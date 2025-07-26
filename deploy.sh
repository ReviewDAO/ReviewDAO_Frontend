#!/bin/bash

# ReviewDAO Frontend Vercel 部署脚本
# 使用方法: ./deploy.sh

echo "🚀 开始部署 ReviewDAO Frontend 到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "📝 请登录 Vercel..."
    vercel login
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📋 请根据 .env.example 创建 .env 文件并配置必要的环境变量"
    echo "📄 复制示例文件..."
    cp .env.example .env
    echo "✏️  请编辑 .env 文件并添加您的 API 密钥"
    echo "🔑 需要配置的变量:"
    echo "   - VITE_PINATA_API_KEY (Pinata IPFS API 密钥)"
    read -p "配置完成后按 Enter 继续..."
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功"

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 部署成功！"
    echo "🌐 您的应用已部署到 Vercel"
    echo "📱 请在 Vercel Dashboard 中查看部署详情"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi

echo "✨ 部署完成！"