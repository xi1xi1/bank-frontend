// src/pages/user/AddCard.tsx
import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Steps,
  Result,
  Alert,
  message,
  Space,
  Row,
  Col,
  Divider,
  Descriptions
} from 'antd';
import {
  CreditCardOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  InfoCircleOutlined,
  BugOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cardApi } from '../../api/card';
import { validators, cleanIdNumber, cleanName, validateBindCardForm } from '../../utils/validate';
import { maskCardNumber } from '../../utils/formatter';

const { Title, Text } = Typography;

interface AddCardFormData {
  cardId: string;        // 修改：使用 camelCase，与后端DTO一致
  cardPassword: string;  // 修改：使用 camelCase，与后端DTO一致
  name: string;
  idNumber: string;      // 修改：使用 camelCase，与后端DTO一致
}

const AddCard: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  
  // 从 localStorage 获取用户信息
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 表单验证规则 - 字段名已修改为与后端一致
  const formRules = {
    cardId: [
      { required: true, message: '请输入银行卡号' },
      {
        validator: (_: any, value: string) => {
          const error = validators.cardId(value);
          if (error) {
            return Promise.reject(new Error(error));
          }
          return Promise.resolve();
        }
      }
    ],
    cardPassword: [
      { required: true, message: '请输入交易密码' },
      {
        validator: (_: any, value: string) => {
          const error = validators.cardPassword(value);
          if (error) {
            return Promise.reject(new Error(error));
          }
          return Promise.resolve();
        }
      }
    ],
    name: [
      { required: true, message: '请输入持卡人姓名' },
      {
        validator: (_: any, value: string) => {
          const cleanedValue = cleanName(value);
          if (!cleanedValue || cleanedValue.length < 2 || cleanedValue.length > 20) {
            return Promise.reject(new Error('姓名长度应为2-20个字符'));
          }
          if (!/^[\u4e00-\u9fa5a-zA-Z\s·.\u00b7\u2022\u2027]+$/u.test(cleanedValue)) {
            return Promise.reject(new Error('姓名只能包含中文、英文、空格和点号'));
          }
          return Promise.resolve();
        }
      }
    ],
    idNumber: [
      { required: true, message: '请输入身份证号' },
      {
        validator: (_: any, value: string) => {
          const cleanedValue = cleanIdNumber(value);
          if (!cleanedValue || cleanedValue.length !== 18) {
            return Promise.reject(new Error('身份证号必须为18位'));
          }
          if (!/^\d{17}[\dX]$/.test(cleanedValue)) {
            return Promise.reject(new Error('身份证号格式不正确（前17位数字，最后一位数字或X）'));
          }
          return Promise.resolve();
        }
      }
    ]
  };

  const handleSubmit = async (values: AddCardFormData) => {
    console.log('=== 表单提交开始 ===');
    console.log('表单原始值:', values);
    
    // 清理数据
    const cleanedValues = {
      ...values,
      idNumber: cleanIdNumber(values.idNumber),
      name: cleanName(values.name)
    };
    
    console.log('清理后值:', cleanedValues);
    
    // 手动验证 - 注意字段名映射
    const validationResult = validateBindCardForm({
      card_id: cleanedValues.cardId,          // 映射到验证函数期望的字段名
      card_password: cleanedValues.cardPassword,
      name: cleanedValues.name,
      id_number: cleanedValues.idNumber
    });
    
    console.log('验证结果:', validationResult);
    
    // 将验证错误映射回表单字段名
    const mappedErrors: Record<string, string> = {};
    if (validationResult.errors.card_id) mappedErrors.cardId = validationResult.errors.card_id;
    if (validationResult.errors.card_password) mappedErrors.cardPassword = validationResult.errors.card_password;
    if (validationResult.errors.name) mappedErrors.name = validationResult.errors.name;
    if (validationResult.errors.id_number) mappedErrors.idNumber = validationResult.errors.id_number;
    
    setFormErrors(mappedErrors);
    
    if (!validationResult.isValid) {
      message.error('请检查表单错误');
      return;
    }
    
    setLoading(true);
    try {
      // 准备请求数据 - 字段名已经和后端DTO一致
      const requestData = {
        user_id: user.user_id,
        cardId: cleanedValues.cardId,
        cardPassword: cleanedValues.cardPassword,
        name: cleanedValues.name,
        idNumber: cleanedValues.idNumber
      };

      console.log('提交到API的数据:', {
        ...requestData,
        cardPassword: '******'
      });

      const response = await cardApi.bindCard(requestData);
      
      console.log('API响应:', response);
      
      if (response.code === 200) {
        setCardInfo(response.data);
        setStep(1);
        message.success('银行卡绑定成功！');
      } else {
        message.error(response.message || '绑定失败');
      }
    } catch (error: any) {
      console.error('绑定银行卡失败:', error);
      
      // 显示详细的错误信息
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = errors.map((e: any) => e.defaultMessage).join(', ');
        message.error(`验证失败: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        message.error(`绑定失败: ${error.response.data.message}`);
      } else {
        message.error(`绑定失败: ${error.message || '请重试'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      navigate('/cards');
    } else {
      setStep(0);
      form.resetFields();
      setCardInfo(null);
      setFormErrors({});
    }
  };

  // 调试验证
  const handleDebugValidation = () => {
    const values = form.getFieldsValue();
    console.log('=== 手动验证调试 ===');
    console.log('表单原始值:', values);
    
    const cleanedValues = {
      ...values,
      idNumber: cleanIdNumber(values.idNumber),
      name: cleanName(values.name)
    };
    
    console.log('清理后值:', cleanedValues);
    
    // 执行验证
    const validationResult = validateBindCardForm({
      card_id: cleanedValues.cardId,
      card_password: cleanedValues.cardPassword,
      name: cleanedValues.name,
      id_number: cleanedValues.idNumber
    });
    
    console.log('验证结果:', validationResult);
    
    if (validationResult.isValid) {
      message.success('验证通过！可以提交');
    } else {
      message.error('验证失败，请查看控制台');
      
      // 映射错误
      const mappedErrors: Record<string, string> = {};
      if (validationResult.errors.card_id) mappedErrors.cardId = validationResult.errors.card_id;
      if (validationResult.errors.card_password) mappedErrors.cardPassword = validationResult.errors.card_password;
      if (validationResult.errors.name) mappedErrors.name = validationResult.errors.name;
      if (validationResult.errors.id_number) mappedErrors.idNumber = validationResult.errors.id_number;
      
      setFormErrors(mappedErrors);
    }
  };

  // 步骤配置
  const stepItems = [
    {
      title: '填写信息',
      description: '输入银行卡信息'
    },
    {
      title: '绑定成功',
      description: '完成绑定'
    }
  ];

  // 渲染第一步：填写表单
  const renderStep1 = () => (
    <Card>
      {/* 顶部说明 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <BankOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        <Title level={4}>添加银行卡</Title>
        <Text type="secondary">请填写银行卡信息进行绑定</Text>
      </div>

      <Alert
        message="重要提示"
        description={
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>请确保姓名和身份证号与银行预留信息一致</li>
            <li>银行卡号必须是12位数字</li>
            <li>交易密码为6位数字，用于取款和转账</li>
            <li>身份证号必须是18位，最后一位可以是数字或X</li>
            <li>姓名可以是中文或英文，可包含空格和点号</li>
          </ul>
        }
        type="warning"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields }) => {
          console.log('表单验证失败:', errorFields);
          const errors: Record<string, string> = {};
          errorFields.forEach(({ name, errors: errs }) => {
            if (errs.length > 0) {
              const fieldName = name[0] as string;
              errors[fieldName] = errs[0];
            }
          });
          setFormErrors(errors);
        }}
        onValuesChange={() => {
          // 清除已显示的错误
          setFormErrors({});
        }}
        size="large"
      >
        {/* 银行卡号 - 字段名改为 cardId */}
        <Form.Item
          label="银行卡号"
          name="cardId"
          rules={formRules.cardId}
          validateStatus={formErrors.cardId ? 'error' : ''}
          help={formErrors.cardId}
          extra="请输入12位银行卡号"
        >
          <Input
            placeholder="请输入12位银行卡号"
            prefix={<CreditCardOutlined style={{ color: '#999' }} />}
            maxLength={12}
            autoComplete="off"
            onChange={(e) => {
              // 只允许输入数字
              const value = e.target.value.replace(/\D/g, '');
              form.setFieldValue('cardId', value);
              if (formErrors.cardId) {
                setFormErrors(prev => ({ ...prev, cardId: '' }));
              }
            }}
          />
        </Form.Item>

        {/* 交易密码 - 字段名改为 cardPassword */}
        <Form.Item
          label="交易密码"
          name="cardPassword"
          rules={formRules.cardPassword}
          validateStatus={formErrors.cardPassword ? 'error' : ''}
          help={formErrors.cardPassword}
          extra="请输入6位数字交易密码"
        >
          <Input.Password
            placeholder="请输入6位数字交易密码"
            prefix={<SafetyOutlined style={{ color: '#999' }} />}
            maxLength={6}
            autoComplete="new-password"
            onChange={(e) => {
              // 只允许输入数字
              const value = e.target.value.replace(/\D/g, '');
              form.setFieldValue('cardPassword', value);
              if (formErrors.cardPassword) {
                setFormErrors(prev => ({ ...prev, cardPassword: '' }));
              }
            }}
          />
        </Form.Item>

        <Divider>身份验证</Divider>

        {/* 姓名 */}
        <Form.Item
          label="持卡人姓名"
          name="name"
          rules={formRules.name}
          validateStatus={formErrors.name ? 'error' : ''}
          help={formErrors.name}
          extra="请输入与银行卡预留一致的姓名（中文或英文）"
        >
          <Input
            placeholder="请输入持卡人真实姓名"
            prefix={<UserOutlined style={{ color: '#999' }} />}
            maxLength={20}
            onChange={() => {
              if (formErrors.name) {
                setFormErrors(prev => ({ ...prev, name: '' }));
              }
            }}
          />
        </Form.Item>

        {/* 身份证号 - 字段名改为 idNumber */}
        <Form.Item
          label="身份证号"
          name="idNumber"
          rules={formRules.idNumber}
          validateStatus={formErrors.idNumber ? 'error' : ''}
          help={formErrors.idNumber}
          extra="请输入18位身份证号，最后一位可以是数字或X"
        >
          <Input
            placeholder="请输入身份证号"
            prefix={<IdcardOutlined style={{ color: '#999' }} />}
            maxLength={18}
            onChange={(e) => {
              // 自动将最后一位x转为X
              let value = e.target.value.toUpperCase();
              // 只允许数字和X
              value = value.replace(/[^0-9X]/g, '');
              form.setFieldValue('idNumber', value);
              if (formErrors.idNumber) {
                setFormErrors(prev => ({ ...prev, idNumber: '' }));
              }
            }}
          />
        </Form.Item>

        
        

        {/* 调试和操作按钮 */}
        <Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              {/* <Button
                onClick={handleDebugValidation}
                block
                size="large"
                icon={<BugOutlined />}
                type="dashed"
              >
                调试验证
              </Button> */}
            </Col>
            <Col span={8}>
              <Button
                onClick={handleBack}
                block
                size="large"
                icon={<ArrowLeftOutlined />}
              >
                返回
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                {loading ? '绑定中...' : '确认绑定'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );

  // 渲染第二步：成功页面
  const renderStep2 = () => (
    <Card>
      <Result
        status="success"
        title="银行卡绑定成功！"
        subTitle="您的银行卡已成功绑定到账户"
        icon={<CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />}
        extra={[
          <Button 
            type="primary" 
            key="cards" 
            onClick={() => navigate('/cards')}
            icon={<CreditCardOutlined />}
          >
            查看所有银行卡
          </Button>,
          <Button 
            key="deposit" 
            onClick={() => navigate('/deposit')}
            icon={<BankOutlined />}
          >
            立即存款
          </Button>,
          <Button 
            key="addMore" 
            onClick={handleBack}
          >
            继续绑定
          </Button>
        ]}
      >
        {cardInfo && (
          <Card 
            type="inner" 
            title="银行卡信息" 
            style={{ maxWidth: 400, margin: '0 auto' }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="银行卡号">
                {maskCardNumber(cardInfo.cardId)}
              </Descriptions.Item>
              <Descriptions.Item label="卡类型">
                {cardInfo.cardType || '储蓄卡'}
              </Descriptions.Item>
              <Descriptions.Item label="当前余额">
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  ¥{cardInfo.balance?.toFixed(2) || '0.00'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="可用余额">
                ¥{cardInfo.availableBalance?.toFixed(2) || '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="卡片状态">
                <Text type="success">{cardInfo.status || '正常'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="绑定时间">
                {new Date(cardInfo.bindTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="日限额">
                ¥{(cardInfo.dailyLimit || 50000).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="月限额">
                ¥{(cardInfo.monthlyLimit || 200000).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Result>
    </Card>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      <Steps 
        current={step} 
        items={stepItems}
        style={{ marginBottom: 40 }}
      />

      {/* 步骤内容 */}
      <div style={{ minHeight: 400 }}>
        {step === 0 ? renderStep1() : renderStep2()}
      </div>
      
    </div>
  );
};

export default AddCard;