# Injective DEX DApp

这是一个基于 Injective 协议的去中心化交易所（DEX）前端应用，使用 React + TypeScript + Vite 构建。

## 功能特点

- 连接 Injective 钱包
- 查看钱包余额
- 查看现货市场列表
- 实时订单簿显示
- 支持市价单交易
- 交易历史记录
- 支持 INJ/USDT 等交易对

## 技术栈

- React 18
- TypeScript
- Vite
- TailwindCSS
- @injectivelabs/sdk-ts

## 开发环境设置

1. 安装依赖
```bash
yarn install
```

2. 启动开发服务器
```bash
yarn dev
```

3. 构建生产版本
```bash
yarn build
```

## 项目结构

```
src/
  ├── components/     # React 组件
  ├── services/      # 服务层（钱包、API等）
  ├── types/         # TypeScript 类型定义
  └── utils/         # 工具函数
```

## 主要功能说明

### 订单簿
- 显示当前市场的最新买单和卖单
- 实时更新价格和数量
- 支持查看交易深度

### 交易功能
- 支持市价单交易
- 显示交易哈希
- 交易成功后自动更新订单簿

### 钱包集成
- 支持 Injective 钱包连接
- 显示钱包余额
- 支持多代币余额查询

## 注意事项

- 当前版本仅支持测试网
- 请确保钱包中有足够的测试代币
- 交易前请仔细核对价格和数量