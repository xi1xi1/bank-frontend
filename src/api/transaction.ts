import api from '../utils/request';

export interface Transaction {
  trans_id: number;
  card_id: string;
  trans_type: string;
  amount: number;
  balance_after: number;
  time: string;
  remark: string;
  operator_id: string;
}

export interface DepositRequest {
  user_id: string;
  card_id: string;
  amount: number;
  card_password: string;
  remark?: string;
}

export interface WithdrawRequest {
  user_id: string;
  card_id: string;
  amount: number;
  card_password: string;
  remark?: string;
}

export interface TransactionQueryParams {
  user_id: string;
  card_id?: string;
  type?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
}

export const transactionApi = {
  // 活期存款
  deposit: (data: DepositRequest) =>
    api.post<Transaction>('/transactions/deposit', data),
  
  // 活期取款
  withdraw: (data: WithdrawRequest) =>
    api.post<Transaction>('/transactions/withdraw', data),
  
  // 查询交易记录
  getTransactions: (params: TransactionQueryParams) =>
    api.get<{
      transactions: Transaction[];
      pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
      };
    }>('/transactions', { params }),
  
  // 创建定期存款
  createFixedDeposit: (data: {
    user_id: string;
    card_id: string;
    principal: number;
    term: number;
    card_password: string;
    auto_renew: boolean;
  }) =>
    api.post('/fixed-deposits/create', data),
  
  // 查询定期存单
  getFixedDeposits: (params: {
    user_id: string;
    card_id?: string;
    status?: number;
    page?: number;
    page_size?: number;
  }) =>
    api.get('/fixed-deposits', { params }),
};