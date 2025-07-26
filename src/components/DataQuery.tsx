import { useState, useEffect } from 'react'

interface DataQueryProps {
  address: string
}

interface Paper {
  id: number
  title: string
  authors: string[]
  abstract: string
  journalId: number
  journalName: string
  submissionDate: string
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'published'
  reviewCount: number
  averageScore: number
  ipfsHash: string
}

interface Review {
  id: number
  paperId: number
  paperTitle: string
  reviewerAddress: string
  reviewerName: string
  score: number
  comments: string
  submissionDate: string
  reward: number
}

interface Journal {
  id: number
  name: string
  description: string
  editor: string
  createdDate: string
  totalSubmissions: number
  totalPublished: number
  isActive: boolean
}

interface Reviewer {
  address: string
  name: string
  tier: number
  reputation: number
  completedReviews: number
  totalRewards: number
  joinedDate: string
  specialties: string[]
  isActive: boolean
}

export function DataQuery({ address }: DataQueryProps) {
  const [activeTab, setActiveTab] = useState<'papers' | 'reviews' | 'journals' | 'reviewers'>('papers')
  const [papers, setPapers] = useState<Paper[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // const contractService = createContractService()

  const statusLabels = {
    pending: '待分配',
    under_review: '审稿中',
    accepted: '已接受',
    rejected: '已拒绝',
    published: '已发表'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    published: 'bg-purple-100 text-purple-800'
  }

  const tierLabels = {
    1: '初级审稿人',
    2: '高级审稿人',
    3: '专家审稿人'
  }

  const loadPapers = async () => {
    try {
      setLoading(true)
      // 这里应该从合约查询论文数据
      // 暂时使用模拟数据
      const mockPapers: Paper[] = [
        {
          id: 1,
          title: 'Blockchain-based Academic Publishing: A Decentralized Approach',
          authors: ['Alice Smith', 'Bob Johnson'],
          abstract: 'This paper presents a novel approach to academic publishing using blockchain technology...',
          journalId: 1,
          journalName: 'Blockchain Research Journal',
          submissionDate: '2024-01-15',
          status: 'published',
          reviewCount: 3,
          averageScore: 8.5,
          ipfsHash: 'QmX1Y2Z3...'
        },
        {
          id: 2,
          title: 'Machine Learning Applications in Peer Review Systems',
          authors: ['Carol Wilson'],
          abstract: 'We explore the use of machine learning algorithms to improve the efficiency of peer review...',
          journalId: 2,
          journalName: 'AI & Machine Learning Review',
          submissionDate: '2024-01-20',
          status: 'under_review',
          reviewCount: 2,
          averageScore: 7.8,
          ipfsHash: 'QmA2B3C4...'
        },
        {
          id: 3,
          title: 'Decentralized Identity Management for Academic Institutions',
          authors: ['David Brown', 'Eve Davis'],
          abstract: 'This study proposes a decentralized identity management system for academic institutions...',
          journalId: 1,
          journalName: 'Blockchain Research Journal',
          submissionDate: '2024-01-25',
          status: 'accepted',
          reviewCount: 3,
          averageScore: 9.2,
          ipfsHash: 'QmD4E5F6...'
        },
        {
          id: 4,
          title: 'Smart Contracts for Research Data Management',
          authors: ['Frank Miller'],
          abstract: 'We present a framework for managing research data using smart contracts...',
          journalId: 3,
          journalName: 'Computer Science Quarterly',
          submissionDate: '2024-02-01',
          status: 'pending',
          reviewCount: 0,
          averageScore: 0,
          ipfsHash: 'QmG7H8I9...'
        },
        {
          id: 5,
          title: 'Tokenized Incentives in Academic Research',
          authors: ['Grace Lee', 'Henry Wang'],
          abstract: 'This paper examines the potential of tokenized incentives to motivate academic research...',
          journalId: 2,
          journalName: 'AI & Machine Learning Review',
          submissionDate: '2024-02-05',
          status: 'rejected',
          reviewCount: 2,
          averageScore: 4.5,
          ipfsHash: 'QmJ0K1L2...'
        }
      ]
      setPapers(mockPapers)
    } catch (error) {
      console.error('Error loading papers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      setLoading(true)
      // 这里应该从合约查询审稿数据
      // 暂时使用模拟数据
      const mockReviews: Review[] = [
        {
          id: 1,
          paperId: 1,
          paperTitle: 'Blockchain-based Academic Publishing: A Decentralized Approach',
          reviewerAddress: '0x1234...5678',
          reviewerName: 'Dr. Alice Smith',
          score: 9,
          comments: 'Excellent work with novel insights into blockchain applications in academic publishing.',
          submissionDate: '2024-01-20',
          reward: 50
        },
        {
          id: 2,
          paperId: 1,
          paperTitle: 'Blockchain-based Academic Publishing: A Decentralized Approach',
          reviewerAddress: '0x2345...6789',
          reviewerName: 'Prof. Bob Johnson',
          score: 8,
          comments: 'Well-written paper with good technical depth. Some minor improvements needed.',
          submissionDate: '2024-01-22',
          reward: 50
        },
        {
          id: 3,
          paperId: 2,
          paperTitle: 'Machine Learning Applications in Peer Review Systems',
          reviewerAddress: '0x3456...7890',
          reviewerName: 'Dr. Carol Wilson',
          score: 7,
          comments: 'Interesting approach but needs more experimental validation.',
          submissionDate: '2024-01-25',
          reward: 45
        },
        {
          id: 4,
          paperId: 3,
          paperTitle: 'Decentralized Identity Management for Academic Institutions',
          reviewerAddress: '0x1234...5678',
          reviewerName: 'Dr. Alice Smith',
          score: 9,
          comments: 'Outstanding contribution to the field with practical implications.',
          submissionDate: '2024-01-30',
          reward: 55
        },
        {
          id: 5,
          paperId: 5,
          paperTitle: 'Tokenized Incentives in Academic Research',
          reviewerAddress: '0x4567...8901',
          reviewerName: 'Dr. David Brown',
          score: 4,
          comments: 'The paper lacks sufficient theoretical foundation and empirical evidence.',
          submissionDate: '2024-02-08',
          reward: 30
        }
      ]
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadJournals = async () => {
    try {
      setLoading(true)
      // 这里应该从合约查询期刊数据
      // 暂时使用模拟数据
      const mockJournals: Journal[] = [
        {
          id: 1,
          name: 'Blockchain Research Journal',
          description: 'A premier journal focusing on blockchain technology and its applications',
          editor: '0xEditor1...ABC',
          createdDate: '2023-10-01',
          totalSubmissions: 156,
          totalPublished: 89,
          isActive: true
        },
        {
          id: 2,
          name: 'AI & Machine Learning Review',
          description: 'Cutting-edge research in artificial intelligence and machine learning',
          editor: '0xEditor2...DEF',
          createdDate: '2023-11-15',
          totalSubmissions: 203,
          totalPublished: 145,
          isActive: true
        },
        {
          id: 3,
          name: 'Computer Science Quarterly',
          description: 'Comprehensive coverage of computer science research and developments',
          editor: '0xEditor3...GHI',
          createdDate: '2023-09-20',
          totalSubmissions: 98,
          totalPublished: 42,
          isActive: true
        }
      ]
      setJournals(mockJournals)
    } catch (error) {
      console.error('Error loading journals:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviewers = async () => {
    try {
      setLoading(true)
      // 这里应该从合约查询审稿人数据
      // 暂时使用模拟数据
      const mockReviewers: Reviewer[] = [
        {
          address: '0x1234...5678',
          name: 'Dr. Alice Smith',
          tier: 2,
          reputation: 450,
          completedReviews: 25,
          totalRewards: 1250,
          joinedDate: '2023-12-01',
          specialties: ['Blockchain', 'Cryptography'],
          isActive: true
        },
        {
          address: '0x2345...6789',
          name: 'Prof. Bob Johnson',
          tier: 3,
          reputation: 680,
          completedReviews: 58,
          totalRewards: 3200,
          joinedDate: '2023-10-15',
          specialties: ['Machine Learning', 'AI'],
          isActive: true
        },
        {
          address: '0x3456...7890',
          name: 'Dr. Carol Wilson',
          tier: 1,
          reputation: 180,
          completedReviews: 8,
          totalRewards: 380,
          joinedDate: '2024-01-05',
          specialties: ['Data Science', 'Statistics'],
          isActive: true
        },
        {
          address: '0x4567...8901',
          name: 'Dr. David Brown',
          tier: 2,
          reputation: 320,
          completedReviews: 15,
          totalRewards: 750,
          joinedDate: '2023-11-20',
          specialties: ['Computer Networks', 'Security'],
          isActive: false
        }
      ]
      setReviewers(mockReviewers)
    } catch (error) {
      console.error('Error loading reviewers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || paper.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredReviews = reviews.filter(review => {
    return review.paperTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
           review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredJournals = journals.filter(journal => {
    return journal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           journal.description.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredReviewers = reviewers.filter(reviewer => {
    return reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           reviewer.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const sortData = <T extends Record<string, unknown>>(data: T[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let aValue: unknown = a[sortBy]
      let bValue: unknown = b[sortBy]
      
      if (sortBy === 'submissionDate' || sortBy === 'createdDate' || sortBy === 'joinedDate') {
        aValue = new Date(aValue as string | number | Date).getTime()
        bValue = new Date(bValue as string | number | Date).getTime()
      }
      
      const aVal = aValue as string | number
      const bVal = bValue as string | number
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  useEffect(() => {
    if (address) {
      loadPapers()
      loadReviews()
      loadJournals()
      loadReviewers()
    }
  }, [address])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">数据查询</h2>
        <div className="text-sm text-gray-600">
          系统数据查询和分析
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {activeTab === 'papers' && (
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有状态</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submissionDate">提交日期</option>
                <option value="title">标题</option>
                <option value="averageScore">平均分数</option>
                <option value="reviewCount">审稿数量</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('papers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'papers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            论文数据 ({filteredPapers.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            审稿数据 ({filteredReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            期刊数据 ({filteredJournals.length})
          </button>
          <button
            onClick={() => setActiveTab('reviewers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviewers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            审稿人数据 ({filteredReviewers.length})
          </button>
        </nav>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">加载中...</div>
        </div>
      )}

      {/* 论文数据 */}
      {activeTab === 'papers' && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    论文信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期刊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    审稿情况
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提交日期
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(sortData(filteredPapers, sortBy, sortOrder) as Paper[]).map((paper: Paper) => (
                  <tr key={paper.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {paper.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          作者: {paper.authors.join(', ')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          IPFS: {paper.ipfsHash}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paper.journalName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[paper.status as keyof typeof statusColors]
                      }`}>
                        {statusLabels[paper.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>审稿数: {paper.reviewCount}</div>
                        {paper.averageScore > 0 && (
                          <div>平均分: {paper.averageScore.toFixed(1)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paper.submissionDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 审稿数据 */}
      {activeTab === 'reviews' && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    论文标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    审稿人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    奖励
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提交日期
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {review.paperTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.reviewerName}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {review.reviewerAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900">{review.score}</span>
                        <span className="text-sm text-gray-500 ml-1">/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.reward} tokens
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.submissionDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 期刊数据 */}
      {activeTab === 'journals' && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期刊信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    编辑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    统计数据
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJournals.map((journal) => (
                  <tr key={journal.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {journal.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {journal.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {journal.editor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>投稿: {journal.totalSubmissions}</div>
                        <div>发表: {journal.totalPublished}</div>
                        <div>接受率: {Math.round((journal.totalPublished / journal.totalSubmissions) * 100)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {journal.createdDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        journal.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {journal.isActive ? '活跃' : '非活跃'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 审稿人数据 */}
      {activeTab === 'reviewers' && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    审稿人信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    等级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    声誉/审稿数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    专业领域
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总奖励
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviewers.map((reviewer) => (
                  <tr key={reviewer.address}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reviewer.name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {reviewer.address}
                        </div>
                        <div className="text-xs text-gray-400">
                          加入: {reviewer.joinedDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tierLabels[reviewer.tier as keyof typeof tierLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>声誉: {reviewer.reputation}</div>
                        <div>审稿: {reviewer.completedReviews}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {reviewer.specialties.map((specialty, index) => (
                          <span key={index} className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reviewer.totalRewards} tokens
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && (
        (activeTab === 'papers' && filteredPapers.length === 0) ||
        (activeTab === 'reviews' && filteredReviews.length === 0) ||
        (activeTab === 'journals' && filteredJournals.length === 0) ||
        (activeTab === 'reviewers' && filteredReviewers.length === 0)
      ) && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            {searchTerm ? '没有找到匹配的数据' : '暂无数据'}
          </div>
        </div>
      )}
    </div>
  )
}