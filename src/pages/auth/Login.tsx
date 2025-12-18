import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Radio, 
  Typography, 
  Row, 
  Col,
  Divider 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  BankOutlined,
  SafetyOutlined,
  GlobalOutlined,
  TransactionOutlined,
  CustomerServiceOutlined 
} from '@ant-design/icons';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../../api/auth';
import { saveUser } from '../../utils/auth';

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'phone' | 'username'>('phone');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // src/pages/auth/Login.tsx - 关键修改部分
 const onFinish = async (values: { account: string; password: string }) => {
    setLoading(true);
    try {
      // 判断是手机号还是用户名
      const isPhone = /^1[3-9]\d{9}$/.test(values.account);
      
      // 构建登录数据
      const loginData: LoginRequest = {
        login_type: isPhone ? 'phone' : 'username',
        password: values.password
      };
      
      if (isPhone) {
        loginData.phone = values.account;
      } else {
        loginData.username = values.account;
      }

      console.log('发送登录请求:', loginData);
      
      const response = await authApi.login(loginData);
      console.log('收到登录响应:', response);
      
      if (response.code !== 200) {
        throw new Error(response.message || '登录失败');
      }
      
      // 使用统一的 saveUser 函数
      const savedUser = saveUser(response.data);
      
      if (!savedUser.userId) {
        console.error('用户信息保存失败，缺少 userId');
        throw new Error('用户信息保存失败');
      }
      
      console.log('登录成功，用户信息已保存:', savedUser);
      message.success('登录成功！');
      
      // 根据角色跳转
      setTimeout(() => {
        if (savedUser.role === 1) {
          console.log('管理员登录，跳转到 /admin/dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('普通用户登录，跳转到 /dashboard');
          navigate('/dashboard');
        }
      }, 500);
      
    } catch (error: any) {
      console.error('登录失败:', error);
      message.error(error.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      overflow: 'hidden'
    }}>
      <Row style={{ height: '100vh', margin: 0 }}>
        {/* 左侧：品牌展示和宣传区 */}
        <Col 
          xs={0} 
          sm={0} 
          md={12} 
          lg={14} 
          xl={16}
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '60px 40px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 背景装饰 */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }} />
          
          {/* 主要内容 */}
          <div style={{ 
            position: 'relative', 
            zIndex: 1,
            width: '100%',
            maxWidth: 600
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: 30
            }}>
              <BankOutlined style={{ 
                fontSize: 64, 
                marginRight: 16,
                color: 'white'
              }} />
              <div>
                <Title level={1} style={{ 
                  color: 'white', 
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                  银行智能系统
                </Title>
                <Paragraph style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  margin: 0
                }}>
                  安全 · 便捷 · 智能
                </Paragraph>
              </div>
            </div>
            
            <Paragraph style={{ 
              fontSize: 18, 
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 40
            }}>
              为您提供安全、便捷、高效的数字化银行服务体验。
              随时随地管理您的资产，享受专业理财建议，
              让您的财富增值更简单。
            </Paragraph>
            
            <Divider style={{ 
              borderColor: 'rgba(255,255,255,0.3)',
              margin: '40px 0'
            }} />
            
            {/* 功能特点 */}
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 20
                }}>
                  <SafetyOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#52c41a' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      银行级安全
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      多重加密保护
                    </Paragraph>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 20
                }}>
                  <TransactionOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#fa8c16' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      实时交易
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      即时到账处理
                    </Paragraph>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 20
                }}>
                  <GlobalOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#722ed1' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      全球服务
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      24小时在线支持
                    </Paragraph>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 20
                }}>
                  <CustomerServiceOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#eb2f96' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      专属客服
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      一对一专业服务
                    </Paragraph>
                  </div>
                </div>
              </Col>
            </Row>
            
            <div style={{ 
              marginTop: 40, 
              padding: 16,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 8
            }}>
              <Paragraph style={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                margin: 0
              }}>
                <strong>温馨提示：</strong>为保障您的账户安全，请勿在公共电脑上保存登录信息，
                建议定期更换密码并使用手机验证码登录。
              </Paragraph>
            </div>
          </div>
        </Col>

        {/* 右侧：登录表单区 */}
        <Col 
          xs={24} 
          sm={24} 
          md={12} 
          lg={10} 
          xl={8}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            backgroundColor: '#fff'
          }}
        >
          <Card 
            bordered={false}
            style={{ 
              width: '100%', 
              maxWidth: 420,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: 12,
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: 40 }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={3} style={{ marginBottom: 8 }}>
                用户登录
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                请使用您的账号或手机号登录系统
              </Paragraph>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: 24 
            }}>
              <Radio.Group 
                value={loginType} 
                onChange={(e) => setLoginType(e.target.value)}
                buttonStyle="solid"
                size="large"
              >
                <Radio.Button value="phone" style={{ padding: '0 24px' }}>
                  <PhoneOutlined style={{ marginRight: 6 }} />
                  手机号登录
                </Radio.Button>
                <Radio.Button value="username" style={{ padding: '0 24px' }}>
                  <UserOutlined style={{ marginRight: 6 }} />
                  用户名登录
                </Radio.Button>
              </Radio.Group>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="account"
                rules={[
                  { 
                    required: true, 
                    message: `请输入${loginType === 'phone' ? '手机号' : '用户名'}` 
                  },
                  ...(loginType === 'phone' ? [{
                    pattern: /^1[3-9]\d{9}$/, 
                    message: '请输入正确的手机号' 
                  }] : [])
                ]}
                style={{ marginBottom: 24 }}
              >
                <Input
                  prefix={loginType === 'phone' ? 
                    <PhoneOutlined style={{ color: '#999' }} /> : 
                    <UserOutlined style={{ color: '#999' }} />
                  }
                  placeholder={loginType === 'phone' ? '请输入手机号' : '请输入用户名'}
                  allowClear
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
                style={{ marginBottom: 32 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="请输入密码"
                  allowClear
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 24 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                  style={{ height: 48, fontSize: 16 }}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <a 
                  href="/register" 
                  style={{ 
                    color: '#1890ff',
                    fontWeight: 500
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                >
                  注册新账号
                </a>
                <a 
                  href="/forgot-password" 
                  style={{ 
                    color: '#666'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: 实现忘记密码功能
                    message.info('忘记密码功能开发中');
                  }}
                >
                  忘记密码？
                </a>
              </div>

              <Divider style={{ 
                margin: '24px 0',
                color: '#999',
                fontSize: 14
              }}>
                或
              </Divider>

              <div style={{ textAlign: 'center' }}>
                <a 
                  href="/admin/login" 
                  style={{ 
                    color: '#1890ff',
                    fontWeight: 500,
                    fontSize: 14
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/login');
                  }}
                >
                  管理员登录入口
                </a>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;