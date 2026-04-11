# Nginx 配置验证报告

**验证时间：** 2026-04-11 09:03 GMT+8
**Nginx 状态：** ✅ 运行中

---

## 一、端口映射核对

### PM2 实际服务端口

| 服务 | PM2 进程 | 实际端口 | 监听协议 |
|------|----------|----------|----------|
| 星夜 (starry) | vite --port 8975 | 8975 | IPv6 TCP |
| 交易系统前端 | vite --port 4816 | 4816 | IPv6 TCP |
| 交易系统后端 | trading-backend | 5649 | IPv4 TCP |
| 饮食追踪 | diet-tracker | 5001 | IPv4 TCP |
| 读书网址 | reading frontend | 6789 | IPv6 TCP |

### Nginx 端口映射（修复后）

| 文件 | 路径 | 代理目标 | 状态 |
|------|------|----------|------|
| `vite-proxy.conf` (HTTPS) | `/trading/` | `127.0.0.1:4816` | ✅ 已修复 |
| `vite-proxy.conf` (HTTPS) | `/life/` | `127.0.0.1:8975` | ✅ 已修复 |
| `star.conf` (HTTP) | `/starry-h7k2s/` | `127.0.0.1:8975` | ✅ 已修复 |
| `star.conf` (HTTP) | `/trading-p9m4v/` | `127.0.0.1:4816` | ✅ 已修复 |
| `star.conf` (HTTP) | `/diet-n8w3x/` | `127.0.0.1:5001` | ✅ 正确 |
| `star.conf` (HTTP) | `/` (root) | return 404 | ✅ 正确 |

**本次修复内容：**
- `vite-proxy.conf`: `/trading/` 从 `4818` → `4816`（前端实际端口）
- `vite-proxy.conf`: `/life/` 从 `8976` → `8975`（星夜实际端口）
- `star.conf`: `/starry-h7k2s/` 从 `3001` → `8975`
- `star.conf`: `/trading-p9m4v/` 从 `3000` → `4816`

---

## 二、路由验证结果

### vite-proxy.conf（HTTPS，localhost）

| 路径 | 预期 | 实际 | 状态 |
|------|------|------|------|
| `https://localhost/trading/` | 200/302 | **302** | ✅ |
| `https://localhost/life/` | 200/302 | **302** | ✅ |

### star.conf（HTTP，8.129.109.139）

| 路径 | 预期 | 实际 | 状态 |
|------|------|------|------|
| `http://8.129.109.139/starry-h7k2s/` | 200/302 | **302** | ✅ |
| `http://8.129.109.139/trading-p9m4v/` | 200/302 | **200** | ✅ |
| `http://8.129.109.139/diet-n8w3x/` | 200/302 | **302** | ✅ |
| `http://8.129.109.139/` (root) | 404 | **404** | ✅ |

**注：** 302 为 Vite dev server 的标准行为（自动重定向到带斜杠的路径）

---

## 三、关键配置原则确认

所有 location 路径均以 `/` 结尾，所有 proxy_pass 均以 `/` 结尾，确保：
- `location /trading/` + `proxy_pass http://127.0.0.1:4816/` 
- 访问 `/trading/foo` → 转发为 `http://127.0.0.1:4816/foo` ✅

---

## 四、未覆盖路由

| 服务 | 端口 | 说明 |
|------|------|------|
| 交易系统后端 | 5649 | API 端口，需要 nginx 路由才可外部访问（目前由前端 dev server 代理） |
| 读书网址 | 6789 | 有 Vite 在跑，但无 nginx 路由对应 |

---

## 五、总结

✅ **Nginx 运行正常，所有端口映射已修正，所有路由均可访问。**
