# 在 pgAdmin4 中执行清空数据脚本

## 📋 操作步骤

### 方法 1: 使用 Query Tool（推荐）

1. **打开 pgAdmin4** 并连接到服务器数据库

2. **展开数据库树**：
   - 找到并展开 `Servers` → 你的服务器 → `Databases` → `forum_db`

3. **打开 Query Tool**：
   - 右键点击 `forum_db` 数据库
   - 选择 `Query Tool`（查询工具）

4. **打开 SQL 脚本文件**：
   - 在 Query Tool 中，点击工具栏的 `打开文件` 图标（📁）
   - 或者使用快捷键 `Ctrl + O`（Windows/Linux）或 `Cmd + O`（Mac）
   - 选择 `backend/scripts/clear_all_data.sql` 文件

5. **查看脚本内容**（确认无误）

6. **执行脚本**：
   - 点击工具栏的 `执行` 按钮（▶️）
   - 或使用快捷键 `F5`

7. **查看结果**：
   - 在底部的 `Messages` 标签页查看执行状态
   - 在 `Data Output` 标签页查看各表的剩余行数（应该都是 0，除了 categories 有 4 行）

### 方法 2: 直接粘贴 SQL

1. **打开 Query Tool**（同上）

2. **复制脚本内容**：
   - 打开 `clear_all_data.sql` 文件
   - 全选并复制所有内容（`Ctrl + A` → `Ctrl + C`）

3. **粘贴到 Query Tool**：
   - 在 Query Tool 的编辑区域粘贴（`Ctrl + V`）

4. **执行脚本**（按 `F5`）

---

## ⚠️ 重要提示

### 执行前确认

1. **已备份数据**（如果需要）
2. **确认数据库名称**：确保连接的是 `forum_db` 数据库
3. **确认服务器**：确保连接的是正确的服务器

### 执行后验证

脚本执行完成后，会显示各表的行数统计。正常情况下：
- `users`: 0 行
- `categories`: 4 行（初始分类）
- `tags`: 0 行
- `posts`: 0 行
- `comments`: 0 行
- `post_tags`: 0 行
- `post_views`: 0 行

---

## 🔍 常见问题

### 1. 权限错误

如果遇到权限错误，确保：
- 使用的数据库用户有 `TRUNCATE` 权限
- 用户有修改序列的权限

### 2. 外键约束错误

如果遇到外键约束错误：
- 检查是否有其他连接正在使用这些表
- 确保脚本中的 `CASCADE` 选项正确执行

### 3. 序列不存在错误

如果提示序列不存在，可能是：
- 表名不同（检查实际的表名）
- 序列名称不同（PostgreSQL 自动生成的序列名）

**解决方法**：可以手动查看序列名称：
```sql
SELECT sequence_name 
FROM information_schema.sequences 
WHERE sequence_schema = 'public';
```

---

## 📝 手动执行（如果脚本有问题）

如果脚本执行失败，可以手动执行以下步骤：

```sql
-- 1. 开始事务
BEGIN;

-- 2. 清空数据
TRUNCATE TABLE post_views CASCADE;
TRUNCATE TABLE post_tags CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE tags CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE categories CASCADE;

-- 3. 重置序列（根据实际序列名称调整）
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE tags_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE post_views_id_seq RESTART WITH 1;

-- 4. 插入初始分类
INSERT INTO categories (name, description, color) VALUES
    ('技术讨论', '编程技术相关讨论', '#3498db'),
    ('问答求助', '技术问题求助', '#e74c3c'),
    ('资源分享', '学习资源和技术分享', '#2ecc71'),
    ('闲聊灌水', '日常闲聊', '#f39c12')
ON CONFLICT (name) DO NOTHING;

-- 5. 提交事务
COMMIT;
```

---

## ✅ 执行成功标志

执行成功后，你应该看到：

1. **Messages 标签页**：
   ```
   BEGIN
   TRUNCATE TABLE
   ALTER SEQUENCE
   INSERT 0 4
   COMMIT
   SELECT 7
   ```

2. **Data Output 标签页**：
   显示各表的行数统计，除了 `categories` 有 4 行，其他都是 0 行

---

## 🎯 快速操作流程

```
pgAdmin4 → 连接服务器 → 展开 forum_db → 右键 → Query Tool 
→ 打开文件 → 选择 clear_all_data.sql → F5 执行 → 查看结果
```

---

## 💡 提示

- **事务保护**：脚本使用 `BEGIN` 和 `COMMIT`，如果出错可以回滚
- **安全确认**：执行前请仔细阅读脚本内容
- **备份建议**：重要数据建议先备份再执行

