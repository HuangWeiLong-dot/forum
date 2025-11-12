-- 创建帖子浏览记录表
CREATE TABLE IF NOT EXISTS post_views (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),  -- 支持 IPv6
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 唯一约束：同一用户对同一帖子只记录一次（如果用户已登录）
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_user_unique 
ON post_views(post_id, user_id) 
WHERE user_id IS NOT NULL;

-- 唯一约束：同一IP对同一帖子在24小时内只记录一次（如果用户未登录）
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_ip_unique 
ON post_views(post_id, ip_address) 
WHERE user_id IS NULL AND ip_address IS NOT NULL;

-- 索引
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_ip ON post_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- 对于未登录用户，使用 IP 地址去重（24小时内）
-- 这个约束通过应用层逻辑实现，不在数据库层面

