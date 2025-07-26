import { MsgExecuteContract } from '@injectivelabs/sdk-ts'
import { CONTRACT_ADDRESSES } from '../config/contracts'
import { msgBroadcaster } from './MsgBroadcaster'

// 合约服务类
export class ContractService {
  private address: string

  constructor(address: string) {
    this.address = address
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
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.JournalManager,
      sender: this.address,
      msg: {
        create_journal: {
          name: params.name,
          description: params.description,
          metadata_uri: params.metadataURI,
          chief_editor: params.chiefEditor,
          submission_fee: params.submissionFee,
          categories: params.categories,
          min_reviewer_tier: params.minReviewerTier,
          required_reviewers: params.requiredReviewers
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 注册审稿人
  async registerAsReviewer(metadataURI: string) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewerDAO,
      sender: this.address,
      msg: {
        register_as_reviewer: {
          metadata_uri: metadataURI
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 创建论文NFT
  async createPaper(params: {
    ipfsHash: string
    doi: string
    metadataURI: string
  }) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.PaperNFT,
      sender: this.address,
      msg: {
        create_paper_item: {
          ipfs_hash: params.ipfsHash,
          doi: params.doi,
          metadata_uri: params.metadataURI
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 投稿论文
  async submitPaper(params: {
    paperId: number
    journalId: number
    metadataURI: string
  }) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewProcess,
      sender: this.address,
      msg: {
        create_submission: {
          paper_id: params.paperId,
          journal_id: params.journalId,
          metadata_uri: params.metadataURI
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 分配审稿人
  async assignReviewer(submissionId: number, reviewerAddress: string) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.JournalManager,
      sender: this.address,
      msg: {
        assign_reviewer: {
          submission_id: submissionId,
          reviewer: reviewerAddress
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 提交审稿意见
  async submitReview(params: {
    submissionId: number
    decision: number
    commentsHash: string
  }) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewProcess,
      sender: this.address,
      msg: {
        submit_review: {
          submission_id: params.submissionId,
          decision: params.decision,
          comments_hash: params.commentsHash
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 发表论文
  async publishPaper(submissionId: number, volumeInfo: string) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.JournalManager,
      sender: this.address,
      msg: {
        publish_paper: {
          submission_id: submissionId,
          volume_info: volumeInfo
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 添加期刊编辑
  async addEditor(journalId: number, editorAddress: string) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.JournalManager,
      sender: this.address,
      msg: {
        add_editor: {
          journal_id: journalId,
          editor: editorAddress
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 分配审稿奖励
  async distributeReviewReward(params: {
    reviewId: number
    submissionId: number
    qualityScore: number
    timelyCompletion: boolean
  }) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.JournalManager,
      sender: this.address,
      msg: {
        distribute_review_reward: {
          review_id: params.reviewId,
          submission_id: params.submissionId,
          quality_score: params.qualityScore,
          timely_completion: params.timelyCompletion
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 更新审稿人等级
  async updateReviewerTier(reviewerAddress: string, tier: number) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewerDAO,
      sender: this.address,
      msg: {
        update_reviewer_tier: {
          reviewer: reviewerAddress,
          tier: tier
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 更新审稿人声誉
  async updateReviewerReputation(reviewerAddress: string, reputationChange: number) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewerDAO,
      sender: this.address,
      msg: {
        update_reviewer_reputation: {
          reviewer: reviewerAddress,
          reputation_change: reputationChange
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 创建DAO提案
  async createProposal(params: {
    proposalType: number
    description: string
    data: string
    votingDuration: number
  }) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewerDAO,
      sender: this.address,
      msg: {
        create_proposal: {
          proposal_type: params.proposalType,
          description: params.description,
          data: params.data,
          voting_duration: params.votingDuration
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // DAO投票
  async vote(proposalId: number, voteType: number) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewerDAO,
      sender: this.address,
      msg: {
        vote: {
          proposal_id: proposalId,
          vote_type: voteType
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }

  // 执行提案
  async executeProposal(proposalId: number) {
    const msg = MsgExecuteContract.fromJSON({
      contractAddress: CONTRACT_ADDRESSES.ReviewerDAO,
      sender: this.address,
      msg: {
        execute_proposal: {
          proposal_id: proposalId
        }
      }
    })

    return await msgBroadcaster.broadcast({
      msgs: [msg],
      injectiveAddress: this.address
    })
  }
}

// 导出便捷函数
export const createContractService = (address: string) => new ContractService(address)