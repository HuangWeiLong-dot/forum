import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../context/LanguageContext'
import { userAPI } from '../services/api'
import { FaTimes, FaSpinner } from 'react-icons/fa'
import './Modal.css'

const ChangePasswordModal = ({ user, onClose }) => {
  const { t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [canChangePassword, setCanChangePassword] = useState(true)
  const [daysRemaining, setDaysRemaining] = useState(0)

  // 检查是否可以修改密码（30天限制）
  useEffect(() => {
    if (user?.passwordUpdatedAt) {
      try {
        const lastUpdate = new Date(user.passwordUpdatedAt)
        const now = new Date()
        const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24))
        const remaining = 30 - daysSinceUpdate
        
        setCanChangePassword(remaining <= 0)
        setDaysRemaining(remaining > 0 ? remaining : 0)
      } catch (error) {
        console.error('Error calculating password update info:', error)
        setCanChangePassword(true)
        setDaysRemaining(0)
      }
    } else {
      // 如果没有修改过密码，可以随时修改
      setCanChangePassword(true)
      setDaysRemaining(0)
    }
  }, [user])

  useEffect(() => {
    // 打开弹窗时锁定背景滚动
    const previousOverflow = document.body.style.overflow
    const previousPosition = document.body.style.position
    const previousTop = document.body.style.top
    const scrollY = window.scrollY
    
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.position = previousPosition
      document.body.style.top = previousTop
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  const validatePassword = (password) => {
    // 密码至少8个字符
    return password.length >= 8
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // 验证密码
      if (!validatePassword(newPassword)) {
        setError(t('password.change.passwordTooShort'))
        setSaving(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError(t('password.change.passwordMismatch'))
        setSaving(false)
        return
      }

      if (newPassword === currentPassword) {
        setError(t('password.change.sameAsCurrent'))
        setSaving(false)
        return
      }

      // 检查是否是测试用户
      const token = localStorage.getItem('token')
      const tokenStr = String(token || '')
      if (tokenStr.startsWith('test-token-')) {
        // 测试用户：直接更新本地存储
        const testUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = {
          ...testUser,
          passwordUpdatedAt: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        setSuccess(t('password.change.success'))
        setTimeout(() => {
          onClose()
        }, 1500)
        return
      }

      // 正常用户：调用API
      await userAPI.changePassword({
        currentPassword,
        newPassword
      })

      setSuccess(t('password.change.success'))
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to change password:', error)
      setError(error.response?.data?.message || t('password.change.failed'))
    } finally {
      setSaving(false)
    }
  }

  const modalContent = (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <h2 className="modal-title">{t('password.change.title')}</h2>
        
        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {success && (
          <div className="modal-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="currentPassword">{t('password.change.currentPassword')}</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('password.change.currentPasswordPlaceholder')}
              required
              disabled={saving || !canChangePassword}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">{t('password.change.newPassword')}</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('password.change.newPasswordPlaceholder')}
              required
              disabled={saving || !canChangePassword}
            />
            <div className="password-hint">
              {t('password.change.passwordHint')}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('password.change.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('password.change.confirmPasswordPlaceholder')}
              required
              disabled={saving || !canChangePassword}
            />
          </div>

          {!canChangePassword && daysRemaining > 0 && (
            <div className="update-limit-hint password-limit-hint">
              {t('password.change.passwordLimit').replace('{days}', daysRemaining)}
            </div>
          )}

          <div className="form-actions change-password-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              {t('password.change.cancel')}
            </button>
            <button
              type="submit"
              className="modal-submit-button"
              disabled={saving || !canChangePassword}
            >
              {saving ? (
                <>
                  <FaSpinner className="spinning" />
                  {t('password.change.saving')}
                </>
              ) : (
                t('password.change.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default ChangePasswordModal