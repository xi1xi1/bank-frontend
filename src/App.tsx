// src/App.tsx 或 src/main.tsx
import React, { useEffect } from 'react';
import { RouterProvider, useLocation } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import './styles/global.css';

// 创建一个组件来检查路径并添加样式
const RouteWrapper: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // 如果是登录/注册页面，移除body上的Layout样式
    const isAuthPage = ['/login', '/register', '/admin/login', '/mock-login', '/debug'].includes(location.pathname);
    
    if (isAuthPage) {
      document.body.classList.add('auth-page');
      document.body.classList.remove('layout-page');
    } else {
      document.body.classList.add('layout-page');
      document.body.classList.remove('auth-page');
    }
  }, [location]);
  
  return <RouterProvider router={router} />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
        <AuthProvider>
          <RouteWrapper />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;