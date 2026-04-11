# 服务器多服务部署配置完整方案

> 生成时间: 2026-04-11
> 服务器: 8.129.109.139

---

## 📋 端口分配表

| 路径 | 服务名称 | 类型 | 端口 | PM2 名称 |
|------|---------|------|------|---------|
| `/life/` | 星夜前端 | Vite (React) | 8975 | `starry` |
| `/trading/` | 交易系统前端 | Vite (React) | 4816 | `trading-frontend` |
| `/api/` | 交易系统后端 | Flask | 5649 | `trading-backend` |
| `/diet/` | 饮食追踪 | Flask | 5001 | `diet-tracker` |
| `/reading/` | 读书网址 | Vite (React) | 6789 | `reading` |

---

## 1. PM2 服务进程管理

### 配置文件路径
```
/root/life-manager/ecosystem.config.js
```

### 完整配置内容

```javascript
module.exports = {
  apps: [
    // ============================================
    // 星夜 - 前端 (Vite React)
    // 访问路径: /life/
    //============================================
    {
      name: 'starry',
      script: 'npm',
      args: 'run preview -- --host --port 8975',
      cwd: '/root/life-manager/frontend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/starry-error.log',
      out_file: '/root/.pm2/logs/starry-out.log',
      log_file: '/root/.pm2/logs/starry-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 交易系统 - 前端 (Vite React)
    // 访问路径: /trading/
    //============================================
    {
      name: 'trading-frontend',
      script: 'npm',
      args: 'run preview -- --host --port 4816',
      cwd: '/root/life-manager/trading-system/frontend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/trading-frontend-error.log',
      out_file: '/root/.pm2/logs/trading-frontend-out.log',
      log_file: '/root/.pm2/logs/trading-frontend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 交易系统 - 后端 (Flask)
    // 访问路径: /api/
    //============================================
    {
      name: 'trading-backend',
      script: 'app.py',
      cwd: '/root/life-manager/trading-system/backend',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py'
      },
      error_file: '/root/.pm2/logs/trading-backend-error.log',
      out_file: '/root/.pm2/logs/trading-backend-out.log',
      log_file: '/root/.pm2/logs/trading-backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 饮食追踪 (Flask)
    // 访问路径: /diet/
    //============================================
    {
      name: 'diet-tracker',
      script: 'app.py',
      cwd: '/root/life-manager/diet-tracker',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py'
      },
      error_file: '/root/.pm2/logs/diet-tracker-error.log',
      out_file: '/root/.pm2/logs/diet-tracker-out.log',
      log_file: '/root/.pm2/logs/diet-tracker-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },

    // ============================================
    // 读书网址 (Vite React)
    // 访问路径: /reading/
    //============================================
    {
      name: 'reading',
      script: 'npm',
      args: 'run preview -- --host --port 6789',
      cwd: '/root/life-manager/reading/frontend',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/reading-error.log',
      out_file: '/root/.pm2/logs/reading-out.log',
      log_file: '/root/.pm2/logs/reading-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### PM2 常用命令

```bash
# 启动所有服务
cd /root/life-manager
pm2 start ecosystem.config.js

# 查看状态
pm2 list

# 查看日志
pm2 logs starry          # 单个服务日志
pm2 logs --lines 50     # 最近50行所有日志

# 重启服务
pm2 restart starry       # 重启单个
pm2 restart all          # 重启所有

# 停止服务
pm2 stop starry
pm2 stop all

# 删除服务
pm2 delete starry

# 监控面板
pm2 monit
```

---

## 2. Nginx 反向代理配置

### 配置文件路径
```
/etc/nginx/conf.d/life-manager.conf
```

### 完整配置内容

```nginx
# ============================================================
# 生活管理器 - Nginx 反向代理配置
# 端口映射:
#   /life/       -> 星夜前端 (8975)
#   /trading/    -> 交易系统前端 (4816)
#   /api/        -> 交易系统后端 (5649)
#   /diet/       -> 饮食追踪 (5001)
#   /reading/    -> 读书网址 (6789)
# ============================================================

# HTTP (80) - 强制跳转 HTTPS
server {
    listen 80;
    server_name 8.129.109.139;

    # 跳转到 HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS (443) - 主配置
server {
    listen 443 ssl http2;
    server_name 8.129.109.139;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/self-signed.crt;
    ssl_certificate_key /etc/nginx/ssl/self-signed.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 全局设置
    client_max_body_size 100M;
    charset utf-8;

    # ============================================================
    # /life/ -> 星夜前端 (8975)
    # ============================================================
    location /life/ {
        proxy_pass http://127.0.0.1:8975/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持 (Vite HMR / 开发时需要)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://127.0.0.1:8975;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # ============================================================
    # /trading/ -> 交易系统前端 (4816)
    # ============================================================
    location /trading/ {
        proxy_pass http://127.0.0.1:4816/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://127.0.0.1:4816;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # ============================================================
    # /api/ -> 交易系统后端 (5649)
    # ============================================================
    location /api/ {
        proxy_pass http://127.0.0.1:5649/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # POST 请求大小限制
        client_max_body_size 10M;
    }

    # ============================================================
    # /diet/ -> 饮食追踪 (5001)
    # ============================================================
    location /diet/ {
        proxy_pass http://127.0.0.1:5001/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://127.0.0.1:5001;
            expires 7d;
            add_header Cache-Control "public, immutable";
        }
        
        # 上传图片
        location ~* \.(jpg|jpeg|png|gif|webp)$ {
            proxy_pass http://127.0.0.1:5001;
            expires 30d;
        }
    }

    # ============================================================
    # /reading/ -> 读书网址 (6789)
    # ============================================================
    location /reading/ {
        proxy_pass http://127.0.0.1:6789/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://127.0.0.1:6789;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }

    # ============================================================
    # 根路径 -> 404
    # ============================================================
    location = / {
        return 404;
    }
}
```

### Nginx 命令

```bash
# 测试配置语法
/usr/sbin/nginx -t

# 重新加载配置
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 状态
systemctl status nginx

# 查看 Nginx 错误日志
tail -50 /var/log/nginx/error.log
```

---

## 3. 服务器重启后自启动设置

```bash
# 生成 systemd 服务并保存 PM2 进程列表
pm2 startup
pm2 save

# 验证自启动
systemctl status pm2-root
```

**注意**: `pm2 startup` 命令已自动检测到 systemd 并生成了服务单元。重启服务器后 PM2 会自动恢复所有进程。

---

## 4. 验证步骤

### 4.1 检查 PM2 服务状态

```bash
pm2 list
```

**预期输出**: 所有 5 个服务状态为 `online`，无 `errored`

### 4.2 检查端口监听

```bash
ss -tlnp | grep -E '8975|4816|5649|5001|6789'
```

**预期输出**: 每个端口都有对应进程在监听

### 4.3 检查 Nginx 配置

```bash
/usr/sbin/nginx -t
```

**预期输出**: `syntax is ok` 和 `test is successful`

### 4.4 逐个测试直接访问后端服务

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8975/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4816/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5649/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5001/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:6789/
```

### 4.5 测试 Nginx 代理（通过外部访问）

```bash
# 通过 https 访问各路径
curl -k -s -o /dev/null -w "%{http_code}" https://8.129.109.139/life/
curl -k -s -o /dev/null -w "%{http_code}" https://8.129.109.139/trading/
curl -k -s -o /dev/null -w "%{http_code}" https://8.129.109.139/diet/
curl -k -s -o /dev/null -w "%{http_code}" https://8.129.109.139/reading/
```

### 4.6 完整健康检查脚本

```bash
#!/bin/bash
echo "=== PM2 Status ==="
pm2 list
echo ""
echo "=== Port Status ==="
ss -tlnp | grep -E '8975|4816|5649|5001|6789'
echo ""
echo "=== Nginx Test ==="
/usr/sbin/nginx -t
echo ""
echo "=== Service Health Check ==="
for port in 8975 4816 5649 5001 6789; do
    code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$port/)
    echo "Port $port: HTTP $code"
done
```

---

## 5. 常见问题排查指南

### 问题 1: 502 Bad Gateway

**原因**: 后端服务未启动或端口未监听

**排查步骤**:
```bash
# 1. 检查 PM2 状态
pm2 list

# 2. 检查端口监听
ss -tlnp | grep <端口号>

# 3. 查看后端日志
pm2 logs <服务名> --lines 50

# 4. 重启后端服务
pm2 restart <服务名>
```

### 问题 2: 404 Not Found

**原因**: 
- Vite `base` 配置与 Nginx `location` 不匹配
- 后端路由问题

**排查步骤**:
```bash
# 1. 检查 Vite 配置的 base 是否与 location 匹配
# 例如 vite.config.js: base: '/life/'
# 匹配的 Nginx location: location /life/

# 2. 直接测试后端端口
curl http://127.0.0.1:<端口>/
```

### 问题 3: 静态资源 404

**原因**: Vite 打包后的静态资源路径问题

**解决方案**:
确保 `vite.config.js` 中的 `base` 与 Nginx `location` 一致:
```javascript
// vite.config.js
export default defineConfig({
  base: '/life/',  // 必须与 Nginx location 匹配
  // ...
})
```

### 问题 4: CSS/JS 加载失败

**原因**: 直接访问后端静态文件端口可以，但代理后失败

**排查步骤**:
```bash
# 1. 检查 Vite 构建产物
ls /root/life-manager/frontend/dist/

# 2. 检查 Nginx 静态资源 location 配置
# 确保静态资源 location 在正确的 location 块内
```

### 问题 5: PM2 服务崩溃重启

**原因**: 内存超限或代码错误

**排查步骤**:
```bash
# 1. 查看重启次数
pm2 list

# 2. 查看错误日志
pm2 logs <服务名> --err --lines 100

# 3. 检查内存使用
pm2 monit
```

### 问题 6: Nginx 配置测试失败

**原因**: 语法错误或 SSL 证书问题

**排查步骤**:
```bash
# 1. 查看详细错误
/usr/sbin/nginx -t 2>&1

# 2. 检查 SSL 证书是否存在
ls -la /etc/nginx/ssl/

# 3. 查看 Nginx 错误日志
tail -20 /var/log/nginx/error.log
```

### 问题 7: WebSocket 连接失败

**原因**: Vite HMR 或 WebSocket 服务未正确配置

**排查步骤**:
确保 Nginx 配置包含:
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### 问题 8: 服务器重启后服务未启动

**排查步骤**:
```bash
# 1. 验证 PM2 自启动配置
pm2 startup
pm2 save
systemctl status pm2-root

# 2. 检查 dump 文件
ls -la /root/.pm2/dump.pm2
```

---

## 6. 日志文件路径

| 服务 | 日志路径 |
|------|---------|
| starry | `/root/.pm2/logs/starry-*.log` |
| trading-frontend | `/root/.pm2/logs/trading-frontend-*.log` |
| trading-backend | `/root/.pm2/logs/trading-backend-*.log` |
| diet-tracker | `/root/.pm2/logs/diet-tracker-*.log` |
| reading | `/root/.pm2/logs/reading-*.log` |
| Nginx | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |

---

## 7. 快速命令速查

```bash
# 启动所有服务
cd /root/life-manager && pm2 start ecosystem.config.js

# 重启所有服务
pm2 restart all

# 查看所有日志
pm2 logs --lines 100

# 查看特定服务日志
pm2 logs starry

# 重新加载 Nginx
systemctl reload nginx

# 完整健康检查
pm2 list && /usr/sbin/nginx -t && ss -tlnp | grep -E '8975|4816|5649|5001|6789'
```

---

*本文档由 AI 自动生成，最后更新: 2026-04-11*
