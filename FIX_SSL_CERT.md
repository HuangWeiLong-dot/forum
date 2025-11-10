# 修复 SSL 证书错误

## 问题

`ERR_CERT_COMMON_NAME_INVALID` - SSL 证书的 Common Name 不匹配

## 原因

`api.reforum.space` 的 SSL 证书可能配置不正确，或者使用了错误的证书文件。

## 解决方案

### 方法一：检查并更新 Nginx 配置（推荐）

在服务器上检查实际的证书文件：

```bash
# 检查证书文件
sudo ls -la /etc/letsencrypt/live/

# 应该看到：
# - reforum.space/
# - api.reforum.space/ (如果单独申请了)
```

### 方法二：使用同一个证书（如果 api.reforum.space 证书不存在）

如果 `api.reforum.space` 没有单独的证书，可以使用 `reforum.space` 的证书（支持通配符或 SAN）。

更新 Nginx 配置，让 `api.reforum.space` 也使用 `reforum.space` 的证书。

### 方法三：重新申请证书

```bash
# 为 api.reforum.space 单独申请证书
sudo certbot certonly --nginx -d api.reforum.space

# 或者为所有域名一起申请
sudo certbot certonly --nginx -d reforum.space -d www.reforum.space -d api.reforum.space
```

## 快速修复步骤

```bash
# 1. 检查证书文件
sudo ls -la /etc/letsencrypt/live/

# 2. 检查当前 Nginx 配置中的证书路径
sudo cat /etc/nginx/sites-enabled/reforum.space | grep ssl_certificate

# 3. 如果 api.reforum.space 没有证书，使用 reforum.space 的证书
# 或者重新申请证书
sudo certbot --nginx -d api.reforum.space

# 4. 测试配置
sudo nginx -t

# 5. 重新加载
sudo systemctl reload nginx
```

