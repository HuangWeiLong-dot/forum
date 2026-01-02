import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CookieConsent from './components/CookieConsent'
import AgeVerification from './components/AgeVerification'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import Home from './pages/Home'
import Search from './pages/Search'
import PostDetail from './pages/PostDetail'
import UserProfile from './pages/UserProfile'
import CreatePost from './pages/CreatePost'

import Changelog from './pages/Changelog'
import Fixes from './pages/Fixes'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import IntroLoader from './components/IntroLoader'
import './App.css'

function App() {
  const { loading } = useAuth()
  const { t } = useLanguage()
  const [showIntro, setShowIntro] = useState(true)
  const [progress, setProgress] = useState(0)
  const [appReady, setAppReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!showIntro) return

    const duration = 1000
    const interval = 30
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextValue = Math.min(prev + increment, 100)
        if (nextValue === 100) {
          clearInterval(timer)
        }
        return nextValue
      })
    }, interval)

    return () => clearInterval(timer)
  }, [showIntro])

  useEffect(() => {
    if (!showIntro || loading || progress < 100) return

    const timeout = setTimeout(() => {
      setShowIntro(false)
      setAppReady(true)
    }, 350)

    return () => clearTimeout(timeout)
  }, [loading, progress, showIntro])

  if (showIntro || loading) {
    return <IntroLoader label="LOADING" progress={Math.round(progress)} />
  }

  return (
      <>
        <div className={`app ${appReady ? 'app-enter' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <AgeVerification />
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="app-container">
          {/* 将Sidebar重新放回app-container中，恢复原来的HTML结构 */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="app-main">
            <div className="page-transition-wrapper">
              <div key={location.pathname} className="page-transition page-transition-enter">
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/post/:postId" element={<PostDetail />} />
                  <Route path="/user/:userId" element={<UserProfile />} />
                  <Route path="/create-post" element={<CreatePost />} />
                  
                  <Route path="/changelog" element={<Changelog />} />
                  <Route path="/fixes" element={<Fixes />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
          <CookieConsent />
          <PWAInstallPrompt />
        </div>
        
        {/* 使用Portal将触发器直接挂载到body，避免被app的transform影响 */}
        {createPortal(
          <button 
            className="sidebar-trigger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {/* 根据侧边栏状态显示不同的箭头图标 */}
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </button>,
          document.body
        )}
      </>
  )
}

export default App

