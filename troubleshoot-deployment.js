#!/usr/bin/env node

/**
 * ReviewDAO 部署故障排除脚本
 * 用于诊断和解决常见的 Vercel 部署问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ReviewDAO 部署故障排除工具\n');

// 检查项目结构
function checkProjectStructure() {
  console.log('📁 检查项目结构...');
  
  const requiredFiles = [
    'package.json',
    'vercel.json',
    'vite.config.ts',
    'index.html',
    'src/main.tsx'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    console.log('✅ 项目结构完整');
  } else {
    console.log('❌ 缺少必要文件:', missingFiles.join(', '));
  }
  
  return missingFiles.length === 0;
}

// 检查包管理器冲突
function checkPackageManagerConflicts() {
  console.log('\n📦 检查包管理器配置...');
  
  const hasYarnLock = fs.existsSync('yarn.lock');
  const hasPackageLock = fs.existsSync('package-lock.json');
  const hasPnpmLock = fs.existsSync('pnpm-lock.yaml');
  
  const lockFiles = [];
  if (hasYarnLock) lockFiles.push('yarn.lock');
  if (hasPackageLock) lockFiles.push('package-lock.json');
  if (hasPnpmLock) lockFiles.push('pnpm-lock.yaml');
  
  if (lockFiles.length > 1) {
    console.log('⚠️  检测到多个锁文件:', lockFiles.join(', '));
    console.log('💡 建议: 删除 package-lock.json，只保留 yarn.lock');
    return false;
  } else if (lockFiles.length === 1) {
    console.log('✅ 包管理器配置正常:', lockFiles[0]);
    return true;
  } else {
    console.log('❌ 未找到锁文件');
    return false;
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('\n🔐 检查环境变量配置...');
  
  const envExampleExists = fs.existsSync('.env.example');
  const envExists = fs.existsSync('.env');
  
  if (!envExampleExists) {
    console.log('❌ 缺少 .env.example 文件');
    return false;
  }
  
  console.log('✅ .env.example 文件存在');
  
  if (envExists) {
    console.log('✅ .env 文件存在');
    
    // 检查必要的环境变量
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasApiKey = envContent.includes('VITE_PINATA_API_KEY');
    const hasNodeEnv = envContent.includes('NODE_ENV');
    
    if (hasApiKey) {
      console.log('✅ VITE_PINATA_API_KEY 已配置');
    } else {
      console.log('⚠️  VITE_PINATA_API_KEY 未配置');
    }
    
    if (hasNodeEnv) {
      console.log('✅ NODE_ENV 已配置');
    } else {
      console.log('⚠️  NODE_ENV 未配置');
    }
    
    return hasApiKey;
  } else {
    console.log('⚠️  .env 文件不存在（部署时需要在 Vercel 中配置环境变量）');
    return true; // 本地可以没有 .env，但 Vercel 需要配置
  }
}

// 检查依赖版本
function checkDependencies() {
  console.log('\n📋 检查依赖配置...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // 检查关键依赖
    const criticalDeps = {
      'vite': '推荐版本 ^5.0.0',
      'react': '当前版本',
      'typescript': '推荐版本 ^5.0.0',
      'tslib': '解决 peer dependency 警告'
    };
    
    Object.keys(criticalDeps).forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ ${dep}: ${deps[dep]} (${criticalDeps[dep]})`);
      } else if (dep === 'tslib') {
        console.log(`⚠️  ${dep}: 未安装 - ${criticalDeps[dep]}`);
      }
    });
    
    return true;
  } catch (error) {
    console.log('❌ 无法读取 package.json');
    return false;
  }
}

// 检查 Vercel 配置
function checkVercelConfig() {
  console.log('\n⚙️  检查 Vercel 配置...');
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    // 检查关键配置
    const hasInstallCommand = vercelConfig.installCommand;
    const hasBuildCommand = vercelConfig.buildCommand;
    const hasBuilds = vercelConfig.builds && vercelConfig.builds.length > 0;
    
    if (hasInstallCommand) {
      console.log(`✅ installCommand: ${vercelConfig.installCommand}`);
    } else {
      console.log('⚠️  未配置 installCommand');
    }
    
    if (hasBuildCommand) {
      console.log(`✅ buildCommand: ${vercelConfig.buildCommand}`);
    } else {
      console.log('⚠️  未配置 buildCommand');
    }
    
    if (hasBuilds) {
      console.log('✅ builds 配置存在');
    } else {
      console.log('❌ 缺少 builds 配置');
    }
    
    return hasBuilds;
  } catch (error) {
    console.log('❌ 无法读取 vercel.json 或格式错误');
    return false;
  }
}

// 生成修复建议
function generateFixSuggestions(results) {
  console.log('\n🔧 修复建议:');
  
  if (!results.structure) {
    console.log('1. 确保项目结构完整，检查缺少的文件');
  }
  
  if (!results.packageManager) {
    console.log('2. 删除 package-lock.json: rm package-lock.json');
    console.log('   或运行: npm run deploy 会自动处理');
  }
  
  if (!results.env) {
    console.log('3. 配置环境变量:');
    console.log('   - 本地: 复制 .env.example 为 .env 并填写值');
    console.log('   - Vercel: 在项目设置中添加环境变量');
  }
  
  if (!results.vercel) {
    console.log('4. 检查 vercel.json 配置文件格式');
  }
  
  console.log('\n📚 更多帮助:');
  console.log('- 查看 VERCEL_DEPLOYMENT_GUIDE.md');
  console.log('- 运行 npm run check-env 验证环境变量');
  console.log('- 访问 https://vercel.com/docs 获取官方文档');
}

// 主函数
function main() {
  const results = {
    structure: checkProjectStructure(),
    packageManager: checkPackageManagerConflicts(),
    env: checkEnvironmentVariables(),
    dependencies: checkDependencies(),
    vercel: checkVercelConfig()
  };
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n📊 检查结果:');
  if (allPassed) {
    console.log('🎉 所有检查通过！项目应该可以正常部署。');
  } else {
    console.log('⚠️  发现一些问题，请查看上述检查结果和修复建议。');
    generateFixSuggestions(results);
  }
  
  console.log('\n💡 提示: 如果问题仍然存在，请检查 Vercel 构建日志获取详细错误信息。');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main };