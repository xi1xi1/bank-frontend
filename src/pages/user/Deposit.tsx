// src/pages/user/Deposit.tsx - 修复版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Alert,
  Steps,
  Result,
  Descriptions,
  message,
  Statistic
} from 'antd';
import {
  CreditCardOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { transactionApi } from '../../api/transaction';
import { cardApi } from '../../api/card';
import { formatCurrency } from '../../utils/formatter';
import type { CardInfo } from '../../api/card';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 银行卡状态判断辅助函数
const isCardNormal = (card: CardInfo): boolean => {
  if (typeof card.status === 'string') {
    return card.status === '正常';
  } else if (typeof card.status === 'number') {
    return card.status === 0;
  }
  return false;
};

const isCardFrozen = (card: CardInfo): boolean => {
  if (typeof card.status === 'string') {
    return card.status === '冻结';
  } else if (typeof card.status === 'number') {
    return card.status === 2;
  }
  return false;
};

const Deposit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [step, setStep] = useState(0);
  const [depositResult, setDepositResult] = useState<any>(null);

  const loadUserCards = async () => {
    try {
      console.log('开始加载银行卡...');
      
      const response = await cardApi.getUserCards();
      
      console.log('银行卡API响应:', response);
      
      if (response.code === 200) {
        const cardsData = response.data?.cards || [];
        console.log('原始银行卡数据:', cardsData);
        
        // 使用辅助函数过滤正常状态的银行卡
        const activeCards = cardsData.filter(isCardNormal);
        
        console.log('过滤后的正常银行卡:', activeCards);
        console.log('银行卡数量:', activeCards.length);
        
        setCards(activeCards);
        
        if (activeCards.length > 0 && !form.getFieldValue('cardId')) {
          form.setFieldsValue({
            cardId: activeCards[0].cardId,
            cardPassword: ''
          });
          console.log('设置默认银行卡:', activeCards[0].cardId);
        }
        
        if (activeCards.length === 0) {
          message.warning('没有正常状态的银行卡可用于存款');
        }
      } else {
        message.error(response.message || '加载银行卡失败');
      }
    } catch (error) {
      console.error('加载银行卡失败:', error);
      message.error('加载银行卡失败');
    }
  };

  useEffect(() => {
    loadUserCards();
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setStep(1);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // ✅ 使用驼峰式
      const depositData = {
        userId: user.userId || user.user_id, // 根据实际字段名
        cardId: values.cardId,
        amount: values.amount,
        cardPassword: values.cardPassword,
        remark: values.remark || '活期存款'
      };

      console.log('提交存款数据:', { ...depositData, cardPassword: '***' });

      const response = await transactionApi.deposit(depositData);
      const result = response.data || response;
      setDepositResult(result);
      setStep(2);
      
      // 重新加载银行卡列表以更新余额
      loadUserCards();
      message.success('存款成功！');
    } catch (error: any) {
      console.error('存款失败:', error);
      setStep(0);
      message.error(`存款失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  // 步骤配置
  const stepItems = [
    {
      title: '填写信息',
      icon: <CreditCardOutlined />
    },
    {
      title: '确认存款',
      icon: <SafetyOutlined />
    },
    {
      title: '完成',
      icon: <CheckCircleOutlined />
    }
  ];

  // 步骤内容
  const stepContents = [
    {
      title: '存款',
      content: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600, margin: '0 auto' }}
        >
          <Alert
            message="存款说明"
            description="单笔存款最高金额为 1,000,000 元，最低金额为 1 元。存款立即到账。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item
            label="选择银行卡"
            name="cardId"
            rules={[{ required: true, message: '请选择银行卡' }]}
          >
            <Select
              placeholder="请选择银行卡"
              suffixIcon={<CreditCardOutlined />}
              loading={cards.length === 0}
              onChange={(value) => {
                console.log('选择银行卡:', value);
              }}
            >
              {cards.map(card => (
                <Option key={card.cardId} value={card.cardId}>
                  <Space>
                    <Text strong>{card.maskedCardId || ('**** **** **** ' + card.cardId.slice(-4))}</Text>
                    <Text type="secondary">余额: {formatCurrency(card.balance)}</Text>
                    {isCardFrozen(card) && <Text type="danger">(已冻结)</Text>}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 调试信息 */}
          {cards.length === 0 && (
            <Alert
              message="没有找到可用银行卡"
              description={
                <div>
                  <p>可能的原因：</p>
                  <ul>
                    <li>您还没有绑定银行卡</li>
                    <li>所有银行卡都处于冻结或挂失状态</li>
                    <li>网络连接问题</li>
                  </ul>
                  <Button 
                    type="link" 
                    onClick={() => window.location.href = '/cards/add'}
                  >
                    去绑定银行卡
                  </Button>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item
            label="存款金额"
            name="amount"
            rules={[
              { required: true, message: '请输入存款金额' },
              { type: 'number', min: 1, message: '存款金额必须大于0' },
              { type: 'number', max: 1000000, message: '单笔存款不能超过100万元' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入存款金额"
              prefix="¥"
              size="large"
              formatter={value => ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="交易密码"
            name="cardPassword"
            rules={[
              { required: true, message: '请输入交易密码' },
              { min: 6, message: '密码长度至少6位' }
            ]}
          >
            <Input.Password
              placeholder="请输入银行卡交易密码"
              size="large"
              prefix={<SafetyOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <Input.TextArea
              placeholder="可选，请输入存款备注"
              rows={2}
              maxLength={100}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="存款信息">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="单笔限额">
                    ¥1 - 1,000,000
                  </Descriptions.Item>
                  <Descriptions.Item label="到账时间">
                    实时到账
                  </Descriptions.Item>
                  <Descriptions.Item label="手续费">
                    免费
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="可用余额">
                <Statistic
                  value={cards.find(c => c.cardId === form.getFieldValue('cardId'))?.balance || 0}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              icon={<ArrowUpOutlined />}
              disabled={cards.length === 0}
            >
              {cards.length === 0 ? '无可用的银行卡' : '确认存款'}
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      title: '确认存款',
      content: (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <LoadingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 24 }} />
          <Title level={4}>正在处理存款...</Title>
          <Text type="secondary">请稍候，系统正在处理您的存款请求</Text>
        </div>
      )
    },
    {
      title: '存款完成',
      content: depositResult ? (
        <Result
          status="success"
          title="存款成功！"
          subTitle={`您的存款操作已成功完成，资金已实时到账。`}
          extra={[
            <Button type="primary" key="again" onClick={() => {
              setStep(0);
              form.resetFields();
              setDepositResult(null);
            }}>
              继续存款
            </Button>,
            <Button key="view" onClick={() => window.location.href = '/transactions'}>
              查看交易记录
            </Button>
          ]}
        >
          <Card style={{ marginTop: 24 }}>
            <Descriptions title="存款详情" column={1}>
              <Descriptions.Item label="交易流水号">
                {depositResult.transNo || depositResult.transId || depositResult.trans_id}
              </Descriptions.Item>
              <Descriptions.Item label="存款金额">
                <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                  +{formatCurrency(depositResult.amount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="存款后余额">
                {formatCurrency(depositResult.balanceAfter || depositResult.balance_after)}
              </Descriptions.Item>
              <Descriptions.Item label="存款时间">
                {new Date(depositResult.transactionTime || depositResult.time).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                {depositResult.remark || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Result>
      ) : null
    }
  ];

  return (
    <div>
      <Title level={3}>活期存款</Title>
      <Paragraph type="secondary">
        将资金存入您的银行账户，实时到账，随时可取。
      </Paragraph>

      <Steps 
        current={step} 
        items={stepItems}
        style={{ margin: '40px 0' }}
      />

      <div style={{ minHeight: 400 }}>
        {stepContents[step].content}
      </div>
    </div>
  );
};

export default Deposit;