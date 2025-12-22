// src/api/user.ts - 驼峰式版本
import api from '../utils/request';

export interface UserInfo {
  userId: string;           // ✅ 驼峰式
  username: string;
  phone: string;
  name: string;
  idNumber: string;         // ✅ 驼峰式
  role: number;
  accountStatus: number;    // ✅ 驼峰式
  createdTime: string;      // ✅ 驼峰式
}

export interface UpdateUserRequest {
  phone?: string;
  name?: string;
}

export interface UserStatistics {
  userId: string;           // ✅ 驼峰式
  totalBalance: number;     // ✅ 驼峰式
  availableBalance: number; // ✅ 驼峰式
  frozenAmount: number;     // ✅ 驼峰式
  fixedDepositAmount: number; // ✅ 驼峰式
  cardCount: number;        // ✅ 驼峰式
  activeCardCount: number;  // ✅ 驼峰式
  thisMonth: {              // ✅ 驼峰式
    depositCount: number;   // ✅ 驼峰式
    depositAmount: number;  // ✅ 驼峰式
    withdrawCount: number;  // ✅ 驼峰式
    withdrawAmount: number; // ✅ 驼峰式
    interestEarned: number; // ✅ 驼峰式
  };
}

export interface TransactionRecord {
  id: string;
  userId: string;           // ✅ 驼峰式
  date: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'payment' | 'interest';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  description: string;
  balanceAfter: number;     // ✅ 驼峰式
  counterparty?: string;
  createdTime: string;      // ✅ 驼峰式
}

export interface TransactionResponse {
  transactions: TransactionRecord[];
  pagination: {
    page: number;
    pageSize: number;       // ✅ 驼峰式
    total: number;
    totalPages: number;     // ✅ 驼峰式
  };
}

export const userApi = {
  // 查询用户信息
  getUserInfo: (userId: string) => 
    api.get<UserInfo>(`/user/${userId}`),
  
  // 更新用户信息
  updateUserInfo: (userId: string, data: UpdateUserRequest) =>
    api.put(`/user/${userId}`, data),
  
  // 获取用户统计信息
  getUserStatistics: (userId: string) =>
    api.get<UserStatistics>(`/user/${userId}/statistics`),
  
  // 管理员查询所有用户
  getAllUsers: (params?: {
    search?: string;
    role?: number;
    accountStatus?: number; // ✅ 驼峰式
    page?: number;
    pageSize?: number;      // ✅ 驼峰式
  }) => 
    api.get<{
      users: Array<UserInfo & {
        cardCount: number;        // ✅ 驼峰式
        totalBalance: number;     // ✅ 驼峰式
        lastLoginTime: string;    // ✅ 驼峰式
      }>;
      pagination: {
        page: number;
        pageSize: number;         // ✅ 驼峰式
        total: number;
        totalPages: number;       // ✅ 驼峰式
      };
    }>('/admin/users', { params }),
  
  // 获取用户交易记录
  getTransactionHistory: (params?: {
    type?: string;
    startDate?: string;     // ✅ 驼峰式
    endDate?: string;       // ✅ 驼峰式
    page?: number;
    pageSize?: number;      // ✅ 驼峰式
  }) => {
    return api.get<TransactionResponse>('/transactions', { params });
  },
  
  // 获取最近交易记录
  getRecentTransactions: (limit: number = 5) => {
    return api.get<TransactionRecord[]>(`/user/recent-transactions?limit=${limit}`);
  },
  
  // 获取交易详情
  getTransactionDetail: (transactionId: string) => {
    return api.get<TransactionRecord>(`/user/transactions/${transactionId}`);
  },
  
  // 导出交易记录
  exportTransactions: (params?: {
    type?: string;
    startDate?: string;     // ✅ 驼峰式
    endDate?: string;       // ✅ 驼峰式
    format?: 'excel' | 'csv' | 'pdf';
  }) => {
    return api.post('/user/transactions/export', params);
  },
  
  // 修改密码
  changePassword: (data: {
    oldPassword: string;    // ✅ 驼峰式
    newPassword: string;    // ✅ 驼峰式
    confirmPassword: string;// ✅ 驼峰式
  }) => {
    return api.put('/user/change-password', data);
  },
  
  // 绑定银行卡
  bindCard: (data: {
    cardId: string;         // ✅ 驼峰式
    cardPassword: string;   // ✅ 驼峰式
    name: string;
    idNumber: string;       // ✅ 驼峰式
  }) => {
    return api.post('/user/cards/bind', data);
  },
  
  // 获取用户银行卡列表
  getUserCards: () => {
    return api.get<Array<{
      cardId: string;           // ✅ 驼峰式
      balance: number;
      availableBalance: number; // ✅ 驼峰式
      status: number;
      statusText: string;       // ✅ 驼峰式
      bindTime: string;         // ✅ 驼峰式
    }>>('/user/cards');
  },
  
  // 解绑银行卡
  unbindCard: (cardId: string, data: {
    cardPassword: string;   // ✅ 驼峰式
    reason?: string;
  }) => {
    return api.post(`/user/cards/${cardId}/unbind`, data);
  },
  
  // 存款
  deposit: (data: {
    cardId: string;         // ✅ 驼峰式
    amount: number;
    cardPassword: string;   // ✅ 驼峰式
    remark?: string;
  }) => {
    return api.post('/transactions/deposit', data);
  },
  
  // 取款
  withdraw: (data: {
    cardId: string;         // ✅ 驼峰式
    amount: number;
    cardPassword: string;   // ✅ 驼峰式
    remark?: string;
  }) => {
    return api.post('/transactions/withdraw', data);
  },
  
  // 创建定期存款
  createFixedDeposit: (data: {
    cardId: string;         // ✅ 驼峰式
    principal: number;
    term: number;
    cardPassword: string;   // ✅ 驼峰式
    autoRenew: boolean;     // ✅ 驼峰式
  }) => {
    return api.post('/fixed-deposits/create', data);
  },
  
  // 获取定期存款列表
  getFixedDeposits: (params?: {
    status?: number;
    page?: number;
    pageSize?: number;      // ✅ 驼峰式
  }) => {
    return api.get('/fixed-deposits', { params });
  },
  
  // 提前支取定期存款
  earlyWithdrawFixedDeposit: (depositId: string, data: {
    cardPassword: string;   // ✅ 驼峰式
    reason?: string;
  }) => {
    return api.post(`/fixed-deposits/${depositId}/early-withdraw`, data);
  }
};