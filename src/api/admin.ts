// src/api/admin.ts - 修复版
import api from '../utils/request';
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  frozenUsers: number;
  newUsersToday?: number;
  totalCards: number;
  activeCards: number;
  frozenCards: number;
  lostCards: number;
  totalTransactions: number;
  todayTransactions: number;
  pendingTransactions?: number;
  totalBalance: number;
  todayIncome: number;
  todayOutcome: number;
  fixedDepositTotal?: number;
  activeFixedDeposits?: number;
  maturedFixedDeposits?: number;
  systemStatus: string;
  securityLevel: string;
  recentUsers?: Array<{
    userId: string;
    username: string;
    name: string;
    phone: string;
    createdTime: string;
    accountStatus: number;
  }>;
  systemAlerts?: Array<{
    id: number;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    time: string;
    status: string;
  }>;
}
export interface AdminStats {
  total_users: number;
  active_users: number;
  frozen_users: number;
  total_cards: number;
  active_cards: number;
  frozen_cards: number;
  lost_cards: number;
  total_transactions: number;
  today_transactions: number;
  total_balance: number;
  today_income: number;
  today_outcome: number;
  system_status: string;
  security_level: string;
}

export interface AdminUser {
  user_id: string;
  username: string;
  phone: string;
  name: string;
  role: number;
  account_status: number;
  card_count: number;
  total_balance: number;
  created_time: string;
  last_login_time: string;
}

export interface SystemAlert {
  id: number;
  type: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  time: string;
  status: '未处理' | '已查看' | '已处理';
}

// 添加新的接口定义
export interface TransactionOverviewData {
  dailyStats: Array<{
    date: string;
    deposit_count: number;
    deposit_amount: number;
    withdraw_count: number;
    withdraw_amount: number;
    total_count: number;
  }>;
  typeStats: Array<{
    trans_type: string;
    count: number;
    total_amount: number;
  }>;
  totalStats: {
    totalTransactions: number;
    totalDeposit: number;
    totalWithdraw: number;
    netFlow: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
export interface TransactionOverviewResponse {
  code: number;
  message: string;
  data: TransactionOverviewData;
}
// 修改已有的TransactionOverview接口（如果已存在）
export interface TransactionOverview {
  date: string;
  deposit_count: number;
  deposit_amount: number;
  withdraw_count: number;
  withdraw_amount: number;
  total_count: number;
  total_amount: number;
}



// 移除泛型参数，使用正确的api调用方式
export const adminApi = {
  //查询所有银行卡
  getAllCards: (params?: {
  search?: string;      // 搜索卡号/用户名/姓名
  status?: string;      // 状态筛选
  page?: number;        // 页码
  page_size?: number;   // 每页数量
}) =>
  api.get<{
    cards: Array<{
      card_id: string;
      user_id: string;
      user_name: string;
      name?: string;     // 用户真实姓名
      balance: number;
      available_balance: number;
      frozen_amount?: number;
      status: number;
      status_text: string;
      card_type?: string;
      bind_time: string;
      last_transaction_time?: string;
      daily_limit?: number;
      monthly_limit?: number;
    }>;
    pagination: {
      page: number;
      page_size: number;
      total: number;
      total_pages: number;
    };
  }>('/admin/cards', { params }),

    /**
   * 管理员冻结/解冻银行卡
   * 注意：targetType必须是'card'才能操作银行卡
   */
  freezeCard: (data: {
    targetType: 'card';                  // 固定为'card'
    targetId: string;                    // 银行卡号
    operation: 'freeze' | 'unfreeze';    // 操作类型
    reasonType: string;                  // 原因类型
    reasonDetail: string;                // 详细原因
    freezeDuration?: number;             // 冻结天数，0=永久
  //  notifyUser?: boolean;                // 是否通知用户
  }) =>
    api.post('/security/admin/freeze', data),
  
  /**
   * 管理员挂失/解挂银行卡
   */
  lostReport: (data: {
    cardId: string;                      // 银行卡号
    operation: 'report' | 'cancel';      // 操作类型
    reasonType: string;                  // 原因类型
    reasonDetail: string;                // 详细原因
    //notifyUser?: boolean;                // 是否通知用户
  }) =>
    api.post('/security/admin/lost-report', data),
    // 管理员登录
  adminLogin: (data: { account: string; password: string }) =>
    api.post('/auth/admin/login', data),
  // 添加管理员
    addAdmin: (data: {
      phone: string;
      username: string;
      password: string;
      name: string;
      idNumber: string;
    }) =>
      api.post('/admin/users/admins', data),
  // 获取管理员仪表盘统计
  getDashboardStats: () => 
    api.get<DashboardStats>('/admin/dashboard/stats'),
  
  // 重置用户密码
  resetUserPassword: (data: {
    targetUserId: string;  // 改为 camelCase
    reason: string;
  }) =>
    api.post('/admin/users/reset-password', data),
  
  // 获取所有用户列表
  getAllUsers: (params?: {
    search?: string;
    role?: number;
    account_status?: number;
    page?: number;
    page_size?: number;
  }) =>
    api.get<{
      users: AdminUser[];
      pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
      };
    }>('/admin/users', { params }),
  
  // 获取系统告警
  getSystemAlerts: (params?: {
    type?: string;
    status?: string;
    start_time?: string;
    end_time?: string;
    page?: number;
    page_size?: number;
  }) =>
    api.get<{
      alerts: SystemAlert[];
      pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
      };
    }>('/admin/alerts', { params }),
// 方法1：直接返回 TransactionOverviewData（推荐）
getTransactionOverview: (params?: {
  date_range?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const backendParams: any = {};
  if (params?.date_range) {
    backendParams.dateRange = params.date_range;
  }
  if (params?.startDate) {
    backendParams.startDate = params.startDate;
  }
  if (params?.endDate) {
    backendParams.endDate = params.endDate;
  }
  
  // ✅ 直接返回 TransactionOverviewData 类型，不要用 TransactionOverviewResponse
  return api.get<TransactionOverviewData>('/admin/transactions/overview', { 
    params: backendParams 
  });
},
  
  // 获取交易记录列表（如果需要的话）
  getTransactionList: (params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    cardId?: string;
    transType?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get<any>('/admin/transactions', { params });
  },
  
  // 修改 freezeUser 方法
  freezeUser: (data: {
    targetType: string;      // 'account' 或 'card'
    targetId: string;        // 用户ID或卡号
    operation: 'freeze' | 'unfreeze'; // 操作类型
    reasonType: string;      // 原因类型
    reasonDetail: string;    // 详细原因
    freezeDuration?: number; // 冻结天数，0=永久
    notifyUser?: boolean;    // 是否通知用户
  }) =>
    api.post('/security/admin/freeze', data),  // 修改路径
  
  // 挂失/解挂银行卡
  reportCard: (data: {
    card_id: string;
    operation: 'report' | 'cancel';
    reason_type: string;
    reason_detail: string;
    notify_user: boolean;
  }) =>
    api.post('/admin/cards/report', data),
  
 // 获取操作日志
getOperationLogs: (params?: {
  user_id?: string;
  action_type?: string;
  target_type?: string;
  target_id?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
}) =>
  api.get<{
    logs: Array<{
      logId: number;
      userId: string;
      userName: string;
      userRole: number;
      userRoleText: string;
      module: string;
      moduleText: string;
      operationType: string;
      operationTypeText: string;
      operationDetail: string;
      targetType: string | null;
      targetId: string | null;
      ipAddress: string;
      status: number;
      statusText: string;
      createdTime: string;
      executionTime: number;
      errorMessage: string | null;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>('/admin/operation-logs', { params }),
  
  // 导出数据
  exportData: (data: {
    data_type: 'users' | 'transactions' | 'cards';
    format: 'excel' | 'csv' | 'pdf';
    start_date?: string;
    end_date?: string;
    filters?: Record<string, any>;
  }) =>
    api.post('/admin/export', data),

    
};