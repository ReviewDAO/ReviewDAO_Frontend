import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'

interface RewardManagerProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface Review {
  id: number
  submissionId: number
  reviewerId: string
  reviewerName: string
  paperTitle: string
  journalName: string
  completedDate: string
  qualityScore?: number
  timelyCompletion?: boolean
  rewardDistributed: boolean
  rewardAmount?: string
}

interface RewardForm {
  reviewId: number
  submissionId: number
  qualityScore: number
  timelyCompletion: boolean
}

export function RewardManager({ address, onTransactionSuccess }: RewardManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showRewardForm, setShowRewardForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rewardForm, setRewardForm] = useState<RewardForm>({
    reviewId: 0,
    submissionId: 0,
    qualityScore: 80,
    timelyCompletion: true
  })
  const [activeTab, setActiveTab] = useState<'pending' | 'distributed'>('pending')

  const contractService = createContractService(address)

  const loadReviews = async () => {
    try {
      // 这里应该从合约查询审稿数据
      // 暂时使用模拟数据
      const mockReviews: Review[] = [
        {
          id: 1,
          submissionId: 1,
          reviewerId: '0x1234...5678',
          reviewerName: 'Dr. Alice Smith',
          paperTitle: 'Deep Learning Approaches for Blockchain Consensus',
          journalName: 'Blockchain Research Journal',
          completedDate: '2024-01-15',
          rewardDistributed: false
        },
        {
          id: 2,
          submissionId: 2,
          reviewerId: '0x2345...6789',
          reviewerName: 'Prof. Bob Johnson',
          paperTitle: 'AI-Powered Smart Contract Security Analysis',
          journalName: 'AI & Machine Learning Review',
          completedDate: '2024-01-10',
          qualityScore: 85,
          timelyCompletion: true,
          rewardDistributed: true,
          rewardAmount: '15.5'
        },
        {
          id: 3,
          submissionId: 3,
          reviewerId: '0x3456...7890',
          reviewerName: 'Dr. Carol Wilson',
          paperTitle: 'Decentralized Identity Management Systems',
          journalName: 'Computer Science Quarterly',
          completedDate: '2024-01-12',
          rewardDistributed: false
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const handleDistributeReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReview) return

    try {
      setLoading(true)

      const response = await contractService.distributeReviewReward({
        reviewId: rewardForm.reviewId,
        submissionId: rewardForm.submissionId,
        qualityScore: rewardForm.qualityScore,
        timelyCompletion: rewardForm.timelyCompletion
      })

      if (response.txHash) {
        onTransactionSuccess(response.txHash)
        setShowRewardForm(false)
        setSelectedReview(null)
        await loadReviews() // 重新加载数据
      }
    } catch (error) {
      console.error('Error distributing reward:', error)
      alert('分配奖励失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const openRewardForm = (review: Review) => {
    setSelectedReview(review)
    setRewardForm({
      reviewId: review.id,
      submissionId: review.submissionId,
      qualityScore: 80,
      timelyCompletion: true
    })
    setShowRewardForm(true)
  }

  const getFilteredReviews = () => {
    return reviews.filter(review => 
      activeTab === 'pending' ? !review.rewardDistributed : review.rewardDistributed
    )
  }

  const calculateRewardAmount = (qualityScore: number, timelyCompletion: boolean) => {
    const baseReward = 10
    const qualityBonus = qualityScore > 80 ? 5 : 0
    const speedBonus = timelyCompletion ? 3 : 0
    return baseReward + qualityBonus + speedBonus
  }

  useEffect(() => {
    if (address) {
      loadReviews()
    }
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">奖励管理</h2>
        <div className="text-sm text-gray-600">
          管理审稿奖励的分配和统计
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            待分配奖励 ({reviews.filter(r => !r.rewardDistributed).length})
          </button>
          <button
            onClick={() => setActiveTab('distributed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'distributed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            已分配奖励 ({reviews.filter(r => r.rewardDistributed).length})
          </button>
        </nav>
      </div>

      {/* 审稿列表 */}
      <div className="space-y-4">
        {getFilteredReviews().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据</h3>
            <p className="text-gray-600">
              {activeTab === 'pending' && '暂无待分配奖励的审稿。'}
              {activeTab === 'distributed' && '暂无已分配的奖励记录。'}
            </p>
          </div>
        ) : (
          getFilteredReviews().map(review => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {review.paperTitle}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">期刊：</span>
                      {review.journalName}
                    </div>
                    <div>
                      <span className="font-medium">审稿人：</span>
                      {review.reviewerName}
                    </div>
                    <div>
                      <span className="font-medium">完成日期：</span>
                      {review.completedDate}
                    </div>
                    <div>
                      <span className="font-medium">审稿人地址：</span>
                      <span className="font-mono text-xs">{review.reviewerId}</span>
                    </div>
                  </div>
                  
                  {review.rewardDistributed && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">✅ 奖励已分配</span>
                      </div>
                      <div className="mt-2 text-sm text-green-700">
                        <div>质量评分: {review.qualityScore}/100</div>
                        <div>及时完成: {review.timelyCompletion ? '是' : '否'}</div>
                        <div>奖励金额: {review.rewardAmount} RDT</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {!review.rewardDistributed && (
                    <button
                      onClick={() => openRewardForm(review)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      分配奖励
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 奖励分配表单模态框 */}
      {showRewardForm && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              分配审稿奖励
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                <div><strong>论文：</strong>{selectedReview.paperTitle}</div>
                <div><strong>审稿人：</strong>{selectedReview.reviewerName}</div>
              </div>
            </div>

            <form onSubmit={handleDistributeReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  质量评分 (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rewardForm.qualityScore}
                  onChange={(e) => setRewardForm({
                    ...rewardForm,
                    qualityScore: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rewardForm.timelyCompletion}
                    onChange={(e) => setRewardForm({
                      ...rewardForm,
                      timelyCompletion: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">及时完成审稿</span>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="text-sm text-blue-700">
                  <div className="font-medium mb-1">预计奖励金额:</div>
                  <div>{calculateRewardAmount(rewardForm.qualityScore, rewardForm.timelyCompletion)} RDT</div>
                  <div className="text-xs mt-1 text-blue-600">
                    基础奖励: 10 RDT + 质量奖励: {rewardForm.qualityScore > 80 ? 5 : 0} RDT + 速度奖励: {rewardForm.timelyCompletion ? 3 : 0} RDT
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRewardForm(false)
                    setSelectedReview(null)
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {loading ? '分配中...' : '确认分配'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}