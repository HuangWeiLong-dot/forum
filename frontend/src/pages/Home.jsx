import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { postAPI } from '../services/api'
import PostCard from '../components/PostCard'
import { useLanguage } from '../context/LanguageContext'
import { debounce } from '../utils/debounce'
import './Home.css'

const Home = () => {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [sort, setSort] = useState('time')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [error, setError] = useState(null)
  const lastRequestTimeRef = useRef(0)
  const MIN_REQUEST_INTERVAL = 500 // 最小请求间隔：500毫秒

  // 当 URL 参数变化时，更新选中的分类
  useEffect(() => {
    const categoryId = searchParams.get('category')
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId, 10))
    } else {
      setSelectedCategory(null)
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchParams])

  const fetchPosts = useCallback(async () => {
    // 节流：确保请求间隔至少为 MIN_REQUEST_INTERVAL 毫秒
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTimeRef.current
    
    // 创建一个实际的请求函数
    const performRequest = async () => {
      lastRequestTimeRef.current = Date.now()
      setLoading(true)
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          sort,
        }
        if (selectedCategory) {
          params.category = selectedCategory
        }

        const response = await postAPI.getPosts(params)
        setPosts(response.data.data || [])
        setPagination(response.data.pagination || pagination)
        setError(null) // 清除之前的错误
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        // 设置更详细的错误信息
        if (!error.response) {
          // 网络错误，后端可能未运行
          setError({
            type: 'network',
            message: '无法连接到服务器，请检查后端服务是否运行',
            detail: error.message
          })
        } else if (error.response.status === 500) {
          // 服务器内部错误
          setError({
            type: 'server',
            message: '服务器错误，可能是数据库连接问题',
            detail: error.response.data?.message || '服务器内部错误'
          })
        } else {
          setError({
            type: 'unknown',
            message: '加载帖子失败',
            detail: error.response.data?.message || error.message
          })
        }
        setPosts([]) // 清空帖子列表
      } finally {
        setLoading(false)
      }
    }

    // 如果距离上次请求太近，延迟执行
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      setTimeout(() => {
        performRequest()
      }, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      return
    }

    // 否则立即执行
    performRequest()
  }, [pagination.page, pagination.limit, sort, selectedCategory])

  // 使用防抖，避免频繁请求
  const debouncedFetchPosts = useCallback(
    debounce(() => {
      fetchPosts()
    }, 300),
    [fetchPosts]
  )

  useEffect(() => {
    debouncedFetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, sort, selectedCategory])

  const handleSortChange = (newSort) => {
    setSort(newSort)
    setPagination({ ...pagination, page: 1 })
  }

  return (
    <div className="home-page">
      <div className="posts-header">
        <div className="sort-buttons">
          <button
            className={`sort-button ${sort === 'time' ? 'active' : ''}`}
            onClick={() => handleSortChange('time')}
          >
            {t('home.latest')}
          </button>
          <button
            className={`sort-button ${sort === 'hot' ? 'active' : ''}`}
            onClick={() => handleSortChange('hot')}
          >
            {t('home.hot')}
          </button>
        </div>
      </div>

      <div className="posts-container">
        {loading ? (
          <div className="loading">{t('home.loading')}</div>
        ) : error ? (
          <div className="error-state" style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '0.5rem' }}>⚠️ 加载失败</h3>
            <p style={{ color: '#856404', marginBottom: '0.5rem' }}>{error.message}</p>
            {error.detail && (
              <p style={{ fontSize: '0.85rem', color: '#856404', marginBottom: '1rem' }}>
                详情: {error.detail}
              </p>
            )}
            <button
              onClick={() => {
                setError(null)
                fetchPosts()
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffc107',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              重试
            </button>
            {error.type === 'network' && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#856404' }}>
                <p>💡 提示：请确保后端服务正在运行</p>
                <p style={{ marginTop: '0.5rem' }}>
                  检查步骤：
                  <br />1. 确认后端服务已启动（通常在 http://localhost:3000）
                  <br />2. 检查浏览器控制台的网络请求错误
                  <br />3. 查看后端日志是否有错误信息
                </p>
              </div>
            )}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>{t('home.emptyTitle')}</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              {t('home.emptyDesc')}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {pagination.totalPages > pagination.page && (
              <div className="load-more-container">
                <button
                  className="load-more-button"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                >
                  {t('home.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home

