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

REM 清理可能的包管理器冲突
if exist "package-lock.json" (
    echo 🧹 清理包管理器冲突...
    del "package-lock.json"
    echo ✅ 已删除 package-lock.json
)

REM 运行故障排除检查
echo 🔍 运行部署前检查...
node troubleshoot-deployment.js
if errorlevel 1 (
    echo ⚠️  发现潜在问题，请查看上述检查结果
    echo 💡 您可以选择继续部署或先解决问题
    set /p continue="是否继续部署？(y/N): "
    if /i not "!continue!"=="y" (
        echo 🛑 部署已取消
        pause
        exit /b 1
    )
)

REM 检查环境变量
echo 🔑 检查环境变量配置...
node check-env.js
if errorlevel 1 (
    echo ❌ 环境变量检查失败
    echo 📋 请确保配置了必要的环境变量
    echo 🔑 需要配置的变量:
    echo    - VITE_PINATA_API_KEY (Pinata IPFS API 密钥)
    echo    - NODE_ENV (建议设置为 production)
    echo.
    if not exist ".env" (
        if exist ".env.example" (
            echo 📄 复制示例文件...
            copy ".env.example" ".env"
            echo ✏️  请编辑 .env 文件并添加您的 API 密钥
        )
    )
    pause
    exit /b 1
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