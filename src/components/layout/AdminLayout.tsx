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
  message,
  Divider,
  Modal,
  Form,
  Input,
  Alert
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth';  // 导入API

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Password } = Input;

type MenuItem = Required<MenuProps>['items'][number];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从 localStorage 获取用户信息
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 管理员菜单项
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
      key: '/admin/operation-logs',
      icon: <HistoryOutlined />,
      label: '操作日志',
    },
  ];

  // 管理员用户下拉菜单项 - 添加修改密码
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'change-password',
      icon: <SafetyOutlined />,
      label: '修改密码',
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
  const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case 'change-password':
        setShowChangePasswordModal(true);
        break;
      case 'logout':
        localStorage.removeItem('user');
        message.success('管理员已退出登录');
        navigate('/admin/login');
        break;
    }
  };

  // 处理修改密码
  const handleChangePassword = async (values: any) => {
    setChangePasswordLoading(true);
    try {
      await authApi.changePassword(
        values.oldPassword,
        values.newPassword,
        values.confirmPassword
      );
      
      message.success('密码修改成功');
      setShowChangePasswordModal(false);
      changePasswordForm.resetFields();
      
      // 可选：修改成功后强制重新登录
      // message.info('密码已修改，请重新登录');
      // localStorage.removeItem('user');
      // navigate('/admin/login');
      
    } catch (error: any) {
      message.error(error.message || '密码修改失败');
    } finally {
      setChangePasswordLoading(false);
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
          overflow: 'hidden',
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
              <CreditCardOutlined style={{ fontSize: 28, color: 'white', marginRight: 12 }} />
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

        {/* 可滚动的内容区域 */}
        <div style={{
          height: 'calc(100vh - 128px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '12px',
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
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                { '管理员'}
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
          
          <div style={{ height: '20px' }}></div>
        </div>

        {/* 固定的折叠按钮区域 */}
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
            <a href="#" onClick={() => message.info('帮助文档功能开发中')}>帮助文档</a>
          </Space>
        </div>
      </Layout>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={showChangePasswordModal}
        onCancel={() => {
          setShowChangePasswordModal(false);
          changePasswordForm.resetFields();
        }}
        footer={null}
        width={400}
        destroyOnClose
      >
        <Alert
          message="安全提示"
          description="请定期修改密码以确保账户安全"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={changePasswordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
              { max: 20, message: '密码长度不能超过20位' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('oldPassword') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('新密码不能与原密码相同'));
                },
              }),
            ]}
            hasFeedback
          >
            <Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
            hasFeedback
          >
            <Password placeholder="请再次输入新密码" />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setShowChangePasswordModal(false);
                  changePasswordForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={changePasswordLoading}
              >
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminLayout;