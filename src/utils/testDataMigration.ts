// 测试数据迁移工具 - 将EVM链端测试数据结构转换为前端格式
import { QueryService } from '../services/QueryService'

// EVM测试数据结构定义
export interface EVMTestData {
  // 研究数据NFT
  researchData: {
    author: string
    ipfsHash: string
    price: string // ETH格式
    isPublic: boolean
    metadataURI: string
  }[]
  
  // 论文NFT
  papers: {
    author: string
    ipfsHash: string
    doi: string
    metadataURI: string
  }[]
  
  // 期刊
  journals: {
    name: string
    description: string
    chiefEditor: string
    submissionFee: string // ETH格式
    categories: string[]
    tier: number
    requiredReviewers: number
  }[]
  
  // 审稿人
  reviewers: {
    address: string
    metadataURI: string
  }[]
  
  // 投稿
  submissions: {
    author: string
    paperId: number
    journalId: number
    metadataURI: string
  }[]
}

// 前端数据结构定义
export interface FrontendSubmission {
  id: string
  title: string
  authors: string[]
  abstract: string
  keywords: string[]
  submissionDate: string
  status: 'pending' | 'under_review' | 'accepted' | 'rejected'
  journalName: string
  paperId: string
  metadataURI: string
  ipfsHash: string
  paperMetadata?: {
    title: string
    authors: string[]
    abstract: string
    keywords: string[]
    doi?: string
    fileUrl: string
  }
  paperContent?: string
}

export interface FrontendJournal {
  id: string
  name: string
  description: string
  chiefEditor: string
  submissionFee: string
  categories: string[]
  tier: number
  requiredReviewers: number
}

export interface FrontendReviewer {
  address: string
  name: string
  affiliation: string
  expertise: string[]
  reputation: number
  completedReviews: number
  tier: number
}

// EVM测试数据（基于write-test-data.js）
export const EVMTestDataSet: EVMTestData = {
  researchData: [
    {
      author: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // author1
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      price: "0.01",
      isPublic: true,
      metadataURI: "ipfs://research-data/dataset1"
    },
    {
      author: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // author2
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH",
      price: "0.02",
      isPublic: false,
      metadataURI: "ipfs://research-data/dataset2"
    }
  ],
  
  papers: [
    {
      author: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      doi: "10.1000/blockchain.2024.001",
      metadataURI: "ipfs://paper/metadata1"
    },
    {
      author: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH",
      doi: "10.1000/blockchain.2024.002",
      metadataURI: "ipfs://paper/metadata2"
    }
  ],
  
  journals: [
    {
      name: "区块链技术研究期刊",
      description: "专注于区块链技术和去中心化应用研究的学术期刊",
      chiefEditor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      submissionFee: "0.01",
      categories: ["Computer Science", "Blockchain Technology"],
      tier: 0,
      requiredReviewers: 2
    },
    {
      name: "人工智能与机器学习期刊",
      description: "人工智能、机器学习和深度学习领域的前沿研究",
      chiefEditor: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      submissionFee: "0.01",
      categories: ["Computer Science", "Artificial Intelligence"],
      tier: 0,
      requiredReviewers: 2
    }
  ],
  
  reviewers: [
    {
      address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      metadataURI: "ipfs://reviewer/profile1"
    },
    {
      address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      metadataURI: "ipfs://reviewer/profile2"
    }
  ],
  
  submissions: [
    {
      author: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      paperId: 0,
      journalId: 0,
      metadataURI: "ipfs://submission/metadata1"
    },
    {
      author: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      paperId: 1,
      journalId: 1,
      metadataURI: "ipfs://submission/metadata2"
    }
  ]
}

// 模拟IPFS元数据内容
export const mockIPFSMetadata = {
  "ipfs://paper/metadata1": {
    title: "基于区块链的去中心化学术发布系统研究",
    authors: ["张三", "李四"],
    abstract: "本文提出了一种基于区块链技术的去中心化学术发布系统，旨在解决传统学术发布中的透明度和公平性问题。通过智能合约实现同行评议流程的自动化，确保评审过程的公正性和可追溯性。",
    keywords: ["区块链", "去中心化", "学术发布", "同行评议", "智能合约"],
    doi: "10.1000/blockchain.2024.001",
    fileUrl: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  },
  "ipfs://paper/metadata2": {
    title: "深度学习在区块链共识机制优化中的应用",
    authors: ["王五", "赵六"],
    abstract: "本研究探讨了深度学习技术在区块链共识机制优化中的应用。通过构建神经网络模型预测网络状态，动态调整共识参数，提高区块链网络的性能和能效。",
    keywords: ["深度学习", "区块链", "共识机制", "神经网络", "性能优化"],
    doi: "10.1000/blockchain.2024.002",
    fileUrl: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH"
  },
  "ipfs://reviewer/profile1": {
    name: "Dr. Alice Chen",
    affiliation: "清华大学计算机科学与技术系",
    expertise: ["区块链技术", "分布式系统", "密码学"],
    bio: "区块链技术专家，在顶级会议和期刊发表论文50余篇"
  },
  "ipfs://reviewer/profile2": {
    name: "Prof. Bob Wang",
    affiliation: "北京大学信息科学技术学院",
    expertise: ["人工智能", "机器学习", "深度学习"],
    bio: "人工智能领域知名学者，IEEE Fellow"
  }
}

// 数据转换函数
export function convertEVMDataToFrontend(): {
  submissions: FrontendSubmission[]
  journals: FrontendJournal[]
  reviewers: FrontendReviewer[]
} {
  const { papers, journals, reviewers, submissions } = EVMTestDataSet
  
  // 转换投稿数据
  const frontendSubmissions: FrontendSubmission[] = submissions.map((submission, index) => {
    const paper = papers[submission.paperId]
    const journal = journals[submission.journalId]
    const paperMetadata = mockIPFSMetadata[paper.metadataURI as keyof typeof mockIPFSMetadata]
    
    // 类型检查：确保paperMetadata是论文元数据而不是审稿人资料
    const isPaperMetadata = paperMetadata && 'title' in paperMetadata && 'authors' in paperMetadata
    
    return {
      id: index.toString(),
      title: isPaperMetadata ? paperMetadata.title : `论文 ${submission.paperId + 1}`,
      authors: isPaperMetadata ? paperMetadata.authors : ["未知作者"],
      abstract: isPaperMetadata ? paperMetadata.abstract : "暂无摘要",
      keywords: isPaperMetadata ? paperMetadata.keywords : [],
      submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'under_review' as const,
      journalName: journal.name,
      paperId: submission.paperId.toString(),
      metadataURI: submission.metadataURI,
      ipfsHash: paper.ipfsHash,
      paperMetadata: isPaperMetadata ? {
        title: paperMetadata.title,
        authors: paperMetadata.authors,
        abstract: paperMetadata.abstract,
        keywords: paperMetadata.keywords,
        doi: paperMetadata.doi,
        fileUrl: paperMetadata.fileUrl
      } : undefined
    }
  })
  
  // 转换期刊数据
  const frontendJournals: FrontendJournal[] = journals.map((journal, index) => ({
    id: index.toString(),
    name: journal.name,
    description: journal.description,
    chiefEditor: journal.chiefEditor,
    submissionFee: journal.submissionFee,
    categories: journal.categories,
    tier: journal.tier,
    requiredReviewers: journal.requiredReviewers
  }))
  
  // 转换审稿人数据
  const frontendReviewers: FrontendReviewer[] = reviewers.map((reviewer, index) => {
    const profile = mockIPFSMetadata[reviewer.metadataURI as keyof typeof mockIPFSMetadata]
    
    // 类型检查：确保profile是审稿人资料而不是论文元数据
    const isReviewerProfile = profile && 'name' in profile && 'affiliation' in profile
    
    return {
      address: reviewer.address,
      name: isReviewerProfile ? profile.name : `审稿人 ${index + 1}`,
      affiliation: isReviewerProfile ? profile.affiliation : "未知机构",
      expertise: isReviewerProfile ? profile.expertise : [],
      reputation: Math.floor(Math.random() * 100) + 50, // 模拟声誉值
      completedReviews: Math.floor(Math.random() * 20) + 5, // 模拟完成的评审数
      tier: Math.floor(Math.random() * 3) // 0-2级别
    }
  })
  
  return {
    submissions: frontendSubmissions,
    journals: frontendJournals,
    reviewers: frontendReviewers
  }
}

// 从合约获取真实数据的函数
export async function loadRealDataFromContract(): Promise<{
  submissions: FrontendSubmission[]
  journals: FrontendJournal[]
  reviewers: FrontendReviewer[]
}> {
  try {
    const queryService = new QueryService()
    
    // 获取所有期刊
    const contractJournals = await queryService.getAllJournals()
    console.log('从合约获取的期刊数据:', contractJournals)
    
    // 获取所有审稿人
    const contractReviewers = await queryService.getAllReviewers()
    console.log('从合约获取的审稿人数据:', contractReviewers)
    
    // 转换期刊数据
    const frontendJournals: FrontendJournal[] = contractJournals.map((journal) => ({
      id: journal.id.toString(),
      name: journal.name || `期刊 ${journal.id}`,
      description: journal.description || '暂无描述',
      chiefEditor: journal.owner,
      submissionFee: (parseFloat(journal.submissionFee) / 1e18).toString(), // 从wei转换为ETH
      categories: journal.categories || [],
      tier: journal.minReviewerTier || 0,
      requiredReviewers: journal.requiredReviewers || 3
    }))
    
    // 转换审稿人数据
    const frontendReviewers: FrontendReviewer[] = contractReviewers.map((reviewer, index) => ({
      address: reviewer.address,
      name: `审稿人 ${index + 1}`, // 暂时使用默认名称，实际应从IPFS获取
      affiliation: '未知机构', // 暂时使用默认值，实际应从IPFS获取
      expertise: [], // 暂时为空，实际应从IPFS获取
      reputation: parseInt(reviewer.reputation) || 0,
      completedReviews: parseInt(reviewer.completedReviews) || 0,
      tier: reviewer.tier || 0
    }))
    
    // 暂时返回空的投稿数据，因为需要更复杂的查询逻辑
    const frontendSubmissions: FrontendSubmission[] = []
    
    console.log('转换后的数据:', {
      journals: frontendJournals,
      reviewers: frontendReviewers,
      submissions: frontendSubmissions
    })
    
    return {
      submissions: frontendSubmissions,
      journals: frontendJournals,
      reviewers: frontendReviewers
    }
  } catch (error) {
    console.error('从合约获取数据失败:', error)
    // 如果获取失败，返回假数据作为备选
    console.log('使用假数据作为备选')
    return convertEVMDataToFrontend()
  }
}

// 创建一个异步加载的数据对象
let cachedRealData: {
  submissions: FrontendSubmission[]
  journals: FrontendJournal[]
  reviewers: FrontendReviewer[]
} | null = null

// 异步加载真实数据
export async function getMigratedTestData() {
  if (!cachedRealData) {
    cachedRealData = await loadRealDataFromContract()
  }
  return cachedRealData
}

// 导出转换后的测试数据（保持向后兼容）
export const migratedTestData = convertEVMDataToFrontend()