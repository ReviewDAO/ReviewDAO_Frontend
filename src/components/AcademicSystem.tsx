import React, { useState } from 'react'
import { walletStrategy } from '../services/Wallet'
import { JournalManager } from './JournalManager'
import { PaperSubmission } from './PaperSubmission'
import { ReviewerDashboard } from './ReviewerDashboard'
import { ReviewProcess } from './ReviewProcess'
import { RewardManager } from './RewardManager'
import { DAOGovernance } from './DAOGovernance'
import { AdminPanel } from './AdminPanel'
import { DataQuery } from './DataQuery'

type TabType = 'journals' | 'papers' | 'reviewer' | 'reviews' | 'rewards' | 'governance' | 'admin' | 'data'

interface UserProfile {
  address: string
  isReviewer: boolean
  isEditor: boolean
  journals: number[]
}

export function AcademicSystem() {
  const [address, setAddress] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabType>('journals')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string>('')

  const connectWallet = async () => {
    try {
      setLoading(true)
      const addresses = await walletStrategy.getAddresses()
      if (addresses.length > 0) {
        setAddress(addresses[0])
        await loadUserProfile(addresses[0])
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userAddress: string) => {
    try {
      // 这里可以查询用户的角色和权限
      // 暂时使用默认值
      setUserProfile({
        address: userAddress,
        isReviewer: false,
        isEditor: false,
        journals: []
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleTransactionSuccess = (txHash: string) => {
    setLastTxHash(txHash)
    // 可以在这里添加成功提示
  }

  const tabs = [
    { id: 'journals' as TabType, label: '期刊管理', icon: '📚' },
    { id: 'papers' as TabType, label: '论文投稿', icon: '📄' },
    { id: 'reviewer' as TabType, label: '审稿人', icon: '👨‍🎓' },
    { id: 'reviews' as TabType, label: '审稿流程', icon: '✅' },
    { id: 'rewards' as TabType, label: '奖励管理', icon: '🎁' },
    { id: 'governance' as TabType, label: 'DAO治理', icon: '🏛️' },
    { id: 'admin' as TabType, label: '管理员面板', icon: '⚙️' },
    { id: 'data' as TabType, label: '数据查询', icon: '📊' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🎓</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">学术评价系统</h1>
                <p className="text-sm text-gray-600">基于Injective区块链的去中心化学术发表平台</p>
              </div>
            </div>
            
            {!address ? (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? '连接中...' : '连接钱包'}
              </button>
            ) : (
              <div className="text-right">
                <div className="text-sm text-gray-600">钱包地址</div>
                <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {address ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'journals' && (
              <JournalManager
                address={address}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'papers' && (
              <PaperSubmission
                address={address}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'reviewer' && (
              <ReviewerDashboard
                address={address}
                userProfile={userProfile}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'reviews' && (
              <ReviewProcess
                address={address}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'rewards' && (
              <RewardManager
                address={address}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'governance' && (
              <DAOGovernance
                address={address}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'admin' && (
              <AdminPanel
                address={address}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            
            {activeTab === 'data' && (
              <DataQuery
                address={address}
              />
            )}
          </div>

          {/* Transaction Status */}
          {lastTxHash && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="text-green-600">✅</div>
                <div>
                  <div className="text-sm font-medium text-green-800">交易成功</div>
                  <div className="text-xs text-green-600">
                    交易哈希: 
                    <a 
                      href={`https://testnet.explorer.injective.network/transaction/${lastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-green-800 ml-1"
                    >
                      {lastTxHash.slice(0, 16)}...{lastTxHash.slice(-8)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">欢迎使用学术评价系统</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              这是一个基于Injective区块链的去中心化学术发表平台，支持期刊管理、论文投稿、同行评议等完整的学术发表流程。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {tabs.map((tab) => (
                <div key={tab.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-3xl mb-3">{tab.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tab.label}</h3>
                  <p className="text-sm text-gray-600">
                    {tab.id === 'journals' && '创建和管理学术期刊'}
                    {tab.id === 'papers' && '提交和管理论文投稿'}
                    {tab.id === 'reviewer' && '注册成为审稿人'}
                    {tab.id === 'reviews' && '参与同行评议流程'}
                    {tab.id === 'rewards' && '管理奖励和激励机制'}
                    {tab.id === 'governance' && 'DAO治理和投票'}
                    {tab.id === 'admin' && '系统管理和配置'}
                    {tab.id === 'data' && '查询和分析数据'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}