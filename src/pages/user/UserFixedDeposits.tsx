// src/pages/user/UserFixedDeposits.tsx - 完整修复版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Space,
  Tag,
  Typography,
  message,
  Descriptions,
  Divider,
  Row,
  Col,
  Tooltip,
  Alert,
  Statistic,
  Empty,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  ClockCircleOutlined,
  BankOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  DollarOutlined
} from '@ant-design/icons';
import api from '../../utils/request';
import { formatCurrency, formatDateTime } from '../../utils/formatter';
import { TERM_OPTIONS } from '../../utils/constants';
import type { CardInfo } from '../../api/card';

const { Title, Text } = Typography;
const { Option } = Select;

interface FixedDeposit {
  fdId: number;
  fdNo: string;
  cardId: string;
  principal: number;
  rate: number;
  term: number;
  startTime: string;
  endTime: string;
  autoRenew: boolean;
  status: number;
  createdTime: string;
  userId?: string;
  expectedInterest?: number;
  interestAmount?: number;
}

const UserFixedDeposits: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<FixedDeposit[]>([]);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<FixedDeposit | null>(null);
  const [withdrawType, setWithdrawType] = useState<'early' | 'mature'>('mature');
  const [form] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  // 加载定期存款列表
  const loadDeposits = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fixed-deposits/my');
      
      console.log('定期存款API响应:', response);
      
      if (response.code === 200) {
        const depositsData = response.data || [];
        setDeposits(depositsData);
      } else {
        message.error(response.message || '加载定期存款失败');
      }
    } catch (error: any) {
      console.error('加载定期存款失败:', error);
      message.error(error.message || '加载定期存款失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载用户银行卡
  const loadUserCards = async () => {
    try {
      const response = await api.get('/cards/my');
      
      if (response.code === 200) {
        const cardsData = response.data?.cards || [];
        
        // 过滤出状态正常的银行卡
        const activeCards = cardsData.filter((card: CardInfo) => {
          if (typeof card.status === 'string') {
            return card.status === '正常';
          } else if (typeof card.status === 'number') {
            return card.status === 0;
          }
          return false;
        });
        
        setCards(activeCards);
        
        // 如果有正常银行卡，设置默认值
        if (activeCards.length > 0 && !form.getFieldValue('cardId')) {
          const defaultCard = activeCards[0];
          form.setFieldsValue({
            cardId: defaultCard.cardId,
            principal: 1000
          });
        }
      }
    } catch (error) {
      console.error('加载银行卡失败:', error);
    }
  };

  useEffect(() => {
    loadDeposits();
    loadUserCards();
  }, []);

  // 计算预期利息
  const calculateExpectedInterest = (principal: number, rate: number, term: number) => {
    return principal * rate * (term / 12);
  };

  // 处理创建定期存款
  const handleCreateDeposit = async (values: any) => {
    try {
      // 验证选择的银行卡
      const selectedCard = cards.find(card => card.cardId === values.cardId);
      if (!selectedCard) {
        message.error('请选择有效的银行卡');
        return;
      }

      // 验证余额是否足够
      if (values.principal > selectedCard.availableBalance) {
        message.error(`存款金额不能超过可用余额 ${formatCurrency(selectedCard.availableBalance)}`);
        return;
      }

      // 最小金额检查
      if (values.principal < 1000) {
        message.error('定期存款最小金额为1000元');
        return;
      }

      const response = await api.post('/fixed-deposits/create', {
        cardId: values.cardId,
        principal: values.principal,
        term: values.term,
        cardPassword: values.cardPassword,
        autoRenew: values.autoRenew
      });
      
      if (response.code === 200) {
        message.success('定期存款创建成功');
        setModalVisible(false);
        form.resetFields();
        loadDeposits(); // 重新加载列表
        loadUserCards(); // 重新加载银行卡余额
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (error: any) {
      console.error('创建定期存款失败:', error);
      message.error(error.response?.data?.message || error.message || '创建失败');
    }
  };

  // 查看详情
  const handleViewDetail = (deposit: FixedDeposit) => {
    setSelectedDeposit(deposit);
    setDetailModalVisible(true);
  };

  // 打开支取模态框
  const handleOpenWithdraw = (deposit: FixedDeposit, type: 'early' | 'mature') => {
    setSelectedDeposit(deposit);
    setWithdrawType(type);
    setWithdrawModalVisible(true);
    withdrawForm.resetFields();
  };

  // 执行支取操作
  const handleWithdraw = async (values: any) => {
    if (!selectedDeposit) return;

    try {
      let response;
      if (withdrawType === 'early') {
        response = await api.post(`/fixed-deposits/${selectedDeposit.fdId}/early-withdraw`, {
          cardPassword: values.cardPassword
        });
      } else {
        response = await api.post(`/fixed-deposits/${selectedDeposit.fdId}/mature`, {
          cardPassword: values.cardPassword
        });
      }

      if (response.code === 200) {
        message.success(withdrawType === 'early' ? '提前支取成功' : '到期转出成功');
        setWithdrawModalVisible(false);
        loadDeposits();
        loadUserCards();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error: any) {
      console.error('支取操作失败:', error);
      message.error(error.response?.data?.message || error.message || '操作失败');
    }
  };

  // 计算剩余天数
  const calculateDaysLeft = (endTime: string) => {
    const endDate = new Date(endTime);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 状态标签
  const getStatusTag = (status: number, endTime: string) => {
    const statusMap: Record<number, { color: string; text: string; icon?: React.ReactNode }> = {
      0: { color: 'processing', text: '持有中', icon: <ClockCircleOutlined /> },
      1: { color: 'warning', text: '已到期', icon: <ExclamationCircleOutlined /> },
      2: { color: 'default', text: '已支取', icon: <CheckCircleOutlined /> },
      3: { color: 'success', text: '已转出', icon: <CheckCircleOutlined /> }
    };
    
    const config = statusMap[status] || { color: 'default', text: '未知' };
    
    let tagText = config.text;
    if (status === 0) {
      const daysLeft = calculateDaysLeft(endTime);
      if (daysLeft > 0) {
        tagText = `${config.text} (${daysLeft}天)`;
      } else {
        tagText = '已到期';
      }
    }
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {tagText}
      </Tag>
    );
  };

  // 计算统计信息
  const calculateStats = () => {
    const totalPrincipal = deposits.reduce((sum, deposit) => sum + deposit.principal, 0);
    const totalExpectedInterest = deposits.reduce((sum, deposit) => {
      if (deposit.status === 0 || deposit.status === 1) {
        return sum + calculateExpectedInterest(deposit.principal, deposit.rate, deposit.term);
      }
      return sum;
    }, 0);
    const activeDeposits = deposits.filter(deposit => deposit.status === 0);
    const maturedDeposits = deposits.filter(deposit => deposit.status === 1);

    return {
      totalPrincipal,
      totalExpectedInterest,
      activeCount: activeDeposits.length,
      maturedCount: maturedDeposits.length,
      totalCount: deposits.length
    };
  };

  const stats = calculateStats();

  const columns = [
    {
      title: '存单编号',
      dataIndex: 'fdNo',
      key: 'fdNo',
      width: 150,
      render: (fdNo: string) => <Text code>{fdNo}</Text>
    },
    {
      title: '银行卡号',
      dataIndex: 'cardId',
      key: 'cardId',
      width: 140,
      render: (cardId: string) => {
        const masked = cardId.substring(0, 6) + '******' + cardId.substring(10);
        return <Text>{masked}</Text>;
      }
    },
    {
      title: '本金',
      dataIndex: 'principal',
      key: 'principal',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(amount)}
        </Text>
      )
    },
    {
      title: '期限',
      dataIndex: 'term',
      key: 'term',
      width: 100,
      render: (term: number) => {
        const option = TERM_OPTIONS.find(t => t.value === term);
        return option ? option.label : `${term}个月`;
      }
    },
    {
      title: '年利率',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (rate: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {(rate * 100).toFixed(2)}%
        </Text>
      )
    },
    {
      title: '预计收益',
      key: 'expectedInterest',
      width: 120,
      render: (_: any, record: FixedDeposit) => {
        const interest = calculateExpectedInterest(record.principal, record.rate, record.term);
        return (
          <Text style={{ color: '#fa8c16' }}>
            {formatCurrency(interest)}
          </Text>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: number, record: FixedDeposit) => 
        getStatusTag(status, record.endTime)
    },
    {
      title: '起息日',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (time: string) => formatDateTime(time, 'YYYY-MM-DD')
    },
    {
      title: '到期日',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (time: string) => formatDateTime(time, 'YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: FixedDeposit) => {
        const daysLeft = calculateDaysLeft(record.endTime);
        
        return (
          <Space size="small">
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleViewDetail(record)}
              icon={<EyeOutlined />}
            >
              详情
            </Button>
            
            {record.status === 0 && (
              <>
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  onClick={() => handleOpenWithdraw(record, 'early')}
                >
                  提前支取
                </Button>
                
                {daysLeft <= 0 && (
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleOpenWithdraw(record, 'mature')}
                  >
                    到期转出
                  </Button>
                )}
              </>
            )}
            
            {record.status === 1 && (
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleOpenWithdraw(record, 'mature')}
              >
                转出
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="定期存款总额"
              value={stats.totalPrincipal}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix="¥"
              suffix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="预计总收益"
              value={stats.totalExpectedInterest}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix="¥"
              suffix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="持有中"
              value={stats.activeCount}
              valueStyle={{ color: '#fa8c16' }}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已到期"
              value={stats.maturedCount}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>定期存款管理</Title>
              <Text type="secondary">管理您的定期存款，享受更高利息收益</Text>
            </div>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadDeposits();
                loadUserCards();
              }}
              loading={loading}
              style={{ marginRight: 8 }}
            >
              刷新
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              disabled={cards.length === 0}
            >
              新建定期存款
            </Button>
          </Col>
        </Row>

        {cards.length === 0 && (
          <Alert
            message="提示"
            description="您还没有绑定银行卡，请先绑定银行卡再办理定期存款业务"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
            action={
              <Button 
                type="link" 
                size="small"
                onClick={() => window.location.href = '/cards/add'}
              >
                去绑定银行卡
              </Button>
            }
          />
        )}
      </Card>

      {/* 定期存款表格 */}
      <Card>
        {deposits.length > 0 ? (
          <Table
            columns={columns}
            dataSource={deposits}
            rowKey="fdId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 笔定期存款`
            }}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无定期存款"
          >
            <Button 
              type="primary" 
              onClick={() => setModalVisible(true)}
              icon={<PlusOutlined />}
            >
              创建第一笔定期存款
            </Button>
          </Empty>
        )}
      </Card>

      {/* 创建定期存款模态框 */}
      <Modal
        title="新建定期存款"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        destroyOnClose
        okText="确认创建"
        cancelText="取消"
      >
        <Alert
          message="定期存款说明"
          description={
            <div>
              <p>• 定期存款享受固定利率，高于活期存款</p>
              <p>• 提前支取按活期利率计息</p>
              <p>• 存款金额至少1000元</p>
              <p>• 存款期间资金将被冻结，到期后可转出</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateDeposit}
        >
          <Form.Item
            label="选择银行卡"
            name="cardId"
            rules={[{ required: true, message: '请选择银行卡' }]}
            help="请选择用于存款的银行卡"
          >
            <Select 
              placeholder="请选择银行卡" 
              size="large"
              suffixIcon={<BankOutlined />}
            >
              {cards.map(card => {
                const maskedCardId = card.maskedCardId || 
                  (card.cardId ? card.cardId.substring(0, 6) + '******' + card.cardId.substring(10) : '');
                
                return (
                  <Option key={card.cardId} value={card.cardId}>
                    <div>
                      <div>{maskedCardId}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        余额: {formatCurrency(card.balance)} 
                        {card.availableBalance < card.balance && 
                          ` (可用: ${formatCurrency(card.availableBalance)})`}
                      </div>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            label="存款金额"
            name="principal"
            rules={[
              { required: true, message: '请输入存款金额' },
              { type: 'number', min: 1000, message: '最小金额为1000元' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入存款金额"
              prefix="¥"
              size="large"
              min={1000}
              step={100}
              formatter={value => ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            label="存款期限"
            name="term"
            rules={[{ required: true, message: '请选择存款期限' }]}
          >
            <Select placeholder="选择存款期限" size="large">
              {TERM_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    <div style={{ fontSize: '12px', color: '#52c41a' }}>
                      年利率: {(option.rate * 100).toFixed(2)}%
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="预计到期收益"
                help="到期后将获得的利息"
              >
                <Input
                  size="large"
                  readOnly
                  value={
                    form.getFieldValue('principal') && form.getFieldValue('term') 
                      ? formatCurrency(
                          calculateExpectedInterest(
                            form.getFieldValue('principal'),
                            TERM_OPTIONS.find(t => t.value === form.getFieldValue('term'))?.rate || 0.01,
                            form.getFieldValue('term')
                          )
                        )
                      : '¥0.00'
                  }
                  prefix={<DollarOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="自动续存"
                name="autoRenew"
                initialValue={false}
              >
                <Select size="large">
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="交易密码"
            name="cardPassword"
            rules={[
              { required: true, message: '请输入交易密码' },
              { min: 6, max: 6, message: '交易密码为6位数字' },
              { pattern: /^\d+$/, message: '交易密码必须为数字' }
            ]}
          >
            <Input.Password
              placeholder="请输入6位数字交易密码"
              size="large"
              prefix={<SafetyOutlined />}
              maxLength={6}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 定期存款详情模态框 */}
      <Modal
        title="定期存款详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedDeposit && (
          <div>
            <Descriptions 
              column={2} 
              bordered 
              size="small"
              labelStyle={{ width: '120px', fontWeight: 'bold' }}
            >
              <Descriptions.Item label="存单编号" span={2}>
                <Text strong>{selectedDeposit.fdNo}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="银行卡号">
                <Text code>
                  {selectedDeposit.cardId.substring(0, 6)}******{selectedDeposit.cardId.substring(10)}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="存款状态">
                {getStatusTag(selectedDeposit.status, selectedDeposit.endTime)}
              </Descriptions.Item>
              
              <Descriptions.Item label="存款本金">
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {formatCurrency(selectedDeposit.principal)}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="存款期限">
                <Text>{selectedDeposit.term}个月</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="年利率">
                <Text strong style={{ color: '#52c41a' }}>
                  {(selectedDeposit.rate * 100).toFixed(2)}%
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="预计收益">
                <Text strong style={{ color: '#fa8c16', fontSize: '16px' }}>
                  {formatCurrency(
                    calculateExpectedInterest(
                      selectedDeposit.principal, 
                      selectedDeposit.rate, 
                      selectedDeposit.term
                    )
                  )}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="起息日">
                {formatDateTime(selectedDeposit.startTime, 'YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              
              <Descriptions.Item label="到期日">
                {formatDateTime(selectedDeposit.endTime, 'YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              
              <Descriptions.Item label="自动续存">
                <Tag color={selectedDeposit.autoRenew ? 'success' : 'default'}>
                  {selectedDeposit.autoRenew ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="创建时间">
                {formatDateTime(selectedDeposit.createdTime, 'YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <div style={{ textAlign: 'center' }}>
              <Space>
                {selectedDeposit.status === 0 && (
                  <>
                    <Button 
                      type="primary" 
                      danger
                      onClick={() => {
                        setDetailModalVisible(false);
                        handleOpenWithdraw(selectedDeposit, 'early');
                      }}
                    >
                      提前支取
                    </Button>
                    
                    {calculateDaysLeft(selectedDeposit.endTime) <= 0 && (
                      <Button 
                        type="primary"
                        onClick={() => {
                          setDetailModalVisible(false);
                          handleOpenWithdraw(selectedDeposit, 'mature');
                        }}
                      >
                        到期转出
                      </Button>
                    )}
                  </>
                )}
                
                {selectedDeposit.status === 1 && (
                  <Button 
                    type="primary"
                    onClick={() => {
                      setDetailModalVisible(false);
                      handleOpenWithdraw(selectedDeposit, 'mature');
                    }}
                  >
                    立即转出
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 支取定期存款模态框 */}
      <Modal
        title={withdrawType === 'early' ? '提前支取定期存款' : '到期转出定期存款'}
        open={withdrawModalVisible}
        onCancel={() => setWithdrawModalVisible(false)}
        onOk={() => withdrawForm.submit()}
        width={500}
        destroyOnClose
        okText="确认支取"
        cancelText="取消"
      >
        {selectedDeposit && (
          <>
            <Alert
              message={withdrawType === 'early' ? '提前支取说明' : '到期转出说明'}
              description={
                withdrawType === 'early' 
                  ? '提前支取将按活期利率计息，可能无法获得全部预期收益。确认要继续吗？'
                  : '定期存款已到期，将按约定利率计息并转出到您的活期账户。'
              }
              type={withdrawType === 'early' ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <div style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="存款本金"
                    value={selectedDeposit.principal}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="存款期限"
                    value={selectedDeposit.term}
                    suffix="个月"
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
              </Row>
            </div>

            <Form
              form={withdrawForm}
              layout="vertical"
              onFinish={handleWithdraw}
            >
              <Form.Item
                label="交易密码"
                name="cardPassword"
                rules={[
                  { required: true, message: '请输入交易密码' },
                  { min: 6, max: 6, message: '交易密码为6位数字' },
                  { pattern: /^\d+$/, message: '交易密码必须为数字' }
                ]}
                help="请输入银行卡交易密码进行身份验证"
              >
                <Input.Password
                  placeholder="请输入6位数字交易密码"
                  size="large"
                  prefix={<SafetyOutlined />}
                  maxLength={6}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserFixedDeposits;