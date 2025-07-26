import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'

interface AdminPanelProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface Reviewer {
  address: string
  name: string
  tier: number
  reputation: number
  completedReviews: number
  joinedDate: string
  isActive: boolean
}

interface JournalStats {
  id: number
  name: string
  totalSubmissions: number
  totalPublished: number
  acceptanceRate: number
  averageReviewTime: number
}

export function AdminPanel({ address, onTransactionSuccess }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'reviewers' | 'journals' | 'system'>('reviewers')
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [journalStats, setJournalStats] = useState<JournalStats[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    tier: 0,
    reputationChange: 0
  })

  const contractService = createContractService()

  const tierLabels = {
    0: '未注册',
    1: '初级审稿人',
    2: '高级审稿人',
    3: '专家审稿人'
  }

  const tierColors = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-purple-100 text-purple-800'
  }

  const loadReviewers = async () => {
    try {
      // 这里应该从合约查询审稿人数据
      // 暂时使用模拟数据
      const mockReviewers: Reviewer[] = [
        {
          address: '0x1234...5678',
          name: 'Dr. Alice Smith',
          tier: 2,
          reputation: 450,
          completedReviews: 25,
          joinedDate: '2023-12-01',
          isActive: true
        },
        {
          address: '0x2345...6789',
          name: 'Prof. Bob Johnson',
          tier: 3,
          reputation: 680,
          completedReviews: 58,
          joinedDate: '2023-10-15',
          isActive: true
        },
        {
          address: '0x3456...7890',
          name: 'Dr. Carol Wilson',
          tier: 1,
          reputation: 180,
          completedReviews: 8,
          joinedDate: '2024-01-05',
          isActive: true
        },
        {
          address: '0x4567...8901',
          name: 'Dr. David Brown',
          tier: 2,
          reputation: 320,
          completedReviews: 15,
          joinedDate: '2023-11-20',
          isActive: false
        }
      ]
      setReviewers(mockReviewers)
    } catch (error) {
      console.error('Error loading reviewers:', error)
    }
  }

  const loadJournalStats = async () => {
    try {
      // 这里应该从合约查询期刊统计数据
      // 暂时使用模拟数据
      const mockStats: JournalStats[] = [
        {
          id: 1,
          name: 'Blockchain Research Journal',
          totalSubmissions: 156,
          totalPublished: 89,
          acceptanceRate: 57,
          averageReviewTime: 21
        },
        {
          id: 2,
          name: 'AI & Machine Learning Review',
          totalSubmissions: 203,
          totalPublished: 145,
          acceptanceRate: 71,
          averageReviewTime: 18
        },
        {
          id: 3,
          name: 'Computer Science Quarterly',
          totalSubmissions: 98,
          totalPublished: 42,
          acceptanceRate: 43,
          averageReviewTime: 28
        }
      ]
      setJournalStats(mockStats)
    } catch (error) {
      console.error('Error loading journal stats:', error)
    }
  }

  const handleUpdateReviewer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReviewer) return

    try {
      setLoading(true)

      // 更新等级
      if (updateForm.tier !== selectedReviewer.tier) {
        const tierResponse = await contractService.updateReviewerTier(
          selectedReviewer.address,
          updateForm.tier
        )
        if (tierResponse.hash) {
          onTransactionSuccess(tierResponse.hash)
        }
      }

      // 更新声誉
      if (updateForm.reputationChange !== 0) {
        const reputationResponse = await contractService.updateReviewerReputation(
          selectedReviewer.address,
          updateForm.reputationChange
        )
        if (reputationResponse.hash) {
          onTransactionSuccess(reputationResponse.hash)
        }
      }

      setShowUpdateForm(false)
      setSelectedReviewer(null)
      await loadReviewers()
    } catch (error) {
      console.error('Error updating reviewer:', error)
      alert('更新审稿人信息失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const openUpdateForm = (reviewer: Reviewer) => {
    setSelectedReviewer(reviewer)
    setUpdateForm({
      tier: reviewer.tier,
      reputationChange: 0
    })
    setShowUpdateForm(true)
  }

  useEffect(() => {
    if (address) {
      loadReviewers()
      loadJournalStats()
    }
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">管理员面板</h2>
        <div className="text-sm text-gray-600">
          系统管理和数据统计
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reviewers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviewers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            审稿人管理
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            期刊统计
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            系统概览
          </button>
        </nav>
      </div>

      {/* 审稿人管理 */}
      {activeTab === 'reviewers' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">审稿人列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      审稿人
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      等级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      声誉
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成审稿
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviewers.map((reviewer) => (
                    <tr key={reviewer.address}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reviewer.name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {reviewer.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          tierColors[reviewer.tier as keyof typeof tierColors]
                        }`}>
                          {tierLabels[reviewer.tier as keyof typeof tierLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reviewer.reputation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reviewer.completedReviews}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          reviewer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reviewer.isActive ? '活跃' : '非活跃'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openUpdateForm(reviewer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          编辑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 期刊统计 */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">期刊统计数据</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      期刊名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总投稿数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      已发表
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      接受率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均审稿时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {journalStats.map((journal) => (
                    <tr key={journal.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {journal.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {journal.totalSubmissions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {journal.totalPublished}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${journal.acceptanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{journal.acceptanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {journal.averageReviewTime} 天
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 系统概览 */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">👨‍🎓</div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">总审稿人数</div>
                <div className="text-2xl font-bold text-gray-900">{reviewers.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📚</div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">活跃期刊数</div>
                <div className="text-2xl font-bold text-gray-900">{journalStats.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📄</div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">总投稿数</div>
                <div className="text-2xl font-bold text-gray-900">
                  {journalStats.reduce((sum, j) => sum + j.totalSubmissions, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">✅</div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">已发表论文</div>
                <div className="text-2xl font-bold text-gray-900">
                  {journalStats.reduce((sum, j) => sum + j.totalPublished, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">审稿人等级分布</h3>
            <div className="space-y-3">
              {Object.entries(tierLabels).slice(1).map(([tier, label]) => {
                const count = reviewers.filter(r => r.tier === parseInt(tier)).length
                const percentage = reviewers.length > 0 ? Math.round((count / reviewers.length) * 100) : 0
                return (
                  <div key={tier} className="flex items-center">
                    <span className="text-sm w-20">{label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm w-16 text-right">{count} ({percentage}%)</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">系统活动统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">活跃审稿人</span>
                <span className="text-sm font-medium">
                  {reviewers.filter(r => r.isActive).length} / {reviewers.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">平均声誉分数</span>
                <span className="text-sm font-medium">
                  {reviewers.length > 0 ? Math.round(reviewers.reduce((sum, r) => sum + r.reputation, 0) / reviewers.length) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">总完成审稿数</span>
                <span className="text-sm font-medium">
                  {reviewers.reduce((sum, r) => sum + r.completedReviews, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">平均接受率</span>
                <span className="text-sm font-medium">
                  {journalStats.length > 0 ? Math.round(journalStats.reduce((sum, j) => sum + j.acceptanceRate, 0) / journalStats.length) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 更新审稿人表单模态框 */}
      {showUpdateForm && selectedReviewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              更新审稿人信息
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                <div><strong>姓名：</strong>{selectedReviewer.name}</div>
                <div><strong>地址：</strong>{selectedReviewer.address}</div>
                <div><strong>当前等级：</strong>{tierLabels[selectedReviewer.tier as keyof typeof tierLabels]}</div>
                <div><strong>当前声誉：</strong>{selectedReviewer.reputation}</div>
              </div>
            </div>

            <form onSubmit={handleUpdateReviewer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  审稿人等级
                </label>
                <select
                  value={updateForm.tier}
                  onChange={(e) => setUpdateForm({
                    ...updateForm,
                    tier: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(tierLabels).slice(1).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  声誉调整 (+/-)
                </label>
                <input
                  type="number"
                  value={updateForm.reputationChange}
                  onChange={(e) => setUpdateForm({
                    ...updateForm,
                    reputationChange: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入正数增加，负数减少"
                />
              </div>

              {updateForm.reputationChange !== 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-700">
                    新声誉分数: {selectedReviewer.reputation + updateForm.reputationChange}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateForm(false)
                    setSelectedReviewer(null)
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
                  {loading ? '更新中...' : '确认更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}