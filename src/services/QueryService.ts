import { ethers } from 'ethers'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, RPC_CONFIG } from '../config/contracts'

// 定义审稿记录接口
interface ReviewRecord {
  reviewer: string
  decision: number
  commentsHash: string
  submittedAt: bigint
}

export class QueryService {
  private provider: ethers.JsonRpcProvider
  private contracts: { [key: string]: ethers.Contract }

  constructor() {
    // 使用 QuickNode 节点创建 provider
    this.provider = new ethers.JsonRpcProvider(RPC_CONFIG.endpoint, {
      chainId: parseInt(RPC_CONFIG.chainId), // 直接使用 chainId
      name: RPC_CONFIG.network
    })

    // 初始化合约实例
    this.contracts = {
      journalManager: new ethers.Contract(
        CONTRACT_ADDRESSES.JOURNAL_MANAGER,
        CONTRACT_ABIS.JournalManager,
        this.provider
      ),
      reviewerDAO: new ethers.Contract(
        CONTRACT_ADDRESSES.REVIEWER_DAO,
        CONTRACT_ABIS.ReviewerDAO,
        this.provider
      ),
      paperNFT: new ethers.Contract(
        CONTRACT_ADDRESSES.PAPER_NFT,
        CONTRACT_ABIS.PaperNFT,
        this.provider
      ),
      reviewProcess: new ethers.Contract(
        CONTRACT_ADDRESSES.REVIEW_PROCESS,
        CONTRACT_ABIS.ReviewProcess,
        this.provider
      )
    }
  }

  // 验证并转换地址格式
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

  // 获取期刊信息
  async getJournal(journalId: number) {
    try {
      const journal = await this.contracts.journalManager.journals(journalId)
      const editors = await this.contracts.journalManager.getJournalEditors(journalId)
      const categories = await this.contracts.journalManager.getJournalCategories(journalId)
      
      return {
        id: journalId,
        name: journal.name,
        description: journal.description,
        metadataURI: journal.metadataURI,
        owner: journal.owner,
        submissionFee: journal.submissionFee.toString(),
        status: journal.status,
        createdAt: journal.createdAt.toString(),
        minReviewerTier: journal.minReviewerTier,
        requiredReviewers: journal.requiredReviewers,
        editors,
        categories
      }
    } catch (error) {
      console.error('Error fetching journal:', error)
      throw error
    }
  }

  // 获取所有期刊
  async getAllJournals() {
    try {
      const count = await this.contracts.journalManager.getJournalCount()
      const journals = []
      
      for (let i = 1; i <= count; i++) {
        try {
          const journal = await this.getJournal(i)
          journals.push(journal)
        } catch (error) {
          console.warn(`Failed to fetch journal ${i}:`, error)
        }
      }
      
      return journals
    } catch (error) {
      console.error('Error fetching all journals:', error)
      throw error
    }
  }

  // 获取审稿人信息
  async getReviewer(address: string) {
    try {
      // 验证并转换地址格式，防止ENS解析
      const validatedAddress = this.validateAddress(address)
      
      const reviewer = await this.contracts.reviewerDAO.reviewers(validatedAddress)
      const balance = await this.contracts.reviewerDAO.balanceOf(validatedAddress)
      
      return {
        address: validatedAddress,
        isActive: reviewer.isActive,
        reputation: reviewer.reputation.toString(),
        completedReviews: reviewer.completedReviews.toString(),
        tier: reviewer.tier,
        joinedAt: reviewer.joinedAt.toString(),
        metadataURI: reviewer.metadataURI,
        tokenBalance: balance.toString()
      }
    } catch (error) {
      console.error('Error fetching reviewer:', error)
      throw error
    }
  }

  // 获取所有审稿人
  async getAllReviewers() {
    try {
      const addresses = await this.contracts.reviewerDAO.getAllReviewers()
      const reviewers = []
      
      for (const address of addresses) {
        try {
          const reviewer = await this.getReviewer(address)
          reviewers.push(reviewer)
        } catch (error) {
          console.warn(`Failed to fetch reviewer ${address}:`, error)
        }
      }
      
      return reviewers
    } catch (error) {
      console.error('Error fetching all reviewers:', error)
      throw error
    }
  }

  // 获取用户的论文 NFT
  async getUserPapers(userAddress: string) {
    try {
      // 验证并转换地址格式，防止ENS解析
      const validatedAddress = this.validateAddress(userAddress)
      
      console.log('Getting balance for address:', validatedAddress)
      console.log('PaperNFT contract address:', CONTRACT_ADDRESSES.PAPER_NFT)
      console.log('Provider network:', await this.provider.getNetwork())
      
      // 检查合约是否可访问
      try {
        const totalSupply = await this.contracts.paperNFT.totalSupply()
        console.log('Total supply of papers:', totalSupply.toString())
      } catch (error) {
        console.error('Failed to get total supply:', error)
        throw new Error('合约连接失败，请检查网络配置')
      }
      
      const balance = await this.contracts.paperNFT.balanceOf(validatedAddress)
      console.log('User balance:', balance.toString())
      const papers = []
      
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.contracts.paperNFT.tokenOfOwnerByIndex(validatedAddress, i)
          const tokenURI = await this.contracts.paperNFT.tokenURI(tokenId)
          console.log(`Token ${i}: ID=${tokenId.toString()}, URI=${tokenURI}`)
          
          papers.push({
            tokenId: tokenId.toString(),
            tokenURI,
            owner: validatedAddress
          })
        } catch (error) {
          console.warn(`Failed to fetch paper ${i} for user ${validatedAddress}:`, error)
        }
      }
      
      console.log('Final papers array:', papers)
      return papers
    } catch (error) {
      console.error('Error fetching user papers:', error)
      throw error
    }
  }

  // 获取论文信息
  async getPaperInfo(tokenId: number) {
    try {
      const tokenURI = await this.contracts.paperNFT.tokenURI(tokenId)
      const owner = await this.contracts.paperNFT.ownerOf(tokenId)
      
      return {
        tokenId,
        tokenURI,
        owner
      }
    } catch (error) {
      console.error('Error fetching paper info:', error)
      throw error
    }
  }

  // 获取审稿人的分配任务
  async getReviewerAssignments(reviewerAddress: string) {
    try {
      // 验证并转换地址格式，防止ENS解析
      const validatedAddress = this.validateAddress(reviewerAddress)
      
      const assignments = await this.contracts.reviewProcess.getReviewerAssignments(validatedAddress)
      const submissions = []
      
      for (const submissionId of assignments) {
        try {
          const submission = await this.getSubmission(submissionId.toString())
          submissions.push(submission)
        } catch (error) {
          console.warn(`Failed to fetch submission ${submissionId}:`, error)
        }
      }
      
      return submissions
    } catch (error) {
      console.error('Error fetching reviewer assignments:', error)
      throw error
    }
  }

  // 获取投稿信息
  async getSubmission(submissionId: string) {
    try {
      const submission = await this.contracts.reviewProcess.submissions(submissionId)
      const reviews = await this.contracts.reviewProcess.getSubmissionReviews(submissionId)
      
      return {
        id: submissionId,
        paperId: submission.paperId.toString(),
        journalId: submission.journalId.toString(),
        author: submission.author,
        status: submission.status,
        createdAt: submission.createdAt.toString(),
        reviewDeadline: submission.reviewDeadline.toString(),
        reviews: reviews.map((review: ReviewRecord) => ({
          reviewer: review.reviewer,
          decision: review.decision,
          commentsHash: review.commentsHash,
          submittedAt: review.submittedAt.toString()
        }))
      }
    } catch (error) {
      console.error('Error fetching submission:', error)
      throw error
    }
  }

  // 获取系统统计信息
  async getSystemStats() {
    try {
      const [journalCount, reviewerCount, totalSupply, submissionCount] = await Promise.all([
        this.contracts.journalManager.getJournalCount(),
        this.contracts.reviewerDAO.getReviewerCount(),
        this.contracts.paperNFT.totalSupply(),
        this.contracts.reviewProcess.getSubmissionCount()
      ])
      
      return {
        totalJournals: journalCount.toString(),
        totalReviewers: reviewerCount.toString(),
        totalPapers: totalSupply.toString(),
        totalSubmissions: submissionCount.toString()
      }
    } catch (error) {
      console.error('Error fetching system stats:', error)
      throw error
    }
  }

  // 检查用户是否为审稿人
  async isReviewer(address: string): Promise<boolean> {
    try {
      // 验证并转换地址格式，防止ENS解析
      const validatedAddress = this.validateAddress(address)
      
      const reviewer = await this.contracts.reviewerDAO.reviewers(validatedAddress)
      return reviewer.isActive
    } catch (error) {
      console.error('Error checking reviewer status:', error)
      return false
    }
  }

  // 检查用户是否为期刊编辑
  async isJournalEditor(address: string, journalId: number): Promise<boolean> {
    try {
      // 验证并转换地址格式，防止ENS解析
      const validatedAddress = this.validateAddress(address)
      
      const editors = await this.contracts.journalManager.getJournalEditors(journalId)
      return editors.includes(validatedAddress)
    } catch (error) {
      console.error('Error checking editor status:', error)
      return false
    }
  }
}

// 导出单例实例
export const queryService = new QueryService()