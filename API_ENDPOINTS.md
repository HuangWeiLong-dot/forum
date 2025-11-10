# API 端点列表

## 基础 URL

- **开发环境**: `http://localhost:3000/api`
- **生产环境**: `https://api.reforum.space/api`

## 健康检查

### GET /health
检查服务状态和数据库连接

**不需要认证**

**响应示例：**
```json
{
  "status": "ok",
  "message": "服务运行正常",
  "database": "connected"
}
```

---

## 用户认证 (Authentication)

### POST /api/auth/register
用户注册

**不需要认证**

**请求体：**
```json
{
  "username": "string (3-20字符)",
  "email": "string (有效邮箱)",
  "password": "string (至少6字符)"
}
```

**响应：**
- `201`: 注册成功，返回用户信息和 token
- `400`: 参数错误或用户已存在

---

### POST /api/auth/login
用户登录

**不需要认证**

**请求体：**
```json
{
  "email": "string",
  "password": "string"
}
```

**响应：**
- `200`: 登录成功，返回用户信息和 token
- `401`: 用户名或密码错误

---

### POST /api/auth/logout
用户登出

**需要认证** (Bearer Token)

**响应：**
- `200`: 登出成功
- `401`: 未授权访问

---

## 用户资料 (Users)

### GET /api/users/profile
获取当前用户资料

**需要认证** (Bearer Token)

**响应：**
- `200`: 成功获取用户资料
- `401`: 未登录

---

### PUT /api/users/profile
更新当前用户资料

**需要认证** (Bearer Token)

**请求体：**
```json
{
  "avatar": "string (可选)",
  "bio": "string (可选, 最多200字符)"
}
```

**响应：**
- `200`: 更新成功
- `401`: 未授权访问
- `400`: 参数验证失败

---

### GET /api/users/:userId
获取指定用户公开资料

**不需要认证**

**路径参数：**
- `userId`: 用户 ID

**响应：**
- `200`: 成功获取用户资料
- `404`: 用户不存在

---

## 帖子管理 (Posts)

### GET /api/posts
获取帖子列表

**不需要认证**

**查询参数：**
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `categoryId`: 分类 ID（可选）
- `sort`: 排序方式（可选: `latest`, `hot`）

**响应：**
- `200`: 成功获取帖子列表

---

### GET /api/posts/:postId
获取帖子详情

**不需要认证**

**路径参数：**
- `postId`: 帖子 ID

**响应：**
- `200`: 成功获取帖子详情
- `404`: 帖子不存在

---

### POST /api/posts
创建帖子

**需要认证** (Bearer Token)

**请求体：**
```json
{
  "title": "string (5-200字符)",
  "content": "string (至少10字符)",
  "categoryId": "integer",
  "tags": ["string"] (可选)
}
```

**响应：**
- `201`: 创建成功
- `400`: 参数验证失败
- `401`: 未授权访问

---

### PUT /api/posts/:postId
更新帖子

**需要认证** (Bearer Token)

**路径参数：**
- `postId`: 帖子 ID

**请求体：**
```json
{
  "title": "string (可选, 5-200字符)",
  "content": "string (可选, 至少10字符)",
  "categoryId": "integer (可选)",
  "tags": ["string"] (可选)
}
```

**响应：**
- `200`: 更新成功
- `400`: 参数验证失败
- `401`: 未授权访问
- `403`: 无权限修改此帖子
- `404`: 帖子不存在

---

## 评论管理 (Comments)

### GET /api/posts/:postId/comments
获取帖子评论列表

**不需要认证**

**路径参数：**
- `postId`: 帖子 ID

**查询参数：**
- `page`: 页码（默认: 1）

**响应：**
- `200`: 成功获取评论列表
- `404`: 帖子不存在

---

### POST /api/posts/:postId/comments
发表评论

**需要认证** (Bearer Token)

**路径参数：**
- `postId`: 帖子 ID

**请求体：**
```json
{
  "content": "string (至少1字符)",
  "parentId": "integer (可选, 父评论ID)"
}
```

**响应：**
- `201`: 评论成功
- `400`: 参数验证失败或嵌套深度超限
- `401`: 未授权访问
- `404`: 帖子不存在

---

### POST /api/comments/:commentId/reply
回复评论

**需要认证** (Bearer Token)

**路径参数：**
- `commentId`: 评论 ID

**请求体：**
```json
{
  "content": "string (至少1字符)"
}
```

**响应：**
- `201`: 回复成功
- `400`: 参数验证失败或嵌套深度超限（最大3层）
- `401`: 未授权访问
- `404`: 评论不存在

---

## 版块分类 (Categories)

### GET /api/categories
获取所有分类

**不需要认证**

**响应：**
- `200`: 成功获取分类列表

---

## 标签 (Tags)

### GET /api/tags
获取热门标签

**不需要认证**

**查询参数：**
- `limit`: 返回数量（默认: 20）

**响应：**
- `200`: 成功获取标签列表

---

## 认证说明

需要认证的端点需要在请求头中添加：

```
Authorization: Bearer <token>
```

Token 通过登录或注册接口获取。

---

## 错误响应格式

```json
{
  "error": "ERROR_CODE",
  "message": "错误描述信息"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 完整端点列表（快速参考）

### 不需要认证
- `GET /health` - 健康检查
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/users/:userId` - 获取用户公开资料
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:postId` - 获取帖子详情
- `GET /api/posts/:postId/comments` - 获取评论列表
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表

### 需要认证
- `POST /api/auth/logout` - 登出
- `GET /api/users/profile` - 获取当前用户资料
- `PUT /api/users/profile` - 更新用户资料
- `POST /api/posts` - 创建帖子
- `PUT /api/posts/:postId` - 更新帖子
- `POST /api/posts/:postId/comments` - 发表评论
- `POST /api/comments/:commentId/reply` - 回复评论

---

## 测试示例

### 注册用户
```bash
curl -X POST https://api.reforum.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 登录
```bash
curl -X POST https://api.reforum.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 获取帖子列表
```bash
curl https://api.reforum.space/api/posts
```

### 创建帖子（需要 token）
```bash
curl -X POST https://api.reforum.space/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "测试帖子",
    "content": "这是一个测试帖子的内容",
    "categoryId": 1
  }'
```

