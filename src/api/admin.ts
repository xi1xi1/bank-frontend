// src/api/admin.ts - 修复版
import api from '../utils/request';

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
  // 获取管理员仪表盘统计
  getDashboardStats: () =>
    api.get<AdminStats>('/admin/dashboard/stats'),

  
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
  
  // 获取交易概览
  getTransactionOverview: (params?: {
    date_range?: string; // 'today' | 'week' | 'month' | 'year'
    start_date?: string;
    end_date?: string;
  }) =>
    api.get<TransactionOverview[]>('/admin/transactions/overview', { params }),
  
  // 冻结/解冻用户账户
  freezeUser: (data: {
    user_id: string;
    operation: 'freeze' | 'unfreeze';
    reason_type: string;
    reason_detail: string;
    freeze_duration?: number;
    notify_user: boolean;
  }) =>
    api.post('/admin/users/freeze', data),
  
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
        log_id: number;
        user_id: string;
        user_name: string;
        user_role: string;
        action_type: string;
        action_detail: string;
        target_type: string;
        target_id: string;
        target_name: string;
        reason: string;
        op_time: string;
        ip_address: string;
      }>;
      pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
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