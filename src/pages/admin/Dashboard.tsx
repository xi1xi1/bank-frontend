// src/pages/admin/Dashboard.tsx - 简化版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  message,
  Typography,
  Space,
  Tag,
  Alert,
  Progress,
  Timeline,
  List,
  Avatar,
  Badge,
  Divider
} from 'antd';
import {
  TeamOutlined,
  BankOutlined,
  TransactionOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  CreditCardOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatRelativeTime } from '../../utils/formatter';
import { ACCOUNT_STATUS } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_users: 125,
    active_users: 118,
    frozen_users: 7,
    total_cards: 150,
    active_cards: 145,
    frozen_cards: 5,
    lost_cards: 2,
    total_transactions: 2568,
    today_transactions: 45,
    total_balance: 2856000.00,
    today_income: 125000.00,
    today_outcome: 78000.00,
    system_status: '健康',
    security_level: '高'
  });

  const [recentUsers, setRecentUsers] = useState([
    {
      id: 'U100000125',
      name: '王五',
      phone: '13800138125',
      register_time: '2024-01-20 14:30:00',
      status: 0,
      card_count: 1,
      total_balance: 5000.00
    },
    // ... 其他用户数据
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: '银行卡异常操作',
      description: '用户 U100000015 在10分钟内连续尝试5次错误密码',
      time: '10分钟前',
      status: '未处理'
    },
    // ... 其他告警数据
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: API调用
      message.success('数据已刷新');
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserStatusTag = (status: number) => {
    switch (status) {
      case ACCOUNT_STATUS.NORMAL:
        return <Tag color="success">正常</Tag>;
      case ACCOUNT_STATUS.FROZEN:
        return <Tag color="error">冻结</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  return (
    <div>
      <Title level={3}>系统概览</Title>
      <Paragraph type="secondary">
        实时监控系统运行状态和关键指标
      </Paragraph>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: '总用户数',
            value: stats.total_users,
            icon: <TeamOutlined />,
            color: '#1890ff',
            change: '+5',
            changeType: 'increase'
          },
          {
            title: '总交易量',
            value: stats.total_transactions,
            icon: <TransactionOutlined />,
            color: '#52c41a',
            change: '+12%',
            changeType: 'increase'
          },
          {
            title: '系统总资产',
            value: stats.total_balance,
            prefix: '¥',
            icon: <BankOutlined />,
            color: '#fa8c16',
            change: '+3.2%',
            changeType: 'increase'
          },
          {
            title: '安全等级',
            value: stats.security_level,
            icon: <SafetyOutlined />,
            color: '#722ed1',
            change: '高',
            changeType: 'normal'
          }
        ].map((stat, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card loading={loading}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <div style={{ fontSize: 24, color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {stat.title}
                  </Text>
                  <Title level={3} style={{ margin: '4px 0 0 0', color: stat.color }}>
                    {stat.prefix}{typeof stat.value === 'number' && stat.prefix === '¥' 
                      ? formatCurrency(stat.value, false) 
                      : stat.value}
                  </Title>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {stat.changeType === 'increase' ? '较昨日增长' : '当前状态'}
                </Text>
                <Tag color={stat.changeType === 'increase' ? 'success' : 'processing'}>
                  {stat.change}
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          {/* 详细统计 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Card title="用户统计" size="small">
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                  <Statistic
                    title="活跃用户"
                    value={stats.active_users}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="冻结用户"
                    value={stats.frozen_users}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </div>
                <Progress
                  percent={Math.round((stats.active_users / stats.total_users) * 100)}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="银行卡统计" size="small">
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                  <Statistic
                    title="正常卡片"
                    value={stats.active_cards}
                    prefix={<CreditCardOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="异常卡片"
                    value={stats.frozen_cards + stats.lost_cards}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </div>
                <Progress
                  percent={Math.round(((stats.frozen_cards + stats.lost_cards) / stats.total_cards) * 100)}
                  status="normal"
                  strokeColor="#fa8c16"
                />
              </Card>
            </Col>
          </Row>

          {/* 系统告警时间线 */}
          <Card title="系统告警" style={{ marginBottom: 16 }}>
            <Timeline
              items={alerts.map(alert => ({
                color: alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue',
                dot: alert.type === 'error' ? <WarningOutlined /> : <ClockCircleOutlined />,
                children: (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{alert.title}</Text>
                      <Tag color={alert.status === '未处理' ? 'error' : 'success'}>
                        {alert.status}
                      </Tag>
                    </div>
                    <Paragraph type="secondary" style={{ margin: '4px 0' }}>
                      {alert.description}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {alert.time}
                    </Text>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>

        {/* 右侧：最近用户和交易 */}
        <Col xs={24} lg={8}>
          {/* 最近注册用户 */}
          <Card 
            title="最近注册用户"
            style={{ marginBottom: 16 }}
          >
            <List
              size="small"
              dataSource={recentUsers}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: user.status === 0 ? '#87d068' : '#f50' 
                        }}
                        icon={<UserOutlined />}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>{user.name}</Text>
                        {getUserStatusTag(user.status)}
                      </div>
                    }
                    description={
                      <div>
                        <div>ID: {user.id}</div>
                        <div>手机: {user.phone}</div>
                        <div>注册: {formatRelativeTime(user.register_time)}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 今日交易概览 */}
          <Card title="今日交易概览">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <Statistic
                title="总收入"
                value={stats.today_income}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Statistic
                title="总支出"
                value={stats.today_outcome}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;