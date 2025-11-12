# 数据库管理脚本

此目录包含用于管理数据库的实用脚本。

## ⚠️ 警告

**清空数据脚本会永久删除所有数据，请谨慎使用！**

建议在执行前先备份数据库。

---

## 清空所有数据

### 方法 1: 使用 SQL 脚本（推荐）

#### 直接执行 SQL

```bash
# 使用 psql 命令行工具
psql -U HuangWeiLong -d forum_db -f clear_all_data.sql
```

#### 使用 Docker 执行

```bash
# 方法 A: 使用提供的脚本
chmod +x clear_all_data_docker.sh
./clear_all_data_docker.sh

# 方法 B: 手动执行
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < clear_all_data.sql
```

#### 使用 PowerShell（Windows）

```powershell
# 执行 PowerShell 脚本
.\clear_all_data.ps1
```

### 方法 2: 使用 Bash 脚本

```bash
# 设置执行权限
chmod +x clear_all_data.sh

# 执行脚本
./clear_all_data.sh
```

---

## 脚本说明

### `clear_all_data.sql`

核心 SQL 脚本，执行以下操作：

1. **删除所有数据**（按外键依赖顺序）：
   - `post_views` - 浏览记录
   - `post_tags` - 帖子标签关联
   - `comments` - 评论
   - `posts` - 帖子
   - `tags` - 标签
   - `users` - 用户
   - `categories` - 分类

2. **重置序列**：让所有表的 ID 从 1 开始

3. **重新插入初始分类**：自动恢复默认的 4 个分类

### `clear_all_data.sh`

Bash 脚本，提供交互式确认和执行 SQL 脚本。

### `clear_all_data.ps1`

PowerShell 脚本，适用于 Windows 系统。

### `clear_all_data_docker.sh`

专门用于 Docker 环境的脚本，自动检测容器并执行。

---

## 数据库配置

脚本会从环境变量读取配置，如果没有设置则使用默认值：

- `DB_HOST`: 数据库主机（默认: localhost）
- `DB_PORT`: 数据库端口（默认: 5432）
- `DB_NAME`: 数据库名称（默认: forum_db）
- `DB_USER`: 数据库用户（默认: HuangWeiLong）
- `DB_PASSWORD`: 数据库密码（默认: 20070511SuKiI）

---

## 备份数据库（建议）

在执行清空操作前，建议先备份：

```bash
# 使用 Docker
docker exec reforum-db-1 pg_dump -U HuangWeiLong forum_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 直接使用 psql
pg_dump -U HuangWeiLong -d forum_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 恢复数据库

如果需要恢复备份：

```bash
# 使用 Docker
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backup_20250101_120000.sql

# 直接使用 psql
psql -U HuangWeiLong -d forum_db < backup_20250101_120000.sql
```

---

## 注意事项

1. **数据不可恢复**：清空操作会永久删除所有数据，请确保已备份
2. **表结构保留**：脚本只删除数据，不会删除表结构
3. **初始分类恢复**：清空后会自动恢复 4 个默认分类
4. **序列重置**：所有表的自增 ID 会从 1 开始
5. **外键约束**：脚本已按正确顺序处理外键依赖

---

## 故障排除

### 权限错误

如果遇到权限错误，确保：
- 数据库用户有足够的权限
- 脚本文件有执行权限（Linux/Mac）

### 容器名称不匹配

如果使用 Docker 脚本，确保容器名称正确：

```bash
# 查看运行中的容器
docker ps

# 修改脚本中的 CONTAINER_NAME 变量
```

### 连接失败

检查：
- 数据库服务是否运行
- 网络连接是否正常
- 数据库配置是否正确

