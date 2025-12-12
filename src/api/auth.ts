import api from '../utils/request';

export interface LoginRequest {
  login_type: 'phone' | 'username';
  phone?: string;
  username?: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  username: string;
  password: string;
  name: string;
  id_number: string;
}

export const authApi = {
  // 用户注册
  register: (data: RegisterRequest) => 
    api.post('/auth/register', data),
  
  // 用户登录
  login: (data: LoginRequest) => 
    api.post('/auth/login', data),
  
  // 修改密码
  changePassword: (userId: string, oldPassword: string, newPassword: string) =>
    api.put('/auth/change-password', {
      user_id: userId,
      old_password: oldPassword,
      new_password: newPassword,
    }),
  
  // 退出登录
  logout: () => 
    api.post('/auth/logout'),
};