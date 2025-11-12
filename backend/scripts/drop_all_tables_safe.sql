-- ============================================
-- 安全删除所有表结构脚本
-- 警告：此脚本将删除所有表、视图、函数和触发器
-- 使用前请确保已备份数据！
-- ============================================

-- 先回滚任何未完成的事务
ROLLBACK;

-- 使用 DO 块来安全执行，即使某些对象不存在也不会报错
DO $$
BEGIN
    -- 删除视图（必须先删除，因为它们依赖表）
    DROP VIEW IF EXISTS tag_stats CASCADE;
    DROP VIEW IF EXISTS category_stats CASCADE;
    DROP VIEW IF EXISTS user_stats CASCADE;
    
    -- 删除函数
    DROP FUNCTION IF EXISTS get_post_comment_count(INTEGER) CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    
    -- 删除表（按依赖顺序，使用 CASCADE 自动处理依赖）
    DROP TABLE IF EXISTS post_views CASCADE;
    DROP TABLE IF EXISTS post_likes CASCADE;
    DROP TABLE IF EXISTS post_tags CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    
    RAISE NOTICE '所有表、视图和函数已删除';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '删除过程中出现错误，但继续执行: %', SQLERRM;
END $$;

-- 验证删除结果
SELECT 
    'Tables' AS object_type,
    COUNT(*) AS remaining_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Views',
    COUNT(*)
FROM information_schema.views 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Functions',
    COUNT(*)
FROM information_schema.routines 
WHERE routine_schema = 'public';

