import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  LockOutlined, 
  UserOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  DashboardOutlined,
  TeamOutlined,
  AuditOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// 导入adminApi
import { adminApi } from '../../api/admin';

const { Title, Paragraph } = Typography;

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // const onFinish = async (values: { username: string; password: string }) => {
  //   setLoading(true);
  //   try {
  //     // 模拟管理员登录逻辑
  //     // TODO: 替换为真实的管理员登录API调用
  //     setTimeout(() => {
  //       // 临时模拟登录成功
  //       const mockAdminData = {
  //         user_id: 'admin-001',
  //         username: values.username,
  //         name: '系统管理员',
  //         role: 1,
  //         token: 'mock-admin-token-' + Date.now()
  //       };
        
  //       localStorage.setItem('user', JSON.stringify(mockAdminData));
  //       message.success('管理员登录成功！');
  //       navigate('/admin/dashboard');
  //     }, 1000);
  //   } catch (error: unknown) {
  //     const errorMessage = error instanceof Error ? error.message : '登录失败，请检查账号密码';
  //     message.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const onFinish = async (values: { username: string; password: string }) => {
  setLoading(true);
  try {

    
    // 调用真实的管理员登录接口
    const response = await adminApi.adminLogin({
      account: values.username,  // 注意：后端要求字段名为 account
      password: values.password
    });
    
    // 处理响应
    if (response.code === 200 && response.data) {
      const userData = {
        userId: response.data.userId,
        username: response.data.username,
        name: response.data.username, // 暂时用username，后续可以从用户信息接口获取真实姓名
        role: response.data.role,
        token: response.data.token,
        is_admin: response.data.is_admin || true
      };
      
      // 存储到localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      message.success('管理员登录成功！');
      navigate('/admin/dashboard');
    } else {
      message.error(response.message || '登录失败');
    }
  } catch (error: unknown) {
    console.error('管理员登录失败:', error);
    const errorMessage = error instanceof Error ? error.message : '登录失败，请检查账号密码';
    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5',
      overflow: 'hidden'
    }}>
      <Row style={{ height: '100vh', margin: 0 }}>
        {/* 左侧：管理员系统介绍 */}
        <Col 
          xs={0} 
          sm={0} 
          md={12} 
          lg={14}
          xl={16}
          style={{
            background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '60px 40px',
            position: 'relative'
          }}
        >
          {/* 背景装饰 */}
          <div style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            zIndex: 0
          }} />
          
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
              <Title level={1} style={{ 
                color: 'white', 
                margin: 0,
                fontWeight: 'bold'
              }}>
                银行管理后台
              </Title>
            </div>
            
            <Paragraph style={{ 
              fontSize: 18, 
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 40
            }}>
              专业的银行管理系统后台，提供全面的账户监控、
              交易管理、风险控制和数据分析功能。
              确保银行业务的安全、高效运行。
            </Paragraph>
            
            <Divider style={{ 
              borderColor: 'rgba(255,255,255,0.2)',
              margin: '40px 0'
            }} />
            
            {/* 管理功能展示 */}
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 24
                }}>
                  <TeamOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#52c41a' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      用户管理
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      账户审核、权限设置、状态管理
                    </Paragraph>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 24
                }}>
                  <DashboardOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#fa8c16' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      交易监控
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      实时交易追踪、异常检测
                    </Paragraph>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 24
                }}>
                  <AuditOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#eb2f96' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      安全审计
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      操作日志、风险预警
                    </Paragraph>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: 24
                }}>
                  <BarChartOutlined style={{ 
                    fontSize: 20, 
                    marginRight: 12,
                    marginTop: 2,
                    color: '#1890ff' 
                  }} />
                  <div>
                    <Title level={5} style={{ color: 'white', margin: '0 0 8px 0' }}>
                      数据分析
                    </Title>
                    <Paragraph style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      margin: 0,
                      fontSize: 13
                    }}>
                      业务统计、趋势分析
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
                <strong>安全提示：</strong>管理员账号仅供授权人员使用，
                请妥善保管您的登录凭证，定期更换密码。
              </Paragraph>
            </div>
          </div>
        </Col>

        {/* 右侧：管理员登录表单 */}
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
              <SafetyCertificateOutlined style={{ 
                fontSize: 48, 
                color: '#722ed1',
                marginBottom: 16
              }} />
              <Title level={2} style={{ marginBottom: 8 }}>
                管理员登录
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                请输入管理员账号和密码
              </Paragraph>
            </div>

            <Form
              form={form}
              name="adminLogin"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入管理员账号' },
                  { min: 4, message: '账号至少4个字符' }
                ]}
                style={{ marginBottom: 24 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#999' }} />}
                  placeholder="管理员账号"
                  allowClear
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
                style={{ marginBottom: 32 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="密码"
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
                  style={{ 
                    height: 48, 
                    fontSize: 16,
                    fontWeight: 500
                  }}
                >
                  {loading ? '登录中...' : '登录管理后台'}
                </Button>
              </Form.Item>

              <Divider style={{ 
                margin: '24px 0',
                color: '#999',
                fontSize: 14
              }}>
                或
              </Divider>

              <div style={{ textAlign: 'center' }}>
                <a 
                  href="/login" 
                  style={{ 
                    color: '#1890ff',
                    fontWeight: 500,
                    fontSize: 14
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  ← 返回用户登录
                </a>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminLogin;