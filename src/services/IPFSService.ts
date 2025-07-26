import { IPFS_CONFIG } from '../config/contracts'

// IPFS服务类
export class IPFSService {
  private apiKey: string
  private gateway: string

  constructor() {
    this.apiKey = IPFS_CONFIG.apiKey
    this.gateway = IPFS_CONFIG.gateway
  }

  // 上传文件到IPFS
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload file to IPFS')
    }

    const result = await response.json()
    return result.IpfsHash
  }

  // 上传JSON数据到IPFS
  async uploadJSON(data: Record<string, unknown>): Promise<string> {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `metadata-${Date.now()}`
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to upload JSON to IPFS')
    }

    const result = await response.json()
    return result.IpfsHash
  }

  // 从IPFS获取数据
  async fetchFromIPFS(hash: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.gateway}${hash}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS')
    }

    return await response.json()
  }

  // 创建论文元数据
  async createPaperMetadata(params: {
    title: string
    abstract: string
    authors: string[]
    keywords: string[]
    category: string
    fileHash?: string
  }): Promise<string> {
    const metadata = {
      title: params.title,
      abstract: params.abstract,
      authors: params.authors,
      keywords: params.keywords,
      category: params.category,
      fileHash: params.fileHash,
      createdAt: new Date().toISOString(),
      type: 'paper'
    }

    return await this.uploadJSON(metadata)
  }

  // 创建期刊元数据
  async createJournalMetadata(params: {
    name: string
    description: string
    issn?: string
    website?: string
    categories: string[]
  }): Promise<string> {
    const metadata = {
      name: params.name,
      description: params.description,
      issn: params.issn,
      website: params.website,
      categories: params.categories,
      createdAt: new Date().toISOString(),
      type: 'journal'
    }

    return await this.uploadJSON(metadata)
  }

  // 创建审稿人元数据
  async createReviewerMetadata(params: {
    name: string
    affiliation: string
    expertise: string[]
    bio?: string
    orcid?: string
  }): Promise<string> {
    const metadata = {
      name: params.name,
      affiliation: params.affiliation,
      expertise: params.expertise,
      bio: params.bio,
      orcid: params.orcid,
      createdAt: new Date().toISOString(),
      type: 'reviewer'
    }

    return await this.uploadJSON(metadata)
  }

  // 创建投稿元数据
  async createSubmissionMetadata(params: {
    coverLetter?: string
    suggestedReviewers?: string[]
    conflictOfInterest?: string
    additionalInfo?: string
  }): Promise<string> {
    const metadata = {
      coverLetter: params.coverLetter,
      suggestedReviewers: params.suggestedReviewers,
      conflictOfInterest: params.conflictOfInterest,
      additionalInfo: params.additionalInfo,
      submittedAt: new Date().toISOString(),
      type: 'submission'
    }

    return await this.uploadJSON(metadata)
  }

  // 创建审稿意见元数据
  async createReviewMetadata(params: {
    summary: string
    strengths: string
    weaknesses: string
    suggestions: string
    confidenceLevel: number
  }): Promise<string> {
    const metadata = {
      summary: params.summary,
      strengths: params.strengths,
      weaknesses: params.weaknesses,
      suggestions: params.suggestions,
      confidenceLevel: params.confidenceLevel,
      reviewedAt: new Date().toISOString(),
      type: 'review'
    }

    return await this.uploadJSON(metadata)
  }

  // 获取IPFS URL
  getIPFSUrl(hash: string): string {
    return `${this.gateway}${hash}`
  }
}

// 导出单例实例
export const ipfsService = new IPFSService()