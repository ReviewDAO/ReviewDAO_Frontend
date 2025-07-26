// 测试数据查看器 - 用于验证EVM测试数据迁移
import { useState, useEffect } from 'react'
import { getMigratedTestData } from '../utils/testDataMigration'
import type { FrontendSubmission, FrontendJournal, FrontendReviewer } from '../utils/testDataMigration'

export function TestDataViewer() {
  const [data, setData] = useState<{
    submissions: FrontendSubmission[]
    journals: FrontendJournal[]
    reviewers: FrontendReviewer[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const realData = await getMigratedTestData()
        setData(realData)
        setError(null)
      } catch (err) {
        console.error('加载数据失败:', err)
        setError('加载数据失败: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在从合约加载数据...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>无数据</div>
  }

  const { submissions, journals, reviewers } = data

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EVM测试数据迁移验证</h1>
        <p className="text-gray-600">验证从EVM链端测试数据到前端的迁移结果</p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 pb-2">
            <div className="text-sm font-medium text-gray-600">投稿数量</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 pb-2">
            <div className="text-sm font-medium text-gray-600">期刊数量</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{journals.length}</div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 pb-2">
            <div className="text-sm font-medium text-gray-600">审稿人数量</div>
          </div>
          <div className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-600">{reviewers.length}</div>
          </div>
        </div>
      </div>

      {/* 投稿数据 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">投稿数据</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{submission.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    submission.status === 'under_review' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.status === 'under_review' ? '审稿中' : submission.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div><strong>作者:</strong> {submission.authors.join(', ')}</div>
                  <div><strong>期刊:</strong> {submission.journalName}</div>
                  <div><strong>投稿日期:</strong> {new Date(submission.submissionDate).toLocaleDateString()}</div>
                  <div><strong>论文ID:</strong> {submission.paperId}</div>
                </div>
                
                <div className="mb-3">
                  <strong className="text-sm text-gray-700">关键词:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {submission.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <strong className="text-sm text-gray-700">摘要:</strong>
                  <p className="text-sm text-gray-600 mt-1">{submission.abstract}</p>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>IPFS哈希:</strong> <code className="bg-gray-100 px-1 rounded">{submission.ipfsHash}</code></div>
                  <div><strong>元数据URI:</strong> <code className="bg-gray-100 px-1 rounded">{submission.metadataURI}</code></div>
                  {submission.paperMetadata?.doi && (
                    <div><strong>DOI:</strong> {submission.paperMetadata.doi}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 期刊数据 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">期刊数据</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {journals.map((journal) => (
              <div key={journal.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{journal.name}</h3>
                <p className="text-gray-600 mb-3">{journal.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div><strong>主编:</strong> <code className="text-xs">{journal.chiefEditor}</code></div>
                  <div><strong>投稿费用:</strong> {journal.submissionFee} ETH</div>
                  <div><strong>等级:</strong> {journal.tier}</div>
                  <div><strong>所需审稿人:</strong> {journal.requiredReviewers}</div>
                </div>
                
                <div>
                  <strong className="text-sm text-gray-700">分类:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {journal.categories.map((category, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 审稿人数据 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">审稿人数据</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {reviewers.map((reviewer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{reviewer.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                    等级 {reviewer.tier}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div><strong>机构:</strong> {reviewer.affiliation}</div>
                  <div><strong>声誉值:</strong> {reviewer.reputation}</div>
                  <div><strong>完成评审:</strong> {reviewer.completedReviews}</div>
                  <div><strong>地址:</strong> <code className="text-xs">{reviewer.address}</code></div>
                </div>
                
                <div>
                  <strong className="text-sm text-gray-700">专业领域:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reviewer.expertise.map((field, fieldIndex) => (
                      <span key={fieldIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数据源信息 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">数据源信息</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">EVM测试数据来源</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>脚本文件:</strong> <code>ReviewDAO_EVM/script/write-test-data.js</code></li>
              <li>• <strong>合约地址:</strong> 包含PaperNFT、ReviewProcess、ReviewerDAO等合约</li>
              <li>• <strong>测试账户:</strong> 使用Hardhat本地测试网络账户</li>
              <li>• <strong>IPFS数据:</strong> 模拟的IPFS哈希和元数据URI</li>
            </ul>
            
            <h4 className="font-medium mt-4 mb-2">迁移转换</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 将链端数据结构转换为前端组件所需格式</li>
              <li>• 添加了模拟的IPFS元数据内容</li>
              <li>• 生成了随机的声誉值和评审统计数据</li>
              <li>• 保持了原始的合约地址和IPFS哈希</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestDataViewer