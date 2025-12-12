import api from '../utils/request';

export interface UserInfo {
  user_id: string;
  username: string;
  phone: string;
  name: string;
  id_number: string;
  role: number;
  account_status: number;
  created_time: string;
}

export interface UpdateUserRequest {
  phone?: string;
  name?: string;
}

export interface UserStatistics {
  user_id: string;
  total_balance: number;
  available_balance: number;
  frozen_amount: number;
  fixed_deposit_amount: number;
  card_count: number;
  active_card_count: number;
  this_month: {
    deposit_count: number;
    deposit_amount: number;
    withdraw_count: number;
    withdraw_amount: number;
    interest_earned: number;
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
    api.get<UserStatistics>(`/users/${userId}/statistics`),
  
  // 管理员查询所有用户
  getAllUsers: (params?: {
    search?: string;
    role?: number;
    account_status?: number;
    page?: number;
    page_size?: number;
  }) => 
    api.get<{
      users: Array<UserInfo & {
        card_count: number;
        total_balance: number;
        last_login_time: string;
      }>;
      pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
      };
    }>('/admin/users', { params }),
};