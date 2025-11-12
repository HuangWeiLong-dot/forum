-- ============================================
-- 清空所有数据脚本
-- 警告：此脚本将删除所有表中的数据，但保留表结构
-- 使用前请确保已备份数据！
-- ============================================

-- 禁用外键检查（PostgreSQL 使用事务处理）
BEGIN;

-- 按照外键依赖顺序删除数据
-- 1. 先删除关联表的数据
TRUNCATE TABLE post_views CASCADE;
TRUNCATE TABLE post_likes CASCADE;
TRUNCATE TABLE post_tags CASCADE;
TRUNCATE TABLE comments CASCADE;

-- 2. 删除主表数据
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE tags CASCADE;

-- 3. 删除用户数据（会级联删除相关的帖子和评论）
TRUNCATE TABLE users CASCADE;

-- 4. 删除分类数据（注意：如果分类被帖子引用，需要先删除帖子）
-- 由于 posts 已经删除，现在可以安全删除 categories
TRUNCATE TABLE categories CASCADE;

-- 重置序列（让 ID 从 1 开始）
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE tags_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE post_views_id_seq RESTART WITH 1;
ALTER SEQUENCE post_likes_id_seq RESTART WITH 1;

-- 重新插入初始分类数据（可选）
INSERT INTO categories (name, description, color) VALUES
    ('技术讨论', '编程技术相关讨论', '#3498db'),
    ('问答求助', '技术问题求助', '#e74c3c'),
    ('资源分享', '学习资源和技术分享', '#2ecc71'),
    ('闲聊灌水', '日常闲聊', '#f39c12')
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- 显示清空结果
SELECT 
    'users' AS table_name, COUNT(*) AS remaining_rows FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'post_tags', COUNT(*) FROM post_tags
UNION ALL
SELECT 'post_views', COUNT(*) FROM post_views
UNION ALL
SELECT 'post_likes', COUNT(*) FROM post_likes;

