# 修复 CORS 错误

## 问题

CORS 错误：`The 'Access-Control-Allow-Origin' header contains multiple values 'https://reforum.space, *'`

## 原因

- 后端 Express 的 CORS 中间件设置了 `Access-Control-Allow-Origin: https://reforum.space`
- Nginx 配置中也设置了 `Access-Control-Allow-Origin: *`
- 导致响应头中有两个 CORS 头，浏览器拒绝

## 解决方案

已更新 `nginx-reforum.conf`，移除了 Nginx 中的 CORS 头设置，让后端 Express 统一处理 CORS。

## 修复步骤

在服务器上执行：

```bash
cd /opt/ReForum

# 1. 拉取最新代码
git pull origin master

# 2. 更新 Nginx 配置
sudo cp nginx-reforum.conf /etc/nginx/sites-available/reforum.space

# 3. 测试 Nginx 配置
sudo nginx -t

# 4. 重新加载 Nginx
sudo systemctl reload nginx

# 5. 验证修复
# 在浏览器中刷新页面，CORS 错误应该消失
```

## 验证

修复后，在浏览器中：
1. 刷新页面
2. 打开开发者工具（F12）
3. 查看 Network 标签
4. API 请求应该成功，不再有 CORS 错误

