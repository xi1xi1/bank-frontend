// src/pages/user/Cards.tsx - 完整改造版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Empty,
  Divider,
  Input,
  Tooltip,
  Alert,
  Form,
  Select,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  WalletOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cardApi } from '../../api/card';
import { userApi } from '../../api/user';
import { formatCurrency, maskCardNumber, formatDate } from '../../utils/formatter';
import { CARD_STATUS } from '../../utils/constants';
import type { CardInfo } from '../../types';
import { getCurrentUserId, requireLogin } from '../../utils/auth';

const { Title, Text } = Typography;
const { Option } = Select;

const Cards: React.FC = () => {
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // 模态框状态
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [unbindModalVisible, setUnbindModalVisible] = useState(false);
  const [unbindCard, setUnbindCard] = useState<CardInfo | null>(null);
  const [unbindPassword, setUnbindPassword] = useState('');
  const [unbindLoading, setUnbindLoading] = useState(false);
  
  // 冻结相关状态
  const [freezeModalVisible, setFreezeModalVisible] = useState(false);
  const [freezeCard, setFreezeCard] = useState<CardInfo | null>(null);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeForm] = Form.useForm();
  
  // 解冻相关状态
  const [unfreezeModalVisible, setUnfreezeModalVisible] = useState(false);
  const [unfreezeCard, setUnfreezeCard] = useState<CardInfo | null>(null);
  const [unfreezeLoading, setUnfreezeLoading] = useState(false);
  const [unfreezeForm] = Form.useForm();
  
  const navigate = useNavigate();

  // 加载用户统计信息
  const loadUserStatistics = async (userId: string) => {
    setStatsLoading(true);
    try {
      const response = await userApi.getUserStatistics(userId);
      if (response.code === 200) {
        setUserStats(response.data);
      } else {
        console.warn('获取用户统计信息失败:', response.message);
        message.warning(response.message || '获取统计信息失败');
      }
    } catch (error: any) {
      console.error('获取用户统计信息失败:', error);
      message.error(error.message || '获取统计信息失败');
    } finally {
      setStatsLoading(false);
    }
  };

  // 加载银行卡数据
  const loadCards = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        message.error('用户未登录');
        navigate('/login');
        return;
      }

      // 并行加载银行卡列表和统计信息
      const [cardsResponse, statsResponse] = await Promise.allSettled([
        cardApi.getUserCards(),
        userApi.getUserStatistics(userId)
      ]);

      // 处理银行卡数据
      if (cardsResponse.status === 'fulfilled' && cardsResponse.value.code === 200) {
        const cardsData = cardsResponse.value.data.cards || [];
        setCards(cardsData as CardInfo[]);
      } else {
        const errorMsg = cardsResponse.status === 'fulfilled' 
          ? cardsResponse.value.message || '加载银行卡失败'
          : '加载银行卡失败';
        message.error(errorMsg);
      }

      // 处理统计信息
      if (statsResponse.status === 'fulfilled' && statsResponse.value.code === 200) {
        setUserStats(statsResponse.value.data);
      } else {
        console.warn('获取用户统计信息失败:', statsResponse);
      }
    } catch (error: any) {
      console.error('加载数据失败:', error);
      message.error(error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (!requireLogin()) {
      navigate('/login');
      return;
    }
    
    const userId = getCurrentUserId();
    if (userId) {
      loadUserStatistics(userId);
    }
    
    loadCards();
  }, [navigate]);

  // 使用后端统计信息计算卡片统计数据
  const calculateStats = () => {
    if (!userStats) {
      return {
        total: 0,
        active: 0,
        frozen: 0,
        lost: 0,
        total_balance: 0
      };
    }

    // 根据银行卡实际列表计算详细状态
    const activeCards = cards.filter(card => {
      if (typeof card.status === 'string') {
        return card.status === '正常';
      } else if (typeof card.status === 'number') {
        return card.status === CARD_STATUS.NORMAL;
      }
      return false;
    });

    const frozenCards = cards.filter(card => {
      if (typeof card.status === 'string') {
        return card.status === '冻结';
      } else if (typeof card.status === 'number') {
        return card.status === CARD_STATUS.FROZEN;
      }
      return false;
    });

    const lostCards = cards.filter(card => {
      if (typeof card.status === 'string') {
        return card.status === '挂失';
      } else if (typeof card.status === 'number') {
        return card.status === CARD_STATUS.LOST;
      }
      return false;
    });

    return {
      total: userStats.cardCount || cards.length,
      active: userStats.activeCardCount || activeCards.length,
      frozen: frozenCards.length,
      lost: lostCards.length,
      total_balance: userStats.totalBalance || 0
    };
  };

  const stats = calculateStats();

  // 查看卡片详情
  const handleViewCard = (card: CardInfo) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  // 打开冻结模态框
  const handleOpenFreezeModal = (card: CardInfo) => {
    // 检查是否可以冻结
    if (card.status === 2 || card.status === '冻结') {
      message.warning('该银行卡已是冻结状态');
      return;
    }
    
    if (card.status === 1 || card.status === '挂失') {
      message.warning('挂失的银行卡无法进行冻结操作');
      return;
    }
    
    if (card.status === 3 || card.status === '已注销') {
      message.warning('已注销的银行卡无法进行冻结操作');
      return;
    }
    
    setFreezeCard(card);
    freezeForm.resetFields();
    setFreezeModalVisible(true);
  };

  // 执行冻结操作
  const executeFreeze = async () => {
    if (!freezeCard) return;

    try {
      const values = await freezeForm.validateFields();
      
      setFreezeLoading(true);
      
      const freezeData = {
        cardId: freezeCard.cardId,
        cardPassword: values.cardPassword,
        reason: values.reason,
      //  contactPhone: values.contactPhone
      };
      
      const response = await cardApi.freezeCard(freezeData);
      
      if (response.code === 200) {
        message.success(response.message || '银行卡冻结申请已提交');
        setFreezeModalVisible(false);
        freezeForm.resetFields();
        loadCards(); // 重新加载列表
        
        // 重新加载统计信息
        const userId = getCurrentUserId();
        if (userId) {
          loadUserStatistics(userId);
        }
      } else {
        message.error(response.message || '冻结失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      console.error('冻结失败:', error);
      message.error(error.message || '冻结失败');
    } finally {
      setFreezeLoading(false);
    }
  };

  // 打开解冻模态框
  const handleOpenUnfreezeModal = (card: CardInfo) => {
    // 检查是否可以解冻
    if (card.status !== 2 && card.status !== '冻结') {
      message.warning('该银行卡不是冻结状态');
      return;
    }
    
    setUnfreezeCard(card);
    unfreezeForm.resetFields();
    setUnfreezeModalVisible(true);
  };

  // 执行解冻操作
  const executeUnfreeze = async () => {
    if (!unfreezeCard) return;

    try {
      const values = await unfreezeForm.validateFields();
      
      setUnfreezeLoading(true);
      
      const unfreezeData = {
        cardId: unfreezeCard.cardId,
        cardPassword: values.cardPassword,
        reason: values.reason
      };
      
      const response = await cardApi.unfreezeCard(unfreezeData);
      
      if (response.code === 200) {
        message.success(response.message || '银行卡解冻成功');
        setUnfreezeModalVisible(false);
        unfreezeForm.resetFields();
        loadCards(); // 重新加载列表
        
        // 重新加载统计信息
        const userId = getCurrentUserId();
        if (userId) {
          loadUserStatistics(userId);
        }
      } else {
        message.error(response.message || '解冻失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      console.error('解冻失败:', error);
      message.error(error.message || '解冻失败');
    } finally {
      setUnfreezeLoading(false);
    }
  };

  // 打开解绑确认框
  const handleOpenUnbindModal = (card: CardInfo) => {
    setUnbindCard(card);
    setUnbindPassword('');
    setUnbindModalVisible(true);
  };

  // 执行解绑操作
  const executeUnbind = async () => {
    if (!unbindCard) {
      message.error('未找到银行卡信息');
      return;
    }

    if (!unbindPassword) {
      message.error('请输入交易密码');
      return;
    }

    if (unbindPassword.length !== 6 || !/^\d+$/.test(unbindPassword)) {
      message.error('交易密码必须是6位数字');
      return;
    }

    setUnbindLoading(true);
    try {
      const response = await cardApi.unbindCard(unbindCard.cardId, unbindPassword);
      
      if (response.code === 200) {
        message.success(response.data?.message || '银行卡注销成功');
        setUnbindModalVisible(false);
        setUnbindPassword('');
        setUnbindCard(null);
        loadCards(); // 重新加载列表
        
        // 重新加载统计信息
        const userId = getCurrentUserId();
        if (userId) {
          loadUserStatistics(userId);
        }
      } else {
        message.error(response.message || '解绑失败');
      }
    } catch (error: any) {
      console.error('解绑失败:', error);
      message.error(error.response?.data?.message || error.message || '解绑失败');
    } finally {
      setUnbindLoading(false);
    }
  };

  // 添加银行卡
  const handleAddCard = () => {
    navigate('/cards/add');
  };

  // 状态标签渲染 - 支持字符串和数字状态
  const renderStatusTag = (status: string | number) => {
    let statusText = '未知';
    let statusColor = 'default';
    let statusIcon = null;
    
    if (typeof status === 'string') {
      statusText = status;
      switch (status) {
        case '正常':
          statusColor = 'success';
          statusIcon = <UnlockOutlined />;
          break;
        case '挂失':
          statusColor = 'warning';
          statusIcon = <ExclamationCircleOutlined />;
          break;
        case '冻结':
          statusColor = 'error';
          statusIcon = <LockOutlined />;
          break;
        case '已注销':
        case '已解绑':
          statusColor = 'default';
          statusIcon = <DeleteOutlined />;
          break;
        default:
          statusColor = 'default';
          statusIcon = null;
      }
    } else {
      const statusMap: Record<number, { color: string; text: string; icon: React.ReactNode }> = {
        [CARD_STATUS.NORMAL]: { color: 'success', text: '正常', icon: <UnlockOutlined /> },
        [CARD_STATUS.LOST]: { color: 'warning', text: '挂失', icon: <ExclamationCircleOutlined /> },
        [CARD_STATUS.FROZEN]: { color: 'error', text: '冻结', icon: <LockOutlined /> },
        [CARD_STATUS.UNBOUND]: { color: 'default', text: '已注销', icon: <DeleteOutlined /> }
      };
      
      const config = statusMap[status] || { color: 'default', text: '未知', icon: null };
      statusColor = config.color;
      statusText = config.text;
      statusIcon = config.icon;
    }
    
    return (
      <Tag color={statusColor} icon={statusIcon}>
        {statusText}
      </Tag>
    );
  };

  // 检查卡片是否可操作
  const canFreeze = (card: CardInfo) => {
    return (card.status === 0 || card.status === '正常');
  };

  const canUnfreeze = (card: CardInfo) => {
    return (card.status === 2 || card.status === '冻结');
  };

  const canUnbind = (card: CardInfo) => {
    return true; // 所有卡片都可以尝试解绑，后端会验证条件
  };

  // 表格列定义 - 修改为文字按钮
  const columns = [
    {
      title: '银行卡号',
      dataIndex: 'cardId',
      key: 'cardId',
      width: 200,
      render: (text: string) => (
        <Text strong>{maskCardNumber(text)}</Text>
      )
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (value: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </Text>
      )
    },
    {
      title: '可用余额',
      dataIndex: 'availableBalance',
      key: 'availableBalance',
      width: 120,
      render: (value: number) => (
        <Text type="secondary">
          {formatCurrency(value)}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag
    },
    {
      title: '绑定时间',
      dataIndex: 'bindTime',
      key: 'bindTime',
      width: 180,
      render: (text: string) => (
        <Text type="secondary">
          {formatDate(text)}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: CardInfo) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => handleViewCard(record)}
            size="small"
            style={{ padding: '0 4px' }}
          >
            查看
          </Button>
          
          {canFreeze(record) && (
            <Button
              type="link"
              onClick={() => handleOpenFreezeModal(record)}
              size="small"
              style={{ padding: '0 4px' }}
            >
              冻结
            </Button>
          )}
          
          {canUnfreeze(record) && (
            <Button
              type="link"
              onClick={() => handleOpenUnfreezeModal(record)}
              size="small"
              style={{ padding: '0 4px' }}
            >
              解冻
            </Button>
          )}
          
          {canUnbind(record) && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => handleOpenUnbindModal(record)}
              style={{ padding: '0 4px' }}
            >
              注销
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>银行卡管理</Title>
      
      {/* 统计卡片 - 使用后端数据 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总银行卡数"
              value={stats.total}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常状态"
              value={stats.active}
              prefix={<UnlockOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="冻结状态"
              value={stats.frozen}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总资产"
              value={stats.total_balance}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Text type="secondary">管理您的银行卡账户，可进行存款、取款、冻结、解冻、注销等操作</Text>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCards}
              loading={loading}
            >
              刷新
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCard}
            >
              添加银行卡
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 银行卡表格 */}
      <Card>
        <Spin spinning={loading}>
          {cards.length > 0 ? (
            <Table
              columns={columns}
              dataSource={cards}
              rowKey="cardId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 张银行卡`
              }}
              scroll={{ x: 1000 }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>暂无银行卡</div>
                  <Button type="primary" onClick={handleAddCard}>
                    添加第一张银行卡
                  </Button>
                </div>
              }
            />
          )}
        </Spin>
      </Card>

      {/* 银行卡详情模态框 */}
      <Modal
        title="银行卡详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={500}
      >
        {selectedCard && (
          <div>
            {/* 卡片头部 */}
            <div style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
              padding: 20,
              borderRadius: 8,
              color: 'white',
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <CreditCardOutlined style={{ fontSize: 32, marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {maskCardNumber(selectedCard.cardId)}
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    {selectedCard.cardType || '储蓄卡'}
                  </div>
                </div>
              </div>
              
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>可用余额</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {formatCurrency(selectedCard.availableBalance || 0)}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>总余额</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {formatCurrency(selectedCard.balance || 0)}
                  </div>
                </Col>
              </Row>
            </div>

            {/* 卡片详情 */}
            <div>
              <Divider>卡片信息</Divider>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Text strong>卡号:</Text>
                  <div>{maskCardNumber(selectedCard.cardId)}</div>
                </Col>
                <Col span={12}>
                  <Text strong>状态:</Text>
                  <div>{renderStatusTag(selectedCard.status)}</div>
                </Col>
                <Col span={12}>
                  <Text strong>绑定时间:</Text>
                  <div>{formatDate(selectedCard.bindTime)}</div>
                </Col>
                <Col span={12}>
                  <Text strong>冻结金额:</Text>
                  <div>{formatCurrency(selectedCard.frozenAmount || 0)}</div>
                </Col>
              </Row>

              <Divider>账户信息</Divider>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text strong>总余额</Text>
                    <div style={{ fontSize: 18, color: '#52c41a' }}>
                      {formatCurrency(selectedCard.balance || 0)}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>可用余额</Text>
                    <div style={{ fontSize: 18, color: '#1890ff' }}>
                      {formatCurrency(selectedCard.availableBalance || 0)}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* 冻结银行卡模态框 */}
      <Modal
        title="冻结银行卡"
        open={freezeModalVisible}
        onCancel={() => {
          setFreezeModalVisible(false);
          freezeForm.resetFields();
          setFreezeCard(null);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setFreezeModalVisible(false);
              freezeForm.resetFields();
              setFreezeCard(null);
            }}
            disabled={freezeLoading}
          >
            取消
          </Button>,
          <Button
            key="freeze"
            type="primary"
            danger
            loading={freezeLoading}
            onClick={executeFreeze}
          >
            {freezeLoading ? '处理中...' : '确认冻结'}
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        {freezeCard && (
          <div>
            <Alert
              message="重要提示"
              description="冻结银行卡后，该卡将无法进行任何交易操作，包括存款、取款、转账等。解冻需要重新验证身份。"
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {/* 银行卡信息 */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 12 }}>银行卡信息</Title>
              
              <div style={{ 
                padding: 16, 
                background: '#f6f6f6', 
                borderRadius: 4,
                marginBottom: 16 
              }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <span>卡号：</span>
                      <Text strong style={{ marginLeft: 8 }}>
                        {maskCardNumber(freezeCard.cardId)}
                      </Text>
                    </div>
                    <div>
                      <span>当前状态：</span>
                      <span style={{ marginLeft: 8 }}>
                        {renderStatusTag(freezeCard.status)}
                      </span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <span>当前余额：</span>
                      <Text strong style={{ marginLeft: 8, color: '#52c41a' }}>
                        {formatCurrency(freezeCard.balance || 0)}
                      </Text>
                    </div>
                    <div>
                      <span>可用余额：</span>
                      <Text strong style={{ marginLeft: 8, color: '#1890ff' }}>
                        {formatCurrency(freezeCard.availableBalance || 0)}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* 冻结表单 */}
            <Form
              form={freezeForm}
              layout="vertical"
            >
              <Form.Item
                label="冻结原因"
                name="reason"
                rules={[{ required: true, message: '请选择冻结原因' }]}
              >
                <Select placeholder="请选择冻结原因">
                  <Option value="卡片遗失">卡片遗失</Option>
                  <Option value="信息泄露">信息泄露</Option>
                  <Option value="风险控制">风险控制</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>

              {/* <Form.Item
                label="联系电话"
                name="contactPhone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input placeholder="请输入您的联系电话" maxLength={11} />
              </Form.Item> */}

              <Form.Item
                label="交易密码"
                name="cardPassword"
                rules={[
                  { required: true, message: '请输入交易密码' },
                  { pattern: /^\d{6}$/, message: '交易密码必须是6位数字' }
                ]}
              >
                <Input.Password
                  placeholder="请输入6位数字交易密码"
                  maxLength={6}
                />
              </Form.Item>

              <Alert
                message="冻结期限"
                description="银行卡冻结通常持续7天，到期后如需继续冻结需要重新操作。"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Form>
          </div>
        )}
      </Modal>

      {/* 解冻银行卡模态框 */}
      <Modal
        title="解冻银行卡"
        open={unfreezeModalVisible}
        onCancel={() => {
          setUnfreezeModalVisible(false);
          unfreezeForm.resetFields();
          setUnfreezeCard(null);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setUnfreezeModalVisible(false);
              unfreezeForm.resetFields();
              setUnfreezeCard(null);
            }}
            disabled={unfreezeLoading}
          >
            取消
          </Button>,
          <Button
            key="unfreeze"
            type="primary"
            loading={unfreezeLoading}
            onClick={executeUnfreeze}
          >
            {unfreezeLoading ? '处理中...' : '确认解冻'}
          </Button>
        ]}
        width={500}
        destroyOnClose
      >
        {unfreezeCard && (
          <div>
            <Alert
              message="解冻提示"
              description="解冻银行卡后，该卡将恢复正常使用，可以进行存款、取款、转账等交易操作。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {/* 银行卡信息 */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 12 }}>银行卡信息</Title>
              
              <div style={{ 
                padding: 12, 
                background: '#f6f6f6', 
                borderRadius: 4,
                marginBottom: 16 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>卡号：</span>
                  <Text strong>
                    {maskCardNumber(unfreezeCard.cardId)}
                  </Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>当前状态：</span>
                  <span>
                    {renderStatusTag(unfreezeCard.status)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>当前余额：</span>
                  <Text strong style={{ color: '#52c41a' }}>
                    {formatCurrency(unfreezeCard.balance || 0)}
                  </Text>
                </div>
              </div>
            </div>

            {/* 解冻表单 */}
            <Form
              form={unfreezeForm}
              layout="vertical"
            >
              <Form.Item
                label="解冻原因（选填）"
                name="reason"
              >
                <Input placeholder="请输入解冻原因" />
              </Form.Item>

              <Form.Item
                label="交易密码"
                name="cardPassword"
                rules={[
                  { required: true, message: '请输入交易密码' },
                  { pattern: /^\d{6}$/, message: '交易密码必须是6位数字' }
                ]}
              >
                <Input.Password
                  placeholder="请输入6位数字交易密码"
                  maxLength={6}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 解绑银行卡模态框 */}
      <Modal
        title="注销银行卡"
        open={unbindModalVisible}
        onCancel={() => {
          setUnbindModalVisible(false);
          setUnbindPassword('');
          setUnbindCard(null);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setUnbindModalVisible(false);
              setUnbindPassword('');
              setUnbindCard(null);
            }}
            disabled={unbindLoading}
          >
            取消
          </Button>,
          <Button
            key="unbind"
            type="primary"
            danger
            loading={unbindLoading}
            onClick={executeUnbind}
            disabled={!unbindPassword || unbindPassword.length !== 6 || unbindLoading}
          >
            {unbindLoading ? '处理中...' : '确认注销'}
          </Button>
        ]}
        width={500}
        destroyOnClose
      >
        {unbindCard && (
          <div>
            <Alert
              message="重要提示"
              description={
                <div>
                  <p>您即将注销银行卡：{maskCardNumber(unbindCard.cardId)}</p>
                  <p style={{ color: '#ff4d4f', marginTop: 8 }}>
                    注销后，该银行卡将永久从您的账户中移除，无法恢复！
                  </p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 12 }}>银行卡信息</Title>
              
              <div style={{ 
                padding: 12, 
                background: '#f6f6f6', 
                borderRadius: 4,
                marginBottom: 16 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>卡号：</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {maskCardNumber(unbindCard.cardId)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>当前余额：</span>
                  <span style={{ fontWeight: 'bold', color: (unbindCard.balance || 0) === 0 ? '#52c41a' : '#ff4d4f' }}>
                    {formatCurrency(unbindCard.balance || 0)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>卡片状态：</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {renderStatusTag(unbindCard.status)}
                  </span>
                </div>
              </div>
              
              <Alert
                message="系统验证"
                description="系统会自动验证注销条件：余额为0、无定期存款、卡片状态正常等"
                type="info"
                showIcon
              />
            </div>

            <div>
              <Title level={5} style={{ marginBottom: 12 }}>身份验证</Title>
              
              <Alert
                message="安全验证"
                description="请输入该银行卡的6位数字交易密码以确认注销操作"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Input.Password
                placeholder="请输入6位数字交易密码"
                value={unbindPassword}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setUnbindPassword(value);
                }}
                maxLength={6}
                size="large"
                disabled={unbindLoading}
              />
              
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                请输入银行卡的6位数字交易密码进行身份验证
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Cards;