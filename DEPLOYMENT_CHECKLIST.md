# 🚀 Vercel 部署检查清单

在部署 ReviewDAO 前端项目到 Vercel 之前，请确保完成以下检查项目：

## ✅ 部署前检查

### 📋 基础配置
- [ ] 项目已推送到 GitHub 仓库
- [ ] 拥有 Vercel 账户并已登录
- [ ] Node.js 版本为 18 或更高
- [ ] 已安装 Vercel CLI（如使用命令行部署）

### 🔧 项目配置
- [ ] `package.json` 配置正确
- [ ] `vercel.json` 配置文件存在
- [ ] `.nvmrc` 文件指定 Node.js 版本
- [ ] 只存在一个锁文件（yarn.lock，无 package-lock.json）
- [ ] `.gitignore` 包含 `package-lock.json`

### 🔑 环境变量
- [ ] 已获取 Pinata API 密钥
- [ ] 已配置 `VITE_PINATA_API_KEY`
- [ ] 已设置 `NODE_ENV=production`
- [ ] （可选）已配置 QuickNode 相关变量
- [ ] 运行 `npm run check-env` 验证通过

### 📦 依赖管理
- [ ] 运行 `npm install` 无错误
- [ ] 运行 `npm run build` 构建成功
- [ ] 运行 `npm run troubleshoot` 检查通过
- [ ] 所有 TypeScript 类型检查通过

### 🔍 功能测试
- [ ] 本地开发服务器正常启动
- [ ] 钱包连接功能正常
- [ ] 主要页面加载无错误
- [ ] 控制台无严重错误信息

## 🚀 部署步骤

### 方法一：自动化脚本（推荐）
```bash
# Windows
./deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### 方法二：npm 脚本
```bash
npm run deploy
```

### 方法三：Vercel Dashboard
1. 登录 Vercel Dashboard
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置项目设置
5. 添加环境变量
6. 点击 "Deploy"

## ✅ 部署后验证

### 🌐 网站访问
- [ ] 部署的网站可以正常访问
- [ ] 所有页面路由正常工作
- [ ] 静态资源加载正常
- [ ] 响应式设计在不同设备上正常

### 🔧 功能验证
- [ ] 钱包连接功能正常
- [ ] IPFS 文件上传功能正常
- [ ] 智能合约交互正常
- [ ] 数据查询功能正常

### 📊 性能检查
- [ ] 页面加载速度合理（< 3秒）
- [ ] Lighthouse 性能评分 > 80
- [ ] 无内存泄漏或性能警告
- [ ] 移动端性能良好

### 🐛 错误检查
- [ ] 浏览器控制台无错误
- [ ] Vercel 函数日志无错误
- [ ] 网络请求正常响应
- [ ] 错误边界正常工作

## 🔧 常见问题解决

### 部署失败
```bash
# 检查项目配置
npm run troubleshoot

# 清理并重新安装
npm run clean

# 重新构建
npm run build
```

### 环境变量问题
```bash
# 验证环境变量
npm run check-env

# 在 Vercel Dashboard 中重新配置环境变量
# 确保变量名正确且值有效
```

### 依赖冲突
```bash
# 删除锁文件冲突
rm package-lock.json

# 重新安装依赖
npm install
```

### 构建错误
```bash
# 检查 TypeScript 错误
npm run lint

# 检查 Vite 配置
cat vite.config.ts

# 查看详细构建日志
npm run build -- --verbose
```

## 📚 相关文档

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - 详细部署指南
- [README.md](./README.md) - 项目说明文档
- [FEATURES.md](./FEATURES.md) - 功能特性说明
- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

## 🆘 获取帮助

如果遇到问题，可以：

1. **运行诊断工具**：`npm run troubleshoot`
2. **查看构建日志**：在 Vercel Dashboard 中查看详细日志
3. **检查文档**：参考上述相关文档
4. **社区支持**：在项目 GitHub 仓库提交 Issue
5. **官方支持**：查看 Vercel 官方文档和社区

---

**提示**：建议在每次部署前都运行一遍这个检查清单，确保部署的成功率和稳定性。