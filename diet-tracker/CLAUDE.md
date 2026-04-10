# 饮食记录网站

小红书风格的饮食记录应用，支持多用户、照片上传、每日邮件汇总。

## 功能

- ✅ 用户注册/登录（用户名 + 邮箱 + 密码）
- ✅ 记录饮食（拍照 + 食物名称 + 分类）
- ✅ 首页只显示当前用户的记录
- ✅ AI管理后台（手动发送邮件、查看状态）
- ✅ 每日自动邮件汇总（每天早上8点发送前一天的饮食给所有用户）

## 技术栈

- Python Flask
- SQLite 数据库
- HTML/CSS/JS（小红书风格）

## 启动

**本地：**
```bash
cd ~/Desktop/diet-tracker
python3 app.py
```
访问：`http://localhost:5001`

**阿里云服务器：**
```bash
ssh -i ~/.ssh/iris.pem root@8.129.109.139
cd /root/diet-tracker
python3 app.py
```
访问：`http://8.129.109.139:5001`

## 数据库

- 文件：`diet_tracker.db`
- **重要：与代码在同一文件夹，更新网站时不要删除！**

## ⚠️ 更新网站注意事项

**更新网站代码时（如替换 app.py 或 templates/），必须：**

1. **保留 `diet_tracker.db` 文件** — 这是用户数据和饮食记录的数据库
2. **保留 `static/uploads/` 文件夹** — 这是用户上传的照片
3. 只替换需要更新的文件

**正确更新步骤：**
```bash
# 1. 停止服务器
pkill -f 'python.*app.py'

# 2. 同步代码（排除数据库）
rsync -avz --exclude='diet_tracker.db' --exclude='__pycache__' \
    -e "ssh -i ~/.ssh/iris.pem" \
    ~/Desktop/diet-tracker/ root@8.129.109.139:/root/diet-tracker/

# 3. 重启服务器
cd /root/diet-tracker
python3 app.py
```

**如果误删数据库，用户账号和记录将全部丢失！**

## 邮件配置

- 发件邮箱：`1299960857@qq.com`
- SMTP 服务器：`smtp.qq.com`
- 端口：`587`
- 授权码：`yckyfmrldseajfgi`

## 管理后台

**AI管理后台（无需登录）：**
- 地址：`http://8.129.109.139:5001/ai-admin`
- 功能：发送邮件、查看状态

**用户管理后台（需要登录）：**
- 地址：`http://8.129.109.139:5001/admin`

## 定时任务

- 每天早上 8:00 自动发送前一天的饮食汇报给所有用户
- 查看定时任务：`crontab -l`
- 日志位置：`/tmp/diet_cron.log`

## API 密钥

- 管理密钥：`admin-secret-key`

## 文件结构

```
diet-tracker/
├── app.py              # Flask 后端
├── send_digest.py      # 邮件发送脚本（定时任务用）
├── diet_tracker.db     # SQLite 数据库（重要！）
├── static/
│   ├── css/           # 样式
│   ├── js/            # 脚本
│   └── uploads/       # 用户上传的照片（重要！）
├── templates/
│   ├── index.html     # 首页
│   ├── add.html       # 添加记录
│   ├── login.html     # 登录
│   ├── register.html  # 注册
│   ├── admin.html     # 用户管理后台
│   ├── ai_admin.html  # AI管理后台
│   └── calendar.html  # 日历
└── CLAUDE.md          # 本文件
```

## 同步命令

**本地 → 阿里云（同步所有文件）：**
```bash
rsync -avz -e "ssh -i ~/.ssh/iris.pem" \
    ~/Desktop/diet-tracker/ root@8.129.109.139:/root/diet-tracker/
```

**本地 → 阿里云（排除数据库和缓存）：**
```bash
rsync -avz --exclude='diet_tracker.db' --exclude='__pycache__' --exclude='*.pyc' \
    -e "ssh -i ~/.ssh/iris.pem" \
    ~/Desktop/diet-tracker/ root@8.129.109.139:/root/diet-tracker/
```
