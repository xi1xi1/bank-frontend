// src/pages/admin/TransactionOverview.tsx - 简化版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Statistic,
  Table,
  Space,
  Button,
  Spin
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatCurrency } from '../../utils/formatter';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('week');

  const loadOverview = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getTransactionOverview({
        date_range: timeRange
      });
      const data = response || [];
      setOverviewData(data);
    } catch (error) {
      console.error('加载交易概览失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, [timeRange]);

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '存款笔数',
      dataIndex: 'deposit_count',
      key: 'deposit_count',
      width: 100
    },
    {
      title: '存款金额',
      dataIndex: 'deposit_amount',
      key: 'deposit_amount',
      render: (amount: number) => (
        <span style={{ color: '#52c41a' }}>
          +{formatCurrency(amount)}
        </span>
      )
    },
    {
      title: '取款笔数',
      dataIndex: 'withdraw_count',
      key: 'withdraw_count',
      width: 100
    },
    {
      title: '取款金额',
      dataIndex: 'withdraw_amount',
      key: 'withdraw_amount',
      render: (amount: number) => (
        <span style={{ color: '#f5222d' }}>
          -{formatCurrency(amount)}
        </span>
      )
    },
    {
      title: '净现金流',
      key: 'net_flow',
      render: (_: any, record: any) => {
        const net = record.deposit_amount - record.withdraw_amount;
        return (
          <span style={{ color: net >= 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <Title level={3}>交易概览</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总存款金额"
              value={overviewData.reduce((sum, item) => sum + (item.deposit_amount || 0), 0)}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix="¥"
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总取款金额"
              value={overviewData.reduce((sum, item) => sum + (item.withdraw_amount || 0), 0)}
              precision={2}
              valueStyle={{ color: '#f5222d' }}
              prefix="¥"
              suffix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="净现金流"
              value={overviewData.reduce((sum, item) => sum + ((item.deposit_amount || 0) - (item.withdraw_amount || 0)), 0)}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="交易总笔数"
              value={overviewData.reduce((sum, item) => sum + (item.total_count || 0), 0)}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              <LineChartOutlined style={{ marginRight: 8 }} />
              交易趋势
            </Title>
          </div>
          
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="today">今日</Option>
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="year">本年</Option>
            </Select>
            
            <RangePicker />
            
            <Button icon={<FilterOutlined />}>
              更多筛选
            </Button>
            
            <Button type="primary" icon={<DownloadOutlined />}>
              导出报表
            </Button>
          </Space>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={overviewData}
          rowKey="date"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default TransactionOverview;