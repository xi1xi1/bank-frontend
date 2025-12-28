// src/utils/request.ts
import axios, { type AxiosResponse, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios';
import { message as antdMessage } from 'antd';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 统一的API响应接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 修正返回类型
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('请求响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    const { code, message } = response.data;
    
    if (code === 200) {
      // ✅ 正确的方式：直接返回完整的响应
      return response;
    } else {
      const error = new Error(message || '请求失败');
      (error as any).response = response;
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('请求失败:', error);
    
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('user');
    //   window.location.href = '/login';
    //   antdMessage.error('登录已过期，请重新登录');
    // }
        if (error.response?.status === 401) {
      // ✅ 检查是否是登录接口
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/') || requestUrl.includes('/login');
      
      // ✅ 检查当前页面
      const currentPath = window.location.pathname;
      const isAdminLoginPage = currentPath === '/admin/login';
      const isUserLoginPage = currentPath === '/login';
      
      // 如果是登录接口的401错误，说明登录失败，不跳转
      if (isLoginRequest) {
        console.log('登录接口返回401，登录失败，但不跳转');
        // 只移除token，不跳转
        localStorage.removeItem('user');
        // 不显示"登录已过期"消息，让组件自己处理错误
      } else {
        // 非登录接口的401，说明token过期，跳转到登录页
        localStorage.removeItem('user');
        
        if (isAdminLoginPage) {
          // 如果当前在管理员登录页，刷新页面
          window.location.reload();
        } else if (isUserLoginPage) {
          // 如果当前在用户登录页，刷新页面
          window.location.reload();
        } else {
          // 否则跳转到用户登录页
          window.location.href = '/login';
          antdMessage.error('登录已过期，请重新登录');
        }
      }
    }
    const errorMessage = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);

// 创建包装函数 - 正确处理响应
const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.get<ApiResponse<T>>(url, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => {
        console.log('GET响应处理:', response.data);
        return response.data;
      });
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.post<ApiResponse<T>>(url, data, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => {
        console.log('POST响应处理:', response.data);
        return response.data;
      });
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.put<ApiResponse<T>>(url, data, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => {
        console.log('PUT响应处理:', response.data);
        return response.data;
      });
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.delete<ApiResponse<T>>(url, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => {
        console.log('DELETE响应处理:', response.data);
        return response.data;
      });
  },
};

export default request;