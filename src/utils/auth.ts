// src/utils/auth.ts - 完整修复版
import { message } from 'antd';

export interface User {
  userId: string;          // ✅ 统一使用 userId（字符串格式）
  username: string;
  phone: string;
  name: string;
  role: number;
  token: string;
  lastLoginTime?: string;
}

/**
 * 保存用户信息到localStorage（兼容多种后端格式）
 */
export const saveUser = (userData: any): User => {
  console.log('保存用户信息，原始数据:', userData);
  
  // 统一处理字段名，兼容多种格式
  const userInfo: User = {
    userId: userData.userId || userData.user_id || userData.id || '',
    username: userData.username || userData.userName || '',
    phone: userData.phone || userData.phoneNumber || '',
    name: userData.name || userData.realName || '用户',
    role: userData.role || userData.userRole || 0,
    token: userData.token || userData.accessToken || '',
    lastLoginTime: userData.lastLoginTime || userData.last_login_time || new Date().toISOString()
  };

  // 验证必要字段
  if (!userInfo.userId || !userInfo.username || !userInfo.token) {
    console.error('用户信息不完整:', userInfo);
    throw new Error('用户信息不完整，无法保存');
  }

  try {
    localStorage.setItem('user', JSON.stringify(userInfo));
    console.log('用户信息保存成功:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    message.error('保存用户信息失败');
    throw error;
  }
};

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr) as User;
    
    // 验证数据完整性
    if (!user.userId || !user.username || !user.token) {
      console.warn('存储的用户信息不完整:', user);
      clearUser();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    clearUser();
    return null;
  }
};

/**
 * 获取当前用户ID - 返回字符串
 */
export const getCurrentUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.userId || null;
};

/**
 * 清除用户信息
 */
export const clearUser = (): void => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Failed to clear user from localStorage:', error);
  }
};

/**
 * 检查用户是否已登录
 */
export const isLoggedIn = (): boolean => {
  const user = getCurrentUser();
  return !!user && !!user.token;
};

/**
 * 检查用户是否为管理员
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return !!user && user.role === 1;
};

/**
 * 获取授权Token
 */
export const getAuthToken = (): string => {
  const user = getCurrentUser();
  return user?.token || '';
};

/**
 * 验证登录状态，未登录则跳转
 */
export const requireLogin = (): boolean => {
  if (!isLoggedIn()) {
    message.warning('请先登录');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    return false;
  }
  return true;
};