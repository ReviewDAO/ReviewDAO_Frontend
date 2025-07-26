import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'
import { ipfsService } from '../services/IPFSService'

interface ReviewProcessProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface Submission {
  id: string
  paperId: string
  journalId: string
  paperTitle: string
  journalName: string
  authors: string[]
  submissionDate: string
  status: number
  assignedReviewers: string[]
  reviews: Review[]
  coverLetter: string
  suggestedReviewers: string[]
}

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  decision: number
  comments: string
  confidentialComments: string
  submissionDate: string
  score: number
}

interface ReviewForm {
  decision: number
  comments: string
  confidentialComments: string
  score: number
}

export function ReviewProcess({ address, onTransactionSuccess }: ReviewProcessProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'assigned'>('pending')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    decision: 0,
    comments: '',
    confidentialComments: '',
    score: 5
  })

  const contractService = createContractService(address)

  const statusLabels = {
    0: '待分配审稿人',
    1: '审稿中',
    2: '审稿完成',
    3: '已接收',
    4: '已拒绝',
    5: '需要修改'
  }

  const decisionLabels = {
    0: '接受',
    1: '小修后接受',
    2: '大修后重审',
    3: '拒绝'
  }

  const decisionColors = {
    0: 'bg-green-100 text-green-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-purple-100 text-purple-800',
    3: 'bg-green-100 text-green-800',
    4: 'bg-red-100 text-red-800',
    5: 'bg-yellow-100 text-yellow-800'
  }

  const loadSubmissions = async () => {
    try {
      // 这里应该从合约查询投稿信息
      // 暂时使用模拟数据
      const mockSubmissions: Submission[] = [
        {
          id: '1',
          paperId: 'paper_1',
          journalId: 'journal_1',
          paperTitle: 'Deep Learning Approaches for Blockchain Consensus',
          journalName: 'Journal of Blockchain Technology',
          authors: ['Alice Smith', 'Bob Johnson'],
          submissionDate: '2024-01-15',
          status: 1, // 审稿中
          assignedReviewers: [address, '0x456...'],
          reviews: [],
          coverLetter: 'This paper presents novel approaches...',
          suggestedReviewers: ['Dr. Charlie Brown', 'Prof. Diana Wilson']
        },
        {
          id: '2',
          paperId: 'paper_2',
          journalId: 'journal_2',
          paperTitle: 'Quantum Computing Applications in Cryptography',
          journalName: 'Quantum Research Journal',
          authors: ['Eve Davis', 'Frank Miller'],
          submissionDate: '2024-01-10',
          status: 2, // 审稿完成
          assignedReviewers: [address, '0x789...'],
          reviews: [
            {
              id: 'review_1',
              reviewerId: address,
              reviewerName: 'You',
              decision: 1, // 小修后接受
              comments: 'The paper is well-written but needs minor revisions...',
              confidentialComments: 'The methodology is sound.',
              submissionDate: '2024-01-20',
              score: 7
            }
          ],
          coverLetter: 'We propose a new quantum algorithm...',
          suggestedReviewers: ['Dr. Grace Lee', 'Prof. Henry Kim']
        }
      ]
      setSubmissions(mockSubmissions)
    } catch (error) {
      console.error('Error loading submissions:', error)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission || !reviewForm.comments) {
      alert('请填写审稿意见')
      return
    }

    try {
      setLoading(true)

      // 创建审稿意见元数据
      const reviewMetadata = {
        summary: reviewForm.comments,
        strengths: 'Paper strengths based on review',
        weaknesses: 'Paper weaknesses based on review', 
        suggestions: reviewForm.confidentialComments || 'No additional suggestions',
        confidenceLevel: reviewForm.score
      }

      const metadataHash = await ipfsService.createReviewMetadata(reviewMetadata)
      const metadataURI = `ipfs://${metadataHash}`

      // 调用合约提交审稿意见
      const response = await contractService.submitReview(
        selectedSubmission.id,
        metadataURI
      )

      onTransactionSuccess(response.txHash)
      setShowReviewForm(false)
      setSelectedSubmission(null)

      // 重置表单
      setReviewForm({
        decision: 0,
        comments: '',
        confidentialComments: '',
        score: 5
      })

      // 重新加载数据
      loadSubmissions()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('提交审稿意见失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishPaper = async (submissionId: string) => {
    try {
      setLoading(true)

      const response = await contractService.publishPaper(submissionId, 'volume1')
      onTransactionSuccess(response.txHash)
      loadSubmissions()
    } catch (error) {
      console.error('Error publishing paper:', error)
      alert('发表论文失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredSubmissions = () => {
    switch (activeTab) {
      case 'pending':
        return submissions.filter(s => 
          s.assignedReviewers.includes(address) && 
          !s.reviews.some(r => r.reviewerId === address)
        )
      case 'completed':
        return submissions.filter(s => 
          s.reviews.some(r => r.reviewerId === address)
        )
      case 'assigned':
        return submissions.filter(s => s.assignedReviewers.includes(address))
      default:
        return submissions
    }
  }

  useEffect(() => {
    if (address) {
      loadSubmissions()
    }
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">审稿流程</h2>
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
            待审稿 ({getFilteredSubmissions().length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            已完成
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            所有分配
          </button>
        </nav>
      </div>

      {/* 投稿列表 */}
      <div className="space-y-4">
        {getFilteredSubmissions().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无投稿</h3>
            <p className="text-gray-600">
              {activeTab === 'pending' && '您目前没有待审稿的论文。'}
              {activeTab === 'completed' && '您还没有完成任何审稿。'}
              {activeTab === 'assigned' && '您还没有被分配任何审稿任务。'}
            </p>
          </div>
        ) : (
          getFilteredSubmissions().map(submission => (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {submission.paperTitle}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>📖 {submission.journalName}</span>
                    <span>👥 {submission.authors.join(', ')}</span>
                    <span>📅 {submission.submissionDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[submission.status as keyof typeof statusColors]
                    }`}>
                      {statusLabels[submission.status as keyof typeof statusLabels]}
                    </span>
                    <span className="text-sm text-gray-500">
                      审稿人: {submission.assignedReviewers.length}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    查看详情
                  </button>
                  {activeTab === 'pending' && !submission.reviews.some(r => r.reviewerId === address) && (
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission)
                        setShowReviewForm(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      开始审稿
                    </button>
                  )}
                </div>
              </div>

              {/* 审稿进度 */}
              {submission.reviews.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">审稿意见</h4>
                  <div className="space-y-2">
                    {submission.reviews.map(review => (
                      <div key={review.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{review.reviewerName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            decisionColors[review.decision as keyof typeof decisionColors]
                          }`}>
                            {decisionLabels[review.decision as keyof typeof decisionLabels]}
                          </span>
                          <span className="text-sm text-gray-600">评分: {review.score}/10</span>
                        </div>
                        <span className="text-sm text-gray-500">{review.submissionDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 投稿详情模态框 */}
      {selectedSubmission && !showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">投稿详情</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">论文信息</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="font-semibold text-gray-900 mb-2">{selectedSubmission.paperTitle}</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">期刊:</span>
                        <span className="ml-2 text-gray-600">{selectedSubmission.journalName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">投稿日期:</span>
                        <span className="ml-2 text-gray-600">{selectedSubmission.submissionDate}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">作者:</span>
                        <span className="ml-2 text-gray-600">{selectedSubmission.authors.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">投稿信</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 text-sm">{selectedSubmission.coverLetter}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">建议审稿人</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.suggestedReviewers.map(reviewer => (
                        <span key={reviewer} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                          {reviewer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedSubmission.reviews.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">审稿意见</h4>
                    <div className="space-y-4">
                      {selectedSubmission.reviews.map(review => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{review.reviewerName}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                decisionColors[review.decision as keyof typeof decisionColors]
                              }`}>
                                {decisionLabels[review.decision as keyof typeof decisionLabels]}
                              </span>
                              <span className="text-sm text-gray-600">评分: {review.score}/10</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{review.comments}</p>
                          {review.confidentialComments && (
                            <div className="border-t border-gray-200 pt-2">
                              <p className="text-xs text-gray-500 mb-1">机密意见（仅编辑可见）:</p>
                              <p className="text-gray-600 text-sm">{review.confidentialComments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 审稿表单模态框 */}
      {showReviewForm && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">提交审稿意见</h3>
                <button
                  onClick={() => {
                    setShowReviewForm(false)
                    setSelectedSubmission(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">论文信息</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-semibold text-gray-900">{selectedSubmission.paperTitle}</h5>
                  <p className="text-gray-600 text-sm">{selectedSubmission.journalName}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    审稿决定 *
                  </label>
                  <select
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm({ ...reviewForm, decision: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>接受</option>
                    <option value={1}>小修后接受</option>
                    <option value={2}>大修后重审</option>
                    <option value={3}>拒绝</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    评分 (1-10) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reviewForm.score}
                    onChange={(e) => setReviewForm({ ...reviewForm, score: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    审稿意见 *
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请详细说明您的审稿意见，包括论文的优点、不足和改进建议..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    机密意见（仅编辑可见）
                  </label>
                  <textarea
                    value={reviewForm.confidentialComments}
                    onChange={(e) => setReviewForm({ ...reviewForm, confidentialComments: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="向编辑提供的机密意见..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false)
                      setSelectedSubmission(null)
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? '提交中...' : '提交审稿意见'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}