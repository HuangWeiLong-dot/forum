#!/bin/bash

# 手动部署脚本
# 如果 SSH 连接有问题，可以通过服务器控制台运行此脚本

set -e

echo "🚀 Starting manual deployment..."

PROJECT_DIR="/opt/ReForum"
cd "$PROJECT_DIR" || exit 1

echo "📦 Pulling latest code..."
git pull origin master

echo "🛑 Stopping containers..."
docker-compose down

echo "🔨 Building images..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services..."
sleep 10

echo "📋 Container status:"
docker-compose ps

echo "📊 Recent logs:"
docker-compose logs --tail=30

echo "✅ Deployment completed!"

