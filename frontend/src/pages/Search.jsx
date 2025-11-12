import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { postAPI } from '../services/api'
import PostCard from '../components/PostCard'
import './Home.css'

const Search = () => {
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
  const [searchQuery, setSearchQuery] = useState('')

  // 从 URL 参数获取搜索关键词
  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchParams])

  useEffect(() => {
    if (searchQuery) {
      fetchPosts()
    } else {
      setPosts([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, sort, searchQuery])

  const fetchPosts = async () => {
    if (!searchQuery.trim()) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort,
        search: searchQuery,
      }

      const response = await postAPI.getPosts(params)
      setPosts(response.data.data || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error('Failed to fetch search results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (newSort) => {
    setSort(newSort)
    setPagination({ ...pagination, page: 1 })
  }

  return (
    <div className="home-page">
      <div className="posts-header">
        <div className="search-results-header">
          <h2>搜索结果</h2>
          {searchQuery && (
            <p className="search-query">关键词: "{searchQuery}"</p>
          )}
        </div>
        <div className="sort-buttons">
          <button
            className={`sort-button ${sort === 'time' ? 'active' : ''}`}
            onClick={() => handleSortChange('time')}
          >
            最新
          </button>
          <button
            className={`sort-button ${sort === 'hot' ? 'active' : ''}`}
            onClick={() => handleSortChange('hot')}
          >
            热门
          </button>
        </div>
      </div>

      <div className="posts-container">
        {loading ? (
          <div className="loading">搜索中...</div>
        ) : !searchQuery ? (
          <div className="empty-state">
            <p>请输入搜索关键词</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>未找到相关帖子</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
              没有找到包含 "{searchQuery}" 的帖子，请尝试其他关键词
            </p>
          </div>
        ) : (
          <>
            <div className="search-results-count">
              找到 {pagination.total} 个结果
            </div>
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
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search

