#!/bin/bash

# ============================================
# 使用 Docker 清空数据库所有数据脚本
# 警告：此脚本将删除所有表中的数据！
# ============================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 从 docker-compose.yml 获取数据库配置
DB_NAME="forum_db"
DB_USER="HuangWeiLong"
DB_PASSWORD="20070511SuKiI"
CONTAINER_NAME="reforum-db-1"  # 根据实际容器名称调整

echo -e "${YELLOW}警告：此操作将删除数据库中的所有数据！${NC}"
echo -e "${YELLOW}容器: ${CONTAINER_NAME}${NC}"
echo -e "${YELLOW}数据库: ${DB_NAME}${NC}"
echo ""
read -p "确认要继续吗？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}操作已取消${NC}"
    exit 1
fi

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/clear_all_data.sql"

# 检查容器是否存在
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}错误：容器 ${CONTAINER_NAME} 未运行${NC}"
    echo "请先启动 Docker 容器：docker-compose up -d"
    exit 1
fi

# 执行 SQL 脚本
echo -e "${GREEN}正在清空数据库...${NC}"

docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} < ${SQL_FILE}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库已清空${NC}"
else
    echo -e "${RED}✗ 清空失败${NC}"
    exit 1
fi

