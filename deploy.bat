@echo off
chcp 65001 >nul
echo 🚀 开始部署 ReviewDAO Frontend 到 Vercel...
echo.

REM 检查是否安装了 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否安装了 Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI 未安装
    echo 📦 正在安装 Vercel CLI...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Vercel CLI 安装失败
        pause
        exit /b 1
    )
)

REM 检查是否已登录 Vercel
echo 🔐 检查 Vercel 登录状态...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 📝 请登录 Vercel...
    vercel login
    if errorlevel 1 (
        echo ❌ Vercel 登录失败
        pause
        exit /b 1
    )
)

REM 检查环境变量文件
if not exist ".env" (
    echo ⚠️  未找到 .env 文件
    echo 📋 请根据 .env.example 创建 .env 文件并配置必要的环境变量
    if exist ".env.example" (
        echo 📄 复制示例文件...
        copy ".env.example" ".env"
    )
    echo ✏️  请编辑 .env 文件并添加您的 API 密钥
    echo 🔑 需要配置的变量:
    echo    - VITE_PINATA_API_KEY (Pinata IPFS API 密钥)
    echo.
    pause
)

REM 安装依赖
echo 📦 安装项目依赖...
npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

REM 构建项目
echo 🔨 构建项目...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 构建成功
echo.

REM 部署到 Vercel
echo 🚀 部署到 Vercel...
vercel --prod
if errorlevel 1 (
    echo ❌ 部署失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo 🎉 部署成功！
echo 🌐 您的应用已部署到 Vercel
echo 📱 请在 Vercel Dashboard 中查看部署详情
echo ✨ 部署完成！
echo.
pause