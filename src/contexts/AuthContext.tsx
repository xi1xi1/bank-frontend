import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';
import { authApi } from '../api/auth';
import { getCurrentUser, saveUser, clearUser } from '../utils/auth';
import type { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// 导出AuthContext以便在hooks中使用
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从localStorage加载用户信息
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = getCurrentUser();
        if (savedUser) {
          setUser(savedUser);
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
      const response = await authApi.login(credentials);
      const userData = response.data;
      
      saveUser(userData);
      setUser(userData);
      
      message.success('登录成功！');
      
      if (userData.role === 1) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authApi.logout().catch(() => {});
    } catch (error: unknown) {
      console.error('Logout API error:', error);
    } finally {
      clearUser();
      setUser(null);
      
      const isAdminPage = window.location.pathname.startsWith('/admin');
      if (isAdminPage) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
      
      message.success('已退出登录');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  const value = {
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