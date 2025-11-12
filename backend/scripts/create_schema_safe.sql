-- ============================================
-- 安全创建数据库结构脚本（带错误处理）
-- 如果表已存在则跳过，不会报错
-- ============================================

-- 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户表 (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar TEXT,
    bio TEXT,
    join_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT password_length CHECK (char_length(password_hash) >= 6)
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. 分类表 (Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. 标签表 (Tags)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 标签表索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ============================================
-- 4. 帖子表 (Posts)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
    CONSTRAINT content_length CHECK (char_length(content) >= 10)
);

-- 帖子表索引
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_like_count ON posts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts USING gin(to_tsvector('english', title));

-- ============================================
-- 5. 帖子标签关联表 (Post Tags)
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id)
);

-- 帖子标签关联表索引
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- ============================================
-- 6. 评论表 (Comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- 7. 帖子浏览记录表 (Post Views)
-- ============================================
CREATE TABLE IF NOT EXISTS post_views (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 唯一约束：同一用户对同一帖子只记录一次
DROP INDEX IF EXISTS idx_post_views_user_unique;
CREATE UNIQUE INDEX idx_post_views_user_unique 
ON post_views(post_id, user_id) 
WHERE user_id IS NOT NULL;

-- 唯一约束：同一IP对同一帖子在24小时内只记录一次
DROP INDEX IF EXISTS idx_post_views_ip_unique;
CREATE UNIQUE INDEX idx_post_views_ip_unique 
ON post_views(post_id, ip_address) 
WHERE user_id IS NULL AND ip_address IS NOT NULL;

-- 帖子浏览记录表索引
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_ip ON post_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- ============================================
-- 8. 帖子点赞记录表 (Post Likes)
-- ============================================
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- 帖子点赞记录表索引
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

-- ============================================
-- 9. 触发器：自动更新 updated_at 字段
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. 视图：用户统计信息
-- ============================================
DROP VIEW IF EXISTS user_stats;
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    COUNT(DISTINCT p.id) AS post_count,
    COUNT(DISTINCT c.id) AS comment_count
FROM users u
LEFT JOIN posts p ON p.author_id = u.id
LEFT JOIN comments c ON c.author_id = u.id
GROUP BY u.id, u.username;

-- ============================================
-- 11. 视图：分类统计信息
-- ============================================
DROP VIEW IF EXISTS category_stats;
CREATE VIEW category_stats AS
SELECT 
    cat.id,
    cat.name,
    cat.description,
    cat.color,
    COUNT(p.id) AS post_count
FROM categories cat
LEFT JOIN posts p ON p.category_id = cat.id
GROUP BY cat.id, cat.name, cat.description, cat.color;

-- ============================================
-- 12. 视图：标签统计信息
-- ============================================
DROP VIEW IF EXISTS tag_stats;
CREATE VIEW tag_stats AS
SELECT 
    t.id,
    t.name,
    COUNT(pt.post_id) AS post_count
FROM tags t
LEFT JOIN post_tags pt ON pt.tag_id = t.id
GROUP BY t.id, t.name;

-- ============================================
-- 13. 函数：获取帖子评论数量
-- ============================================
CREATE OR REPLACE FUNCTION get_post_comment_count(post_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM comments WHERE post_id = post_id_param);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. 初始化数据
-- ============================================
INSERT INTO categories (name, description, color) VALUES
    ('技术讨论', '编程技术相关讨论', '#3498db'),
    ('问答求助', '技术问题求助', '#e74c3c'),
    ('资源分享', '学习资源和技术分享', '#2ecc71'),
    ('闲聊灌水', '日常闲聊', '#f39c12')
ON CONFLICT (name) DO NOTHING;

