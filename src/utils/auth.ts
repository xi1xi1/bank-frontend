import { message } from 'antd';

export interface User {
  user_id: string;
  username: string;
  phone: string;
  name: string;
  role: number;
  token: string;
}

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    return null;
  }
};

/**
 * 保存用户信息到localStorage
 */
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
    message.error('保存用户信息失败');
  }
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
 * 检查Token是否即将过期
 */
export const isTokenExpiringSoon = (): boolean => {
  // 这里可以根据实际JWT token的过期时间来实现
  // 暂时返回false
  return false;
};

/**
 * 刷新Token
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    // 这里可以实现token刷新逻辑
    // 暂时返回true
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * 检查页面访问权限
 */
export const checkPagePermission = (requiredRole: 'user' | 'admin' = 'user'): boolean => {
  if (requiredRole === 'admin') {
    return isAdmin();
  }
  return isLoggedIn();
};

/**
 * 退出登录并跳转到登录页
 */
export const logoutAndRedirect = (isAdminPage: boolean = false): void => {
  clearUser();
  
  // 根据当前页面类型跳转到不同的登录页
  if (isAdminPage) {
    window.location.href = '/admin/login';
  } else {
    window.location.href = '/login';
  }
  
  message.success('已退出登录');
};