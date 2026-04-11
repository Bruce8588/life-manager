# 服务器问题诊断报告

**日期：** 2026-04-11  
**问题：** 多个网站无法打开

---

## 🔴 问题1：Nginx 配置冲突

**位置：** `/etc/nginx/conf.d/`

**问题：** 存在两个配置文件同时生效
- `life-manager.conf`（端口 80/443，proxy_pass 到 8975）
- `starry.conf`（端口 8975，直接 serving 文件）

**冲突表现：**
- `life-manager.conf` 的 `proxy_pass http://127.0.0.1:8975/` 末尾有 `/`，会把 `/life/` 前缀去掉
- 导致请求 `http://server/life/` → 发到 `http://127.0.0.1:8975/` → 找不到文件 → 404

**证据：**
```
$ curl -I http://localhost/life/
HTTP/1.1 404 Not Found
```

---

## 🔴 问题2：PM2 进程丢失

**问题：** 今天多次重启后，PM2 中的进程列表经常丢失（只剩 1-2 个服务），需要手动重新启动

**表现：** 服务运行不稳定，有时 `pm2 list` 只有部分服务

---

## 🔴 问题3：旧进程占用端口

**问题：** 之前手动启动的进程没有被清理，继续占用端口

**证据：**
```
$ ps aux | grep app.py
root 2908099  /usr/bin/python3 /root/life-manager/trading-system/backend/app.py  (旧进程，Apr10)
root 2908110  /usr/bin/python3 /root/life-manager/trading-system/backend/app.py  (旧进程，Apr10)
```

**结果：** PM2 新启动的 trading-backend 因端口冲突不断崩溃重启（377次）

---

## 🔴 问题4：Vite proxy 配置问题

**位置：** `/root/life-manager/frontend/vite.config.js`

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5649',
    changeOrigin: true
  }
}
```

**问题：** 
- `proxy: /api` 只在 Vite 开发服务器模式有效
- 生产环境直接 IP:端口 访问时，proxy 不起作用
- 前端页面加载后，JS 发起的 `/api/xxx` 请求找不到后端，页面一直 loading

---

## 🔴 问题5：前端资源路径硬编码

**位置：** `/root/life-manager/frontend/dist/index.html`

```html
<script type="module" crossorigin src="/life/assets/index-BLGyhUXx.js"></script>
<link rel="stylesheet" crossorigin href="/life/assets/index-CD8BNp39.css">
```

**问题：** 构建后的资源引用 `/life/assets/...` 路径

**如果用 Nginx serving 需要：**
- 正确配置 `alias` 或 `root` + `try_files`
- 不能简单用 `proxy_pass`

---

## 📋 当前配置文件清单

| 文件 | 状态 | 问题 |
|------|------|------|
| `/etc/nginx/conf.d/life-manager.conf` | 冲突 | proxy_pass 路径错误 |
| `/etc/nginx/conf.d/starry.conf` | 可用 | 正确配置了 /life/ |
| `/root/life-manager/ecosystem.config.js` | PM2配置 | 需验证自启动 |
| `/root/life-manager/frontend/vite.config.js` | 前端proxy | 只在开发模式有效 |

---

## ✅ 正确的配置（starry.conf）

**文件路径：** `/etc/nginx/conf.d/starry.conf`

```nginx
server {
    listen 8975;
    server_name localhost;

    # 前端页面 - base 是 /life/
    location /life/ {
        alias /root/life-manager/frontend/dist/;
        index index.html;
        try_files $uri $uri/ /life/index.html;
    }

    # 静态资源
    location /life/assets/ {
        alias /root/life-manager/frontend/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 转发 /api/* → 后端 5649
    location /api/ {
        proxy_pass http://127.0.0.1:5649;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 首页重定向到 /life/
    location = / {
        return 302 /life/;
    }
}
```

---

## 📍 当前服务端口

| 服务 | 端口 | 进程管理 |
|------|------|----------|
| 星夜前端 | 8975 | PM2 |
| 交易系统前端 | 4816 | PM2 |
| 交易系统后端 | 5649 | PM2 |
| 饮食追踪 | 5001 | PM2 |
| 读书网址 | 6789 | PM2 |

---

## 🔧 建议的修复步骤

1. **删除冲突配置**
   ```bash
   rm /etc/nginx/conf.d/life-manager.conf
   ```

2. **验证 starry.conf 生效**
   ```bash
   /usr/sbin/nginx -t && /usr/sbin/nginx -s reload
   ```

3. **清理旧进程**
   ```bash
   pkill -f "2908"  # 清理旧进程
   ```

4. **重启所有 PM2 服务**
   ```bash
   pm2 restart all
   pm2 save
   ```

5. **验证访问**
   ```bash
   curl -I http://localhost:8975/life/
   curl -I http://localhost:8975/api/stocks
   ```

---

## 📝 备注

- **问题1（配置冲突）** 是导致"页面一直 loading 打不开"的主要原因
- **问题4（Vite proxy）** 说明如果用 IP:端口 直接访问前端，API 请求会失败
- 建议统一通过 Nginx 反向代理访问，不要直接用 IP:端口
