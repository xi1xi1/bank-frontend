// src/pages/auth/Register.tsx
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
  Alert,
  Checkbox
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { 
  authApi, 
  type RegisterRequest
} from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { validatePhone, validateIdCard } from '../../utils/validate';

const { Title, Text } = Typography;

interface StepItem {
  title: string;
  description: string;
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

interface ValidationState {
  username: { checked: boolean; available: boolean };
  phone: { checked: boolean; available: boolean };
  idNumber: { checked: boolean; available: boolean };
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [validation, setValidation] = useState<ValidationState>({
    username: { checked: false, available: false },
    phone: { checked: false, available: false },
    idNumber: { checked: false, available: false }
  });
  const [form] = Form.useForm<RegisterFormValues>();
  const [registerData, setRegisterData] = useState<Partial<RegisterRequest>>({});
  const navigate = useNavigate();

  const steps: StepItem[] = [
    {
      title: '基本信息',
      description: '填写用户名和联系方式',
    },
    {
      title: '身份验证',
      description: '填写真实身份信息',
    },
    {
      title: '完成注册',
      description: '设置登录密码',
    },
  ];

  // 检查用户名
  const checkUsername = async (username: string): Promise<boolean> => {
    try {
      console.log('🔍 检查用户名:', username);
      const response = await authApi.checkUsername(username);
      
      if (response.code === 200) {
        const isAvailable = response.data?.available === true;
        console.log('用户名是否可用:', isAvailable);
        
        setValidation(prev => ({
          ...prev,
          username: { checked: true, available: isAvailable }
        }));
        
        if (isAvailable) {
          // 保存用户名到注册数据
          setRegisterData(prev => ({
            ...prev,
            username
          }));
          
          return true;
        } else {
          message.error('用户名已存在，请更换');
          return false;
        }
      } else {
        message.error(response.message || '验证失败');
        return false;
      }
    } catch (error: any) {
      console.error('❌ 检查用户名失败:', error);
      message.error(error.message || '网络错误，请稍后重试');
      return false;
    }
  };

  // 检查手机号
  const checkPhone = async (phone: string): Promise<boolean> => {
    try {
      console.log('🔍 检查手机号:', phone);
      const response = await authApi.checkPhone(phone);
      
      if (response.code === 200) {
        const isAvailable = response.data?.available === true;
        console.log('手机号是否可用:', isAvailable);
        
        setValidation(prev => ({
          ...prev,
          phone: { checked: true, available: isAvailable }
        }));
        
        if (isAvailable) {
          // 保存手机号到注册数据
          setRegisterData(prev => ({
            ...prev,
            phone
          }));
          
          return true;
        } else {
          message.error('手机号已被注册');
          return false;
        }
      } else {
        message.error(response.message || '验证失败');
        return false;
      }
    } catch (error: any) {
      console.error('检查手机号失败:', error);
      message.error(error.message || '网络错误，请稍后重试');
      return false;
    }
  };

  // 检查身份证
  const checkIdNumber = async (idNumber: string, name: string): Promise<boolean> => {
    try {
      console.log('🔍 检查身份证:', idNumber);
      const response = await authApi.checkIdNumber(idNumber);
      
      if (response.code === 200) {
        const isAvailable = response.data?.available === true;
        console.log('身份证是否可用:', isAvailable);
        
        setValidation(prev => ({
          ...prev,
          idNumber: { checked: true, available: isAvailable }
        }));
        
        if (isAvailable) {
          // 保存姓名和身份证到注册数据
          setRegisterData(prev => ({
            ...prev,
            name,
            idNumber
          }));
          
          message.success('身份信息验证通过');
          return true;
        } else {
          message.error('身份证已被注册');
          return false;
        }
      } else {
        message.error(response.message || '验证失败');
        return false;
      }
    } catch (error: any) {
      console.error('检查身份证失败:', error);
      message.error(error.message || '网络错误，请稍后重试');
      return false;
    }
  };

  // 验证当前步骤的字段
  const validateCurrentStep = async (): Promise<boolean> => {
    const stepFields = currentStep === 0 ? ['username', 'phone'] :
                     currentStep === 1 ? ['name', 'idNumber'] :
                     ['password', 'confirmPassword', 'agreement'];

    try {
      await form.validateFields(stepFields);
      return true;
    } catch (error: any) {
      console.log('表单验证失败:', error);
      return false;
    }
  };

  // 处理下一步按钮点击
  const handleNextStep = async () => {
    console.log('handleNextStep 调用，当前步骤:', currentStep);
    
    // 验证表单字段
    const isValid = await validateCurrentStep();
    if (!isValid) {
      message.warning('请完善当前步骤的信息');
      return;
    }

    setStepLoading(true);

    // 第一步：验证用户名和手机号
    if (currentStep === 0) {
      console.log('第一步验证开始...');
      
      const username = form.getFieldValue('username');
      const phone = form.getFieldValue('phone');
      
      // 保存当前步骤的数据
      setRegisterData(prev => ({
        ...prev,
        username,
        phone
      }));
      
      try {
        // 验证用户名
        const usernameValid = await checkUsername(username);
        console.log('用户名验证结果:', usernameValid);
        if (!usernameValid) {
          setStepLoading(false);
          return;
        }

        // 验证手机号
        const phoneValid = await checkPhone(phone);
        console.log('手机号验证结果:', phoneValid);
        if (!phoneValid) {
          setStepLoading(false);
          return;
        }

        console.log('所有验证通过，跳转到下一步');
        setCurrentStep(1);
      } finally {
        setStepLoading(false);
      }
      return;
    }

    // 第二步：验证身份证信息
    if (currentStep === 1) {
      console.log('第二步验证开始...');
      
      const name = form.getFieldValue('name');
      const idNumber = form.getFieldValue('idNumber');
      
      try {
        // 验证身份证
        const idNumberValid = await checkIdNumber(idNumber, name);
        console.log('身份证验证结果:', idNumberValid);
        if (!idNumberValid) {
          return;
        }

        console.log('身份证验证通过，跳转到下一步');
        setCurrentStep(2);
      } finally {
        setStepLoading(false);
      }
      return;
    }

    // 第三步直接提交
    if (currentStep === 2) {
      console.log('第三步，提交注册');
      handleSubmit();
      setStepLoading(false);
    }
  };

  // 处理上一步
  const handlePrevStep = () => {
    console.log('上一步，当前步骤:', currentStep, '->', currentStep - 1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 提交注册
  // 修改 handleSubmit 函数
const handleSubmit = async () => {
  console.log('开始提交注册...');
  
  // 检查协议
  const agreement = form.getFieldValue('agreement');
  if (!agreement) {
    message.error('请阅读并同意注册协议');
    return;
  }

  // 先验证密码字段
  try {
    await form.validateFields(['password', 'confirmPassword', 'agreement']);
  } catch (error) {
    console.log('密码验证失败:', error);
    return;
  }

  // 获取密码
  const password = form.getFieldValue('password');
  const confirmPassword = form.getFieldValue('confirmPassword');
  
  if (password !== confirmPassword) {
    message.error('两次输入的密码不一致');
    return;
  }

  // 检查所有验证是否通过
  console.log('验证状态检查:', {
    username: validation.username.available,
    phone: validation.phone.available,
    idNumber: validation.idNumber.available
  });
  
  if (!validation.username.available || 
      !validation.phone.available || 
      !validation.idNumber.available) {
    message.error('请完成所有验证步骤');
    return;
  }

  // 构建完整的注册数据 - 直接使用所有已保存的数据和当前密码
  const finalData: RegisterRequest = {
    username: registerData.username || form.getFieldValue('username') || '',
    phone: registerData.phone || form.getFieldValue('phone') || '',
    password: password,
    name: registerData.name || form.getFieldValue('name') || '',
    idNumber: registerData.idNumber || form.getFieldValue('idNumber') || ''
  };

  console.log('最终注册数据:', finalData);

  // 验证所有必需字段
  const requiredFields = ['username', 'phone', 'password', 'name', 'idNumber'];
  const missingFields = requiredFields.filter(field => !finalData[field as keyof RegisterRequest]);
  
  if (missingFields.length > 0) {
    console.log('缺失字段:', missingFields);
    message.error(`请填写完整的注册信息，缺失：${missingFields.join(', ')}`);
    return;
  }

  setLoading(true);
  
  try {
    console.log('📤 发送注册请求:', JSON.stringify(finalData, null, 2));
    
    const response = await authApi.register(finalData);
    console.log('📥 收到注册响应:', response);
    
    if (response.code !== 200) {
      throw new Error(response.message || '注册失败');
    }
    
    message.success('注册成功！');
    message.info('请使用用户名登录系统');
    
    // 跳转到登录页面
    setTimeout(() => {
      navigate('/login');
    }, 1000);
    
  } catch (error: any) {
    console.error('❌ 注册失败:', error);
    
    let errorMessage = '注册失败，请稍后重试';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // 显示验证状态图标
  const renderValidationStatus = (checked: boolean, available: boolean, fieldName: string) => {
    if (!checked) return null;
    
    const Icon = available ? CheckCircleOutlined : CloseCircleOutlined;
    const color = available ? '#52c41a' : '#f5222d';
    const text = available ? '验证通过' : '验证失败';
    
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginTop: 4,
        color,
        fontSize: '14px'
      }}>
        <Icon style={{ marginRight: 4 }} />
        <span>{fieldName}{text}</span>
      </div>
    );
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

        <Steps 
          current={currentStep} 
          items={steps.map((step, index) => ({
            key: index,
            title: step.title,
            description: step.description
          }))}
          style={{ marginBottom: 40 }}
        />

        <Form
          form={form}
          name="register"
          layout="vertical"
          preserve={true}
          initialValues={{
            phone: '',
            username: '',
            name: '',
            idNumber: '',
            password: '',
            confirmPassword: '',
            agreement: false,
          }}
        >
          {currentStep === 0 && (
            <>
              <Alert
                message="第一步：填写基本信息"
                description="请填写用户名和手机号，点击下一步进行验证"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, message: '用户名至少3个字符' },
                      { max: 20, message: '用户名最多20个字符' },
                      { 
                        pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 
                        message: '用户名只能包含中文、字母、数字和下划线',
                      }
                    ]}
                    extra={renderValidationStatus(validation.username.checked, validation.username.available, '用户名')}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入用户名（3-20位）"
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { 
                        validator: (_, value) => {
                          const result = validatePhone(value);
                          return result ? Promise.resolve() : Promise.reject(new Error('请输入正确的手机号'));
                        }
                      }
                    ]}
                    extra={renderValidationStatus(validation.phone.checked, validation.phone.available, '手机号')}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="请输入11位手机号"
                      size="large"
                      maxLength={11}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 第一步验证状态提示 */}
              {validation.username.checked && validation.phone.checked && (
                <Alert
                  message="验证状态"
                  description={
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        {validation.username.available ? 
                          '✓ 用户名验证通过' : '✗ 用户名验证失败，请更换'}
                      </div>
                      <div>
                        {validation.phone.available ? 
                          '✓ 手机号验证通过' : '✗ 手机号验证失败，请更换'}
                      </div>
                    </div>
                  }
                  type={
                    validation.username.available && validation.phone.available ? 
                      "success" : "warning"
                  }
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}
            </>
          )}

          {currentStep === 1 && (
            <>
              <Alert
                message="第二步：填写身份信息"
                description="请填写真实姓名和身份证号码，点击下一步进行验证"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[
                      { required: true, message: '请输入姓名' },
                      { min: 2, message: '姓名至少2个字符' },
                      { max: 20, message: '姓名最多20个字符' },
                      { 
                        pattern: /^[\u4e00-\u9fa5a-zA-Z·\s]+$/, 
                        message: '姓名只能包含中文、字母和空格',
                      }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入真实姓名"
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="idNumber"
                    label="身份证号"
                    rules={[
                      { required: true, message: '请输入身份证号' },
                      { 
                        validator: (_, value) => {
                          const result = validateIdCard(value);
                          return result ? Promise.resolve() : Promise.reject(new Error('请输入正确的身份证号'));
                        }
                      }
                    ]}
                    extra={renderValidationStatus(validation.idNumber.checked, validation.idNumber.available, '身份证号')}
                  >
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="请输入18位身份证号"
                      size="large"
                      maxLength={18}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 第二步验证状态提示 */}
              {validation.idNumber.checked && (
                <Alert
                  message="验证状态"
                  description={
                    validation.idNumber.available ? 
                      '✓ 身份证验证通过' : '✗ 身份证验证失败，请检查'
                  }
                  type={validation.idNumber.available ? "success" : "warning"}
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <Alert
                message="第三步：设置安全信息"
                description="请设置登录密码并同意注册协议"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              {/* 注册信息预览 */}
              <Alert
                message="注册信息预览"
                description={
                  <div>
                    <div>用户名: {registerData.username || '未填写'}</div>
                    <div>手机号: {registerData.phone || '未填写'}</div>
                    <div>姓名: {registerData.name || '未填写'}</div>
                    <div>身份证: {registerData.idNumber || '未填写'}</div>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="登录密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码至少6位' },
                      { max: 15, message: '密码最多15位' },
                      { 
                        pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, 
                        message: '密码必须包含字母和数字',
                      }
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请输入密码（6-15位，包含字母和数字）"
                      size="large"
                      style={{ width: '100%' }}
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
                          } else {
                            return Promise.reject(new Error('两次输入的密码不一致'));
                          }
                        },
                      }),
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<SafetyOutlined />}
                      placeholder="请再次输入密码"
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

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
                    { 
                      required: true, 
                      message: '请阅读并同意注册协议',
                    },
                  ]}
                  style={{ marginTop: 12 }}
                >
                  <Checkbox>
                    我已阅读并同意《银行系统注册协议》
                  </Checkbox>
                </Form.Item>
              </div>

              {/* 所有验证状态总结 */}
              <Alert
                message="验证状态总结"
                description={
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      {validation.username.checked ? 
                        (validation.username.available ? 
                          '✓ 用户名验证通过' : '✗ 用户名验证失败') : 
                        '○ 用户名未验证'}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      {validation.phone.checked ? 
                        (validation.phone.available ? 
                          '✓ 手机号验证通过' : '✗ 手机号验证失败') : 
                        '○ 手机号未验证'}
                    </div>
                    <div>
                      {validation.idNumber.checked ? 
                        (validation.idNumber.available ? 
                          '✓ 身份证验证通过' : '✗ 身份证验证失败') : 
                        '○ 身份证未验证'}
                    </div>
                  </div>
                }
                type={
                  validation.username.available && 
                  validation.phone.available && 
                  validation.idNumber.available ? 
                    "success" : "warning"
                }
                showIcon
                style={{ marginBottom: 24 }}
              />
            </>
          )}

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {currentStep > 0 && (
                  <Button 
                    onClick={handlePrevStep}
                    icon={<ArrowLeftOutlined />}
                    style={{ marginRight: 8 }}
                  >
                    上一步
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="primary" 
                    onClick={handleNextStep}
                    loading={stepLoading}
                    style={{ minWidth: 120 }}
                  >
                    下一步
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={
                      !validation.username.available || 
                      !validation.phone.available || 
                      !validation.idNumber.available
                    }
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