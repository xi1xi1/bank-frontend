// src/pages/admin/CardManagement.tsx - 修复版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatCurrency, formatDateTime } from '../../utils/formatter';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// 添加 getAllCards 方法到 adminApi
// 在你的 adminApi.ts 中添加：
// getAllCards: (params?: any) => request.get('/admin/cards', { params }),

const CardManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    card_id: '',
    user_id: '',
    status: '',
    page: 1,
    page_size: 10
  });

  // 临时模拟数据函数
  const getMockCards = async () => {
    return {
      cards: [
        {
          card_id: '6225888888888888',
          user_name: '张三',
          user_id: 'U100001',
          balance: 50000,
          available_balance: 45000,
          status: 0,
          created_time: '2024-01-01 10:00:00'
        },
        {
          card_id: '6225888888888889',
          user_name: '李四',
          user_id: 'U100002',
          balance: 30000,
          available_balance: 30000,
          status: 0,
          created_time: '2024-01-02 11:00:00'
        }
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total: 2,
        total_pages: 1
      }
    };
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      // 暂时使用模拟数据
      const response = await getMockCards();
      const cardsData = response.cards || [];
      setCards(cardsData);
    } catch (error) {
      console.error('加载银行卡失败:', error);
      message.error('加载银行卡失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [filters]);

  const columns = [
    {
      title: '卡号',
      dataIndex: 'card_id',
      key: 'card_id',
      width: 200,
      render: (id: string) => (
        <Text code>
          {id.replace(/(\d{4})(?=\d)/g, '$1 ')}
        </Text>
      )
    },
    {
      title: '持卡人',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(balance)}
        </Text>
      )
    },
    {
      title: '可用余额',
      dataIndex: 'available_balance',
      key: 'available_balance',
      width: 120,
      render: (balance: number) => formatCurrency(balance)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'success', text: '正常' },
          1: { color: 'error', text: '冻结' },
          2: { color: 'warning', text: '挂失' },
          3: { color: 'default', text: '注销' }
        };
        const config = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      key: 'created_time',
      width: 150,
      render: (time: string) => formatDateTime(time, 'YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info('查看详情功能开发中')}
          >
            详情
          </Button>
          {record.status === 0 ? (
            <Button
              type="link"
              size="small"
              danger
              icon={<LockOutlined />}
              onClick={() => message.info('冻结功能开发中')}
            >
              冻结
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              icon={<UnlockOutlined />}
              onClick={() => message.info('解冻功能开发中')}
            >
              解冻
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={3}>银行卡管理</Title>
      <Text type="secondary">管理系统所有银行卡信息</Text>
      
      <div style={{ margin: '24px 0' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索卡号或用户ID"
              allowClear
              onSearch={(value) => setFilters({ ...filters, card_id: value })}
            />
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="卡片状态"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="0">正常</Option>
              <Option value="1">冻结</Option>
              <Option value="2">挂失</Option>
              <Option value="3">注销</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button icon={<FilterOutlined />}>
                更多筛选
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={cards}
        rowKey="card_id"
        loading={loading}
        pagination={{
          pageSize: filters.page_size,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => {
            setFilters({ ...filters, page, page_size: pageSize });
          }
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default CardManagement;