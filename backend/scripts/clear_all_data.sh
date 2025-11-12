#!/bin/bash

# ============================================
# 清空数据库所有数据脚本
# 警告：此脚本将删除所有表中的数据！
# ============================================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 数据库配置（从环境变量或默认值）
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-forum_db}
DB_USER=${DB_USER:-HuangWeiLong}
DB_PASSWORD=${DB_PASSWORD:-20070511SuKiI}

echo -e "${YELLOW}警告：此操作将删除数据库中的所有数据！${NC}"
echo -e "${YELLOW}数据库: ${DB_NAME}${NC}"
echo -e "${YELLOW}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo ""
read -p "确认要继续吗？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}操作已取消${NC}"
    exit 1
fi

# 执行 SQL 脚本
echo -e "${GREEN}正在清空数据库...${NC}"

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/clear_all_data.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库已清空${NC}"
else
    echo -e "${RED}✗ 清空失败${NC}"
    exit 1
fi

