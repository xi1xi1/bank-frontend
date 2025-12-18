// src/pages/user/Settings.tsx - 修改密码成功后不退出登录
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Alert,
  Tabs,
  Avatar,
  Descriptions,
  message,
  Divider,
  Tag,
  Space
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../../utils/request';
import { formatDateTime } from '../../utils/formatter';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 用户信息接口
interface UserInfo {
  userId: string;
  username: string;
  phone: string;
  name: string;
  idNumber?: string;
  role: number;
  accountStatus: number;
  createdTime: string;
  lastLoginTime?: string;
  email?: string;
  gender?: number;
  birthDate?: string;
  address?: string;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // 加载用户信息
  const loadUserInfo = async () => {
    try {
      console.log('开始加载用户信息...');
      
      const response = await api.get('/user/info');
      
      console.log('用户信息响应:', response);
      
      if (response.code === 200) {
        const userData = response.data;
        console.log('用户数据:', userData);
        
        setUserInfo(userData);
        
        // 设置表单初始值
        form.setFieldsValue({
          name: userData.name,
          phone: userData.phone,
          email: userData.email || '',
          address: userData.address || ''
        });
        
        // 更新本地存储的用户信息
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          name: userData.name,
          phone: userData.phone,
          email: userData.email
        }));
      } else {
        message.error(response.message || '加载用户信息失败');
      }
    } catch (error: any) {
      console.error('加载用户信息失败:', error);
      message.error(error.message || '加载用户信息失败');
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  // 修改获取姓名首字（姓）的函数
  const getFirstNameChar = (name: string): string => {
    if (!name || name.length === 0) return '用';
    // 获取姓（第一个字符）
    return name.charAt(0);
  };

  // 修改生成头像颜色的函数 - 改为灰色
  const getAvatarColor = (): string => {
    // 固定为灰色
    return '#8c8c8c'; // 灰色
  };

  // 更新个人信息
  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      if (!userInfo) {
        message.error('用户信息未加载');
        return;
      }
      
      const updateData = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address
      };
      
      console.log('更新用户信息:', updateData);
      
      const response = await api.put(`/user/${userInfo.userId}`, updateData);
      
      console.log('更新响应:', response);
      
      if (response.code === 200) {
        message.success('个人信息更新成功！');
        loadUserInfo(); // 重新加载信息
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error: any) {
      console.error('更新失败:', error);
      message.error(error.response?.data?.message || error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码 - 修改后不退出登录
  const handleChangePassword = async (values: any) => {
    // 前端验证密码一致性
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致！');
      return;
    }

    setLoading(true);
    try {
      // 发送包含 confirmPassword 的完整数据
      const response = await api.put('/user/password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      
      console.log('修改密码响应:', response);
      
      if (response.code === 200) {
        // ✅ 修改：不退出登录，只显示成功消息
        setPasswordChanged(true);
        message.success({
          content: '密码修改成功！',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
        
        // ✅ 重置表单
        passwordForm.resetFields();
        
        // ✅ 5秒后重置成功状态
        setTimeout(() => {
          setPasswordChanged(false);
        }, 5000);
        
      } else {
        message.error(response.message || '修改密码失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      
      // 显示详细的错误信息
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = errors.map((e: any) => e.defaultMessage).join(', ');
        message.error(`验证失败: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        message.error(`修改失败: ${error.response.data.message}`);
      } else {
        message.error(error.message || '修改密码失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 根据角色获取角色名称
  const getRoleName = (role: number) => {
    const roles: { [key: number]: string } = {
      0: '普通用户',
      1: '管理员',
      2: '柜员',
      3: '经理'
    };
    return roles[role] || '未知角色';
  };

  // 获取账户状态标签
  const getAccountStatusTag = (status: number) => {
    if (status === 0) {
      return <Tag color="success">正常</Tag>;
    } else if (status === 1) {
      return <Tag color="error">冻结</Tag>;
    } else {
      return <Tag color="default">未知</Tag>;
    }
  };

  return (
    <div>
      <Title level={3}>账户设置</Title>
      <Paragraph type="secondary">
        管理您的个人信息、安全设置和偏好设置
      </Paragraph>

      <Row gutter={24}>
        <Col xs={24} md={8} lg={6}>
          <Card style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={100}
                style={{ 
                  marginBottom: 16,
                  fontSize: 40,
                  backgroundColor: getAvatarColor(), // 使用固定的灰色
                  color: 'white', // 白色文字
                  border: '4px solid #f0f0f0',
                  fontWeight: 'bold'
                }}
              >
                {userInfo?.name ? getFirstNameChar(userInfo.name) : '用'}
              </Avatar>
              
              <Title level={4} style={{ marginBottom: 4 }}>
                {userInfo?.name || '用户'}
              </Title>
              <Text type="secondary">@{userInfo?.username}</Text>
              
              <div style={{ marginTop: 16 }}>
                {/* <Text type="secondary" style={{ fontSize: '14px' }}>
                  头像为姓名首字自动生成
                </Text> */}
              </div>
            </div>

            <Divider />
            
            <Descriptions column={1} size="small">
              <Descriptions.Item label="用户ID">
                <Text code>{userInfo?.userId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                {userInfo && getAccountStatusTag(userInfo.accountStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="用户角色">
                {userInfo && getRoleName(userInfo.role)}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {userInfo?.createdTime ? formatDateTime(userInfo.createdTime) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {userInfo?.lastLoginTime ? formatDateTime(userInfo.lastLoginTime) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16} lg={18}>
          <Card>
            <Tabs defaultActiveKey="profile">
              {/* 个人信息标签页 */}
              <TabPane tab="个人信息" key="profile">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        label="姓名"
                        name="name"
                        rules={[{ required: true, message: '请输入姓名' }]}
                      >
                        <Input
                          placeholder="请输入真实姓名"
                          prefix={<UserOutlined />}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="手机号码"
                        name="phone"
                        rules={[
                          { required: true, message: '请输入手机号码' },
                          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                        ]}
                      >
                        <Input
                          placeholder="请输入手机号码"
                          prefix={<PhoneOutlined />}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="电子邮箱"
                    name="email"
                    rules={[
                      { type: 'email', message: '请输入正确的邮箱地址' }
                    ]}
                  >
                    <Input
                      placeholder="请输入电子邮箱"
                      prefix={<MailOutlined />}
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="联系地址"
                    name="address"
                  >
                    <Input
                      placeholder="请输入联系地址"
                      prefix={<HomeOutlined />}
                      size="large"
                    />
                  </Form.Item>

                  <Alert
                    message="提示"
                    description="修改个人信息可能需要重新验证身份"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        保存修改
                      </Button>
                      <Button
                        onClick={() => form.resetFields()}
                        icon={<EditOutlined />}
                      >
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>

              {/* 安全设置标签页 */}
              <TabPane tab="安全设置" key="security">
                {passwordChanged && (
                  <Alert
                    message="密码修改成功"
                    description="您的登录密码已成功修改，下次登录时请使用新密码。"
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ marginBottom: 24 }}
                  />
                )}

                <Alert
                  message="安全提醒"
                  description="定期修改密码可以更好地保护您的账户安全。建议使用包含字母、数字和特殊符号的复杂密码。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  onFinishFailed={({ errorFields }) => {
                    console.log('表单验证失败:', errorFields);
                    message.error('请检查表单错误');
                  }}
                >
                  <Form.Item
                    label="当前密码"
                    name="oldPassword"
                    rules={[
                      { required: true, message: '请输入当前密码' },
                      { min: 6, message: '密码长度至少6位' }
                    ]}
                  >
                    <Input.Password
                      placeholder="请输入当前密码"
                      prefix={<LockOutlined />}
                      size="large"
                      autoComplete="current-password"
                    />
                  </Form.Item>

                  <Form.Item
                    label="新密码"
                    name="newPassword"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 8, message: '密码长度至少8位' },
                      { 
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                        message: '需包含大小写字母和数字' 
                      }
                    ]}
                    help="密码需包含大小写字母和数字，长度至少8位"
                  >
                    <Input.Password
                      placeholder="请输入新密码"
                      prefix={<LockOutlined />}
                      size="large"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    label="确认新密码"
                    name="confirmPassword"
                    rules={[
                      { required: true, message: '请再次输入新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value) {
                            return Promise.reject(new Error('请再次输入新密码'));
                          }
                          if (value !== getFieldValue('newPassword')) {
                            return Promise.reject(new Error('两次输入的密码不一致'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="请再次输入新密码"
                      prefix={<LockOutlined />}
                      size="large"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Alert
                    message="密码规则"
                    description="新密码必须符合以下规则：1. 至少8位长度；2. 包含大小写字母；3. 包含数字"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SafetyOutlined />}
                        size="large"
                      >
                        确认修改
                      </Button>
                      <Button
                        onClick={() => {
                          passwordForm.resetFields();
                          setPasswordChanged(false);
                        }}
                        size="large"
                      >
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>

                <Divider />

                <Card title="安全状态" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>登录密码强度: </Text>
                      <Tag color="success">强</Tag>
                    </div>
                    <div>
                      <Text strong>最近登录: </Text>
                      <Text>{userInfo?.lastLoginTime ? formatDateTime(userInfo.lastLoginTime) : '-'}</Text>
                    </div>
                    <div>
                      <Text strong>密码最后修改: </Text>
                      <Text>{passwordChanged ? '刚刚' : '未修改'}</Text>
                    </div>
                    <div>
                      <Text strong>账户安全建议: </Text>
                      <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                        <li>建议启用双重验证</li>
                        <li>定期检查登录记录</li>
                        <li>不在公共设备上保存密码</li>
                        <li>建议每3个月修改一次密码</li>
                      </ul>
                    </div>
                  </Space>
                </Card>
              </TabPane>

              {/* 账户信息标签页 */}
              <TabPane tab="账户信息" key="account">
                {userInfo && (
                  <Descriptions 
                    column={1} 
                    bordered 
                    size="middle"
                    labelStyle={{ fontWeight: 'bold', width: '120px' }}
                  >
                    <Descriptions.Item label="用户ID">
                      <Text code>{userInfo.userId}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="用户名">
                      {userInfo.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="姓名">
                      {userInfo.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="手机号">
                      {userInfo.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="身份证号">
                      {userInfo.idNumber ? (
                        <Text type="secondary">
                          {userInfo.idNumber.substring(0, 6)}******{userInfo.idNumber.substring(14)}
                        </Text>
                      ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="电子邮箱">
                      {userInfo.email || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="联系地址">
                      {userInfo.address || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="用户角色">
                      <Tag color="blue">{getRoleName(userInfo.role)}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="账户状态">
                      {getAccountStatusTag(userInfo.accountStatus)}
                    </Descriptions.Item>
                    <Descriptions.Item label="注册时间">
                      {formatDateTime(userInfo.createdTime)}
                    </Descriptions.Item>
                    <Descriptions.Item label="最后登录">
                      {userInfo.lastLoginTime ? formatDateTime(userInfo.lastLoginTime) : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;