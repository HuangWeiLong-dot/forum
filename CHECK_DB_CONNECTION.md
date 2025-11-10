# 检查后端与数据库连接

## 方法一：通过健康检查端点（推荐）

后端提供了健康检查端点，会自动检查数据库连接：

```bash
# 在服务器上测试
curl http://127.0.0.1:3000/health

# 或通过 HTTPS（如果配置了）
curl https://api.reforum.space/health
```

**正常响应示例：**
```json
{
  "status": "ok",
  "message": "服务运行正常",
  "database": "connected"
}
```

**如果数据库未连接：**
```json
{
  "status": "error",
  "message": "数据库连接失败",
  "database": "disconnected"
}
```

## 方法二：查看后端日志

```bash
# 查看后端容器日志
cd /opt/ReForum
docker-compose logs backend

# 查看最近的日志
docker-compose logs --tail=50 backend

# 实时查看日志
docker-compose logs -f backend
```

**正常启动时应该看到：**
- 数据库连接成功的消息
- 服务器启动信息
- 没有数据库连接错误

## 方法三：直接测试数据库连接

```bash
# 进入后端容器
docker-compose exec backend sh

# 在容器内测试数据库连接（需要安装 psql 或使用 Node.js）
# 或者直接退出容器，在服务器上测试
exit

# 使用 Docker 数据库容器测试
docker-compose exec db psql -U HuangWeiLong -d forum_db -c "SELECT 1;"
```

## 方法四：通过 API 测试

```bash
# 测试一个需要数据库的 API 端点
curl http://127.0.0.1:3000/api/categories

# 如果返回数据，说明数据库连接正常
# 如果返回错误，查看错误信息
```

## 方法五：检查数据库容器状态

```bash
# 查看数据库容器状态
docker-compose ps db

# 应该显示 (healthy) 状态

# 查看数据库日志
docker-compose logs db
```

## 快速诊断命令

```bash
# 1. 检查健康状态
curl http://127.0.0.1:3000/health | jq .

# 2. 查看后端日志
docker-compose logs --tail=20 backend

# 3. 检查数据库容器
docker-compose ps db

# 4. 测试数据库连接
docker-compose exec db psql -U HuangWeiLong -d forum_db -c "SELECT version();"
```

## 常见问题排查

### 问题 1: 数据库连接失败

**检查数据库容器是否运行：**
```bash
docker-compose ps db
```

**检查数据库环境变量：**
```bash
docker-compose exec backend env | grep DB_
```

**查看数据库日志：**
```bash
docker-compose logs db
```

### 问题 2: 连接超时

**检查数据库网络：**
```bash
# 从后端容器 ping 数据库
docker-compose exec backend ping db
```

### 问题 3: 认证失败

**检查数据库用户名和密码：**
```bash
# 查看 docker-compose.yml 中的配置
cat docker-compose.yml | grep -A 5 "DB_"
```

