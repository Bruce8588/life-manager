#!/bin/bash
# 数据库备份脚本 - 在每次代码更新前执行
# 会从服务器下载最新的数据库作为备份

SERVER_DB="root@8.129.109.139:/root/life-manager/trading-system/backend/trading_system.db"
LOCAL_DIR="~/Desktop/AI项目/life-manager/trading-system/backend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 正在备份服务器数据库..."

# 下载服务器数据库作为备份（带时间戳）
scp -i ~/.ssh/iris.pem "$SERVER_DB" "$LOCAL_DIR/trading_system_backup_$TIMESTAMP.db"

# 同时更新最新的备份（不带时间戳，供部署时参考）
scp -i ~/.ssh/iris.pem "$SERVER_DB" "$LOCAL_DIR/trading_system_backup_latest.db"

echo "✅ 数据库备份完成: trading_system_backup_$TIMESTAMP.db"
echo "   最新备份: trading_system_backup_latest.db"
