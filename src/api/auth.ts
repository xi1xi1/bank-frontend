// src/api/auth.ts
import api from '../utils/request';
import type { ApiResponse } from '../utils/request';

// 登录请求接口
export interface LoginRequest {
  login_type: 'phone' | 'username';
  phone?: string;
  username?: string;
  password: string;
}

// 注册请求接口 - 前端表单收集的数据
export interface RegisterRequest {
  username: string;
  password: string;
  phone: string;
  name: string;
  idNumber: string;
}

// 登录响应数据接口
export interface LoginData {
  userId: string;
  username: string;
  token: string;
  role: number;
  lastLoginTime: string;
  name?: string;
  phone?: string;
}

// 注册响应数据接口
export interface RegisterData {
  userId: string;
  username: string;
  phone: string;
}

// 验证用户名响应
export interface CheckUsernameResponse {
  username: string;
  available: boolean;
  exists: boolean;
}

// 验证手机号响应
export interface CheckPhoneResponse {
  phone: string;
  available: boolean;
  exists: boolean;
}

// 验证身份证响应
export interface CheckIdNumberResponse {
  idNumber: string;
  available: boolean;
  exists: boolean;
}

export const authApi = {
  // 用户注册 - 只发送后端需要的字段
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterData>> => {
    // 确保只发送后端需要的5个字段
    const requestData = {
      phone: data.phone,
      username: data.username,
      password: data.password,
      name: data.name,
      idNumber: data.idNumber  // 注意：后端要求的是 idNumber，不是 id_number
    };
    
    console.log('📤 authApi.register 发送数据:', JSON.stringify(requestData, null, 2));
    return api.post<RegisterData>('/auth/register', requestData);
  },
  
  // 用户登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginData>> => {
    const requestBody = {
      account: data.login_type === 'phone' ? data.phone : data.username,
      password: data.password
    };
    
    console.log('📤 authApi.login 发送数据:', JSON.stringify(requestBody, null, 2));
    return api.post<LoginData>('/auth/login', requestBody);
  },
  
  // 简化版登录接口
  simpleLogin: (account: string, password: string): Promise<ApiResponse<LoginData>> => {
    return api.post<LoginData>('/auth/login', {
      account,
      password
    });
  },
  
  // 分步验证API
  checkUsername: (username: string): Promise<ApiResponse<CheckUsernameResponse>> => {
    return api.post<CheckUsernameResponse>('/auth/check-username', { username });
  },
  
  checkPhone: (phone: string): Promise<ApiResponse<CheckPhoneResponse>> => {
    return api.post<CheckPhoneResponse>('/auth/check-phone', { phone });
  },
  
  checkIdNumber: (idNumber: string): Promise<ApiResponse<CheckIdNumberResponse>> => {
    return api.post<CheckIdNumberResponse>('/auth/check-id-number', { idNumber });
  },
  
  // 修改密码
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse> =>
    api.put('/user/password', {
      oldPassword,
      newPassword,
      confirmPassword
    }),
  
  // 退出登录
  logout: (): Promise<{ success: boolean; message: string }> => {
    return Promise.resolve({
      success: true,
      message: '退出成功'
    });
  },
  
  // 健康检查
  healthCheck: (): Promise<ApiResponse> =>
    api.get('/auth/health'),
  
  // 连通性测试
  ping: (): Promise<ApiResponse> =>
    api.get('/auth/ping'),
  
  // 测试token
  testToken: (): Promise<ApiResponse> =>
    api.get('/auth/test-token')
};