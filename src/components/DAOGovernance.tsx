import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'

interface DAOGovernanceProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface Proposal {
  id: number
  proposer: string
  proposalType: number
  description: string
  startTime: string
  endTime: string
  forVotes: number
  againstVotes: number
  abstainVotes: number
  status: number
  hasVoted: boolean
  userVote?: number
}

interface CreateProposalForm {
  proposalType: number
  description: string
  data: string
  votingDuration: number
}

export function DAOGovernance({ address, onTransactionSuccess }: DAOGovernanceProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'create'>('active')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreateProposalForm>({
    proposalType: 0,
    description: '',
    data: '',
    votingDuration: 7
  })

  const contractService = createContractService()

  const proposalTypes = {
    0: '一般提案',
    1: '添加审稿人',
    2: '移除审稿人',
    3: '升级审稿人',
    4: '参数更新',
    5: '资金分配'
  }

  const proposalStatus = {
    0: '待处理',
    1: '活跃',
    2: '通过',
    3: '拒绝',
    4: '已执行'
  }

  const voteTypes = {
    0: '反对',
    1: '赞成',
    2: '弃权'
  }

  const statusColors = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-red-100 text-red-800',
    4: 'bg-purple-100 text-purple-800'
  }

  const loadProposals = async () => {
    try {
      // 这里应该从合约查询提案数据
      // 暂时使用模拟数据
      const mockProposals: Proposal[] = [
        {
          id: 1,
          proposer: '0x1234...5678',
          proposalType: 1,
          description: '提议添加新的高级审稿人 Dr. Alice Smith 到系统中',
          startTime: '2024-01-10',
          endTime: '2024-01-17',
          forVotes: 150,
          againstVotes: 30,
          abstainVotes: 20,
          status: 1,
          hasVoted: false
        },
        {
          id: 2,
          proposer: '0x2345...6789',
          proposalType: 4,
          description: '更新基础审稿奖励从10 INJ增加到15 INJ',
          startTime: '2024-01-05',
          endTime: '2024-01-12',
          forVotes: 200,
          againstVotes: 50,
          abstainVotes: 10,
          status: 2,
          hasVoted: true,
          userVote: 1
        },
        {
          id: 3,
          proposer: '0x3456...7890',
          proposalType: 5,
          description: '分配10000 INJ用于激励新审稿人注册',
          startTime: '2024-01-08',
          endTime: '2024-01-15',
          forVotes: 80,
          againstVotes: 120,
          abstainVotes: 30,
          status: 3,
          hasVoted: true,
          userVote: 0
        }
      ]
      setProposals(mockProposals)
    } catch (error) {
      console.error('Error loading proposals:', error)
    }
  }

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.description) {
      alert('请填写提案描述')
      return
    }

    try {
      setLoading(true)

      const response = await contractService.createProposal({
        proposalType: createForm.proposalType,
        description: createForm.description,
        data: createForm.data,
        votingDuration: createForm.votingDuration * 24 * 60 * 60 // 转换为秒
      })

      if (response.transactionHash) {
        onTransactionSuccess(response.transactionHash)
        setShowCreateForm(false)
        setCreateForm({
          proposalType: 0,
          description: '',
          data: '',
          votingDuration: 7
        })
        await loadProposals()
      }
    } catch (error) {
      console.error('Error creating proposal:', error)
      alert('创建提案失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proposalId: number, voteType: number) => {
    try {
      setLoading(true)

      const response = await contractService.voteOnProposal(proposalId, voteType === 1)

      if (response.transactionHash) {
        onTransactionSuccess(response.transactionHash)
        await loadProposals()
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('投票失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteProposal = async (proposalId: number) => {
    try {
      setLoading(true)

      const response = await contractService.executeProposal(proposalId)

      if (response.transactionHash) {
        onTransactionSuccess(response.transactionHash)
        await loadProposals()
      }
    } catch (error) {
      console.error('Error executing proposal:', error)
      alert('执行提案失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredProposals = () => {
    switch (activeTab) {
      case 'active':
        return proposals.filter(p => p.status === 1)
      case 'completed':
        return proposals.filter(p => p.status === 2 || p.status === 3 || p.status === 4)
      default:
        return proposals
    }
  }

  const calculateVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0
  }

  const getTotalVotes = (proposal: Proposal) => {
    return proposal.forVotes + proposal.againstVotes + proposal.abstainVotes
  }

  useEffect(() => {
    if (address) {
      loadProposals()
    }
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">DAO治理</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          创建提案
        </button>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            活跃提案 ({proposals.filter(p => p.status === 1).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            已完成提案
          </button>
        </nav>
      </div>

      {/* 提案列表 */}
      <div className="space-y-4">
        {getFilteredProposals().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无提案</h3>
            <p className="text-gray-600">
              {activeTab === 'active' && '当前没有活跃的提案。'}
              {activeTab === 'completed' && '暂无已完成的提案。'}
            </p>
          </div>
        ) : (
          getFilteredProposals().map(proposal => {
            const totalVotes = getTotalVotes(proposal)
            const forPercentage = calculateVotePercentage(proposal.forVotes, totalVotes)
            const againstPercentage = calculateVotePercentage(proposal.againstVotes, totalVotes)
            const abstainPercentage = calculateVotePercentage(proposal.abstainVotes, totalVotes)

            return (
              <div key={proposal.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        提案 #{proposal.id}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[proposal.status as keyof typeof statusColors]
                      }`}>
                        {proposalStatus[proposal.status as keyof typeof proposalStatus]}
                      </span>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {proposalTypes[proposal.proposalType as keyof typeof proposalTypes]}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{proposal.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">提案人：</span>
                        <span className="font-mono text-xs">{proposal.proposer}</span>
                      </div>
                      <div>
                        <span className="font-medium">投票期限：</span>
                        {proposal.startTime} - {proposal.endTime}
                      </div>
                    </div>

                    {/* 投票统计 */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>总投票数: {totalVotes}</span>
                        {proposal.hasVoted && (
                          <span className="text-blue-600">
                            您已投票: {voteTypes[proposal.userVote as keyof typeof voteTypes]}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm w-12">赞成</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${forPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-16 text-right">
                            {proposal.forVotes} ({forPercentage}%)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm w-12">反对</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${againstPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-16 text-right">
                            {proposal.againstVotes} ({againstPercentage}%)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm w-12">弃权</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-400 h-2 rounded-full" 
                              style={{ width: `${abstainPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-16 text-right">
                            {proposal.abstainVotes} ({abstainPercentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  {proposal.status === 1 && !proposal.hasVoted && (
                    <>
                      <button
                        onClick={() => handleVote(proposal.id, 1)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        赞成
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 0)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        反对
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 2)}
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                      >
                        弃权
                      </button>
                    </>
                  )}
                  
                  {proposal.status === 2 && (
                    <button
                      onClick={() => handleExecuteProposal(proposal.id)}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      执行提案
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 创建提案模态框 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              创建新提案
            </h3>
            
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提案类型
                </label>
                <select
                  value={createForm.proposalType}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    proposalType: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(proposalTypes).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提案描述
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    description: e.target.value
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="详细描述您的提案内容..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提案数据 (可选)
                </label>
                <input
                  type="text"
                  value={createForm.data}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    data: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="相关数据或参数"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  投票期限 (天)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={createForm.votingDuration}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    votingDuration: parseInt(e.target.value) || 7
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {loading ? '创建中...' : '创建提案'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}