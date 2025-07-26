#!/usr/bin/env node

// 环境变量检查脚本
// 用于验证部署前的环境配置

const fs = require('fs');
const path = require('path');

console.log('🔍 检查环境变量配置...');
console.log('');

// 检查 .env 文件是否存在
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('❌ 未找到 .env 文件');
    
    if (fs.existsSync(envExamplePath)) {
        console.log('📋 发现 .env.example 文件');
        console.log('💡 建议: 复制 .env.example 为 .env 并配置相应的值');
        console.log('   cp .env.example .env');
    }
    
    console.log('');
    console.log('🔑 需要配置的环境变量:');
    console.log('   VITE_PINATA_API_KEY - Pinata IPFS API 密钥');
    console.log('   NODE_ENV - 环境类型 (production)');
    console.log('');
    process.exit(1);
}

// 读取 .env 文件
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    const envVars = {};
    envLines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    });
    
    console.log('✅ 找到 .env 文件');
    console.log('');
    
    // 检查必需的环境变量
    const requiredVars = {
        'VITE_PINATA_API_KEY': 'Pinata IPFS API 密钥'
    };
    
    const optionalVars = {
        'VITE_QUICKNODE_ENDPOINT': 'QuickNode RPC 端点',
        'VITE_QUICKNODE_API_KEY': 'QuickNode API 密钥'
    };
    
    let allRequired = true;
    
    console.log('🔑 必需的环境变量:');
    Object.entries(requiredVars).forEach(([key, description]) => {
        if (envVars[key] && envVars[key] !== 'your_pinata_api_key_here') {
            console.log(`   ✅ ${key}: ${description}`);
        } else {
            console.log(`   ❌ ${key}: ${description} (未配置或使用默认值)`);
            allRequired = false;
        }
    });
    
    console.log('');
    console.log('🔧 可选的环境变量:');
    Object.entries(optionalVars).forEach(([key, description]) => {
        if (envVars[key]) {
            console.log(`   ✅ ${key}: ${description}`);
        } else {
            console.log(`   ⚪ ${key}: ${description} (未配置)`);
        }
    });
    
    console.log('');
    
    if (allRequired) {
        console.log('🎉 所有必需的环境变量都已配置！');
        console.log('🚀 您可以继续部署到 Vercel');
        console.log('');
        console.log('部署命令:');
        console.log('   npm run vercel-build  # 本地构建测试');
        console.log('   vercel --prod         # 部署到生产环境');
    } else {
        console.log('⚠️  请配置所有必需的环境变量后再部署');
        console.log('');
        console.log('获取 API 密钥:');
        console.log('   Pinata: https://app.pinata.cloud/keys');
        console.log('   QuickNode: https://www.quicknode.com/');
        process.exit(1);
    }
    
} catch (error) {
    console.log('❌ 读取 .env 文件失败:', error.message);
    process.exit(1);
}

console.log('');
console.log('📚 更多部署信息请参考: VERCEL_DEPLOYMENT_GUIDE.md');