import React, { useState, useEffect, useCallback } from 'react'
import { createContractService } from '../services/ContractService'
import { ipfsService } from '../services/IPFSService'
import { getMigratedTestData, type FrontendSubmission } from '../utils/testDataMigration'

interface ReviewProcessProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

// 使用迁移的数据类型
type Submission = FrontendSubmission

// 审稿意见接口 - 保留用于未来扩展
// interface Review {
//   id: string
//   reviewerId: string
//   reviewerName: string
//   decision: number
//   comments: string
//   confidentialComments: string
//   submissionDate: string
//   score: number
// }

interface ReviewForm {
  decision: number
  comments: string
  confidentialComments: string
  score: number
}

export function ReviewProcess({ address, onTransactionSuccess }: ReviewProcessProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'assigned'>('pending')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  // const [loading, setLoading] = useState(false) // 暂时注释，后续实现加载状态时使用
  // const [loadingPaperContent, setLoadingPaperContent] = useState(false) // 暂时注释，后续实现时使用
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    decision: 0,
    comments: '',
    confidentialComments: '',
    score: 5
  })

  const contractService = createContractService()

  const statusLabels = {
    'pending': '待分配审稿人',
    'under_review': '审稿中',
    'completed': '审稿完成',
    'accepted': '已接收',
    'rejected': '已拒绝',
    'revision_required': '需要修改'
  }

  // const decisionLabels = {
  //   0: '接受',
  //   1: '小修后接受',
  //   2: '大修后重审',
  //   3: '拒绝'
  // }

  // const decisionColors = {
  //   0: 'bg-green-100 text-green-800',
  //   1: 'bg-blue-100 text-blue-800',
  //   2: 'bg-yellow-100 text-yellow-800',
  //   3: 'bg-red-100 text-red-800'
  // }

  const statusColors = {
    'pending': 'bg-gray-100 text-gray-800',
    'under_review': 'bg-blue-100 text-blue-800',
    'completed': 'bg-purple-100 text-purple-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'revision_required': 'bg-yellow-100 text-yellow-800'
  }

  // 从区块链加载真实数据
  const loadRealSubmissions = useCallback(async () => {
    try {
      setDataLoading(true)
      const realData = await getMigratedTestData()
      console.log('从合约加载的投稿数据:', realData.submissions)
      setSubmissions(realData.submissions)
    } catch (error) {
      console.error('加载投稿数据失败:', error)
      setSubmissions([])
    } finally {
      setDataLoading(false)
    }
  }, [])

  const loadSubmissions = useCallback(async () => {
    await loadRealSubmissions()
  }, [loadRealSubmissions])

  const handleAssignSelfAsReviewer = async (submission: Submission) => {
    try {
      setIsLoading(true)
      
      await contractService.assignReviewer({
        submissionId: parseInt(submission.id),
        reviewerAddress: address
      })
      
      alert('成功分配为审稿人！现在您可以开始审稿了。')
      
      // 重新加载数据
      await loadSubmissions()
      
    } catch (error) {
      console.error('Error assigning reviewer:', error)
      
      if ((error as Error).message.includes('Not authorized')) {
        alert('分配审稿人失败：您没有权限分配审稿人。\n\n在实际应用中，只有期刊编辑或管理员可以分配审稿人。\n在演示环境中，请联系管理员获取相应权限。')
      } else if ((error as Error).message.includes('Not a registered reviewer')) {
        alert('分配审稿人失败：您尚未注册为审稿人。\n\n请先在"审稿人面板"中注册为审稿人，然后再尝试分配。')
      } else if ((error as Error).message.includes('Reviewer already assigned')) {
        alert('您已经被分配为此投稿的审稿人。')
      } else {
        alert('分配审稿人失败: ' + (error as Error).message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission || !reviewForm.comments) {
      alert('请填写审稿意见')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

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
        parseInt(selectedSubmission.id),
        reviewForm.decision,
        metadataURI
      )

      onTransactionSuccess(response.hash)
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
      await loadSubmissions()
    } catch (error) {
      console.error('Error submitting review:', error)
      
      // 提供更友好的错误信息
      if ((error as Error).message.includes('Only assigned reviewers can call this function')) {
        setError('提交审稿意见失败：您尚未被分配为此投稿的审稿人。\n\n请注意：\n1. 您需要先在"审稿人面板"中注册为审稿人\n2. 期刊编辑需要将您分配为此投稿的审稿人\n3. 在演示环境中，您可以联系管理员进行分配')
      } else {
        setError('提交审稿意见失败: ' + (error as Error).message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }



  const getFilteredSubmissions = () => {
    switch (activeTab) {
      case 'pending':
        return submissions.filter(s => s.status === 'under_review')
      case 'completed':
        return submissions.filter(s => s.status === 'accepted' || s.status === 'rejected')
      case 'assigned':
        return submissions.filter(s => s.status === 'under_review')
      default:
        return submissions
    }
  }

  useEffect(() => {
    if (address) {
      loadSubmissions()
    }
  }, [address, loadSubmissions])

  // 加载论文详细内容
  // const loadPaperContent = async (submission: Submission) => {
  //   if (submission.paperContent) return // 已加载
  //   
  //   setLoadingPaperContent(true)
  //   try {
  //     // 尝试从IPFS获取论文内容
  //     if (submission.paperMetadata?.fileUrl) {
  //       const content = await ipfsService.fetchFromIPFS(submission.paperMetadata.fileUrl)
  //       // 更新submission的paperContent
  //       setSubmissions(prev => prev.map(s => 
  //         s.id === submission.id 
  //           ? { ...s, paperContent: content }
  //           : s
  //       ))
  //     }
  //   } catch (error) {
  //     console.error('加载论文内容失败:', error)
  //     // 使用模拟内容
  //     const mockContent = `这是论文《${submission.title}》的模拟内容。\n\n摘要：${submission.abstract}\n\n关键词：${submission.keywords.join(', ')}\n\n正文内容将在此处显示...`
  //     setSubmissions(prev => prev.map(s => 
  //       s.id === submission.id 
  //         ? { ...s, paperContent: mockContent }
  //         : s
  //     ))
  //   } finally {
  //     setLoadingPaperContent(false)
  //   }
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">审稿流程</h2>
        {dataLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>正在加载数据...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 rounded-md p-4">
          <div className="flex justify-between items-start">
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-2 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
        {dataLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">正在加载投稿数据</h3>
            <p className="text-gray-600">请稍候，正在从合约获取最新数据...</p>
          </div>
        ) : getFilteredSubmissions().length === 0 ? (
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
                    {submission.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>📖 {submission.journalName}</span>
                    <span>👥 {submission.authors.join(', ')}</span>
                    <span>📅 {new Date(submission.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[submission.status]
                    }`}>
                      {statusLabels[submission.status]}
                    </span>
                    <span className="text-sm text-gray-500">
                      审稿人: 0
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{submission.abstract}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    查看详情
                  </button>
                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAssignSelfAsReviewer(submission)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors mr-2"
                        disabled={isLoading}
                      >
                        分配为审稿人
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowReviewForm(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        开始审稿
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 审稿进度 - 暂时隐藏，因为新数据结构中没有reviews字段 */}
              {/* 可以在这里添加从区块链查询审稿意见的功能 */}
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
                    <h5 className="font-semibold text-gray-900 mb-2">{selectedSubmission.title}</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">期刊:</span>
                        <span className="ml-2 text-gray-600">{selectedSubmission.journalName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">投稿日期:</span>
                        <span className="ml-2 text-gray-600">{new Date(selectedSubmission.submissionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">作者:</span>
                        <span className="ml-2 text-gray-600">{selectedSubmission.authors.join(', ')}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">关键词:</span>
                        <span className="ml-2 text-gray-600">{selectedSubmission.keywords.join(', ')}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">IPFS哈希:</span>
                        <code className="ml-2 text-xs bg-gray-200 px-1 rounded">{selectedSubmission.ipfsHash}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">摘要</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 text-sm">{selectedSubmission.abstract}</p>
                  </div>
                </div>

                {selectedSubmission.paperContent && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">论文内容</h4>
                    <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSubmission.paperContent}</pre>
                    </div>
                  </div>
                )}

                {/* 审稿意见部分 - 暂时隐藏，因为新数据结构中没有reviews字段 */}
                {/* 可以在这里添加从区块链查询审稿意见的功能 */}
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
                  <h5 className="font-semibold text-gray-900">{selectedSubmission.title}</h5>
                  <p className="text-gray-600 text-sm">{selectedSubmission.journalName}</p>
                  <p className="text-gray-600 text-sm mt-1">作者: {selectedSubmission.authors.join(', ')}</p>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? '提交中...' : '提交审稿意见'}
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