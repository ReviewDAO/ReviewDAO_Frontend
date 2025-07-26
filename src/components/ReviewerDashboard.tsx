import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'
import { ipfsService } from '../services/IPFSService'

interface ReviewerDashboardProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface ReviewerProfile {
  name: string
  affiliation: string
  expertise: string[]
  bio: string
  orcid: string
  tier: number
  reputation: number
  reviewCount: number
}

interface RegisterForm {
  name: string
  affiliation: string
  expertise: string[]
  bio: string
  orcid: string
}

export function ReviewerDashboard({ address, onTransactionSuccess }: ReviewerDashboardProps) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [reviewerProfile, setReviewerProfile] = useState<ReviewerProfile | null>(null)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    affiliation: '',
    expertise: [],
    bio: '',
    orcid: ''
  })
  const [newExpertise, setNewExpertise] = useState('')

  const contractService = createContractService()

  const expertiseAreas = [
    'Computer Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Blockchain Technology',
    'Cryptocurrency',
    'Distributed Systems',
    'Cybersecurity',
    'Software Engineering',
    'Data Science',
    'Big Data',
    'Cloud Computing',
    'Internet of Things',
    'Human-Computer Interaction',
    'Database Systems',
    'Network Security',
    'Quantum Computing',
    'Robotics'
  ]

  const tierLabels = {
    0: '初级审稿人',
    1: '高级审稿人',
    2: '专家审稿人'
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.name || !registerForm.affiliation || registerForm.expertise.length === 0) {
      alert('请填写姓名、机构和专业领域')
      return
    }

    try {
      setLoading(true)

      // 创建审稿人元数据
      const metadataHash = await ipfsService.createReviewerMetadata({
        name: registerForm.name,
        affiliation: registerForm.affiliation,
        expertise: registerForm.expertise,
        bio: registerForm.bio,
        orcid: registerForm.orcid
      })

      const metadataURI = `ipfs://${metadataHash}`

      // 调用合约注册审稿人
      const response = await contractService.registerAsReviewer(metadataURI)

      onTransactionSuccess(response.hash)
      setShowRegisterForm(false)
      setIsRegistered(true)

      // 设置审稿人档案
      setReviewerProfile({
        ...registerForm,
        tier: 0, // 初级审稿人
        reputation: 100, // 初始声誉
        reviewCount: 0
      })

      // 重置表单
      setRegisterForm({
        name: '',
        affiliation: '',
        expertise: [],
        bio: '',
        orcid: ''
      })
    } catch (error) {
      console.error('Error registering reviewer:', error)
      alert('注册审稿人失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpertise = () => {
    if (newExpertise && !registerForm.expertise.includes(newExpertise)) {
      setRegisterForm({
        ...registerForm,
        expertise: [...registerForm.expertise, newExpertise]
      })
      setNewExpertise('')
    }
  }

  const handleRemoveExpertise = (expertise: string) => {
    setRegisterForm({
      ...registerForm,
      expertise: registerForm.expertise.filter(e => e !== expertise)
    })
  }

  const loadReviewerProfile = async () => {
    try {
      // 这里应该从合约查询审稿人信息
      // 暂时使用模拟数据
      setReviewerProfile({
        name: 'Dr. Alice Smith',
        affiliation: 'MIT Computer Science',
        expertise: ['Artificial Intelligence', 'Machine Learning', 'Blockchain Technology'],
        bio: 'Professor of Computer Science with 10+ years of research experience.',
        orcid: '0000-0000-0000-0000',
        tier: 1,
        reputation: 850,
        reviewCount: 25
      })
      setIsRegistered(true)
    } catch (error) {
      console.error('Error loading reviewer profile:', error)
    }
  }

  useEffect(() => {
    if (address) {
      loadReviewerProfile()
    }
  }, [address])

  if (!isRegistered && !showRegisterForm) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">👨‍🎓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">成为审稿人</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          注册成为审稿人，参与学术同行评议，为学术社区贡献您的专业知识。
        </p>
        <button
          onClick={() => setShowRegisterForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          注册审稿人
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">审稿人仪表板</h2>
        {!isRegistered && (
          <button
            onClick={() => setShowRegisterForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            注册审稿人
          </button>
        )}
      </div>

      {/* 注册表单 */}
      {showRegisterForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">审稿人注册</h3>
            <button
              onClick={() => setShowRegisterForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入您的姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  机构 *
                </label>
                <input
                  type="text"
                  value={registerForm.affiliation}
                  onChange={(e) => setRegisterForm({ ...registerForm, affiliation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入您的工作机构"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ORCID (可选)
              </label>
              <input
                type="text"
                value={registerForm.orcid}
                onChange={(e) => setRegisterForm({ ...registerForm, orcid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0000-0000-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                专业领域 *
              </label>
              <div className="flex space-x-2 mb-2">
                <select
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择专业领域</option>
                  {expertiseAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddExpertise}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {registerForm.expertise.map(expertise => (
                  <span
                    key={expertise}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <span>{expertise}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(expertise)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                个人简介
              </label>
              <textarea
                value={registerForm.bio}
                onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="简要介绍您的学术背景和研究经历..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? '注册中...' : '注册审稿人'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 审稿人档案 */}
      {isRegistered && reviewerProfile && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                👨‍🎓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{reviewerProfile.name}</h3>
                <p className="text-gray-600">{reviewerProfile.affiliation}</p>
                {reviewerProfile.orcid && (
                  <p className="text-sm text-gray-500">ORCID: {reviewerProfile.orcid}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                reviewerProfile.tier === 0 ? 'bg-green-100 text-green-800' :
                reviewerProfile.tier === 1 ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {tierLabels[reviewerProfile.tier as keyof typeof tierLabels]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reviewerProfile.reputation}</div>
              <div className="text-sm text-gray-600">声誉分数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reviewerProfile.reviewCount}</div>
              <div className="text-sm text-gray-600">完成审稿</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reviewerProfile.tier + 1}</div>
              <div className="text-sm text-gray-600">审稿人等级</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">专业领域</h4>
              <div className="flex flex-wrap gap-2">
                {reviewerProfile.expertise.map(expertise => (
                  <span
                    key={expertise}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    {expertise}
                  </span>
                ))}
              </div>
            </div>

            {reviewerProfile.bio && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">个人简介</h4>
                <p className="text-gray-600 text-sm">{reviewerProfile.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 审稿统计 */}
      {isRegistered && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                📋
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">5</div>
                <div className="text-sm text-gray-600">待审稿论文</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                ✅
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">25</div>
                <div className="text-sm text-gray-600">已完成审稿</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⏱️
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">3.2</div>
                <div className="text-sm text-gray-600">平均审稿天数</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                🏆
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600">审稿质量评分</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}