#!/bin/bash
# 部署脚本：同步代码到服务器，但不覆盖数据库
# 使用方法: ./deploy.sh [服务器路径]

SERVER_PATH="${1:-root@8.129.109.139:/root/life-manager/trading-system}"
LOCAL_PATH="~/Desktop/AI项目/life-manager/trading-system"

echo "⚠️  注意：数据库文件不会被同步！"
echo ""
echo "同步内容：代码、配置文件"
echo "保留内容：trading_system.db（服务器数据库）"
echo ""

rsync -avz \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.DS_Store' \
  --exclude='*.db' \
  --exclude='trading_system.db' \
  --exclude='*.pyc' \
  -e "ssh -i ~/.ssh/iris.pem" \
  "$LOCAL_PATH/" "$SERVER_PATH/"

echo ""
echo "✅ 部署完成！数据库文件已保留。"
