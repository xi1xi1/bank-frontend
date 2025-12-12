import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RequireAuth } from './contexts/AuthGuard';
import Loading from './components/common/Loading';

// 懒加载页面组件 - 使用正确的动态导入语法
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserCards = lazy(() => import('./pages/user/Cards'));
const Deposit = lazy(() => import('./pages/user/Deposit'));
const Transactions = lazy(() => import('./pages/user/Transactions'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));

// 加载中组件
const withSuspense = (Component: React.ComponentType) => {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: withSuspense(Login)
  },
  {
    path: '/register',
    element: withSuspense(Register)
  },
  {
    path: '/admin/login',
    element: withSuspense(AdminLogin)
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        {withSuspense(UserDashboard)}
      </RequireAuth>
    )
  },
  {
    path: '/cards',
    element: (
      <RequireAuth>
        {withSuspense(UserCards)}
      </RequireAuth>
    )
  },
  {
    path: '/deposit',
    element: (
      <RequireAuth>
        {withSuspense(Deposit)}
      </RequireAuth>
    )
  },
  {
    path: '/transactions',
    element: (
      <RequireAuth>
        {withSuspense(Transactions)}
      </RequireAuth>
    )
  },
  {
    path: '/admin/dashboard',
    element: (
      <RequireAuth requireAdmin>
        {withSuspense(AdminDashboard)}
      </RequireAuth>
    )
  },
  {
    path: '/admin/users',
    element: (
      <RequireAuth requireAdmin>
        {withSuspense(UserManagement)}
      </RequireAuth>
    )
  }
]);