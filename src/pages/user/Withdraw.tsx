// src/pages/user/Withdraw.tsx - 修复类型错误版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Typography,
  Steps,
  Select,
  Divider,
  Alert,
  Result,
  Descriptions,
  Space,
  Tooltip
} from 'antd';
import {
  SafetyOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { cardApi } from '../../api/card';
import { transactionApi } from '../../api/transaction';
import { formatCurrency } from '../../utils/formatter';
import { validateTransactionPassword } from '../../utils/validate';
import type { CardInfo } from '../../api/card';

const { Title, Text } = Typography;
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

const getCardStatusText = (card: CardInfo): string => {
  if (typeof card.status === 'string') {
    return card.status;
  }
  switch (card.status) {
    case 0: return '正常';
    case 1: return '挂失';
    case 2: return '冻结';
    case 3: return '已注销';
    default: return '未知';
  }
};

const Withdraw: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [withdrawData, setWithdrawData] = useState<any>(null);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 加载银行卡列表
  const loadCards = async () => {
    try {
      console.log('开始加载取款银行卡...');
      
      const response = await cardApi.getUserCards();
      console.log('银行卡API响应:', response);
      
      if (response.code === 200) {
        const cardsData = response.data?.cards || [];
        console.log('原始银行卡数据:', cardsData);
        
        // 使用辅助函数过滤正常状态的银行卡
        const availableCards = cardsData.filter(isCardNormal);
        
        console.log('过滤后的正常银行卡:', availableCards);
        console.log('银行卡数量:', availableCards.length);
        
        setCards(availableCards);
        
        if (availableCards.length > 0) {
          setSelectedCard(availableCards[0]);
          form.setFieldValue('cardId', availableCards[0].cardId);
          console.log('设置默认银行卡:', availableCards[0].cardId);
        }
        
        if (availableCards.length === 0) {
          message.warning('没有正常状态的银行卡可用于取款');
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
    loadCards();
  }, []);

  // 步骤配置
  const stepItems = [
    {
      title: '填写信息',
      description: '填写取款金额和密码'
    },
    {
      title: '确认信息',
      description: '确认取款信息'
    },
    {
      title: '完成',
      description: '取款成功'
    }
  ];

  // 第一步：提交表单
  const handleStep1Submit = async (values: any) => {
    if (!selectedCard) {
      message.error('请选择银行卡');
      return;
    }

    const amount = parseFloat(values.amount);
    if (amount <= 0) {
      message.error('取款金额必须大于0');
      return;
    }

    if (amount > selectedCard.availableBalance) {
      message.error('取款金额不能超过可用余额');
      return;
    }

    // 验证交易密码
    if (!validateTransactionPassword(values.cardPassword)) {
      message.error('交易密码必须是6位数字');
      return;
    }

    setWithdrawData(values);
    setCurrentStep(1);
  };

  // 第二步：确认并执行取款
  const handleConfirm = async () => {
    if (!withdrawData || !selectedCard) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('提交取款数据:', { 
        ...withdrawData, 
        cardPassword: '***',
        userId: user.userId || user.user_id 
      });

      const result = await transactionApi.withdraw({
        userId: user.userId || user.user_id,
        cardId: withdrawData.cardId,
        amount: parseFloat(withdrawData.amount),
        cardPassword: withdrawData.cardPassword,
        remark: withdrawData.remark || '活期取款'
      });

      console.log('取款API响应:', result);
      
      setTransactionResult(result.data || result);
      setCurrentStep(2);
      
      // 刷新银行卡列表
      loadCards();
      message.success('取款成功！');
    } catch (error: any) {
      console.error('取款失败:', error);
      
      let errorMsg = '取款失败，请稍后重试';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        if (error.message.includes('余额不足')) {
          errorMsg = '余额不足';
        } else if (error.message.includes('密码错误')) {
          errorMsg = '交易密码错误';
        } else if (error.message.includes('冻结')) {
          errorMsg = '银行卡已被冻结';
        } else {
          errorMsg = error.message;
        }
      }
      
      message.error(errorMsg);
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  // 银行卡选择器渲染
  const renderCardSelect = () => (
    <Select
      placeholder="请选择取款银行卡"
      onChange={(value) => {
        console.log('选择银行卡:', value);
        const card = cards.find(c => c.cardId === value);
        setSelectedCard(card || null);
      }}
      size="large"
      suffixIcon={<CreditCardOutlined />}
    >
      {cards.map(card => (
        <Option key={card.cardId} value={card.cardId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>{card.maskedCardId || ('**** **** **** ' + card.cardId.slice(-4))}</Text>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {getCardStatusText(card)}
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                余额: {formatCurrency(card.balance)}
              </Text>
              <div style={{ fontSize: 12, color: '#1890ff' }}>
                可用: {formatCurrency(card.availableBalance)}
              </div>
            </div>
          </div>
        </Option>
      ))}
    </Select>
  );

  // 密码输入框渲染
  const renderPasswordInput = () => (
    <Input
      placeholder="请输入6位数字交易密码"
      prefix={<SafetyOutlined />}
      suffix={
        <Tooltip title={showPassword ? "隐藏密码" : "显示密码"}>
          <Button
            type="text"
            size="small"
            icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setShowPassword(!showPassword)}
          />
        </Tooltip>
      }
      type={showPassword ? "text" : "password"}
      maxLength={6}
    />
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>活期取款</Title>
      <Text type="secondary" style={{ marginBottom: 32, display: 'block' }}>
        从您的银行卡中取出现金，实时到账。
      </Text>

      <Steps 
        current={currentStep} 
        items={stepItems}
        style={{ marginBottom: 48 }}
      />

      {/* 第一步：填写表单 */}
      {currentStep === 0 && (
        <Card>
          <Form
            form={form}
            name="withdraw"
            onFinish={handleStep1Submit}
            layout="vertical"
            size="large"
          >
            {/* 银行卡选择 */}
            <Form.Item
              name="cardId"
              label="选择银行卡"
              rules={[{ required: true, message: '请选择银行卡' }]}
            >
              {cards.length > 0 ? renderCardSelect() : (
                <Alert
                  message="没有可用银行卡"
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
                />
              )}
            </Form.Item>

            {/* 当前银行卡信息 */}
            {selectedCard && (
              <Alert
                message="当前银行卡信息"
                description={
                  <div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div>
                          <Text strong>卡号: </Text>
                          <Text>{selectedCard.maskedCardId || selectedCard.cardId}</Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text strong>状态: </Text>
                          <Text type="success">{getCardStatusText(selectedCard)}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <Text strong>总余额: </Text>
                          <Text type="warning">{formatCurrency(selectedCard.balance)}</Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text strong>可用余额: </Text>
                          <Text style={{ color: '#1890ff' }}>{formatCurrency(selectedCard.availableBalance)}</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {/* 取款金额 */}
            <Form.Item
              name="amount"
              label="取款金额"
              rules={[
                { required: true, message: '请输入取款金额' },
                { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const amount = parseFloat(value);
                    if (!amount || amount < 1) {
                      return Promise.reject('取款金额不能小于1元');
                    }
                    if (selectedCard && amount > selectedCard.availableBalance) {
                      return Promise.reject('取款金额不能超过可用余额');
                    }
                    if (amount > 100000) {
                      return Promise.reject('单笔取款不能超过10万元');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入取款金额"
                prefix="¥"
                size="large"
                formatter={value => ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  const str = value.replace(/¥\s?|(,*)/g, '');
                  const num = parseFloat(str);
                  return isNaN(num) ? 0 : num;
                }}
                min={1}
                max={selectedCard?.availableBalance || 100000}
              />
            </Form.Item>

            {/* 交易密码 */}
            <Form.Item
              name="cardPassword"
              label="交易密码"
              rules={[
                { required: true, message: '请输入交易密码' },
                { validator: (_, value) => 
                  validateTransactionPassword(value) 
                    ? Promise.resolve() 
                    : Promise.reject('交易密码必须是6位数字')
                }
              ]}
            >
              {renderPasswordInput()}
            </Form.Item>

            {/* 备注 */}
            <Form.Item
              name="remark"
              label="备注"
            >
              <Input.TextArea
                placeholder="请输入备注信息（可选）"
                rows={3}
                maxLength={100}
                showCount
              />
            </Form.Item>

            <Divider />

            {/* 提示信息 */}
            <Alert
              message="重要提示"
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>取款操作实时到账，请仔细核对信息</li>
                  <li>单笔取款金额不能超过银行卡可用余额</li>
                  <li>单笔取款限额为10万元</li>
                  <li>请确保在安全的环境下输入交易密码</li>
                  <li>如有疑问，请联系客服 400-123-4567</li>
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large"
                disabled={!selectedCard}
                icon={<BankOutlined />}
              >
                {selectedCard ? '下一步' : '请先选择银行卡'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 第二步：确认信息 */}
      {currentStep === 1 && withdrawData && selectedCard && (
        <Card>
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8, fontSize: 18 }} />
            <Title level={4} style={{ margin: 0 }}>取款信息确认</Title>
          </div>
          
          <Descriptions 
            column={1} 
            bordered 
            style={{ marginBottom: 24 }}
            labelStyle={{ width: '120px', fontWeight: 'bold' }}
          >
            <Descriptions.Item label="银行卡号">
              {selectedCard.maskedCardId || selectedCard.cardId}
            </Descriptions.Item>
            <Descriptions.Item label="当前余额">
              <Text style={{ color: '#faad14' }}>{formatCurrency(selectedCard.balance)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="可用余额">
              <Text style={{ color: '#1890ff' }}>{formatCurrency(selectedCard.availableBalance)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="取款金额">
              <Text strong style={{ color: '#ff4d4f', fontSize: 20 }}>
                -{formatCurrency(parseFloat(withdrawData.amount))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="取款后余额">
              <Text strong style={{ color: '#52c41a', fontSize: 18 }}>
                {formatCurrency(selectedCard.availableBalance - parseFloat(withdrawData.amount))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="备注">
              {withdrawData.remark || '无'}
            </Descriptions.Item>
          </Descriptions>

          <Alert
            message="请确认取款信息"
            description="确认无误后，点击确认按钮完成取款操作。操作完成后资金将实时从您的账户扣除。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Button 
                onClick={() => setCurrentStep(0)}
                block
                size="large"
              >
                返回修改
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                type="primary" 
                onClick={handleConfirm}
                loading={loading}
                block
                size="large"
                icon={<BankOutlined />}
              >
                {loading ? '处理中...' : '确认取款'}
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 第三步：完成 */}
      {currentStep === 2 && transactionResult && (
        <Card>
          <Result
            status="success"
            title="取款成功！"
            subTitle="您的取款操作已成功完成，资金已实时从您的账户扣除。"
            icon={<CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />}
            extra={[
              <Button 
                key="detail" 
                onClick={() => window.location.href = '/transactions'}
                icon={<EyeOutlined />}
              >
                查看交易记录
              </Button>,
              <Button 
                key="again" 
                type="primary" 
                onClick={() => {
                  form.resetFields();
                  setWithdrawData(null);
                  setTransactionResult(null);
                  setCurrentStep(0);
                  loadCards();
                }}
                icon={<BankOutlined />}
              >
                继续取款
              </Button>
            ]}
          >
            <div style={{ textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
              <Descriptions 
                title="取款详情" 
                column={1}
                bordered
                size="small"
              >
                <Descriptions.Item label="交易流水号">
                  {transactionResult.transNo || transactionResult.transId || transactionResult.trans_id}
                </Descriptions.Item>
                <Descriptions.Item label="银行卡号">
                  {selectedCard?.maskedCardId || selectedCard?.cardId}
                </Descriptions.Item>
                <Descriptions.Item label="取款金额">
                  <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>
                    -{formatCurrency(transactionResult.amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="交易后余额">
                  {formatCurrency(transactionResult.balanceAfter || transactionResult.balance_after)}
                </Descriptions.Item>
                <Descriptions.Item label="交易时间">
                  {new Date(transactionResult.transactionTime || transactionResult.time).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  {transactionResult.remark || '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Result>
        </Card>
      )}

      {/* 调试信息（开发环境可用）
      {import.meta.env?.MODE === 'development' && (
        <Alert
          type="info"
          message="调试信息"
          description={
            <div>
              <div>当前步骤: {currentStep}</div>
              <div>银行卡数量: {cards.length}</div>
              <div>选中银行卡: {selectedCard?.cardId || '无'}</div>
              <div>取款数据: {withdrawData ? JSON.stringify(withdrawData) : '无'}</div>
            </div>
          }
          style={{ marginTop: 24 }}
        />
      )} */}
    </div>
  );
};

export default Withdraw;