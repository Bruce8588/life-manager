# 星夜 (Star Night) - 项目规范文档

> 记录星夜项目的愿景、目标和设计决策

---

## 愿景

**一个统一的人生管理系统**，以星夜为入口，整合生活中的各个维度——健康、财务、职业、学习、心理等。

**核心理念**：简洁、温暖、有序。不追求功能堆砌，而是让每个功能都恰到好处。

---

## 项目结构

```
Bruce8588/life-manager (GitHub主仓库)
│
├── SPEC.md              # 本文档
├── README.md            # 项目说明
├── deploy/              # 部署配置
│
├── frontend/            # 星夜导航系统 (port 3001, 访问 /life/)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── HomePage.jsx    # 星夜首页（6大项目入口）
│           └── BodyHub.jsx     # 身体模块（跳转饮食追踪）
│
└── trading-system/      # 交易系统 (port 3000)
    ├── backend/         # Flask API
    │   ├── app.py       # 所有API路由
    │   ├── requirements.txt
    │   └── trading_system.db  # SQLite数据库
    │
    └── frontend/        # React前端
        ├── index.html
        ├── vite.config.js
        ├── src/
        │   ├── App.jsx           # 主应用+路由
        │   └── components/       # 8个功能页面
        │       ├── MarketInfo/      # 市场信息
        │       ├── Memo/            # 宏观叙事
        │       ├── LogicGroups/     # 逻辑分组
        │       ├── Stocks/          # 股票管理
        │       ├── TradingModels/   # 交易模型
        │       ├── RiskControl/     # 决策与风控
        │       ├── TradingReview/   # 交易复盘
        │       ├── MarketRecords/    # 行情记录
        │       └── Canvas/          # 画布组件
        └── package.json
```

---

## 相关独立项目

| 项目 | GitHub仓库 | 说明 |
|------|-----------|------|
| Raven | Bruce8588/Raven | 股票追踪系统（iFinD API） |
| diet-tracker | Bruce8588/diet-tracker | 饮食追踪系统 |
| goal-app-macos | Bruce8588/goal-app-macos | Mac目标管理App |

---

## 技术栈

### 星夜导航 (frontend/)
- React 18 + Vite
- Tailwind CSS
- React Router
- dnd-kit (拖拽排序)

### 交易系统 (trading-system/)
- **前端**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **后端**: Python Flask + SQLAlchemy
- **数据库**: SQLite
- **画布**: HTML5 Canvas + React

---

## 端口分配

| 端口 | 服务 | Nginx路径 | 说明 |
|------|------|-----------|------|
| 3000 | trading-system 前端 | /trading-p9m4v/ | 交易系统主界面 |
| 3001 | 星夜导航 | /starry-h7k2s/life/ | 星夜入口页面 |
| 5001 | trading-system API | /api | Flask后端API |
| 5002 | 饮食追踪 | /diet-n8w3x/ | 饮食追踪系统 |

---

## 数据库表结构

```
trading_system.db (13张表)
├── stocks              # 股票信息
├── logic_groups        # 逻辑分组
├── custom_fields       # 自定义字段
├── stock_field_values  # 股票字段值
├── memos               # 宏观叙事/备忘录
├── trading_models       # 交易模型
├── decisions           # 决策记录
├── risk_positions      # 风险持仓
├── risk_rules          # 风控规则
├── risk_alerts         # 风险警报
├── market_records      # 行情记录
├── market_entries      # 市场条目
└── trading_reviews     # 交易复盘
```

---

## 工作流程

### 开发流程
```
本地开发 → GitHub push → 服务器 git pull → 重启服务
```

### Git 规范
```bash
# 提交格式
[类型] 简短描述

# 类型
新增 / 修改 / 修复 / 优化 / 文档 / 配置

# 示例
[优化] 行情记录趋势列颜色一致
[修复] 修正股票删除问题
```

### 服务器部署
```bash
# 1. 更新代码
cd /root/life-manager/trading-system
git pull origin main

# 2. 重启后端
pkill -f 'python.*app.py'
cd backend && nohup python app.py > /tmp/backend.log &

# 3. 重启前端
cd frontend && fuser -k 3000/tcp
nohup node node_modules/.bin/vite --host --port 3000 > /tmp/vite.log &
```

---

## 设计原则

1. **星夜作为唯一入口** - 保持用户体验统一
2. **子系统独立运行** - 便于单独迭代和维护
3. **数据自主可控** - 优先本地存储，减少依赖
4. **渐进式增强** - 先满足核心需求，再逐步完善

---

## 未来规划

### 近期（TODO）
- [ ] 统一身份认证（单点登录）
- [ ] 论文项目详情页开发
- [ ] 职业发展项目详情页开发
- [ ] 积累项目详情页开发
- [ ] 行情记录数据导出Excel
- [ ] 全局搜索功能

### 中期
- [ ] 交易系统内嵌到星夜（iframe或API集成）
- [ ] 数据可视化（图表）
- [ ] 移动端适配

### 远期
- [ ] 跨设备同步
- [ ] AI 辅助分析和建议
- [ ] 社区分享功能

---

## 决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-04-10 | 保持三个子系统独立运行 | 降低耦合度，便于单独迭代 |
| 2026-04-10 | 饮食追踪移入 life-manager | 便于统一管理和文档 |
| 2026-04-10 | 星夜作为导航入口 | 用户体验统一，减少认知负担 |
| 2026-04-10 | 交易系统8个页面 | 市场、叙事、分组、股票、模型、风控、复盘、记录 |
