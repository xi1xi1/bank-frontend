// src/components/layout/AdminLayout.tsx
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
  message,
  Tag,
  Divider
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  BellOutlined,
  SettingOutlined,
  AuditOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SafetyOutlined,
  BarChartOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  ApiOutlined,
  MonitorOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从 localStorage 获取用户信息
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 管理员专属菜单项配置
  const menuItems: MenuItem[] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '控制台',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: '/admin/cards',
      icon: <CreditCardOutlined />,
      label: '银行卡管理',
    },
    {
      key: '/admin/transactions',
      icon: <TransactionOutlined />,
      label: '交易监控',
    },
    {
      key: '/admin/alerts',
      icon: <BellOutlined />,
      label: '系统告警',
    },
    {
      key: '/admin/operation-logs',
      icon: <HistoryOutlined />,
      label: '操作日志',
    },
    {
      key: '/admin/audit-log',
      icon: <AuditOutlined />,
      label: '安全审计',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      key: '/admin/statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
  ];

  // 管理员专属用户下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'admin-profile',
      icon: <UserOutlined />,
      label: '管理员资料',
    },
    {
      key: 'admin-security',
      icon: <SecurityScanOutlined />,
      label: '安全设置',
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
        message.success('管理员已退出登录');
        navigate('/admin/login');
        break;
      case 'admin-profile':
        message.info('管理员资料功能开发中');
        break;
      case 'admin-security':
        message.info('管理员安全设置功能开发中');
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
    return '控制台';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 左侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
          overflow: 'hidden', // 外部隐藏，内部控制滚动
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo 区域 */}
        <div style={{
          padding: collapsed ? '16px 8px' : '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          textAlign: collapsed ? 'center' : 'left',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)',
          flexShrink: 0,
        }}>
          {collapsed ? (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text strong style={{ color: '#722ed1', fontSize: 14 }}>BMS</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SecurityScanOutlined style={{ fontSize: 28, color: 'white', marginRight: 12 }} />
              <div>
                <Title level={4} style={{ margin: 0, color: 'white', lineHeight: 1.2 }}>
                  银行管理系统
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  Admin Panel
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* ✅ 可滚动的内容区域 */}
        <div style={{
          height: 'calc(100vh - 128px)', // 减去Logo(64px)和底部按钮(64px)
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '12px', // 添加底部内边距
        }}>
          {/* 管理员信息区域 */}
          {!collapsed && (
            <div style={{
              padding: '20px 16px',
              borderBottom: '1px solid #f0f0f0',
              textAlign: 'center',
              background: '#fafafa',
            }}>
              <Avatar 
                size={56} 
                icon={<UserOutlined />}
                style={{ 
                  marginBottom: 12,
                  background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
              <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1890ff' }}>
                {user.name || '系统管理员'}
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
              theme="light"
            />
          </div>

          {/* 系统状态信息 - 现在可以滚动了 */}
          {!collapsed && (
            <div style={{
              margin: '16px',
              padding: '12px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 6,
              fontSize: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="success" />
                <Text type="secondary">系统状态: 正常</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="processing" />
                <Text type="secondary">在线用户: 128</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="default" />
                <Text type="secondary">数据库连接: 正常</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="warning" />
                <Text type="secondary">待处理告警: 3</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="success" />
                <Text type="secondary">内存使用率: 68%</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="processing" />
                <Text type="secondary">CPU使用率: 42%</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="default" />
                <Text type="secondary">网络延迟: 24ms</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="success" />
                <Text type="secondary">磁盘空间: 85%可用</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="processing" />
                <Text type="secondary">API响应: 120ms</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="default" />
                <Text type="secondary">缓存命中率: 92%</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="success" />
                <Text type="secondary">会话数量: 156</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Badge status="warning" />
                <Text type="secondary">队列任务: 8</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Badge status="success" />
                <Text type="secondary">安全级别: 高</Text>
              </div>
            </div>
          )}
          
          {/* 底部空白区域，确保内容不会被遮挡 */}
          <div style={{ height: '20px' }}></div>
        </div>

        {/* ✅ 固定的折叠按钮区域 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #f0f0f0',
          padding: '12px',
          background: colorBgContainer,
          height: 64,
          zIndex: 1001,
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
        marginLeft: collapsed ? 80 : 260,
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
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0, marginRight: 12 }}>
                {getCurrentPageTitle()}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date().toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Text>
            </div>
          </div>

          {/* 右侧操作区 */}
          <Space size="middle" align="center">
            {/* 快速操作按钮 */}
            <Space size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                onClick={() => navigate('/admin/alerts')}
                size="small"
              >
                <Badge count={3} size="small" offset={[10, -5]} />
              </Button>
              <Button 
                type="text" 
                icon={<DatabaseOutlined />}
                onClick={() => message.info('数据备份功能开发中')}
                size="small"
              >
                备份
              </Button>
              <Button 
                type="primary" 
                ghost
                icon={<MonitorOutlined />}
                onClick={() => navigate('/dashboard')}
                size="small"
              >
                用户视图
              </Button>
            </Space>

            {/* 用户信息 - 只显示名字 */}
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
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />}
                  style={{ 
                    marginRight: 8,
                    background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)'
                  }}
                />
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 500,
                  color: '#333'
                }}>
                  {user.name || '管理员'}
                </span>
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
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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
          <Space size="large">
            <Text>© 2025 银行管理系统 v1.0.0</Text>
            <Divider type="vertical" />
            <Text>最后更新: 2025-12-20</Text>
            <Divider type="vertical" />
            <a href="/admin/settings">系统设置</a>
            <Divider type="vertical" />
            <a href="#" onClick={() => message.info('帮助文档功能开发中')}>帮助文档</a>
          </Space>
        </div>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;