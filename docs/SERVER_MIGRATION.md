# 服务器数据库迁移指南

## 在服务器上创建 notifications 表

### 方法 1: 使用 Docker 容器执行（推荐）

如果数据库在 Docker 容器中运行：

```bash
# 1. 将迁移脚本复制到服务器（如果还没有）
# 或者直接在服务器上创建文件

# 2. 在服务器上执行迁移
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_notifications_table.sql

# 或者如果脚本已经在容器内
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -f /path/to/add_notifications_table.sql
```

### 方法 2: 直接连接数据库执行

如果可以直接连接到服务器的 PostgreSQL：

```bash
# 使用 psql 连接
psql -h 43.167.196.43 -p 5433 -U HuangWeiLong -d forum_db

# 然后执行 SQL
\i backend/migrations/add_notifications_table.sql

# 或者直接粘贴 SQL 内容
```

### 方法 3: 通过 SSH 执行

```bash
# SSH 到服务器后
cd /path/to/REForum
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_notifications_table.sql
```

## 验证迁移是否成功

```bash
# 检查表是否存在
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications';"

# 应该返回：
#  table_name
# --------------
#  notifications
```

## 迁移脚本内容

如果需要在服务器上手动创建，执行以下 SQL：

```sql
-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'new_post',
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  related_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
```

## 注意事项

1. **备份数据**：执行迁移前建议备份数据库
2. **权限检查**：确保数据库用户有创建表和索引的权限
3. **重启服务**：迁移完成后，重启后端服务以确保更改生效

```bash
# 重启后端服务
docker-compose restart backend
# 或
docker restart reforum-backend-1
```

