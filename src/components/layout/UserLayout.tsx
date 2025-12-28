// src/components/layout/UserLayout.tsx - 完整代码
import React, { useState, useEffect } from 'react';
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
  Spin
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
import api from '../../utils/request';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const UserLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从localStorage获取初始用户信息
  const initialUser = JSON.parse(localStorage.getItem('user') || '{}');

  // 加载完整的用户信息
  const loadUserInfo = async () => {
    // 如果已经有完整的name信息，并且name不是username（说明不是初始状态），不需要重复加载
    if (user?.name && user?.name !== user?.username) {
      return;
    }
    
    // 如果localStorage中没有用户信息，直接返回
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser || !storedUser.userId) {
      return;
    }
    
    setLoading(true);
    try {
      console.log('开始加载用户完整信息...');
      const response = await api.get('/user/info');
      
      console.log('用户信息响应:', response);
      
      if (response.code === 200) {
        const userData = response.data;
        
        // 合并用户信息，优先使用API返回的数据
        const updatedUser = {
          ...storedUser,
          name: userData.name || storedUser.username,
          phone: userData.phone || storedUser.phone,
          email: userData.email || storedUser.email,
          userId: userData.userId || storedUser.userId,
          username: userData.username || storedUser.username,
          role: userData.role || storedUser.role,
          accountStatus: userData.accountStatus || storedUser.accountStatus,
          createdTime: userData.createdTime || storedUser.createdTime,
          lastLoginTime: userData.lastLoginTime || storedUser.lastLoginTime
        };
        
        console.log('更新后的用户信息:', updatedUser);
        
        // 保存到localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 更新状态
        setUser(updatedUser);
        setUserInfo(userData);
        
        console.log('用户信息加载完成');
      } else {
        console.warn('加载用户信息失败:', response.message);
        // 如果API调用失败，使用localStorage中的信息
        setUser(storedUser);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 如果发生错误，使用localStorage中的信息
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载用户信息
  useEffect(() => {
    // 初始化用户状态
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    
    // 延迟加载用户信息，避免阻塞初始渲染
    const timer = setTimeout(() => {
      loadUserInfo();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 监听路由变化，当进入设置页面时重新加载（可选）
  useEffect(() => {
    if (location.pathname === '/settings') {
      // 进入设置页面时重新加载，确保信息最新
      loadUserInfo();
    }
  }, [location.pathname]);

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

  // 用户下拉菜单项
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

  // 获取用户名（优先使用name，没有则用username）
  const getUserName = (): string => {
    if (!user) return '用户';
    return user.name || user.username || '用户';
  };

  // 获取姓名首字（姓）
  const getFirstNameChar = (): string => {
    const name = getUserName();
    if (!name || name.length === 0) return '用';
    return name.charAt(0);
  };

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
    loadUserInfo(); // 先重新加载用户信息
    setTimeout(() => {
      window.location.reload();
    }, 300);
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

  // 如果正在加载且用户信息不完整，显示加载状态
  if (loading && (!user || !user.name || user.name === user.username)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spin size="large" tip="正在加载用户信息..." />
        <Typography.Text type="secondary">正在获取您的个人信息...</Typography.Text>
      </div>
    );
  }

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
              {getFirstNameChar()}
            </Avatar>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{getUserName()}</div>
            <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
              {user.username ? `@${user.username}` : user.userId || ''}
            </div>
            {/* <div style={{ marginTop: 8 }}>
              <Button 
                type="link" 
                size="small" 
                onClick={loadUserInfo}
                loading={loading}
                style={{ fontSize: '12px' }}
              >
                刷新信息
              </Button>
            </div> */}
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
              {/* 通知按钮 */}
              {/* <Button 
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
                  {getFirstNameChar()}
                </Avatar>
                {!collapsed && (
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 500,
                    color: '#333'
                  }}>
                    {getUserName()}
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