import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaSearch, FaPlus, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import './Header.css'

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme') || 'light'
  })
  const navigate = useNavigate()

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
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
            placeholder="搜索帖子、用户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        <div className="header-actions">
          <button
            type="button"
            className="header-button theme-toggle-button"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
            <span>{theme === 'dark' ? '日间模式' : '夜间模式'}</span>
          </button>
          {isAuthenticated ? (
            <>
              <button 
                className="header-button create-button"
                onClick={() => navigate('/create-post')}
                title="发布新帖子"
              >
                <FaPlus /> 发布
              </button>
              <div className="user-menu">
                <button 
                  className="user-avatar-button" 
                  title="用户菜单"
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
                      我的资料
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }} 
                      className="dropdown-item"
                    >
                      登出
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
                登录
              </button>
              <button
                className="header-button register-button"
                onClick={() => setShowRegisterModal(true)}
              >
                注册
              </button>
            </>
          )}
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

