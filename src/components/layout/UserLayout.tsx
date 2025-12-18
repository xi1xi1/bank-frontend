// src/components/layout/UserLayout.tsx - 修改头像为灰底白字版，删除安全设置菜单项
import React, { useState } from 'react';
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Button,
  Typography,
  Space,
  Badge,
  message
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  BankOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  WalletOutlined,
  SafetyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  MessageOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

// 获取姓名首字（姓）
const getFirstNameChar = (name: string): string => {
  if (!name || name.length === 0) return '用';
  return name.charAt(0);
};

// 获取用户姓名（如果有）
const getUserName = (user: any): string => {
  return user.name || user.username || '用户';
};

const UserLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const {
    token: { colorBgContainer, borderRadiusLG, colorBgTextHover },
  } = theme.useToken();

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/deposit',
      icon: <ArrowUpOutlined />,
      label: '存款',
    },
    {
      key: '/withdraw',
      icon: <ArrowDownOutlined />,
      label: '取款',
    },
    {
      key: '/cards',
      icon: <CreditCardOutlined />,
      label: '银行卡',
    },
    {
      key: '/transactions',
      icon: <HistoryOutlined />,
      label: '交易记录',
    },
    {
      key: '/fixed-deposits',
      icon: <BankOutlined />,
      label: '定期存款',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
  ];

  // 用户下拉菜单项 - 删除了安全设置
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  // 处理用户菜单点击
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'logout':
        localStorage.removeItem('user');
        message.success('已退出登录');
        navigate('/login');
        break;
      case 'profile':
        navigate('/settings?tab=profile');
        break;
    }
  };

  // 当前选中的菜单项
  const selectedKeys = [location.pathname];

  // 安全地获取当前菜单项的label
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item?.key === location.pathname);
    if (currentItem && 'label' in currentItem) {
      return currentItem.label as string;
    }
    return '首页';
  };

  // 处理刷新页面
  const handleRefresh = () => {
    window.location.reload();
  };

  // 处理帮助中心
  const handleHelp = () => {
    message.info('帮助中心功能开发中');
  };

  // 处理通知
  const handleNotifications = () => {
    navigate('/settings?tab=notifications');
  };

  // 处理联系客服
  const handleContact = () => {
    message.info('客服热线: 400-123-4567');
  };

  // 处理导出报表
  const handleExport = () => {
    message.info('导出功能开发中');
  };

  // 处理安全检查
  const handleSecurityCheck = () => {
    message.success('安全检查完成，账户安全状态良好');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo 区域 */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          textAlign: collapsed ? 'center' : 'left',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {collapsed ? (
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>B</Title>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BankOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>个人银行</Title>
            </div>
          )}
        </div>

        {/* 用户信息区域 */}
        {!collapsed && (
          <div style={{
            padding: '24px 16px',
            borderBottom: '1px solid #f0f0f0',
            textAlign: 'center',
          }}>
            <Avatar 
              size={64} 
              style={{ 
                marginBottom: 12,
                backgroundColor: '#8c8c8c', // 灰色背景
                color: 'white', // 白色文字
                fontSize: 24,
                fontWeight: 'bold'
              }}
            >
              {getFirstNameChar(getUserName(user))}
            </Avatar>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{getUserName(user)}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {user.username ? `@${user.username}` : user.user_id}
            </div>
          </div>
        )}

        {/* 菜单区域 */}
        <div style={{ padding: '16px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
          />
        </div>

        {/* 折叠按钮 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #f0f0f0',
          padding: '12px',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ width: '100%', height: 40 }}
          />
        </div>
      </Sider>

      {/* 右侧内容区域 */}
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 220,
        transition: 'all 0.2s',
      }}>
        {/* 顶部Header */}
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999,
        }}>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>
              {getCurrentPageTitle()}
            </Title>
          </div>

          {/* 右侧操作区 */}
          <Space size="middle" align="center">
            <Space size="small">
              {/* 通知按钮
              <Button 
                type="text" 
                icon={<BellOutlined />}
                onClick={handleNotifications}
                size="small"
              >
                <Badge count={3} size="small" offset={[10, -5]} />
              </Button> */}

              {/* 刷新按钮 */}
              <Button 
                type="text" 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                size="small"
                title="刷新页面"
              />

              {/* 联系客服 */}
              <Button 
                type="text" 
                icon={<MessageOutlined />}
                onClick={handleContact}
                size="small"
                title="联系客服"
              />
            </Space>

            {/* 用户信息 */}
            <Dropdown 
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  height: 32,
                  minWidth: 'auto',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorBgTextHover || '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <Avatar 
                  size="small" 
                  style={{ 
                    marginRight: 8,
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    backgroundColor: '#8c8c8c', // 灰色背景
                    color: 'white', // 白色文字
                    fontWeight: 'bold'
                  }}
                >
                  {getFirstNameChar(getUserName(user))}
                </Avatar>
                {!collapsed && (
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 500,
                    color: '#333'
                  }}>
                    {getUserName(user)}
                  </span>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* 主要内容区域 */}
        <Content style={{
          margin: '24px 16px',
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>

        {/* 底部Footer */}
        <div style={{
          textAlign: 'center',
          padding: '16px 24px',
          color: '#666',
          fontSize: 12,
          borderTop: '1px solid #f0f0f0',
          background: colorBgContainer,
        }}>
          © 2025 个人银行系统. 如有问题请联系客服: 400-123-4567
        </div>
      </Layout>
    </Layout>
  );
};

export default UserLayout;