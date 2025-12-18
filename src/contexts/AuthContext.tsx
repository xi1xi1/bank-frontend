// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';
import { authApi, type LoginRequest as ApiLoginRequest } from '../api/auth';
import { getCurrentUser, saveUser, clearUser } from '../utils/auth';
import type { User } from '../types';

// 扩展 User 类型以包含 user_id 属性
interface ExtendedUser extends User {
  user_id?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<ExtendedUser>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// 定义与 AuthContext 兼容的 LoginRequest
interface LoginRequest {
  login_type: 'phone' | 'username';
  phone?: string;
  username?: string;
  password: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从localStorage加载用户信息
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = getCurrentUser();
        if (savedUser) {
          setUser(savedUser as ExtendedUser);
          console.log('🔄 AuthContext 初始化用户:', savedUser);
        }
      } catch (error: unknown) {
        console.error('Failed to initialize auth:', error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      console.log('🔐 AuthContext 开始登录:', credentials);
      
      // 将前端登录请求转换为 API 需要的格式
      const apiCredentials: ApiLoginRequest = {
        login_type: credentials.login_type,
        password: credentials.password,
        ...(credentials.login_type === 'phone' ? { phone: credentials.phone } : { username: credentials.username })
      };
      
      // 调用 authApi.login
      const response = await authApi.login(apiCredentials);
      
      // 检查响应格式
      if (response.code !== 200) {
        throw new Error(response.message || '登录失败');
      }
      
      const userData = response.data;
      
      // 构建用户对象
      const completeUserData: ExtendedUser = {
        userId: userData.userId,
        username: userData.username,
        phone: credentials.phone || userData.phone || '',
        name: userData.name || (userData.role === 1 ? '管理员' : '用户'),
        role: userData.role || 0,
        token: userData.token,
        lastLoginTime: userData.lastLoginTime,
        // 兼容性处理：同时设置 user_id 和 userId
        user_id: userData.userId
      };
      
      console.log('✅ AuthContext 登录成功:', completeUserData);
      
      // 保存用户数据
      saveUser(completeUserData);
      setUser(completeUserData);
      
      message.success('登录成功！正在跳转...');
      
      // 根据角色跳转
      setTimeout(() => {
        if (completeUserData.role === 1) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 500);
      
    } catch (error: unknown) {
      console.error('❌ AuthContext 登录失败:', error);
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      message.error(`登录失败: ${errorMessage}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // 尝试调用登出API
      authApi.logout().catch(() => {
        console.log('登出API调用失败，继续本地登出');
      });
    } catch (error: unknown) {
      console.error('Logout API error:', error);
    } finally {
      // 清除本地用户数据
      clearUser();
      setUser(null);
      
      console.log('🚪 用户已登出');
      
      // 根据当前页面重定向到对应登录页
      const isAdminPage = window.location.pathname.startsWith('/admin');
      message.success('已退出登录');
      
      setTimeout(() => {
        if (isAdminPage) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }, 300);
    }
  };

  const updateUser = (userData: Partial<ExtendedUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      saveUser(updatedUser);
      setUser(updatedUser);
      console.log('🔄 AuthContext 更新用户:', updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 1,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};