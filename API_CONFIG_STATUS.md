# API 端点配置状态

## ✅ 已更新的配置

### 前端配置

1. **docker-compose.yml**
   - `VITE_API_BASE_URL=https://api.reforum.space/api` ✅

2. **frontend/Dockerfile**
   - `VITE_API_BASE_URL=https://api.reforum.space/api` ✅

3. **frontend/src/services/api.js**
   - 使用环境变量：`import.meta.env.VITE_API_BASE_URL || '/api'` ✅
   - 会从构建时的环境变量获取值

### 后端配置

1. **docker-compose.yml**
   - `FRONTEND_URL=https://reforum.space` ✅
   - `APP_URL=https://api.reforum.space` ✅

2. **backend/app.js**
   - CORS 配置使用 `FRONTEND_URL` 环境变量 ✅

## ⚠️ 重要提示

**配置已更新，但需要重新构建前端容器才能生效！**

因为前端是静态构建的，`VITE_API_BASE_URL` 在构建时就被编译进代码了。

## 重新部署步骤

在服务器上执行：

```bash
cd /opt/ReForum

# 拉取最新代码
git pull origin master

# 重新构建前端（重要！）
docker-compose build --no-cache frontend

# 重启容器
docker-compose up -d

# 查看日志确认
docker-compose logs --tail=30 frontend
```

## 验证配置

部署后，在浏览器中：

1. 打开开发者工具（F12）
2. 查看 Network 标签
3. 访问网站并查看 API 请求
4. 确认请求地址是 `https://api.reforum.space/api/...`

## 当前配置总结

- **前端 API 基础 URL**: `https://api.reforum.space/api`
- **后端 CORS 允许来源**: `https://reforum.space`
- **后端 APP URL**: `https://api.reforum.space`

