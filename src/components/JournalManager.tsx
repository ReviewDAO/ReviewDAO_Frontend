import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'
import { ipfsService } from '../services/IPFSService'
import { ENUMS } from '../config/contracts'

interface JournalManagerProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface Journal {
  id: number
  name: string
  description: string
  chiefEditor: string
  submissionFee: string
  categories: string[]
  status: string
}

interface CreateJournalForm {
  name: string
  description: string
  issn: string
  website: string
  categories: string[]
  submissionFee: string
  minReviewerTier: number
  requiredReviewers: number
}

export function JournalManager({ address, onTransactionSuccess }: JournalManagerProps) {
  const [journals, setJournals] = useState<Journal[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreateJournalForm>({
    name: '',
    description: '',
    issn: '',
    website: '',
    categories: [],
    submissionFee: '0.1',
    minReviewerTier: 0,
    requiredReviewers: 3
  })
  const [newCategory, setNewCategory] = useState('')
  const [editorAddress, setEditorAddress] = useState('')
  const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null)

  const contractService = createContractService(address)

  const availableCategories = [
    'Computer Science',
    'Artificial Intelligence',
    'Blockchain Technology',
    'Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Software Engineering',
    'Distributed Systems'
  ]

  const reviewerTiers = [
    { value: 0, label: '初级审稿人' },
    { value: 1, label: '高级审稿人' },
    { value: 2, label: '专家审稿人' }
  ]

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name || !createForm.description) {
      alert('请填写期刊名称和描述')
      return
    }

    try {
      setLoading(true)

      // 创建期刊元数据
      const metadataHash = await ipfsService.createJournalMetadata({
        name: createForm.name,
        description: createForm.description,
        issn: createForm.issn,
        website: createForm.website,
        categories: createForm.categories
      })

      const metadataURI = `ipfs://${metadataHash}`

      // 调用合约创建期刊
      const response = await contractService.createJournal({
        name: createForm.name,
        description: createForm.description,
        metadataURI,
        chiefEditor: address, // 创建者作为主编
        submissionFee: (parseFloat(createForm.submissionFee) * 1e18).toString(), // 转换为wei
        categories: createForm.categories,
        minReviewerTier: createForm.minReviewerTier,
        requiredReviewers: createForm.requiredReviewers
      })

      onTransactionSuccess(response.txHash)
      setShowCreateForm(false)
      setCreateForm({
        name: '',
        description: '',
        issn: '',
        website: '',
        categories: [],
        submissionFee: '0.1',
        minReviewerTier: 0,
        requiredReviewers: 3
      })

      // 刷新期刊列表
      await loadJournals()
    } catch (error) {
      console.error('Error creating journal:', error)
      alert('创建期刊失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategory && !createForm.categories.includes(newCategory)) {
      setCreateForm({
        ...createForm,
        categories: [...createForm.categories, newCategory]
      })
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCreateForm({
      ...createForm,
      categories: createForm.categories.filter(c => c !== category)
    })
  }

  const handleAddEditor = async () => {
    if (!editorAddress || !selectedJournalId) {
      alert('请选择期刊并输入编辑地址')
      return
    }

    try {
      setLoading(true)
      const response = await contractService.addEditor(selectedJournalId, editorAddress)
      onTransactionSuccess(response.txHash)
      setEditorAddress('')
      setSelectedJournalId(null)
    } catch (error) {
      console.error('Error adding editor:', error)
      alert('添加编辑失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const loadJournals = async () => {
    // 这里应该从合约查询期刊列表
    // 暂时使用模拟数据
    setJournals([
      {
        id: 0,
        name: 'Blockchain Research Journal',
        description: 'A journal dedicated to blockchain technology research',
        chiefEditor: address,
        submissionFee: '0.1',
        categories: ['Blockchain Technology', 'Computer Science'],
        status: 'Active'
      }
    ])
  }

  useEffect(() => {
    loadJournals()
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">期刊管理</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          创建新期刊
        </button>
      </div>

      {/* 创建期刊表单 */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">创建新期刊</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateJournal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期刊名称 *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入期刊名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISSN
                </label>
                <input
                  type="text"
                  value={createForm.issn}
                  onChange={(e) => setCreateForm({ ...createForm, issn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="XXXX-XXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期刊描述 *
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="描述期刊的研究领域和目标"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期刊网站
              </label>
              <input
                type="url"
                value={createForm.website}
                onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://journal-website.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学科分类
              </label>
              <div className="flex space-x-2 mb-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择学科分类</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {createForm.categories.map(category => (
                  <span
                    key={category}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  投稿费用 (INJ)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.submissionFee}
                  onChange={(e) => setCreateForm({ ...createForm, submissionFee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最低审稿人等级
                </label>
                <select
                  value={createForm.minReviewerTier}
                  onChange={(e) => setCreateForm({ ...createForm, minReviewerTier: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {reviewerTiers.map(tier => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所需审稿人数量
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={createForm.requiredReviewers}
                  onChange={(e) => setCreateForm({ ...createForm, requiredReviewers: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? '创建中...' : '创建期刊'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 期刊列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">我的期刊</h3>
        {journals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📚</div>
            <p>还没有创建任何期刊</p>
          </div>
        ) : (
          journals.map(journal => (
            <div key={journal.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{journal.name}</h4>
                  <p className="text-gray-600 mt-1">{journal.description}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                  {journal.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">主编:</span>
                  <div className="font-mono text-xs mt-1">
                    {journal.chiefEditor.slice(0, 8)}...{journal.chiefEditor.slice(-6)}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">投稿费用:</span>
                  <div className="mt-1">{journal.submissionFee} INJ</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">学科分类:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {journal.categories.map(cat => (
                      <span key={cat} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 添加编辑功能 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={selectedJournalId === journal.id ? editorAddress : ''}
                    onChange={(e) => {
                      setEditorAddress(e.target.value)
                      setSelectedJournalId(journal.id)
                    }}
                    placeholder="编辑地址"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddEditor}
                    disabled={loading || !editorAddress || selectedJournalId !== journal.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                  >
                    添加编辑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}