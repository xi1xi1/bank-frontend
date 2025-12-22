// src/pages/admin/CardManagement.tsx - 完整修改版
import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  message,
  Modal,
  Descriptions,
  Divider,
  Tooltip,
  Popconfirm,
  Form
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  UserOutlined,
  MoneyCollectOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatCurrency, formatDateTime } from '../../utils/formatter';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 详情对话框组件
interface CardDetailModalProps {
  visible: boolean;
  onClose: () => void;
  card: any;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ visible, onClose, card }) => {
  if (!card) return null;

  const statusMap: Record<number, { color: string; text: string; desc: string }> = {
    0: { color: 'success', text: '正常', desc: '卡片可正常使用' },
    1: { color: 'warning', text: '挂失', desc: '卡片已挂失，等待处理' },
    2: { color: 'error', text: '冻结', desc: '卡片已被冻结，无法进行交易' },
    3: { color: 'default', text: '注销', desc: '卡片已注销，不可再使用' }
  };

  const cardTypeMap: Record<number, { text: string; icon: React.ReactNode }> = {
    0: { text: '储蓄卡', icon: <CreditCardOutlined /> },
    1: { text: '信用卡', icon: <CreditCardOutlined /> },
    2: { text: '借记卡', icon: <CreditCardOutlined /> }
  };

  const statusConfig = statusMap[card.status] || { color: 'default', text: '未知', desc: '状态未知' };
  const cardTypeConfig = cardTypeMap[card.card_type] || { text: '未知类型', icon: <CreditCardOutlined /> };

  return (
    <Modal
      title={
        <Space>
          <CreditCardOutlined />
          <span>银行卡详情</span>
          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={750}
    >
      {/* 卡片基本信息 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          卡片信息
        </Title>
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="卡号">
                <Text strong copyable style={{ fontSize: '16px' }}>
                  {card.card_id?.replace(/(\d{4})(?=\d)/g, '$1 ')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="卡类型">
                <Space>
                  {cardTypeConfig.icon}
                  <span>{cardTypeConfig.text}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Space>
                  <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                  <Text type="secondary">{statusConfig.desc}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="绑定时间">
                <Space>
                  <ClockCircleOutlined />
                  {formatDateTime(card.bind_time, 'YYYY-MM-DD HH:mm:ss')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="最后交易时间">
                {card.last_transaction_time ? (
                  <Space>
                    <ClockCircleOutlined />
                    {formatDateTime(card.last_transaction_time, 'YYYY-MM-DD HH:mm:ss')}
                  </Space>
                ) : (
                  <Text type="secondary">暂无交易记录</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="状态描述">
                {card.status_text || statusConfig.text}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* 余额信息 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          余额信息
        </Title>
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>账户余额</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                {formatCurrency(card.balance || 0)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f6ffed', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>可用余额</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                {formatCurrency(card.available_balance || 0)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#fff7e6', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>冻结金额</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                {formatCurrency(card.frozen_amount || 0)}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* 用户信息 */}
      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          用户信息
        </Title>
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="用户ID">
                <Text copyable code>{card.user_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="用户名">
                <Text strong>{card.user_name}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="持卡人姓名">
                <Text strong>{card.name}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

// 操作确认对话框组件
const OperationModal: React.FC<{
  visible: boolean;
  operationType: 'freeze' | 'unfreeze' | 'report' | 'cancel';
  cardInfo: any;
  onConfirm: (values: any) => Promise<void>;
  onCancel: () => void;
}> = ({ visible, operationType, cardInfo, onConfirm, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 操作类型配置
  const operationConfig = {
    freeze: {
      title: '冻结银行卡',
      submitText: '确认冻结',
      reasonTypeOptions: [
        { value: 'suspicious_activity', label: '可疑交易' },
        { value: 'judicial', label: '司法冻结' },
        { value: 'other', label: '其他' }
      ]
    },
    unfreeze: {
      title: '解冻银行卡',
      submitText: '确认解冻',
      reasonTypeOptions: [
        { value: 'investigation_completed', label: '调查完成' },
        { value: 'user_request', label: '用户申请' },
        { value: 'other', label: '其他' }
      ]
    },
    report: {
      title: '挂失银行卡',
      submitText: '确认挂失',
      reasonTypeOptions: [
        { value: 'card_lost', label: '卡片遗失' },
        { value: 'card_damaged', label: '卡片损坏' },
        { value: 'other', label: '其他' }
      ]
    },
    cancel: {
      title: '解挂银行卡',
      submitText: '确认解挂',
      reasonTypeOptions: [
        { value: 'card_found', label: '卡片找回' },
        { value: 'investigation_completed', label: '调查完成' },
        { value: 'other', label: '其他' }
      ]
    }
  };

  const config = operationConfig[operationType];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await onConfirm({
        ...values,
        operation: operationType
      });
      
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<number, { color: string; text: string; desc: string }> = {
    0: { color: 'success', text: '正常', desc: '卡片可正常使用' },
    1: { color: 'warning', text: '挂失', desc: '卡片已挂失' },
    2: { color: 'error', text: '冻结', desc: '卡片已被冻结' },
    3: { color: 'default', text: '注销', desc: '卡片已注销' }
  };

  return (
    <Modal
      title={config.title}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={config.submitText}
      cancelText="取消"
      width={500}
    >
      <div style={{ marginBottom: 16 }}>
        <p><strong>卡号：</strong>{cardInfo?.card_id}</p>
        <p><strong>持卡人：</strong>{cardInfo?.name} ({cardInfo?.user_name})</p>
        <p><strong>当前状态：</strong>
          <Tag color={statusMap[cardInfo?.status]?.color || 'default'}>
            {statusMap[cardInfo?.status]?.text || '未知'}
          </Tag>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="reasonType"
          label="原因类型"
          rules={[{ required: true, message: '请选择原因类型' }]}
        >
          <Select placeholder="请选择原因类型">
            {config.reasonTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reasonDetail"
          label="详细原因"
          rules={[
            { required: true, message: '请输入详细原因' },
            { min: 5, message: '至少输入5个字符' }
          ]}
        >
          <TextArea
            placeholder="请输入详细的操作原因"
            rows={4}
            maxLength={200}
            showCount
          />
        </Form.Item>
        
        {/* 移除冻结天数字段 */}
      </Form>
    </Modal>
  );
};

// 状态映射
const statusMap: Record<number, { color: string; text: string; desc: string }> = {
  0: { color: 'success', text: '正常', desc: '卡片可正常使用' },
  1: { color: 'warning', text: '挂失', desc: '卡片已挂失' },
  2: { color: 'error', text: '冻结', desc: '卡片已被冻结' },
  3: { color: 'default', text: '注销', desc: '卡片已注销' }
};

const CardManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [operationModalVisible, setOperationModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [currentOperation, setCurrentOperation] = useState<'freeze' | 'unfreeze' | 'report' | 'cancel'>('freeze');
  
  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 筛选状态
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // 加载银行卡数据
  const loadCards = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllCards({
        search: filters.search,
        status: filters.status,
        page: pagination.current,
        page_size: pagination.pageSize
      });
      
      if (response.code === 200 && response.data) {
        const { cards: cardList, pagination: pagi } = response.data;
        
        if (Array.isArray(cardList)) {
          setCards(cardList);
          
          if (pagi) {
            setPagination(prev => ({
              ...prev,
              current: pagi.page || 1,
              total: pagi.total || 0
            }));
          }
        } else {
          setCards([]);
        }
      } else {
        message.error(response.message || '加载银行卡失败');
        setCards([]);
      }
    } catch (error: any) {
      console.error('加载银行卡失败:', error);
      message.error(error.message || '加载银行卡失败');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [pagination.current, pagination.pageSize, filters.search, filters.status]);

  // 搜索处理函数
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 状态筛选处理函数
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({ search: '', status: '' });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 查看详情
  const handleViewDetail = (record: any) => {
    setSelectedCard(record);
    setDetailModalVisible(true);
  };

  // 根据卡片状态判断可执行的操作
  const getAvailableOperations = (status: number) => {
    switch(status) {
      case 0: // 正常状态
        return [
          { type: 'freeze' as const, label: '冻结', icon: <LockOutlined />, color: 'danger' },
          { type: 'report' as const, label: '挂失', icon: <ExclamationCircleOutlined />, color: 'warning' }
        ];
      case 1: // 挂失状态
        return [
          { type: 'cancel' as const, label: '解挂', icon: <UnlockOutlined />, color: 'success' }
        ];
      case 2: // 冻结状态
        return [
          { type: 'unfreeze' as const, label: '解冻', icon: <UnlockOutlined />, color: 'success' }
        ];
      case 3: // 注销状态
        return []; // 不可操作
      default:
        return [];
    }
  };

  // 处理操作
  const handleOperation = (card: any, operationType: 'freeze' | 'unfreeze' | 'report' | 'cancel') => {
    setSelectedCard(card);
    setCurrentOperation(operationType);
    setOperationModalVisible(true);
  };

  // 确认执行操作
  const handleConfirmOperation = async (values: any) => {
    try {
      const { operation, reasonType, reasonDetail } = values; // 移除 freezeDuration
      const cardId = selectedCard.card_id;

      if (operation === 'freeze' || operation === 'unfreeze') {
        // 调用冻结/解冻接口 - 移除 freezeDuration 参数
        const response = await adminApi.freezeCard({
          targetType: 'card',
          targetId: cardId,
          operation: operation,
          reasonType: reasonType,
          reasonDetail: reasonDetail,
          freezeDuration: 0 // 默认传递0
        });
        
        if (response.code === 200 && response.data?.success) {
          message.success(response.data.message || '操作成功');
          loadCards(); // 重新加载数据
        } else {
          message.error(response.data?.message || response.message || '操作失败');
        }
      } else if (operation === 'report' || operation === 'cancel') {
        // 调用挂失/解挂接口
        const response = await adminApi.lostReport({
          cardId: cardId,
          operation: operation,
          reasonType: reasonType,
          reasonDetail: reasonDetail
        });
        
        if (response.code === 200 && response.data?.success) {
          message.success(response.data.message || '操作成功');
          loadCards(); // 重新加载数据
        } else {
          message.error(response.data?.message || response.message || '操作失败');
        }
      }

      setOperationModalVisible(false);
      setSelectedCard(null);
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(error.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '卡号',
      dataIndex: 'card_id',
      key: 'card_id',
      width: 200,
      render: (id: string) => (
        <Text code>
          {id && id.replace(/(\d{4})(?=\d)/g, '$1 ')}
        </Text>
      )
    },
    {
      title: '持卡人',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
      render: (name: string, record: any) => (
        <div>
          <div>{name || '未知'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.name}
          </Text>
        </div>
      )
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
      render: (id: string) => (
        <Text code>{id || '未知'}</Text>
      )
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(balance || 0)}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const config = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'bind_time',
      key: 'bind_time',
      width: 150,
      render: (time: string) => time ? formatDateTime(time, 'YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        const operations = getAvailableOperations(record.status);
        
        return (
          <Space size="small">
            <Tooltip title="查看详情">
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                详情
              </Button>
            </Tooltip>
            
            {operations.map(op => (
              <Tooltip key={op.type} title={op.label}>
                <Button
                  type="link"
                  size="small"
                  icon={op.icon}
                  danger={op.color === 'danger'}
                  onClick={() => handleOperation(record, op.type)}
                  style={op.color === 'success' ? { color: '#52c41a' } : undefined}
                >
                  {op.label}
                </Button>
              </Tooltip>
            ))}
            
            {record.status === 3 && (
              <Tooltip title="已注销，不可操作">
                <Button
                  type="link"
                  size="small"
                  disabled
                  icon={<LockOutlined />}
                >
                  已注销
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      <Title level={3}>银行卡管理</Title>
      <Text type="secondary">管理系统所有银行卡信息</Text>
      
      <div style={{ margin: '24px 0' }}>
        <Row gutter={16} align="middle" justify="space-between">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索卡号或用户名"
              allowClear
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onSearch={handleSearch}
              style={{ width: '100%' }}
              enterButton={<SearchOutlined />}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="卡片状态"
              style={{ width: '100%' }}
              allowClear
              value={filters.status || undefined}
              onChange={handleStatusChange}
            >
              <Option value="">全部状态</Option>
              <Option value="0">正常</Option>
              <Option value="1">挂失</Option>
              <Option value="2">冻结</Option>
              <Option value="3">注销</Option>
            </Select>
          </Col>
          
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
              disabled={!filters.search && !filters.status}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={cards}
        rowKey="card_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => {
            setPagination({
              current: page,
              pageSize: pageSize,
              total: pagination.total
            });
          },
          onShowSizeChange: (current, size) => {
            setPagination({
              current: 1,
              pageSize: size,
              total: pagination.total
            });
          }
        }}
        scroll={{ x: 1200 }}
      />

      {/* 详情对话框 */}
      <CardDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        card={selectedCard}
      />

      {/* 操作确认对话框 */}
      <OperationModal
        visible={operationModalVisible}
        operationType={currentOperation}
        cardInfo={selectedCard}
        onConfirm={handleConfirmOperation}
        onCancel={() => {
          setOperationModalVisible(false);
          setSelectedCard(null);
        }}
      />
    </div>
  );
};

export default CardManagement;