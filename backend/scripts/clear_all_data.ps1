# ============================================
# 清空数据库所有数据脚本 (PowerShell)
# 警告：此脚本将删除所有表中的数据！
# ============================================

# 数据库配置（从环境变量或默认值）
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "forum_db" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "HuangWeiLong" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "20070511SuKiI" }

Write-Host "警告：此操作将删除数据库中的所有数据！" -ForegroundColor Yellow
Write-Host "数据库: $DB_NAME" -ForegroundColor Yellow
Write-Host "主机: ${DB_HOST}:${DB_PORT}" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "确认要继续吗？(yes/no)"

if ($confirm -ne "yes") {
    Write-Host "操作已取消" -ForegroundColor Red
    exit 1
}

# 获取脚本目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "clear_all_data.sql"

# 设置环境变量
$env:PGPASSWORD = $DB_PASSWORD

# 执行 SQL 脚本
Write-Host "正在清空数据库..." -ForegroundColor Green

$psqlPath = "psql"
if (Get-Command psql -ErrorAction SilentlyContinue) {
    $psqlPath = (Get-Command psql).Source
} else {
    Write-Host "错误：未找到 psql 命令，请确保 PostgreSQL 客户端已安装并在 PATH 中" -ForegroundColor Red
    exit 1
}

& $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 数据库已清空" -ForegroundColor Green
} else {
    Write-Host "✗ 清空失败" -ForegroundColor Red
    exit 1
}

