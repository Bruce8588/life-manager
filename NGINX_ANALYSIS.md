# Nginx 反向代理问题分析报告

## 一、当前配置检查

### 1.1 Nginx 状态
```
nginx 可执行文件: /usr/sbin/nginx
配置语法检查: ✅ 通过
nginx 服务状态: inactive (未运行)
```

### 1.2 配置文件结构
```
/etc/nginx/
├── nginx.conf                 # 主配置（默认 server block）
└── conf.d/
    ├── star.conf              # 三个子服务的反向代理
    └── vite-proxy.conf        # vite 开发的两个服务代理
```

---

## 二、问题分析

### 2.1 问题 1：vite-proxy.conf 中 location 与 proxy_pass 路径转发错误

**文件：** `/etc/nginx/conf.d/vite-proxy.conf`

**错误配置：**
```nginx
location /trading {
    proxy_pass http://127.0.0.1:4818;       # 末尾无斜杠
}
location /life {
    proxy_pass http://127.0.0.1:8976;       # 末尾无斜杠
}
```

**问题：** 当用户访问 `https://域名/life/xxx` 时，Nginx 会将**完整 URI `/life/xxx`** 转发给后端，而不是只转发 `/xxx`。如果后端服务本身运行在 `/` 路径，它收到的请求是 `/life/xxx`，导致 404。

**对比：star.conf 中正确的写法：**
```nginx
location /diet-n8w3x/ {
    proxy_pass http://127.0.0.1:5001/;      # ✅ 有 trailing slash
}
```
此时 `域名/diet-n8w3x/api` → 转发为 `后端:5001/api` ✅

### 2.2 问题 2：star.conf 中路径末尾斜杠不一致可能导致样式错乱

**各 location 的 proxy_pass 对比：**
| location | proxy_pass | 行为 |
|---|---|---|
| `/starry-h7k2s/` | `http://127.0.0.1:3001/` | ✅ 带 trailing slash，路径剥离正确 |
| `/trading-p9m4v/` | `http://127.0.0.1:3000/` | ✅ 带 trailing slash，路径剥离正确 |
| `/diet-n8w3x/` | `http://127.0.0.1:5001/` | ✅ 带 trailing slash，路径剥离正确 |

这部分配置本身是正确的。

### 2.3 问题 3：vite-proxy.conf 使用转义 `$host` 但未统一

**文件中：** `proxy_set_header Host \$host;` 使用了 `\$` 转义，但在 Nginx 配置中这是不必要的（除非在 log_format 中）。这不影响功能，但说明文件来源可能是多个不同来源拼接的。

### 2.4 问题 4：vite-proxy.conf 没有 `X-Forwarded-For` 头

缺少完整的企业级代理头：
```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

---

## 三、修复方案

### 3.1 修复 vite-proxy.conf

**核心修改：**
1. 给 `location` 末尾加 `/`（前缀匹配）
2. 给 `proxy_pass` 末尾加 `/`（剥离 location 前缀）
3. 补全 `X-Forwarded-For` 和 `X-Forwarded-Proto`
4. 移除不必要的 `\$` 转义
5. 添加 WebSocket 支持（如果前端用到 HMR）
6. 添加合理的超时时间

### 3.2 标准、稳定、不会出错的配置模板

```nginx
# ============================================
# Nginx 反向代理标准模板
# 适用于：Vue/React 前端 + 后端 API 架构
# ============================================

# --- 通用 proxy 设置（可放到 nginx.conf 的 http{} 块中）---
# proxy_redirect default;         # 默认即重写 Location 头
# proxy_set_header Host $host;    # 传递原始 Host
# proxy_set_header X-Real-IP $remote_addr;
# proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
# proxy_set_header X-Forwarded-Proto $scheme;
# proxy_connect_timeout 60s;
# proxy_send_timeout 60s;
# proxy_read_timeout 60s;

# --- 示例：后端 API 服务 ---
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080/;   # ✅ 末尾斜杠 = 剥离 location 前缀
        # 访问 /api/user → 转发为 http://127.0.0.1:8080/user
    }
}

# --- 示例：多路径路由到不同服务 ---
server {
    listen 80;
    server_name example.com;

    # 前端静态资源（Vite build 产物）
    location / {
        proxy_pass http://127.0.0.1:3000/;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;  # ✅ /api/ → / (剥离前缀)
    }

    # WebSocket (Vite HMR)
    location /ws/ {
        proxy_pass http://127.0.0.1:3000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3.3 关键配置原则（防止 404/502）

| 场景 | location 写法 | proxy_pass 写法 | 效果 |
|---|---|---|---|
| 剥离前缀转发 | `location /api/` | `proxy_pass http://backend/;` | `/api/users` → `backend/users` ✅ |
| 保留前缀转发 | `location /api` | `proxy_pass http://backend;` | `/api/users` → `backend/api/users` |
| 根路径代理 | `location /` | `proxy_pass http://backend/;` | `/anything` → `backend/anything` |
| 精确匹配静态 | `location = /admin` | `proxy_pass http://admin_srv;` | 只代理 `/admin` |

---

## 四、实际修复内容

### 4.1 修改后的 vite-proxy.conf

```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/self-signed.crt;
    ssl_certificate_key /etc/nginx/ssl/self-signed.key;

    client_max_body_size 100M;

    # ========== 修复 1: /trading ==========
    location /trading/ {
        proxy_pass http://127.0.0.1:4818/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket 支持（Vite HMR）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ========== 修复 2: /life ==========
    location /life/ {
        proxy_pass http://127.0.0.1:8976/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 4.2 修改后的 star.conf（建议优化）

现有配置本身正确，但可以统一加上 WebSocket 支持和超时配置：

```nginx
server {
    listen 80;
    server_name 8.129.109.139;

    location /starry-h7k2s/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /trading-p9m4v/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /diet-n8w3x/ {
        proxy_pass http://127.0.0.1:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        return 404;
    }
}
```

---

## 五、验证修复

### 5.1 语法检查
```bash
/usr/sbin/nginx -t
```
预期输出：
```
nginx: configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5.2 启动服务
```bash
systemctl start nginx
systemctl status nginx
```

### 5.3 功能测试
```bash
# 测试根路径
curl -I http://8.129.109.139/

# 测试各子路径
curl -I http://8.129.109.139/starry-h7k2s/
curl -I http://8.129.109.139/trading-p9m4v/
curl -I http://8.129.109.139/diet-n8w3x/

# HTTPS 测试（vite-proxy）
curl -kI https://localhost/trading/
curl -kI https://localhost/life/
```

---

## 六、总结

| 问题 | 原因 | 修复 |
|---|---|---|
| `/trading/xxx` 404 | `proxy_pass` 末尾无 `/`，路径未剥离 | 改为 `proxy_pass http://127.0.0.1:4818/;` |
| `/life/xxx` 404 | 同上 | 改为 `proxy_pass http://127.0.0.1:8976/;` |
| 样式错乱 | 路径转发错误导致静态资源 404 | 同上 + 添加 WebSocket 支持 |
| 502 Bad Gateway | 后端服务未启动或端口错误 | 确认后端服务运行状态 |
| 跨域问题 | 缺少 CORS 头 | 如需跨域，在 proxy_pass 中添加 CORS headers |
