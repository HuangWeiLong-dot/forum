import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaInbox, FaCompass, FaUserCircle } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import './BottomNav.css'

const BottomNav = () => {
  const location = useLocation()
  const { t } = useLanguage()

  // 导航项配置
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
    {
      path: '/profile',
      icon: <FaUserCircle />,
      label: t('bottomNav.profile')
    }
  ]

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

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
  )
}

export default BottomNav