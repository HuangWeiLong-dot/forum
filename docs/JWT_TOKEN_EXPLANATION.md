# JWT Token 在代码中的作用和位置

## 概述

JWT (JSON Web Token) 是本项目的**身份认证机制**，用于验证用户的登录状态并保护需要认证的 API 端点。

---

## 1. JWT Token 的生成（后端）

### 位置：`backend/middleware/auth.js`

```javascript
// 生成 JWT token 的函数
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },                    // 载荷（Payload）：包含用户 ID
    process.env.JWT_SECRET,        // 密钥：用于签名 token
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // 过期时间：默认 7 天
  );
};
```

**作用：**
- 在用户登录或注册成功后，生成一个包含用户 ID 的加密 token
- Token 使用密钥签名，防止被篡改
- Token 有过期时间（默认 7 天），过期后需要重新登录

### 生成时机：

#### 1. 用户注册时
**位置：** `backend/controllers/authController.js` (第 66 行)

```javascript
// 创建用户成功后
const token = generateToken(user.id);

return res.status(201).json({
  user: userProfile,
  token,  // 返回给前端
});
```

#### 2. 用户登录时
**位置：** `backend/controllers/authController.js` (第 123 行)

```javascript
// 验证密码成功后
const token = generateToken(user.id);

return res.status(200).json({
  user: userProfile,
  token,  // 返回给前端
});
```

---

## 2. JWT Token 的验证（后端）

### 位置：`backend/middleware/auth.js`

```javascript
export const authenticate = async (req, res, next) => {
  try {
    // 1. 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '未提供认证令牌',
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 2. 验证 token 是否有效
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '用户不存在',
      });
    }

    // 4. 将用户信息附加到请求对象，供后续路由使用
    req.user = user;
    req.userId = user.id;
    
    next(); // 继续执行下一个中间件或路由处理函数
  } catch (error) {
    // 处理各种错误情况
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '无效的认证令牌',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '认证令牌已过期',
      });
    }
    // ... 其他错误处理
  }
};
```

**作用：**
- 验证客户端发送的 token 是否有效
- 检查 token 是否过期
- 验证 token 中的用户是否存在
- 将用户信息附加到请求对象 (`req.user`, `req.userId`)，供后续使用

---

## 3. JWT Token 的使用（前端）

### 3.1 Token 存储

**位置：** `frontend/src/context/AuthContext.jsx`

```javascript
// 登录成功后，保存 token 到 localStorage
const login = async (credentials) => {
  const response = await authAPI.login(credentials)
  const { token: newToken, user: userData } = response.data
  
  setToken(newToken)
  setUser(userData)
  localStorage.setItem('token', newToken)  // 保存到本地存储
  localStorage.setItem('user', JSON.stringify(userData))
}
```

**存储位置：**
- `localStorage.getItem('token')` - 浏览器本地存储
- 页面刷新后仍然保留，实现"记住登录状态"

### 3.2 Token 自动添加到请求头

**位置：** `frontend/src/services/api.js`

```javascript
// 请求拦截器 - 自动添加 token 到所有 API 请求
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      // 在所有请求头中添加 Authorization
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

**作用：**
- **自动**为所有 API 请求添加 `Authorization: Bearer <token>` 头
- 无需在每个 API 调用中手动添加 token
- 如果用户未登录（没有 token），请求头中就不会包含 Authorization

### 3.3 Token 验证（应用启动时）

**位置：** `frontend/src/context/AuthContext.jsx`

```javascript
useEffect(() => {
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token')
    
    if (storedToken) {
      // 尝试验证 token 是否仍然有效
      userAPI.getProfile()
        .then((response) => {
          setUser(response.data)  // Token 有效，更新用户信息
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            // Token 无效或过期，清除
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          }
        })
    }
  }
  initAuth()
}, [])
```

**作用：**
- 应用启动时，检查本地是否有保存的 token
- 如果有，向后端验证 token 是否仍然有效
- 如果无效（返回 401），清除本地存储的 token 和用户信息

### 3.4 Token 过期处理

**位置：** `frontend/src/services/api.js`

```javascript
// 响应拦截器 - 处理 401 错误（Token 过期或无效）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储
      console.warn('Unauthorized access, clearing token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 前端状态会在 AuthContext 中自动更新
    }
    return Promise.reject(error)
  }
)
```

**作用：**
- 当任何 API 请求返回 401 错误时，自动清除 token
- 用户需要重新登录才能继续使用需要认证的功能

---

## 4. 需要 JWT Token 的 API 端点

### 受保护的 API（需要 `authenticate` 中间件）

#### 帖子相关
- ✅ `POST /api/posts` - 创建帖子
- ✅ `PUT /api/posts/:postId` - 更新帖子
- ✅ `DELETE /api/posts/:postId` - 删除帖子
- ✅ `POST /api/posts/:postId/like` - 点赞/取消点赞
- ✅ `GET /api/posts/:postId/like` - 检查点赞状态

#### 用户相关
- ✅ `GET /api/users/profile` - 获取当前用户资料
- ✅ `PUT /api/users/profile` - 更新当前用户资料

#### 评论相关
- ✅ `POST /api/posts/:postId/comments` - 创建评论
- ✅ `POST /api/comments/:commentId/reply` - 回复评论

#### 上传相关
- ✅ `POST /api/upload/image` - 上传图片（单个）
- ✅ `POST /api/upload/images` - 上传图片（多个）

#### 认证相关
- ✅ `POST /api/auth/logout` - 登出

### 公开的 API（不需要 token）

- ❌ `GET /api/posts` - 获取帖子列表
- ❌ `GET /api/posts/:postId` - 获取帖子详情
- ❌ `GET /api/users/:userId` - 获取用户公开资料
- ❌ `POST /api/auth/register` - 注册
- ❌ `POST /api/auth/login` - 登录
- ❌ `GET /api/categories` - 获取分类列表
- ❌ `GET /api/tags` - 获取标签列表

---

## 5. JWT Token 的工作流程

### 5.1 用户登录流程

```
1. 用户在前端输入用户名/密码
   ↓
2. 前端发送 POST /api/auth/login 请求
   ↓
3. 后端验证用户名和密码
   ↓
4. 后端生成 JWT token（包含 userId）
   ↓
5. 后端返回 { user, token } 给前端
   ↓
6. 前端保存 token 到 localStorage
   ↓
7. 前端将 token 添加到后续所有请求的 Authorization 头
```

### 5.2 访问受保护资源的流程

```
1. 前端发送 API 请求（自动带上 token）
   Authorization: Bearer <token>
   ↓
2. 后端 authenticate 中间件验证 token
   - 检查 token 格式
   - 验证 token 签名
   - 检查是否过期
   - 查找用户是否存在
   ↓
3. 验证成功：将用户信息附加到 req.user
   验证失败：返回 401 错误
   ↓
4. 路由处理函数可以使用 req.user 获取当前用户信息
```

### 5.3 Token 过期处理流程

```
1. 用户发送 API 请求（token 已过期）
   ↓
2. 后端验证 token，发现已过期
   ↓
3. 返回 401 Unauthorized 错误
   ↓
4. 前端响应拦截器捕获 401 错误
   ↓
5. 前端自动清除 localStorage 中的 token
   ↓
6. 前端更新状态，标记用户为未登录
   ↓
7. 用户需要重新登录
```

---

## 6. JWT Token 的配置

### 环境变量配置

**位置：** `backend/.env` 或 `backend/env.example`

```bash
# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_in_production  # 用于签名和验证 token 的密钥
JWT_EXPIRES_IN=7d                                    # Token 过期时间（7 天）
```

**重要性：**
- `JWT_SECRET` 必须保密，不能泄露
- 生产环境应使用强随机字符串
- 如果泄露，攻击者可以伪造 token

---

## 7. JWT Token 的安全性

### 优点

1. **无状态认证**
   - 服务器不需要存储 session
   - 适合分布式系统

2. **可携带用户信息**
   - Token 中包含用户 ID
   - 减少数据库查询

3. **跨域友好**
   - 可以轻松在不同域名间使用

### 安全考虑

1. **Token 存储在 localStorage**
   - ⚠️ 容易受到 XSS 攻击
   - 建议：考虑使用 httpOnly cookie（需要额外配置）

2. **Token 过期时间**
   - 当前设置：7 天
   - 建议：根据安全需求调整（生产环境可缩短）

3. **Token 刷新机制**
   - ⚠️ 当前没有实现 refresh token
   - 建议：实现 refresh token 以提升安全性

4. **HTTPS**
   - ⚠️ 必须使用 HTTPS 传输 token
   - HTTP 传输的 token 可以被中间人攻击获取

---

## 8. 代码位置总结

### 后端

| 文件 | 功能 |
|------|------|
| `backend/middleware/auth.js` | 生成和验证 JWT token |
| `backend/controllers/authController.js` | 登录/注册时生成 token |
| `backend/routes/*.js` | 路由配置，决定哪些端点需要认证 |

### 前端

| 文件 | 功能 |
|------|------|
| `frontend/src/context/AuthContext.jsx` | Token 存储和管理 |
| `frontend/src/services/api.js` | 自动添加 token 到请求头，处理过期错误 |

---

## 9. 实际使用示例

### 前端：检查用户是否登录

```javascript
import { useAuth } from '../context/AuthContext'

const MyComponent = () => {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <div>请先登录</div>
  }
  
  return <div>欢迎，{user.username}！</div>
}
```

### 后端：在路由中使用用户信息

```javascript
router.post('/posts', authenticate, (req, res) => {
  // authenticate 中间件已经验证了 token
  // 可以通过 req.userId 获取当前登录用户的 ID
  const userId = req.userId
  
  // 创建帖子时，自动关联到当前用户
  const post = await Post.create({
    ...req.body,
    authorId: userId  // 使用已验证的用户 ID
  })
})
```

---

## 总结

JWT Token 在本项目中起到**身份认证和授权**的核心作用：

1. **生成**：用户登录/注册时生成
2. **存储**：前端保存在 localStorage
3. **传输**：每次 API 请求自动添加到请求头
4. **验证**：后端中间件验证 token 的有效性
5. **使用**：受保护的路由可以访问用户信息
6. **过期**：过期后自动清除，需要重新登录

这种机制实现了**无状态的用户认证**，使得系统可以在分布式环境中高效运行。

