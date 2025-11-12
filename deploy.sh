#!/bin/bash

# REForum 部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始部署 REForum 到服务器"
echo "=========================================="

# 进入项目目录
cd /opt/ReForum

echo "1. 拉取最新代码..."
git pull origin master

echo "2. 停止现有容器..."
docker-compose down

echo "3. 重新构建镜像..."
docker-compose build --no-cache

echo "4. 启动容器..."
docker-compose up -d

echo "5. 等待服务启动..."
sleep 10

echo "6. 检查容器状态..."
docker-compose ps

echo "7. 查看最新日志..."
docker-compose logs --tail=50

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo "前端: https://reforum.space"
echo "API: https://api.reforum.space"
echo "=========================================="

