import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaSearch, FaPlus, FaUserCircle, FaMoon, FaSun, FaGlobeAsia } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import Inbox from './Inbox'
import ThemeColorPicker from './ThemeColorPicker'
import './Header.css'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme') || 'light'
  })
  const navigate = useNavigate()
  const languageMenuRef = useRef(null)

  const languages = [
    { code: 'zh', label: '中文', symbol: '文' },
    { code: 'en', label: 'English', symbol: 'A' },
    { code: 'ja', label: '日本語', symbol: 'あ' },
  ]

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 点击外部区域时关闭语言菜单（桌面端）
  useEffect(() => {
    if (!showLanguageMenu || isMobile) return
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageMenu, isMobile])

  // 移动端打开语言菜单时禁用滚动
  useEffect(() => {
    if (!showLanguageMenu || !isMobile) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showLanguageMenu, isMobile])

  const localeMap = {
    zh: 'zh-CN',
    en: 'en-US',
    ja: 'ja-JP',
  }

  const currentLocale = localeMap[language] || 'en-US'

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('theme-dark')
    } else {
      root.classList.remove('theme-dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const yearMonth = currentTime.toLocaleDateString(currentLocale, {
    year: 'numeric',
    month: 'long',
  })
  const day = currentTime.toLocaleDateString(currentLocale, {
    day: '2-digit',
  })
  const timeString = currentTime.toLocaleTimeString(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const languageMenuContent = (
    <div className="language-menu-list">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`language-option ${language === lang.code ? 'active' : ''}`}
          onClick={() => {
            setLanguage(lang.code)
            setShowLanguageMenu(false)
          }}
        >
          <span className="language-symbol">{lang.symbol}</span>
          <span className="language-label">{lang.label}</span>
        </button>
      ))}
    </div>
  )

  const languageOverlay = showLanguageMenu && isMobile
    ? createPortal(
        <div className="language-overlay" onClick={() => setShowLanguageMenu(false)}>
          <div className="language-modal" onClick={(e) => e.stopPropagation()}>
            <div className="language-modal-header">
              <span>{t('header.languageTitle')}</span>
              <button
                type="button"
                className="language-modal-close"
                onClick={() => setShowLanguageMenu(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {languageMenuContent}
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="header-logo">
            <span className="logo-text">
              <span className="logo-re">RE</span>
              <span className="logo-forum">Forum</span>
            </span>
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        <div className="header-center">
          <div className="date-block">
            <span className="date-year-month">{yearMonth}</span>
            <span className="date-day">{day}</span>
          </div>
          <span className="time-block">{timeString}</span>
        </div>

        <div className="header-actions-row">
          <div className="header-actions-group header-actions-group-tools">
            <ThemeColorPicker />
            <button
              type="button"
              className="header-button theme-toggle-button"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? t('header.toLight') : t('header.toDark')}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            <div 
              className="language-switcher-header"
              ref={!isMobile ? languageMenuRef : null}
            >
              <button
                type="button"
                className="header-button language-toggle-button"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                title="Switch language"
              >
                <FaGlobeAsia />
              </button>
              {!isMobile && showLanguageMenu && (
                <div className="language-menu">
                  {languageMenuContent}
                </div>
              )}
            </div>
            {languageOverlay}
            {isAuthenticated && <Inbox />}
          </div>
          <div className="header-actions-group header-actions-group-primary">
            {isAuthenticated ? (
              <>
                <button 
                  className="header-button create-button"
                  onClick={() => navigate('/create-post')}
                  title={t('header.createTitle')}
                >
                  <FaPlus />
                  <span className="create-button-label">{t('header.create')}</span>
                </button>
                <div className="user-menu">
                  <button 
                    className="user-avatar-button" 
                    title={t('header.userMenu')}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                  >
                    <FaUserCircle className="user-avatar" />
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <Link 
                        to={`/user/${user.id}`} 
                        className="dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {t('header.profile')}
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }} 
                        className="dropdown-item"
                      >
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  className="header-button login-button"
                  onClick={() => setShowLoginModal(true)}
                >
                    {t('header.login')}
                </button>
                <button
                  className="header-button register-button"
                  onClick={() => setShowRegisterModal(true)}
                >
                    {t('header.register')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false)
            setShowLoginModal(true)
          }}
        />
      )}
    </header>
  )
}

export default Header

