// src/pages/admin/Statistics.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  DatePicker,
  Select,
  Button,
  Space,
  message,
  Divider,
  Progress,
  List
} from 'antd';
import {
  UserOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
// import { mockService } from '../../mock/service';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface StatData {
  date: string;
  new_users: number;
  active_users: number;
  deposits: number;
  withdrawals: number;
  transaction_count: number;
  total_balance: number;
}

interface TopUser {
  rank: number;
  user_id: string;
  name: string;
  total_balance: number;
  transaction_count: number;
  growth: number;
}

interface CardStat {
  type: string;
  count: number;
  active_count: number;
  frozen_count: number;
  lost_count: number;
}

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [statType, setStatType] = useState('daily');
  const [statData, setStatData] = useState<StatData[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [cardStats, setCardStats] = useState<CardStat | null>(null);
  const [summary, setSummary] = useState({
    total_users: 0,
    active_users: 0,
    total_cards: 0,
    active_cards: 0,
    total_balance: 0,
    daily_transactions: 0,
    monthly_growth: 0
  });

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true);
    try {
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 800));

      // 生成模拟统计数据
      const mockStatData: StatData[] = [];
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      const days = endDate.diff(startDate, 'day') + 1;

      for (let i = 0; i < days; i++) {
        const date = startDate.add(i, 'day').format('YYYY-MM-DD');
        mockStatData.push({
          date,
          new_users: Math.floor(Math.random() * 10),
          active_users: Math.floor(Math.random() * 100) + 50,
          deposits: Math.floor(Math.random() * 100000) + 50000,
          withdrawals: Math.floor(Math.random() * 80000) + 30000,
          transaction_count: Math.floor(Math.random() * 500) + 200,
          total_balance: Math.floor(Math.random() * 1000000) + 5000000
        });
      }

      // 生成模拟顶级用户数据
      const mockTopUsers: TopUser[] = [
        { rank: 1, user_id: 'U100000001', name: '张三', total_balance: 150000.00, transaction_count: 45, growth: 12.5 },
        { rank: 2, user_id: 'U100000002', name: '李四', total_balance: 98000.00, transaction_count: 38, growth: 8.2 },
        { rank: 3, user_id: 'U100000003', name: '王五', total_balance: 75000.00, transaction_count: 29, growth: 5.7 },
        { rank: 4, user_id: 'U100000004', name: '赵六', total_balance: 62000.00, transaction_count: 32, growth: 9.1 },
        { rank: 5, user_id: 'U100000005', name: '钱七', total_balance: 58000.00, transaction_count: 26, growth: 6.8 }
      ];

      // 生成模拟银行卡统计数据
      const mockCardStats: CardStat = {
        type: '储蓄卡',
        count: 1245,
        active_count: 1180,
        frozen_count: 45,
        lost_count: 20
      };

      // 生成模拟汇总数据
      const mockSummary = {
        total_users: 1568,
        active_users: 1342,
        total_cards: 1245,
        active_cards: 1180,
        total_balance: 8563200.50,
        daily_transactions: 3245,
        monthly_growth: 8.7
      };

      setStatData(mockStatData);
      setTopUsers(mockTopUsers);
      setCardStats(mockCardStats);
      setSummary(mockSummary);

      message.success('统计数据加载成功');
    } catch (error) {
      console.error('加载统计数据失败:', error);
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadStatistics();
  }, []);

  // 处理日期范围变化
  const handleDateChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中');
  };

  // 统计表格列定义
  const statColumns: ColumnsType<StatData> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      fixed: 'left'
    },
    {
      title: '新增用户',
      dataIndex: 'new_users',
      key: 'new_users',
      width: 100,
      sorter: (a, b) => a.new_users - b.new_users
    },
    {
      title: '活跃用户',
      dataIndex: 'active_users',
      key: 'active_users',
      width: 100,
      sorter: (a, b) => a.active_users - b.active_users
    },
    {
      title: '存款金额',
      dataIndex: 'deposits',
      key: 'deposits',
      width: 120,
      render: (value: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ¥{value.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.deposits - b.deposits
    },
    {
      title: '取款金额',
      dataIndex: 'withdrawals',
      key: 'withdrawals',
      width: 120,
      render: (value: number) => (
        <Text strong style={{ color: '#f5222d' }}>
          ¥{value.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.withdrawals - b.withdrawals
    },
    {
      title: '交易笔数',
      dataIndex: 'transaction_count',
      key: 'transaction_count',
      width: 100,
      sorter: (a, b) => a.transaction_count - b.transaction_count
    },
    {
      title: '系统总余额',
      dataIndex: 'total_balance',
      key: 'total_balance',
      width: 140,
      render: (value: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          ¥{value.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.total_balance - b.total_balance
    }
  ];

  // 顶级用户表格列定义
  const topUserColumns: ColumnsType<TopUser> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <Badge count={rank} style={{ backgroundColor: rank <= 3 ? '#1890ff' : '#8c8c8c' }} />
      )
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '总资产',
      dataIndex: 'total_balance',
      key: 'total_balance',
      width: 120,
      render: (value: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ¥{value.toFixed(2)}
        </Text>
      )
    },
    {
      title: '交易次数',
      dataIndex: 'transaction_count',
      key: 'transaction_count',
      width: 100
    },
    {
      title: '月增长率',
      dataIndex: 'growth',
      key: 'growth',
      width: 100,
      render: (value: number) => (
        <Text style={{ color: value > 0 ? '#52c41a' : '#f5222d' }}>
          {value > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(value)}%
        </Text>
      )
    }
  ];

  // 银行卡状态数据
  const cardStatusData = [
    { type: '活跃', value: cardStats?.active_count || 0, color: '#52c41a' },
    { type: '冻结', value: cardStats?.frozen_count || 0, color: '#f5222d' },
    { type: '挂失', value: cardStats?.lost_count || 0, color: '#fa8c16' }
  ];

  return (
    <div>
      <Title level={2}>数据统计</Title>
      
      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>统计时间:</Text>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              style={{ width: 280 }}
            />
          </Col>
          <Col>
            <Text strong>统计类型:</Text>
          </Col>
          <Col>
            <Select
              value={statType}
              onChange={setStatType}
              style={{ width: 120 }}
            >
              <Option value="daily">每日统计</Option>
              <Option value="weekly">每周统计</Option>
              <Option value="monthly">每月统计</Option>
            </Select>
          </Col>
          <Col flex="auto">
            <Space style={{ float: 'right' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadStatistics}
                loading={loading}
              >
                刷新数据
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出报表
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 概览统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={3}>
          <Card>
            <Statistic
              title="总用户数"
              value={summary.total_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="活跃用户"
              value={summary.active_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="银行卡总数"
              value={summary.total_cards}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="活跃银行卡"
              value={summary.active_cards}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="系统总资产"
              value={summary.total_balance}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="日均交易量"
              value={summary.daily_transactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="月增长率"
              value={summary.monthly_growth}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 银行卡状态分布 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="银行卡状态分布">
            {cardStats && (
              <div>
                <Row gutter={16}>
                  <Col span={8}>
                    <Progress
                      type="dashboard"
                      percent={Math.round((cardStats.active_count / cardStats.count) * 100)}
                      strokeColor="#52c41a"
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text strong>活跃卡</Text>
                      <div>{cardStats.active_count}张</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Progress
                      type="dashboard"
                      percent={Math.round((cardStats.frozen_count / cardStats.count) * 100)}
                      strokeColor="#f5222d"
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text strong>冻结卡</Text>
                      <div>{cardStats.frozen_count}张</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Progress
                      type="dashboard"
                      percent={Math.round((cardStats.lost_count / cardStats.count) * 100)}
                      strokeColor="#fa8c16"
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text strong>挂失卡</Text>
                      <div>{cardStats.lost_count}张</div>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <List
                  size="small"
                  dataSource={cardStatusData}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                            marginRight: 8
                          }}
                        />
                        <div style={{ flex: 1 }}>{item.type}</div>
                        <div>{item.value}张</div>
                        <div style={{ marginLeft: 16, color: '#8c8c8c' }}>
                          {Math.round((item.value / (cardStats?.count || 1)) * 100)}%
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="资产排行榜">
            <Table
              columns={topUserColumns}
              dataSource={topUsers}
              rowKey="rank"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 详细统计数据 */}
      <Card title="详细统计表">
        <Table
          columns={statColumns}
          dataSource={statData}
          rowKey="date"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>

      {/* 图表区域 */}
      <Card title="趋势分析" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="用户增长趋势">
              <div style={{ textAlign: 'center', padding: 40 }}>
                <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">图表功能开发中</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="交易量分布">
              <div style={{ textAlign: 'center', padding: 40 }}>
                <BarChartOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">图表功能开发中</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// 添加 Badge 组件导入
import { Badge } from 'antd';

export default Statistics;