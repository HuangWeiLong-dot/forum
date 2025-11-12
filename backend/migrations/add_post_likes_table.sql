-- 创建帖子点赞记录表
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 唯一约束：同一用户对同一帖子只能点赞一次
    UNIQUE(post_id, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

-- 注释
COMMENT ON TABLE post_likes IS '帖子点赞记录表，记录用户对帖子的点赞';
COMMENT ON COLUMN post_likes.post_id IS '被点赞的帖子ID';
COMMENT ON COLUMN post_likes.user_id IS '点赞的用户ID';

