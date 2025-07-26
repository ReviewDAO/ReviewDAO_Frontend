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
  endpoints: [
    'https://solemn-neat-meadow.injective-testnet.quiknode.pro/4a1ce2523092ceec9ddebe3812387be68c53ab9e/',
    'https://k8s.testnet.json-rpc.injective.network/',
    'https://testnet.sentry.json-rpc.injective.network/'
  ],
  endpoint: 'https://solemn-neat-meadow.injective-testnet.quiknode.pro/4a1ce2523092ceec9ddebe3812387be68c53ab9e/',
  chainId: '1439',
  apiKey: 'QN_672a648618ca4bcdb3da46be0e7eb8fe',
  network: 'injective-testnet'
}

// IPFS配置
export const IPFS_CONFIG = {
  // Pinata JWT API密钥已配置
  apiKey: import.meta.env.VITE_PINATA_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4YzJlYzY1NC1mMWEyLTQ0YTktYmU2Yi00MGU1NDlkNzJmYTgiLCJlbWFpbCI6ImNob3JkMjQ0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4NTI0MDExMDYzNTEzNWQzNTFjNSIsInNjb3BlZEtleVNlY3JldCI6IjRkN2ViNDE2N2Q0YmVkZTRhODMxMWY4NzI2NmYxNmEzOTlkNzIyZmMwODA3NjRmNjc5MTkwZTRlNzBhZWIwNWEiLCJleHAiOjE3ODUwNDQzNTF9.NS6nsuZgSukTbUShT7UU7NaxejcvZJyJIlMRFQfEI2w',
  gateway: 'https://teal-abstract-gazelle-306.mypinata.cloud/ipfs/'
}

// 合约ABI简化版本 - 主要方法
export const CONTRACT_ABIS = {
  JournalManager: [
    'function createJournal(string name, string description, string metadataURI, address owner, uint256 submissionFee, string[] categories, uint8 minReviewerTier, uint256 requiredReviewers) external',
    'function getJournalInfo(uint256 id) external view returns (tuple(uint256 id, string name, string description, string metadataURI, address owner, uint256 submissionFee, uint256 createdTime, uint8 status, string[] categories, uint256 totalSubmissions, uint256 totalPublished, uint8 minReviewerTier, uint256 requiredReviewers))',
    'function getJournalCount() external view returns (uint256)',
    'function getJournalEditors(uint256 journalId) external view returns (address[] memory)',
    'function addEditor(uint256 journalId, address editor) external',
    'function removeEditor(uint256 journalId, address editor) external',
    'function updateSubmissionFee(uint256 journalId, uint256 newFee) external',
    'function updateJournalStatus(uint256 journalId, uint8 status) external',
    'function hasRole(bytes32 role, address account) external view returns (bool)',
    'function ADMIN_ROLE() external view returns (bytes32)',
    'function EDITOR_ROLE() external view returns (bytes32)'
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
    'function createPaperItem(string ipfsHash, string doi, string metadataURI) external',
    'function mint(address to, string tokenURI) external returns (uint256)',
    'function tokenURI(uint256 tokenId) external view returns (string)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function tokenByIndex(uint256 index) external view returns (uint256)',
    'function citePaper(uint256 paperId) external payable',
    'function paperDOIs(uint256 tokenId) external view returns (string)',
    'function citations(uint256 paperId, uint256 index) external view returns (tuple(address citer, uint256 amount, uint256 timestamp))'
   ],
   ReviewProcess: [
    'function createSubmission(uint256 paperId, uint256 journalId, string metadataURI) external',
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
    None: 0,
    Junior: 1,
    Senior: 2,
    Expert: 3
  },
  SubmissionStatus: {
    Submitted: 0,
    UnderReview: 1,
    Accepted: 2,
    Rejected: 3,
    Published: 4
  }
}