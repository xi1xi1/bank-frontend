// src/api/transaction.ts
import request from '../utils/request';

export interface Transaction {
  transId: number;
  transNo: string;
  cardId: string;
  userId: string;
  transType: string;
  transSubtype?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  fee: number;
  currency: string;
  status: string;
  remark?: string;
  operatorId: string;
  operatorType: string;
  transTime: string;
  completedTime?: string;
}

export interface DepositRequest {
  userId: string;
  cardId: string;
  amount: number;
  cardPassword: string;
  remark?: string;
}

export interface WithdrawRequest {
  userId: string;
  cardId: string;
  amount: number;
  cardPassword: string;
  remark?: string;
}

export interface TransactionQueryParams {
  userId: string;
  cardId?: string;
  transType?: string;  // 注意：后端使用的是transType
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sort?: 'asc' | 'desc';
}

export interface FixedDepositRequest {
  userId: string;
  cardId: string;
  principal: number;
  term: number;
  cardPassword: string;
  autoRenew: boolean;
}

export interface FixedDepositQueryParams {
  userId: string;
  cardId?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const transactionApi = {
  // 活期存款
  deposit: (data: DepositRequest) =>
    request.post<Transaction>('/transactions/deposit', data),
  
  // 活期取款
  withdraw: (data: WithdrawRequest) =>
    request.post<Transaction>('/transactions/withdraw', data),
  
  // 查询交易记录 - 根据后端接口调整为正确的路径
  getTransactions: (params: TransactionQueryParams) => {
    // 根据后端代码，交易查询接口是 /transactions
    // 参数映射：type -> transType
    const queryParams = {
      ...params,
      transType: params.transType === 'all' ? 'ALL' : params.transType,
    };
    
    return request.get<TransactionResponse>('/transactions', { params: queryParams });
  },
  
  // 查询交易记录（简化版，用于列表显示）
  getUserTransactions: (userId: string, page: number = 1, pageSize: number = 10) => {
    return request.get<TransactionResponse>('/transactions', {
      params: {
        userId,
        page,
        pageSize,
      }
    });
  },
  
  // 创建定期存款
  createFixedDeposit: (data: FixedDepositRequest) =>
    request.post('/fixed-deposits/create', data),
  
  // 查询定期存单
  getFixedDeposits: (params: FixedDepositQueryParams) =>
    request.get('/fixed-deposits', { params }),
  
  // 获取交易详情
  getTransactionDetail: (transNo: string) =>
    request.get<Transaction>(`/transactions/${transNo}`),
};