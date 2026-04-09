#!/bin/bash
# 部署脚本：同步代码到服务器，但永远不覆盖服务器数据库
# 使用方法: ./deploy.sh

set -e

SERVER_PATH="root@8.129.109.139:/root/life-manager/trading-system"
LOCAL_PATH="/Users/isenfengming/Desktop/AI项目/life-manager/trading-system"

echo "============================================"
echo "🚀 开始部署交易系统"
echo "============================================"
echo ""
echo "⚠️  安全检查：数据库文件不会被同步"
echo ""

# Step 1: 备份服务器数据库（以防万一）
echo "📦 Step 1: 备份服务器数据库..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$LOCAL_PATH/backend/db_backups"
mkdir -p "$BACKUP_DIR"
scp -i ~/.ssh/iris.pem \
  "root@8.129.109.139:/root/life-manager/trading-system/backend/trading_system.db" \
  "$BACKUP_DIR/trading_system_$TIMESTAMP.db" 2>/dev/null || true
echo "   ✅ 已备份到 db_backups/trading_system_$TIMESTAMP.db"

# Step 2: 同步代码（排除数据库）
echo ""
echo "📤 Step 2: 同步代码到服务器（排除数据库）..."
rsync -avz \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.DS_Store' \
  --exclude='*.db' \
  --exclude='*.pyc' \
  --exclude='db_backups/' \
  --exclude='deploy.sh' \
  --exclude='backup-db.sh' \
  --exclude='*.log' \
  -e "ssh -i ~/.ssh/iris.pem" \
  "$LOCAL_PATH/" \
  "$SERVER_PATH/"

# Step 3: 重启服务
echo ""
echo "🔄 Step 3: 重启 Flask 服务..."
ssh -i ~/.ssh/iris.pem root@8.129.109.139 \
  "cd /root/life-manager/trading-system/backend && pkill -f 'python.*app.py' ; sleep 1 && nohup python3 app.py > /tmp/flask.log 2>&1 &"

echo ""
echo "============================================"
echo "✅ 部署完成！"
echo "============================================"
echo ""
echo "服务器数据库保留原样，未被修改 ✓"
