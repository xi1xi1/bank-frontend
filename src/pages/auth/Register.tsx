import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Steps, 
  Row, 
  Col,
  Typography,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  SafetyOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { validatePhone, validateIdCard } from '../../utils/validate';

const { Title, Text } = Typography;

interface StepItem {
  title: string;
  description: string;
  fields?: string[];
}

interface RegisterFormValues {
  username: string;
  phone: string;
  name: string;
  idNumber: string;
  password: string;
  confirmPassword: string;
  agreement?: boolean;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();

  const steps: StepItem[] = [
    {
      title: '基本信息',
      description: '填写账号和联系方式',
      fields: ['username', 'phone'],
    },
    {
      title: '身份验证',
      description: '验证您的身份信息',
      fields: ['name', 'idNumber'],
    },
    {
      title: '完成注册',
      description: '设置登录密码',
      fields: ['password', 'confirmPassword'],
    },
  ];

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const registerData = {
        phone: values.phone,
        username: values.username,
        password: values.password,
        name: values.name,
        id_number: values.idNumber,
      };

      await authApi.register(registerData);
      
      message.success('注册成功！');
      message.info('请使用注册的账号登录系统');
      
      // 跳转到登录页面
      navigate('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后重试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const currentStepFields = steps[currentStep].fields || [];
    form.validateFields(currentStepFields).then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      message.warning('请完善当前步骤的信息');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: 800, padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2}>银行系统注册</Title>
          <Text type="secondary">请按照步骤完成账号注册</Text>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 40 }}
          items={steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            phone: '',
            username: '',
            name: '',
            idNumber: '',
            password: '',
            confirmPassword: '',
          }}
        >
          {currentStep === 0 && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="账号"
                    rules={[
                      { required: true, message: '请输入账号' },
                      { min: 4, message: '账号至少4个字符' },
                      { max: 20, message: '账号最多20个字符' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入账号（4-20位）"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { validator: (_, value) => 
                        validatePhone(value) ? Promise.resolve() : Promise.reject('请输入正确的手机号')
                      }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="请输入11位手机号"
                      size="large"
                      maxLength={11}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="账号使用须知"
                description="账号将用于登录系统，请确保账号唯一且易于记忆"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            </>
          )}

          {currentStep === 1 && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[
                      { required: true, message: '请输入姓名' },
                      { min: 2, message: '姓名至少2个字符' },
                      { max: 20, message: '姓名最多20个字符' },
                      { pattern: /^[\u4e00-\u9fa5a-zA-Z·\s]+$/, message: '姓名只能包含中文、字母和空格' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入真实姓名"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="idNumber"
                    label="身份证号"
                    rules={[
                      { required: true, message: '请输入身份证号' },
                      { validator: (_, value) => 
                        validateIdCard(value) ? Promise.resolve() : Promise.reject('请输入正确的身份证号')
                      }
                    ]}
                  >
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="请输入18位身份证号"
                      size="large"
                      maxLength={18}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="身份信息安全"
                description="您的身份信息将受到严格保护，仅用于银行系统身份验证"
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="登录密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 8, message: '密码至少8位' },
                      { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字' }
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请输入密码（至少8位）"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject('两次输入的密码不一致');
                        },
                      }),
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<SafetyOutlined />}
                      placeholder="请再次输入密码"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="密码安全提示"
                description="请使用包含字母和数字的组合密码，不要使用过于简单的密码"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <div style={{ marginBottom: 24 }}>
                <Title level={5}>注册协议</Title>
                <div style={{ 
                  maxHeight: 150, 
                  overflowY: 'auto', 
                  border: '1px solid #d9d9d9',
                  padding: 12,
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#666'
                }}>
                  <p>1. 用户注册成功后，即视为同意本协议的所有条款。</p>
                  <p>2. 用户应妥善保管账号和密码，不得转让或出借给他人使用。</p>
                  <p>3. 用户在使用本系统时应遵守相关法律法规。</p>
                  <p>4. 银行将严格保护用户的个人信息和交易数据。</p>
                  <p>5. 如有任何疑问，请联系客服热线：400-xxx-xxxx。</p>
                </div>
                <Form.Item
                  name="agreement"
                  valuePropName="checked"
                  rules={[
                    { required: true, message: '请阅读并同意注册协议' },
                  ]}
                  style={{ marginTop: 12 }}
                >
                  <input type="checkbox" id="agreement" />
                  <label htmlFor="agreement" style={{ marginLeft: 8 }}>
                    我已阅读并同意《银行系统注册协议》
                  </label>
                </Form.Item>
              </div>
            </>
          )}

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {currentStep > 0 && (
                  <Button 
                    onClick={prevStep}
                    icon={<ArrowLeftOutlined />}
                    style={{ marginRight: 8 }}
                  >
                    上一步
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep}>
                    下一步
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    style={{ minWidth: 120 }}
                  >
                    完成注册
                  </Button>
                )}
              </div>
            </div>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text type="secondary">已有账号？</Text>
            <Button 
              type="link" 
              onClick={() => navigate('/login')}
              style={{ paddingLeft: 4 }}
            >
              立即登录
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;