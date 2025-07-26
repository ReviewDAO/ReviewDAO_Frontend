import React, { useState, useEffect } from 'react'
import { createContractService } from '../services/ContractService'
import { ipfsService } from '../services/IPFSService'

interface PaperSubmissionProps {
  address: string
  onTransactionSuccess: (txHash: string) => void
}

interface Paper {
  id: number
  title: string
  doi: string
  authors: string[]
  abstract: string
  status: string
  createdAt: string
}

interface CreatePaperForm {
  title: string
  abstract: string
  authors: string[]
  keywords: string[]
  category: string
  doi: string
  file: File | null
}

interface SubmissionForm {
  paperId: number
  journalId: number
  coverLetter: string
  suggestedReviewers: string[]
  conflictOfInterest: string
}

export function PaperSubmission({ address, onTransactionSuccess }: PaperSubmissionProps) {
  const [papers, setPapers] = useState<Paper[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreatePaperForm>({
    title: '',
    abstract: '',
    authors: [],
    keywords: [],
    category: '',
    doi: '',
    file: null
  })
  const [submissionForm, setSubmissionForm] = useState<SubmissionForm>({
    paperId: 0,
    journalId: 0,
    coverLetter: '',
    suggestedReviewers: [],
    conflictOfInterest: ''
  })
  const [newAuthor, setNewAuthor] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newReviewer, setNewReviewer] = useState('')

  const contractService = createContractService(address)

  const categories = [
    'Computer Science',
    'Artificial Intelligence',
    'Blockchain Technology',
    'Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Software Engineering',
    'Distributed Systems'
  ]

  const mockJournals = [
    { id: 0, name: 'Blockchain Research Journal' },
    { id: 1, name: 'AI & Machine Learning Review' },
    { id: 2, name: 'Computer Science Quarterly' }
  ]

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.title || !createForm.abstract || createForm.authors.length === 0) {
      alert('请填写论文标题、摘要和作者信息')
      return
    }

    try {
      setLoading(true)

      let fileHash = ''
      if (createForm.file) {
        // 上传论文文件到IPFS
        fileHash = await ipfsService.uploadFile(createForm.file)
      }

      // 创建论文元数据
      const metadataHash = await ipfsService.createPaperMetadata({
        title: createForm.title,
        abstract: createForm.abstract,
        authors: createForm.authors,
        keywords: createForm.keywords,
        category: createForm.category,
        fileHash
      })

      const metadataURI = `ipfs://${metadataHash}`
      const doi = createForm.doi || `10.1234/${Date.now()}`

      // 调用合约创建论文NFT
      const response = await contractService.createPaper({
        ipfsHash: fileHash || metadataHash,
        doi,
        metadataURI
      })

      onTransactionSuccess(response.txHash)
      setShowCreateForm(false)
      resetCreateForm()

      // 刷新论文列表
      await loadPapers()
    } catch (error) {
      console.error('Error creating paper:', error)
      alert('创建论文失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPaper = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submissionForm.paperId || !submissionForm.journalId) {
      alert('请选择论文和期刊')
      return
    }

    try {
      setLoading(true)

      // 创建投稿元数据
      const metadataHash = await ipfsService.createSubmissionMetadata({
        coverLetter: submissionForm.coverLetter,
        suggestedReviewers: submissionForm.suggestedReviewers,
        conflictOfInterest: submissionForm.conflictOfInterest
      })

      const metadataURI = `ipfs://${metadataHash}`

      // 调用合约投稿
      const response = await contractService.submitPaper({
        paperId: submissionForm.paperId,
        journalId: submissionForm.journalId,
        metadataURI
      })

      onTransactionSuccess(response.txHash)
      setShowSubmissionForm(false)
      setSubmissionForm({
        paperId: 0,
        journalId: 0,
        coverLetter: '',
        suggestedReviewers: [],
        conflictOfInterest: ''
      })
    } catch (error) {
      console.error('Error submitting paper:', error)
      alert('投稿失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      title: '',
      abstract: '',
      authors: [],
      keywords: [],
      category: '',
      doi: '',
      file: null
    })
  }

  const handleAddAuthor = () => {
    if (newAuthor && !createForm.authors.includes(newAuthor)) {
      setCreateForm({
        ...createForm,
        authors: [...createForm.authors, newAuthor]
      })
      setNewAuthor('')
    }
  }

  const handleRemoveAuthor = (author: string) => {
    setCreateForm({
      ...createForm,
      authors: createForm.authors.filter(a => a !== author)
    })
  }

  const handleAddKeyword = () => {
    if (newKeyword && !createForm.keywords.includes(newKeyword)) {
      setCreateForm({
        ...createForm,
        keywords: [...createForm.keywords, newKeyword]
      })
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setCreateForm({
      ...createForm,
      keywords: createForm.keywords.filter(k => k !== keyword)
    })
  }

  const handleAddSuggestedReviewer = () => {
    if (newReviewer && !submissionForm.suggestedReviewers.includes(newReviewer)) {
      setSubmissionForm({
        ...submissionForm,
        suggestedReviewers: [...submissionForm.suggestedReviewers, newReviewer]
      })
      setNewReviewer('')
    }
  }

  const handleRemoveSuggestedReviewer = (reviewer: string) => {
    setSubmissionForm({
      ...submissionForm,
      suggestedReviewers: submissionForm.suggestedReviewers.filter(r => r !== reviewer)
    })
  }

  const loadPapers = async () => {
    // 这里应该从合约查询用户的论文列表
    // 暂时使用模拟数据
    setPapers([
      {
        id: 0,
        title: 'Blockchain-based Academic Publishing System',
        doi: '10.1234/blockchain.2023.001',
        authors: ['Alice Smith', 'Bob Johnson'],
        abstract: 'This paper presents a novel blockchain-based system for academic publishing...',
        status: 'Created',
        createdAt: new Date().toISOString()
      }
    ])
  }

  useEffect(() => {
    loadPapers()
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">论文管理</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            创建论文
          </button>
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            投稿论文
          </button>
        </div>
      </div>

      {/* 创建论文表单 */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">创建新论文</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreatePaper} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                论文标题 *
              </label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入论文标题"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                摘要 *
              </label>
              <textarea
                value={createForm.abstract}
                onChange={(e) => setCreateForm({ ...createForm, abstract: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入论文摘要"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学科分类
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择学科分类</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DOI (可选)
                </label>
                <input
                  type="text"
                  value={createForm.doi}
                  onChange={(e) => setCreateForm({ ...createForm, doi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.1234/example.2023.001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                作者 *
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="作者姓名"
                />
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {createForm.authors.map(author => (
                  <span
                    key={author}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <span>{author}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(author)}
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
                关键词
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="关键词"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {createForm.keywords.map(keyword => (
                  <span
                    key={keyword}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                论文文件 (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCreateForm({ ...createForm, file: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                {loading ? '创建中...' : '创建论文'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 投稿表单 */}
      {showSubmissionForm && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">投稿论文</h3>
            <button
              onClick={() => setShowSubmissionForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitPaper} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择论文 *
                </label>
                <select
                  value={submissionForm.paperId}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, paperId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>选择论文</option>
                  {papers.map(paper => (
                    <option key={paper.id} value={paper.id}>{paper.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择期刊 *
                </label>
                <select
                  value={submissionForm.journalId}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, journalId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>选择期刊</option>
                  {mockJournals.map(journal => (
                    <option key={journal.id} value={journal.id}>{journal.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                投稿信
              </label>
              <textarea
                value={submissionForm.coverLetter}
                onChange={(e) => setSubmissionForm({ ...submissionForm, coverLetter: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="向编辑介绍您的论文..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建议审稿人
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newReviewer}
                  onChange={(e) => setNewReviewer(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="审稿人姓名或邮箱"
                />
                <button
                  type="button"
                  onClick={handleAddSuggestedReviewer}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {submissionForm.suggestedReviewers.map(reviewer => (
                  <span
                    key={reviewer}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                  >
                    <span>{reviewer}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSuggestedReviewer(reviewer)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                利益冲突声明
              </label>
              <textarea
                value={submissionForm.conflictOfInterest}
                onChange={(e) => setSubmissionForm({ ...submissionForm, conflictOfInterest: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="声明任何潜在的利益冲突..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmissionForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? '投稿中...' : '提交投稿'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 论文列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">我的论文</h3>
        {papers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>还没有创建任何论文</p>
          </div>
        ) : (
          papers.map(paper => (
            <div key={paper.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{paper.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{paper.abstract}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>DOI: {paper.doi}</span>
                    <span>创建时间: {new Date(paper.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                  {paper.status}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium text-gray-700">作者:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {paper.authors.map(author => (
                    <span key={author} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {author}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}