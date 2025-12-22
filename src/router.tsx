import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './contexts/AuthGuard';
import Loading from './components/common/Loading';
import AddCard from './pages/user/AddCard';

// 导入布局组件
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import AuthLayout from './components/layout/AuthLayout';

// ========== 懒加载页面组件 ==========

// 公共页面（使用AuthLayout）
const UserLogin = lazy(() => import('./pages/auth/Login'));
const UserRegister = lazy(() => import('./pages/auth/Register'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const DebugAuth = lazy(() => import('./pages/DebugAuth'));

// 用户页面（使用UserLayout）
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserCards = lazy(() => import('./pages/user/Cards'));
const UserDeposit = lazy(() => import('./pages/user/Deposit'));
const UserWithdraw = lazy(() => import('./pages/user/Withdraw'));
const UserTransactions = lazy(() => import('./pages/user/UserTransactions'));
const UserFixedDeposits = lazy(() => import('./pages/user/UserFixedDeposits'));
const UserSettings = lazy(() => import('./pages/user/Settings'));


// 管理员页面（使用AdminLayout）
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminCardManagement = lazy(() => import('./pages/admin/CardManagement'));
const AdminTransactionOverview = lazy(() => import('./pages/admin/TransactionOverview'));
const AdminSystemAlerts = lazy(() => import('./pages/admin/SystemAlerts'));
const AdminOperationLogs = lazy(() => import('./pages/admin/OperationLogs'));
const AdminAdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAuditLog = lazy(() => import('./pages/admin/AuditLog'));
const Statistics = lazy(() => import('./pages/admin/Statistics'));

// ========== 路由配置 ==========

export const router = createBrowserRouter([
  // 根路径重定向到用户登录
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  
  // ========== 公开路由（使用AuthLayout，无需认证）==========
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<Loading />}>
            <UserLogin />
          </Suspense>
        )
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<Loading />}>
            <UserRegister />
          </Suspense>
        )
      },
      {
        path: '/admin/login',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminLogin />
          </Suspense>
        )
      },
      {
        path: '/debug-auth',
        element: (
          <Suspense fallback={<Loading />}>
            <DebugAuth />
          </Suspense>
        )
      },
      // MockLogin 页面已被移除
    ]
  },
  
  // ========== 用户路由（需要普通用户权限，使用UserLayout）==========
  {
    path: '/',
    element: (
      <RequireAuth>
        <UserLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<Loading />}>
            <UserDashboard />
          </Suspense>
        )
      },
      {
        path: 'cards',
        element: (
          <Suspense fallback={<Loading />}>
            <UserCards />
          </Suspense>
        )
      },
      {
        path: 'deposit',
        element: (
          <Suspense fallback={<Loading />}>
            <UserDeposit />
          </Suspense>
        )
      },
      {
        path: 'withdraw',
        element: (
          <Suspense fallback={<Loading />}>
            <UserWithdraw />
          </Suspense>
        )
      },
      {
        path: 'transactions',
        element: (
          <Suspense fallback={<Loading />}>
            <UserTransactions />
          </Suspense>
        )
      },
      {
        path: 'fixed-deposits',
        element: (
          <Suspense fallback={<Loading />}>
            <UserFixedDeposits />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Loading />}>
            <UserSettings />
          </Suspense>
        )
      },
      {
        path: 'cards/add',
        element: (
          <Suspense fallback={<Loading />}>
            <AddCard />
          </Suspense>
        )
      }
    ]
  },
  
  // ========== 管理员路由（需要管理员权限，使用AdminLayout）==========
  {
    path: '/admin',
    element: (
      <RequireAuth requireAdmin>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminDashboard />
          </Suspense>
        )
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminUserManagement />
          </Suspense>
        )
      },
      {
        path: 'cards',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminCardManagement />
          </Suspense>
        )
      },
      {
        path: 'transactions',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminTransactionOverview />
          </Suspense>
        )
      },
      {
        path: 'alerts',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminSystemAlerts />
          </Suspense>
        )
      },
      {
        path: 'operation-logs',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminOperationLogs />
          </Suspense>
        )
      },
      {
        path: 'audit-log',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminAuditLog />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Loading />}>
            <AdminAdminSettings />
          </Suspense>
        )
      },
      {
        path: 'statistics',
        element: (
          <Suspense fallback={<Loading />}>
            <Statistics />
          </Suspense>
        )
      }
    ]
  },
  
  // ========== 404页面 ==========
  {
    path: '*',
    element: (
      <div style={{ 
        padding: 50, 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5'
      }}>
        <h1 style={{ fontSize: 48, marginBottom: 20, color: '#1890ff' }}>404</h1>
        <h2 style={{ marginBottom: 20, color: '#333' }}>页面不存在</h2>
        <p style={{ marginBottom: 30, color: '#666', maxWidth: 400 }}>
          您访问的页面不存在或已被移动。
        </p>
        <a 
          href="/dashboard" 
          style={{
            padding: '10px 24px',
            backgroundColor: '#1890ff',
            color: 'white',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 'bold',
            transition: 'all 0.3s',
          }}
        >
          返回首页
        </a>
      </div>
    )
  }
]);