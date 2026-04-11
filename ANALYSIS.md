# Life-Manager 服务稳定性与前端管理分析

## 问题1：服务不稳定根因分析

### 🔴 严重问题（立即修复）

#### 1. 端口冲突 - 核心问题

**现象**：日志中大量 `OSError: [Errno 98] Address already in use`

**原因**：
- `diet-tracker/app.py` 运行在端口 **5001**
- 日志显示 `trading-system` 也在尝试绑定 5001（应该是 5649）
- 多次启动导致端口冲突

**当前端口占用**：
| 端口 | 服务 | 状态 |
|------|------|------|
| 5001 | diet-tracker (Flask) | ✅ 运行中 |
| 5649 | trading-system backend (Flask) | ✅ 运行中 |
| 3000-3003 | vite frontend (多个冲突实例) | ⚠️ 混乱 |
| 8080 | searxng | ✅ 独立 |

#### 2. 无进程管理 - 根本原因

**当前问题**：
- 所有服务直接用 `python3 app.py` 或 `vite` 启动
- 没有 PM2 / supervisor / systemd 管理
- 服务崩溃后不会自动重启
- 没有进程监控和日志轮转

**日志证据**：
```
Traceback (most recent call last):
  File "app.py", line 984, in <module>
    app.run(debug=True, host='0.0.0.0', port=5001)
OSError: [Errno 98] Address already in use
```

#### 3. Debug 模式在生产环境 - 导致频繁重启

所有 Flask 服务都配置了 `debug=True`：
- `diet-tracker/app.py`: `app.run(debug=True, host='0.0.0.0', port=5001)`
- `trading-system/backend/app.py`: `app.run(debug=True, host='0.0.0.0', port=5649)`

**Debug 模式问题**：
- 文件变化时自动重启（`* Restarting with stat`）
- 不适合生产环境
- 占用更多内存

#### 4. 前端代理配置错误

**问题**：`/root/life-manager/frontend/vite.config.js`
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5649',  // 指向 trading-system，而非 life-manager 后端
  }
}
```

但 `lifeApi.js` 中的 API base 是 `/api/life`，没有对应后端服务！

### 🟡 中等问题

#### 5. 数据库路径问题

**错误**：`sqlite3.OperationalError: unable open database file`
- diet-tracker 的数据库路径可能不正确

#### 6. 多个 Vite 实例抢占端口

日志显示：
```
Port 3001 is in use, trying another one...
Port 3002 is in use, trying another one...
...
  ➜  Local:   http://localhost:3003/life/
```

---

## 问题2：星夜无法有效管理

### 当前前端架构问题

1. **没有统一入口** - 星夜需要在多个标签页间切换
2. **无服务状态监控** - 看不到子服务是否在线
3. **无快捷操作** - 无法一键重启/停止服务
4. **代理配置混乱** - 不知道自己调用的 API 对应哪个后端

### 当前服务清单

| 服务 | 端口 | 类型 | 功能 |
|------|------|------|------|
| diet-tracker | 5001 | Flask | 饮食记录 + 邮件汇总 |
| trading-system | 5649 | Flask | 股票交易系统 |
| trading-frontend | 4816 | Vite/React | 股票系统前端 |
| life-manager | 8975 | Vite/React | 人生管理前端 |
| reading | 6789 | Vite/React | 读书笔记 |

---

## 修复方案

### 🔴 P0 - 立即修复（不稳定性）

#### 步骤1：安装 PM2 并配置所有服务

```bash
# 安装 PM2
npm install -g pm2

# 为每个服务创建 ecosystem.config.js
```

#### 步骤2：修复 diet-tracker 启动脚本

创建 `/root/life-manager/diet-tracker/start.sh`：
```bash
#!/bin/bash
cd /root/life-manager/diet-tracker
nohup python3 app.py > /tmp/diet-tracker.log 2>&1 &
echo $! > /tmp/diet-tracker.pid
```

#### 步骤3：修复 trading-system backend

将 `debug=False`，关闭 auto-reload：
```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5649)
```

#### 步骤4：修复 diet-tracker

同样关闭 debug 模式

#### 步骤5：统一端口分配

| 服务 | 端口 | 备注 |
|------|------|------|
| diet-tracker | 5001 | 不变 |
| trading-system | 5649 | 不变 |
| trading-frontend | 4816 | Vite → 4816 |
| life-manager | 6789 | Vite → 6789 |
| reading | 6788 | Vite → 6788 |

---

### 🟡 P1 - 短期改进（星夜管理体验）

#### 方案：创建统一管理界面

新建 `service-manager/` 目录，包含：

1. **服务状态监控页** - 显示所有服务在线/离线状态
2. **快捷操作面板** - 重启/停止/启动单个服务
3. **日志查看器** - 查看各服务的实时日志
4. **访问入口** - 一键打开各服务的 URL

#### 修改 `frontend/src/components/HomePage.jsx`

添加服务状态指示器和快捷操作：

```jsx
// 在 HomePage 中添加服务状态组件
const ServiceStatus = ({ name, port, url, status }) => (
  <div className="flex items-center gap-2 p-2 rounded bg-gray-100">
    <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-sm">{name}</span>
    <a href={url} target="_blank" className="text-blue-500 text-sm">访问</a>
  </div>
)

// 在 useEffect 中添加健康检查
useEffect(() => {
  const checkServices = async () => {
    const services = [
      { name: '饮食记录', url: 'http://localhost:5001', check: 'http://localhost:5001/' },
      { name: '交易系统', url: 'http://localhost:4816', check: 'http://localhost:5649/api/stocks' },
      { name: '人生管理', url: 'http://localhost:6789/life', check: 'http://localhost:6789/life/' },
      { name: '读书笔记', url: 'http://localhost:6788/reading', check: 'http://localhost:6788/reading/' },
    ]
    // 检查每个服务状态
  }
  checkServices()
}, [])
```

#### 修复 vite 代理配置

`/root/life-manager/frontend/vite.config.js`:
```javascript
export default defineConfig({
  base: '/life/',
  plugins: [react()],
  server: {
    port: 6789,
    proxy: {
      '/api/life': {
        target: 'http://localhost:5001',  // diet-tracker 提供 life API
        changeOrigin: true
      }
    },
    historyApiFallback: true
  }
})
```

---

## 实施优先级

### 第一阶段：立即止血（5分钟）
1. 杀掉所有重复的 vite 进程
2. 确保每个端口只有一个服务
3. 创建服务启动/停止脚本

### 第二阶段：PM2 管理（30分钟）
1. 安装 PM2
2. 创建 ecosystem 配置
3. 配置开机自启
4. 配置日志轮转

### 第三阶段：前端改进（60分钟）
1. 修复 proxy 配置
2. 添加服务状态监控
3. 添加快捷操作按钮

### 第四阶段：长期优化
1. 关闭所有 debug 模式
2. 配置 nginx 反向代理
3. 添加健康检查端点

---

## 快速修复命令

```bash
# 1. 杀掉所有重复 vite 进程
pkill -f "vite" && sleep 1

# 2. 重启 diet-tracker
cd /root/life-manager/diet-tracker && pkill -f "diet-tracker" && nohup python3 app.py > /tmp/diet-tracker.log 2>&1 &

# 3. 检查端口占用
lsof -i -P -n | grep LISTEN

# 4. 启动 PM2 (如果安装)
pm2 startup
pm2 save
```

---

## 注意事项

1. **trading-system 和 life-manager 前端都代理到 trading-system backend (5649)**，这是正确的设计
2. **life-manager 前端的 API 调用路径**是 `/api/life`，但后端 diet-tracker 可能不提供这个 API，需要确认
3. **reading 服务**目前端口 6789 与 life-manager 冲突，需要重新分配
