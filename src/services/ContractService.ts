import { ethers } from 'ethers'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, RPC_CONFIG } from '../config/contracts'
import type { NetworkSwitchError } from '../types/ethereum'

// 合约服务类
export class ContractService {
  private signer: ethers.Signer | null = null

  constructor() {
    // 构造函数现在不需要参数
  }

  // 验证地址格式
  private validateAddress(address: string): string {
    // Check if it's an Injective bech32 address
    if (address.startsWith('inj')) {
      try {
        // Convert Injective bech32 address to Ethereum hex format
        return getEthereumAddress(address)
      } catch {
        throw new Error(`Invalid Injective address format: ${address}`);
      }
    }
    
    // Handle Ethereum hex addresses
    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid address format: ${address}`)
    }
    return ethers.getAddress(address) // 返回校验和格式的地址
  }

  // 添加Injective网络到Keplr
  private async addInjectiveNetwork() {
    if (!window.keplr?.ethereum) {
      throw new Error('Keplr EVM support not available')
    }

    try {
      await window.keplr.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${parseInt(RPC_CONFIG.chainId).toString(16)}`, // 1439 -> 0x59f
          chainName: 'Injective Testnet',
          nativeCurrency: {
            name: 'Injective',
            symbol: 'INJ',
            decimals: 18
          },
          rpcUrls: [RPC_CONFIG.endpoint],
          blockExplorerUrls: ['https://testnet.explorer.injective.network/']
        }]
      })
    } catch (error: unknown) {
      const networkError = error as NetworkSwitchError
      // 如果网络已存在，忽略错误
      if (networkError.code !== 4902) {
        console.error('Error adding Injective network:', error)
      }
    }
  }

  // 切换到Injective网络
  private async switchToInjectiveNetwork() {
    if (!window.keplr?.ethereum) {
      throw new Error('Keplr EVM support not available')
    }

    try {
      await window.keplr.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(RPC_CONFIG.chainId).toString(16)}` }]
      })
    } catch (error: unknown) {
      const networkError = error as NetworkSwitchError
      // 如果网络不存在，先添加再切换
      if (networkError.code === 4902) {
        await this.addInjectiveNetwork()
        await this.switchToInjectiveNetwork()
      } else {
        console.error('Error switching to Injective network:', error)
        throw error
      }
    }
  }

  // 设置签名者
  async setSigner() {
    try {
      // 检查是否有Keplr钱包
      if (!window.keplr) {
        throw new Error('Keplr wallet not found')
      }

      // 检查Keplr是否支持EVM
      if (!window.keplr.ethereum) {
        throw new Error('Keplr EVM support not available')
      }

      // 添加Injective测试网到Keplr
      await this.addInjectiveNetwork()
      
      // 切换到Injective测试网
      await this.switchToInjectiveNetwork()

      // 启用Keplr的EVM功能
      if (window.keplr.ethereum.enable) {
        await window.keplr.ethereum.enable()
      }
      
      // 创建ethers provider使用Keplr的ethereum provider
      const provider = new ethers.BrowserProvider(window.keplr.ethereum)
      this.signer = await provider.getSigner()
      
      const address = await this.signer.getAddress()
      console.log('Signer set successfully for address:', address)
      
    } catch (error) {
      console.error('Error setting signer:', error)
      throw new Error('Failed to connect to Injective wallet: ' + (error as Error).message)
    }
  }

  // 检查用户是否有管理员权限
  async hasAdminRole(): Promise<boolean> {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.JOURNAL_MANAGER,
      CONTRACT_ABIS.JournalManager,
      this.signer
    )

    try {
      if (!this.signer) {
        throw new Error('Signer not available')
      }
      const userAddress = await this.signer.getAddress()
      const ADMIN_ROLE = await contract.ADMIN_ROLE()
      return await contract.hasRole(ADMIN_ROLE, userAddress)
    } catch (error) {
      console.error('Error checking admin role:', error)
      return false
    }
  }

  // 创建期刊
  async createJournal(params: {
    name: string
    description: string
    metadataURI: string
    chiefEditor: string
    submissionFee: string
    categories: string[]
    minReviewerTier: number
    requiredReviewers: number
  }) {
    if (!this.signer) {
      await this.setSigner()
    }

    // 检查用户是否有管理员权限
    const hasAdmin = await this.hasAdminRole()
    if (!hasAdmin) {
      throw new Error('您没有创建期刊的权限。只有管理员可以创建期刊。')
    }

    // 验证主编地址格式
    const validatedChiefEditor = this.validateAddress(params.chiefEditor)

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.JOURNAL_MANAGER,
      CONTRACT_ABIS.JournalManager,
      this.signer
    )

    const tx = await contract.createJournal(
      params.name,
      params.description,
      params.metadataURI,
      validatedChiefEditor,
      params.submissionFee,
      params.categories,
      params.minReviewerTier,
      params.requiredReviewers
    )
    return await tx.wait()
  }

  // 注册审稿人
  async registerAsReviewer(metadataURI: string) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    const tx = await contract.registerAsReviewer(metadataURI)
    return await tx.wait()
  }

  // 创建论文
  async createPaper(params: {
    title: string
    abstract: string
    metadataURI: string
    journalId: number
    ipfsHash: string
    doi?: string
  }) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.PAPER_NFT,
      CONTRACT_ABIS.PaperNFT,
      this.signer
    )

    const tx = await contract.createPaperItem(
      params.ipfsHash,
      params.doi || '',
      params.metadataURI
    )
    return await tx.wait()
  }

  // 创建投稿
  async createSubmission(params: {
    journalId: number
    paperTokenId: number
    metadataURI: string
  }) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEW_PROCESS,
      CONTRACT_ABIS.ReviewProcess,
      this.signer
    )

    const tx = await contract.createSubmission(
      params.paperTokenId,
      params.journalId,
      params.metadataURI
    )
    return await tx.wait()
  }

  // 分配审稿人
  async assignReviewer(params: {
    submissionId: number
    reviewerAddress: string
  }) {
    if (!this.signer) {
      await this.setSigner()
    }

    // 验证审稿人地址格式
    const validatedReviewerAddress = this.validateAddress(params.reviewerAddress)

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEW_PROCESS,
      CONTRACT_ABIS.ReviewProcess,
      this.signer
    )

    const tx = await contract.assignReviewer(params.submissionId, validatedReviewerAddress)
    return await tx.wait()
  }

  // 提交审稿意见
  async submitReview(submissionId: number, decision: number, commentsHash: string) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
       CONTRACT_ADDRESSES.REVIEW_PROCESS,
       CONTRACT_ABIS.ReviewProcess,
       this.signer
     )

    const tx = await contract.submitReview(submissionId, decision, commentsHash)
    return await tx.wait()
  }

  // 发布论文
  async publishPaper(submissionId: number) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEW_PROCESS,
      CONTRACT_ABIS.ReviewProcess,
      this.signer
    )

    const tx = await contract.publishPaper(submissionId)
    return await tx.wait()
  }

  // 添加编辑
  async addEditor(params: {
    journalId: number
    editorAddress: string
  }) {
    if (!this.signer) {
      await this.setSigner()
    }

    // 验证编辑地址格式
    const validatedEditorAddress = this.validateAddress(params.editorAddress)

    const contract = new ethers.Contract(
       CONTRACT_ADDRESSES.JOURNAL_MANAGER,
       CONTRACT_ABIS.JournalManager,
       this.signer
     )

    const tx = await contract.addEditor(params.journalId, validatedEditorAddress)
    return await tx.wait()
  }

  // 分发审稿奖励
  async distributeReviewReward(submissionId: number, reviewerAddress: string, amount: string) {
    if (!this.signer) {
      await this.setSigner()
    }

    // 验证审稿人地址格式
    const validatedReviewerAddress = this.validateAddress(reviewerAddress)

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEW_PROCESS,
      CONTRACT_ABIS.ReviewProcess,
      this.signer
    )

    const tx = await contract.distributeReward(validatedReviewerAddress, submissionId, amount)
    return await tx.wait()
  }

  // 更新审稿人等级
  async updateReviewerTier(reviewerAddress: string, tier: number) {
    if (!this.signer) {
      await this.setSigner()
    }

    // 验证审稿人地址格式
    const validatedReviewerAddress = this.validateAddress(reviewerAddress)

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    const tx = await contract.updateReviewerTier(validatedReviewerAddress, tier)
    return await tx.wait()
  }

  // 更新审稿人声誉
  async updateReviewerReputation(reviewerAddress: string, reputationChange: number) {
    if (!this.signer) {
      await this.setSigner()
    }

    // 验证审稿人地址格式
    const validatedReviewerAddress = this.validateAddress(reviewerAddress)

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    const tx = await contract.updateReviewerReputation(validatedReviewerAddress, reputationChange)
    return await tx.wait()
  }

  // DAO 治理相关方法

  // 创建提案
  async createProposal(params: {
    proposalType: number
    description: string
    data: string
    votingDuration: number
  }) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    // 将数据转换为字节格式
    const dataBytes = ethers.toUtf8Bytes(params.data)

    const tx = await contract.createProposal(
      params.proposalType,
      params.description,
      dataBytes,
      params.votingDuration
    )
    return await tx.wait()
  }

  // 对提案投票
  async voteOnProposal(proposalId: number, support: boolean) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    const tx = await contract.voteOnProposal(proposalId, support)
    return await tx.wait()
  }

  // 执行提案
  async executeProposal(proposalId: number) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    const tx = await contract.executeProposal(proposalId)
    return await tx.wait()
  }

  // 结束提案投票
  async finalizeProposal(proposalId: number) {
    if (!this.signer) {
      await this.setSigner()
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.REVIEWER_DAO,
      CONTRACT_ABIS.ReviewerDAO,
      this.signer
    )

    const tx = await contract.finalizeProposal(proposalId)
    return await tx.wait()
  }
}

// 导出便捷函数
export const createContractService = () => new ContractService()