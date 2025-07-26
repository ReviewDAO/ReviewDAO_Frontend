# ReviewDAO - 去中心化学术论文同行评议系统

这是一个基于 Injective 区块链的去中心化学术发表平台，旨在革新传统的学术论文同行评议流程。系统通过智能合约和代币激励机制，构建了一个透明、公正、高效的学术发表生态系统。

## 🌟 核心功能

### 📚 期刊管理
- 创建和管理学术期刊
- 设置期刊分类和投稿要求
- 管理编辑团队和权限
- 期刊统计和影响力分析

### 📄 论文投稿系统
- 论文NFT化存储和管理
- 支持多种学科分类
- IPFS去中心化文件存储
- 投稿状态实时跟踪

### 👨‍🎓 审稿人管理
- 审稿人注册和等级认证
- 基于声誉的分级制度
- 专业领域匹配算法
- 审稿质量评估系统

### 🔍 同行评议流程
- 自动化审稿人分配
- 匿名评议机制
- 多轮修改和重审
- 透明的决策记录

### 🎁 激励与奖励
- 代币化奖励机制
- 基于质量的动态奖励
- 声誉积分系统
- 长期激励计划

### 🏛️ DAO治理
- 去中心化决策机制
- 社区提案和投票
- 参数调整和升级
- 透明的治理流程

## 🛠️ 技术架构

### 前端技术栈
- **React 18** - 现代化用户界面框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的前端构建工具
- **TailwindCSS** - 实用优先的CSS框架
- **Zustand** - 轻量级状态管理

### 区块链集成
- **Injective Protocol** - 高性能区块链网络
- **@injectivelabs/sdk-ts** - Injective官方SDK
- **@injectivelabs/wallet-strategy** - 钱包连接策略
- **Ethers.js** - 以太坊JavaScript库

### 去中心化存储
- **IPFS** - 分布式文件存储
- **Pinata** - IPFS固定服务

### 智能合约
- **Solidity** - 智能合约开发语言
- **Hardhat** - 以太坊开发环境
- **OpenZeppelin** - 安全的智能合约库

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn
- Git

### 安装与运行

1. **克隆项目**
```bash
git clone <repository-url>
cd ReviewDAO_Frontend
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的API密钥
```

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

5. **构建生产版本**
```bash
npm run build
# 或
yarn build
```

## 📁 项目结构

```
ReviewDAO_Frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── ReviewDAO.tsx    # 主应用组件
│   │   ├── JournalManager.tsx    # 期刊管理
│   │   ├── PaperSubmission.tsx   # 论文投稿
│   │   ├── ReviewProcess.tsx     # 审稿流程
│   │   ├── ReviewerDashboard.tsx # 审稿人面板
│   │   ├── RewardManager.tsx     # 奖励管理
│   │   ├── DAOGovernance.tsx     # DAO治理
│   │   ├── AdminPanel.tsx        # 管理面板
│   │   ├── DataQuery.tsx         # 数据查询
│   │   └── TestDataViewer.tsx    # 测试数据查看
│   ├── services/            # 服务层
│   │   ├── ContractService.ts    # 智能合约服务
│   │   ├── IPFSService.ts        # IPFS存储服务
│   │   ├── QueryService.ts       # 数据查询服务
│   │   └── Wallet.ts             # 钱包连接服务
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   │   └── testDataMigration.ts  # 测试数据迁移
│   └── config/              # 配置文件
├── public/                  # 静态资源
├── vercel.json             # Vercel部署配置
├── deploy.sh / deploy.bat  # 部署脚本
└── check-env.js            # 环境检查脚本
```

## 🎯 核心模块详解

### 📚 期刊管理 (JournalManager)
- **创建期刊**: 支持设置期刊名称、描述、分类等信息
- **编辑管理**: 分配编辑权限，管理期刊团队
- **统计分析**: 查看期刊投稿量、接收率、影响因子等数据
- **状态控制**: 激活、暂停或关闭期刊

### 📄 论文投稿 (PaperSubmission)
- **论文创建**: 上传论文文件，填写元数据信息
- **NFT铸造**: 将论文转换为NFT，确保版权和唯一性
- **投稿提交**: 选择目标期刊，提交投稿申请
- **状态跟踪**: 实时查看投稿状态和审稿进度

### 🔍 审稿流程 (ReviewProcess)
- **自动分配**: 基于专业领域自动匹配审稿人
- **审稿界面**: 提供结构化的审稿表单和评分系统
- **意见提交**: 支持公开评论和机密意见
- **决策记录**: 透明记录所有审稿决定和修改要求

### 👨‍🎓 审稿人系统 (ReviewerDashboard)
- **注册认证**: 审稿人资质验证和等级认定
- **任务管理**: 查看分配的审稿任务和截止时间
- **声誉系统**: 基于审稿质量的声誉积分机制
- **专业匹配**: 根据研究领域智能匹配审稿任务

### 🎁 奖励机制 (RewardManager)
- **代币奖励**: 基于审稿质量和及时性的代币激励
- **等级奖励**: 不同审稿人等级享受不同奖励倍数
- **质量奖金**: 高质量审稿获得额外奖励
- **长期激励**: 持续参与获得累积奖励

### 🏛️ DAO治理 (DAOGovernance)
- **提案系统**: 社区成员可提交改进提案
- **投票机制**: 基于代币权重的民主投票
- **参数调整**: 通过治理调整系统参数
- **资金管理**: 社区资金的透明分配和使用

## 🚀 部署到 Vercel

### 快速部署

1. **使用自动化脚本（推荐）**
   ```bash
   # Windows 用户
   ./deploy.bat
   
   # Linux/Mac 用户
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **使用 npm 脚本**
   ```bash
   npm run check-env  # 检查环境变量
   npm run deploy     # 自动检查并部署
   ```

3. **手动部署**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel
   
   # 登录 Vercel
   vercel login
   
   # 部署
   vercel --prod
   ```

### 🔑 环境变量配置

部署前请确保配置以下环境变量：

```bash
# 必需变量
VITE_PINATA_API_KEY=your_pinata_api_key_here
NODE_ENV=production

# 可选变量
VITE_QUICKNODE_ENDPOINT=your_quicknode_endpoint
VITE_QUICKNODE_API_KEY=your_quicknode_api_key
```

**获取 API 密钥：**
- **Pinata API**: 访问 [app.pinata.cloud/keys](https://app.pinata.cloud/keys) 创建API密钥
- **QuickNode**: 访问 [quicknode.com](https://quicknode.com) 获取Injective节点访问权限

### 📋 部署配置文件

项目包含以下部署相关文件：
- `vercel.json` - Vercel 部署配置
- `deploy.sh` / `deploy.bat` - 自动部署脚本
- `check-env.js` - 环境变量检查脚本
- `troubleshoot-deployment.js` - 部署故障排除脚本
- `.nvmrc` - Node.js 版本指定

### 🔧 部署故障排除

如果遇到部署问题，可以使用以下工具进行诊断：

```bash
# 运行故障排除脚本
npm run troubleshoot

# 清理并重新安装依赖
npm run clean

# 检查环境变量配置
npm run check-env
```

**常见问题解决：**
- **混合包管理器警告**: 项目已配置使用 npm，删除了 package-lock.json
- **Peer dependency 警告**: 已添加 tslib 依赖，警告可安全忽略
- **构建失败**: 确保使用 Node.js 18，运行 `npm run clean` 清理缓存

详细部署指南请参考：[VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md)

## 🔗 智能合约地址

### Injective 测试网部署地址
```
ReviewerDAO: 0x1Af85C14Ed83F231268087eAf4D2b7Af9Cb86D7F
JournalManager: 0x662A4B81251D08eeE28E0E0834c806F7E591d2E1
ResearchDataNFT: 0xEf5358dBa86e8809c4cbc2089FA3b8f5Cf5A3f7c
PaperNFT: 0x8f09212f1841D4Ee730C38ED183F3736c76F4DB5
ReviewProcess: 0x3B78412842A3F51903E9fdc623C29C724B87a3e3
```

## ⚠️ 重要说明

### 网络支持
- **当前版本**: 仅支持 Injective 测试网
- **主网支持**: 计划在后续版本中推出

### 钱包要求
- 支持 Keplr 钱包连接
- 确保钱包中有足够的测试代币（INJ）
- 建议在测试网环境下进行充分测试

### 使用建议
- 投稿前请仔细检查论文信息和目标期刊
- 审稿时请遵循学术道德和评议标准
- 参与治理投票前请充分了解提案内容
- 定期备份重要的学术数据和文件

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与联系

- **问题反馈**: 请在 GitHub Issues 中提交
- **功能建议**: 欢迎通过 Issues 或 Discussions 提出
- **技术支持**: 查看文档或联系开发团队

---

**ReviewDAO** - 让学术发表更加透明、公正、高效 🎓✨