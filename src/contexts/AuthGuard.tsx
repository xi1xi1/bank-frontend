// src/contexts/AuthGuard.tsx - 简化版本
import React from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/common/Loading';

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const location = useLocation();
  
  // 直接从 localStorage 获取用户信息
  const userStr = localStorage.getItem('user');
  
  // 调试信息
  console.log('🔒 AuthGuard 检查:', {
    path: location.pathname,
    hasUserData: !!userStr,
    userData: userStr,
    requireAdmin
  });

  // 如果没有用户信息，重定向到登录页
  if (!userStr) {
    console.log('❌ 未登录，重定向到登录页');
    const isAdminPage = location.pathname.startsWith('/admin');
    const redirectPath = isAdminPage ? '/admin/login' : '/login';
    
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  try {
    const user = JSON.parse(userStr);
    console.log('用户信息:', user);

    // 检查是否需要管理员权限
    if (requireAdmin) {
      if (user.role !== 1) {
        console.log('❌ 需要管理员权限但不是管理员，重定向到用户首页');
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
      }
    } else {
      // 普通用户页面，管理员不能访问（除非特别说明）
      // 这里根据你的需求决定：如果管理员也可以访问用户页面，可以注释掉这段
      if (user.role === 1) {
        console.log('⚠️ 管理员访问用户页面，允许访问');
        // return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
      }
    }

    console.log('✅ 权限检查通过');
    return <>{children}</>;

  } catch (error) {
    console.error('解析用户信息失败:', error);
    localStorage.removeItem('user');
    
    const isAdminPage = location.pathname.startsWith('/admin');
    const redirectPath = isAdminPage ? '/admin/login' : '/login';
    
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }
};