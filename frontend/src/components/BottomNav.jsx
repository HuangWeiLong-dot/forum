import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaHome, FaInbox, FaCompass, FaUserCircle, FaSignInAlt } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import './BottomNav.css'

const BottomNav = () => {
  const location = useLocation()
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  // 处理导航项点击，特别是需要登录的项
  const handleNavItemClick = (item) => {
    if (item.path === '/profile') {
      if (isAuthenticated && user) {
        // 已登录，跳转到用户个人资料页
        navigate(`/user/${user.id}`)
      } else {
        // 未登录，显示登录模态框
        setShowLoginModal(true)
      }
    } else if (item.authRequired) {
      // 登录/注册入口，直接显示登录模态框
      setShowLoginModal(true)
    }
  }

  // 根据登录状态动态生成导航项
  const navItems = [
    {
      path: '/',
      icon: <FaHome />,
      label: t('bottomNav.home'),
      exact: true
    },
    {
      path: '/inbox',
      icon: <FaInbox />,
      label: t('bottomNav.inbox')
    },
    {
      path: '/explore',
      icon: <FaCompass />,
      label: t('bottomNav.explore')
    },
    ...(isAuthenticated ? [
      {
        path: '/profile',
        icon: <FaUserCircle />,
        label: t('bottomNav.profile')
      }
    ] : [
      {
        path: '/auth',
        icon: <FaSignInAlt />,
        label: t('bottomNav.login'),
        authRequired: true
      }
    ])
  ]

  return (
    <>
      <nav className="bottom-nav">
        <div className="bottom-nav-container">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)

            // 处理需要特殊点击逻辑的项：profile和authRequired项
            if (item.path === '/profile' || item.authRequired) {
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavItemClick(item)}
                  className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="bottom-nav-icon">{item.icon}</div>
                  <span className="bottom-nav-label">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="bottom-nav-icon">{item.icon}</div>
                <span className="bottom-nav-label">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* 登录模态框 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}

      {/* 注册模态框 */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false)
            setShowLoginModal(true)
          }}
        />
      )}
    </>
  )
}

export default BottomNav