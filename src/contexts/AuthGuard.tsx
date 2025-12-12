import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const isAdminPage = window.location.pathname.startsWith('/admin');
        navigate(isAdminPage ? '/admin/login' : '/login', { replace: true });
      } else if (requireAdmin && !isAdmin) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, requireAdmin]);

  if (loading || !isAuthenticated || (requireAdmin && !isAdmin)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  return <>{children}</>;
};