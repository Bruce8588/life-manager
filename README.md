# 星夜 (Star Night) - 人生管理系统

一个统一的人生管理系统，以星夜为入口，整合生活中的各个维度。

🌐 **访问地址**: https://8.129.109.139/life/

---

## 项目组成

```
life-manager/
├── frontend/           # 星夜导航 (port 3001)
│   └── src/components/HomePage.jsx  # 首页
│
└── trading-system/    # 交易系统 (port 3000)
    ├── backend/        # Flask API
    └── frontend/       # React前端
```

---

## 功能模块

### 🌟 星夜导航 (首页)
- 💪 身体 - 饮食追踪
- 💰 财务 - 交易系统
- 📄 论文 - 学术研究
- 💼 职业发展
- 📚 积累
- 🧠 心理

### 📊 交易系统 (8个页面)
1. **市场信息** - 宏观市场数据
2. **宏观叙事** - 备忘录/观点记录
3. **逻辑分组** - 交易逻辑分组管理
4. **股票管理** - 股票列表和详情
5. **交易模型** - 交易策略+画图
6. **决策与风控** - 投资决策和风险管理
7. **交易复盘** - 复盘记录
8. **行情记录** - 趋势跟踪表格

---

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **后端**: Python Flask + SQLAlchemy
- **数据库**: SQLite
- **画布**: HTML5 Canvas

---

## 开发

### 本地启动

```bash
# 星夜导航
cd frontend
npm install
npm run dev    # http://localhost:3001/life/

# 交易系统前端
cd trading-system/frontend
npm install
npm run dev    # http://localhost:3000

# 交易系统后端
cd trading-system/backend
pip install -r requirements.txt
python app.py  # http://localhost:5001
```

### 部署到服务器

```bash
# 连接服务器
ssh -i ~/.ssh/iris.pem root@8.129.109.139

# 更新代码
cd /root/life-manager/trading-system
git pull origin main

# 重启服务
pm2 restart all  # 或手动重启
```

---

## GitHub 仓库

| 项目 | 仓库 |
|------|------|
| 星夜+交易系统 | https://github.com/Bruce8588/life-manager |
| Raven (股票追踪) | https://github.com/Bruce8588/Raven |
| 饮食追踪 | https://github.com/Bruce8588/diet-tracker |
| 目标管理App | https://github.com/Bruce8588/goal-app-macos |

---

## 工作流程

```
本地开发 → git push → GitHub → 服务器 git pull → 重启服务
```

### 提交规范
```
[类型] 简短描述

类型: 新增 / 修改 / 修复 / 优化 / 文档 / 配置
```

---

详情请查看 [SPEC.md](./SPEC.md)
