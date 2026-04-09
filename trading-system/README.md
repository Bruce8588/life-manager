# 交易系统

一个集备忘录、逻辑分组、股票管理和交易模型于一体的个人交易系统。

## 功能特性

### 📝 备忘录
- 记录你对市场的看法和观点
- 支持编辑和删除
- 时间戳自动记录

### 🧩 逻辑分组
- 创建交易逻辑分组
- 自定义分组颜色
- 为股票分配分组

### 📊 股票管理
- 添加、编辑、删除股票
- 记录股票代码、名称、行业、价格等信息
- **自定义字段**：自由添加字段（如市盈率、业绩等）
- 支持文本、数字、日期类型的字段

### 🎨 交易模型
- 文字描述 + 画图建模
- 内置绘图工具：画笔、橡皮擦、直线、矩形、圆形、文字
- 多种颜色可选
- 画布支持撤销和清空

## 技术栈

- **前端**: React + Vite + Tailwind CSS
- **后端**: Python Flask + SQLAlchemy
- **数据库**: SQLite

## 安装与运行

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

后端服务将在 http://localhost:5000 启动

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 http://localhost:3000 启动

### 3. 访问

在浏览器中打开 http://localhost:3000

## 项目结构

```
trading-system/
├── backend/
│   ├── app.py           # Flask API
│   ├── requirements.txt # Python 依赖
│   └── trading_system.db # SQLite 数据库
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/          # 画布组件
│   │   │   ├── LogicGroups/     # 逻辑分组
│   │   │   ├── Memo/            # 备忘录
│   │   │   ├── Stocks/          # 股票管理
│   │   │   └── TradingModels/   # 交易模型
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API 接口

### 备忘录
- `GET /api/memos` - 获取所有备忘录
- `POST /api/memos` - 创建备忘录
- `PUT /api/memos/:id` - 更新备忘录
- `DELETE /api/memos/:id` - 删除备忘录

### 逻辑分组
- `GET /api/logic-groups` - 获取所有分组
- `POST /api/logic-groups` - 创建分组
- `PUT /api/logic-groups/:id` - 更新分组
- `DELETE /api/logic-groups/:id` - 删除分组

### 股票
- `GET /api/stocks` - 获取所有股票
- `POST /api/stocks` - 添加股票
- `PUT /api/stocks/:id` - 更新股票
- `DELETE /api/stocks/:id` - 删除股票

### 自定义字段
- `GET /api/custom-fields` - 获取所有字段
- `POST /api/custom-fields` - 创建字段
- `PUT /api/custom-fields/:id` - 更新字段
- `DELETE /api/custom-fields/:id` - 删除字段

### 交易模型
- `GET /api/models` - 获取所有模型
- `POST /api/models` - 创建模型
- `PUT /api/models/:id` - 更新模型
- `DELETE /api/models/:id` - 删除模型
- `POST /api/models/:id/drawing` - 保存绘图数据
