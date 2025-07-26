// 合约配置
export const CONTRACT_ADDRESSES = {
  JOURNAL_MANAGER: '0x662A4B81251D08eeE28E0E0834c806F7E591d2E1',
  REVIEWER_DAO: '0x1Af85C14Ed83F231268087eAf4D2b7Af9Cb86D7F',
  PAPER_NFT: '0x8f09212f1841D4Ee730C38ED183F3736c76F4DB5',
  REVIEW_PROCESS: '0x3B78412842A3F51903E9fdc623C29C724B87a3e3',
  RESEARCH_DATA_NFT: '0xEf5358dBa86e8809c4cbc2089FA3b8f5Cf5A3f7c'
}

// RPC配置
export const RPC_CONFIG = {
  endpoint: 'https://solemn-neat-meadow.injective-testnet.quiknode.pro/4a1ce2523092ceec9ddebe3812387be68c53ab9e',
  chainId: 'injective-888'
}

// IPFS配置
export const IPFS_CONFIG = {
  apiKey: 'daa5d6c28febf353121e',
  gateway: 'https://gateway.pinata.cloud/ipfs/'
}

// 合约ABI简化版本 - 主要方法
export const CONTRACT_ABIS = {
  JournalManager: [
    'function createJournal(string name, string description, string metadataURI, address owner, uint256 submissionFee, string[] categories, uint8 minReviewerTier, uint8 requiredReviewers) external',
    'function journals(uint256 id) external view returns (tuple(string name, string description, string metadataURI, address owner, uint256 submissionFee, uint8 status, uint256 createdAt, uint8 minReviewerTier, uint8 requiredReviewers))',
    'function getJournalCount() external view returns (uint256)',
    'function getJournalEditors(uint256 journalId) external view returns (address[] memory)',
    'function getJournalCategories(uint256 journalId) external view returns (string[] memory)',
    'function addEditor(uint256 journalId, address editor) external',
    'function removeEditor(uint256 journalId, address editor) external',
    'function updateSubmissionFee(uint256 journalId, uint256 newFee) external',
    'function updateJournalStatus(uint256 journalId, uint8 status) external'
  ],
  ReviewerDAO: [
    'function registerAsReviewer(string metadataURI) external',
    'function reviewers(address reviewer) external view returns (tuple(bool isActive, uint256 reputation, uint256 completedReviews, uint8 tier, uint256 joinedAt, string metadataURI))',
    'function getReviewerCount() external view returns (uint256)',
    'function getAllReviewers() external view returns (address[] memory)',
    'function updateReviewerReputation(address reviewer, int256 change) external',
    'function updateReviewerTier(address reviewer, uint8 newTier) external',
    'function distributeReward(address reviewer, uint256 reviewId, uint256 amount) external',
    'function reviewRewards(uint256 reviewId, address reviewer) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)'
  ],
  PaperNFT: [
    'function mint(address to, string tokenURI) external returns (uint256)',
    'function tokenURI(uint256 tokenId) external view returns (string)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function tokenByIndex(uint256 index) external view returns (uint256)'
  ],
  ReviewProcess: [
    'function submitPaper(uint256 journalId, string ipfsHash) external payable',
    'function assignReviewer(uint256 submissionId, address reviewer) external',
    'function submitReview(uint256 submissionId, uint8 decision, string commentsHash) external',
    'function submissions(uint256 id) external view returns (tuple(uint256 paperId, uint256 journalId, address author, uint8 status, uint256 createdAt, uint256 reviewDeadline))',
    'function getSubmissionCount() external view returns (uint256)',
    'function getReviewerAssignments(address reviewer) external view returns (uint256[] memory)',
    'function getSubmissionReviews(uint256 submissionId) external view returns (tuple(address reviewer, uint8 decision, string commentsHash, uint256 submittedAt)[] memory)'
  ]
}

// 枚举定义
export const ENUMS = {
  ReviewDecision: {
    Pending: 0,
    Accept: 1,
    MinorRevision: 2,
    MajorRevision: 3,
    Reject: 4
  },
  ReviewerTier: {
    Junior: 0,
    Senior: 1,
    Expert: 2
  },
  SubmissionStatus: {
    Submitted: 0,
    UnderReview: 1,
    Accepted: 2,
    Rejected: 3,
    Published: 4
  }
}