// src/pages/admin/Dashboard.tsx - 修改版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  message,
  Typography,
  Space,
  Tag,
  Progress,
  Timeline,
  List,
  Avatar,
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
import { adminApi } from '../../api/admin';  // 导入API

const { Title, Text, Paragraph } = Typography;

// 定义接口 - 使用驼峰命名以匹配后端DTO
interface DashboardStats {
  totalUsers: number;           // 总用户数
  activeUsers: number;          // 活跃用户数
  frozenUsers: number;          // 冻结用户数
  newUsersToday?: number;       // 今日新增用户
  totalCards: number;           // 总银行卡数
  activeCards: number;          // 正常卡数
  frozenCards: number;          // 冻结卡数
  lostCards: number;           // 挂失卡数
  totalTransactions: number;    // 总交易笔数
  todayTransactions: number;    // 今日交易笔数
  pendingTransactions?: number; // 处理中交易数
  totalBalance: number;         // 系统总余额
  todayIncome: number;          // 今日收入
  todayOutcome: number;         // 今日支出
  fixedDepositTotal?: number;   // 定期存款总额
  activeFixedDeposits?: number; // 持有中定期存款数
  maturedFixedDeposits?: number;// 已到期定期存款数
  systemStatus: string;         // 系统状态：健康、警告、危险
  securityLevel: string;        // 安全等级：高、中、低
  recentUsers?: Array<{
    userId: string;
    username: string;
    name: string;
    phone: string;
    createdTime: string;
    accountStatus: number;
  }>;
  systemAlerts?: Array<{
    id: number;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    time: string;
    status: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    frozenUsers: 0,
    totalCards: 0,
    activeCards: 0,
    frozenCards: 0,
    lostCards: 0,
    totalTransactions: 0,
    todayTransactions: 0,
    totalBalance: 0,
    todayIncome: 0,
    todayOutcome: 0,
    systemStatus: '健康',
    securityLevel: '高'
  });

  const [recentUsers, setRecentUsers] = useState<Array<{
    userId: string;
    username: string;
    name: string;
    phone: string;
    createdTime: string;
    accountStatus: number;
  }>>([]);

  const [alerts, setAlerts] = useState<Array<{
    id: number;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    time: string;
    status: string;
  }>>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 调用真实API
      const response = await adminApi.getDashboardStats();
      
      if (response.code === 200 && response.data) {
        const statsData = response.data;
        console.log('获取到的统计数据:', statsData);
        setStats(statsData);
        
        // 处理最近用户数据
        if (statsData.recentUsers && Array.isArray(statsData.recentUsers)) {
          setRecentUsers(statsData.recentUsers);
        } else {
          setRecentUsers([]);
        }
        
        // 处理系统告警数据
        if (statsData.systemAlerts && Array.isArray(statsData.systemAlerts)) {
          setAlerts(statsData.systemAlerts);
        } else {
          setAlerts([]);
        }
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error: any) {
      console.error('加载数据失败:', error);
      message.error(error.message || '数据加载失败');
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

  // 计算异常卡片总数
  const getAbnormalCards = () => {
    return stats.frozenCards + stats.lostCards;
  };

  // 计算活跃用户百分比
  const getActiveUserPercent = () => {
    return stats.totalUsers > 0 
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0;
  };

  // 计算异常卡片百分比
  const getAbnormalCardPercent = () => {
    return stats.totalCards > 0
      ? Math.round((getAbnormalCards() / stats.totalCards) * 100)
      : 0;
  };

  // 今日新增用户数
  const getNewUsersToday = () => {
    return stats.newUsersToday || 0;
  };

  return (
    <div>
      <Title level={3}>系统概览</Title>
      <Paragraph type="secondary">
        实时监控系统运行状态和关键指标
        <Button 
          type="link" 
          icon={<ReloadOutlined />} 
          onClick={loadData}
          loading={loading}
          style={{ marginLeft: 8 }}
        >
          刷新
        </Button>
      </Paragraph>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: '总用户数',
            value: stats.totalUsers,
            icon: <TeamOutlined />,
            color: '#1890ff',
            change: `+${getNewUsersToday()}`,
            changeType: 'increase' as const
          },
          {
            title: '总交易量',
            value: stats.totalTransactions,
            icon: <TransactionOutlined />,
            color: '#52c41a',
            change: `${stats.todayTransactions}笔今日`,
            changeType: 'increase' as const
          },
          {
            title: '系统总资产',
            value: stats.totalBalance,
            prefix: '¥',
            icon: <BankOutlined />,
            color: '#fa8c16',
            change: stats.fixedDepositTotal ? `定期: ¥${formatCurrency(stats.fixedDepositTotal, false)}` : '无定期',
            changeType: 'normal' as const
          },
          {
            title: '安全等级',
            value: stats.securityLevel,
            icon: <SafetyOutlined />,
            color: '#722ed1',
            change: stats.systemStatus,
            changeType: 'normal' as const
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
                  {stat.changeType === 'increase' ? '今日新增' : '当前状态'}
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
                    value={stats.activeUsers}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="冻结用户"
                    value={stats.frozenUsers}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </div>
                <Progress
                  percent={getActiveUserPercent()}
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
                    value={stats.activeCards}
                    prefix={<CreditCardOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="异常卡片"
                    value={getAbnormalCards()}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </div>
                <Progress
                  percent={getAbnormalCardPercent()}
                  status="normal"
                  strokeColor="#fa8c16"
                />
              </Card>
            </Col>
          </Row>

          {/* 系统告警时间线 */}
          <Card title="系统告警" style={{ marginBottom: 16 }}>
            {alerts.length > 0 ? (
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
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无系统告警
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：最近用户和交易 */}
        <Col xs={24} lg={8}>
          {/* 最近注册用户 */}
          <Card 
            title="最近注册用户"
            style={{ marginBottom: 16 }}
          >
            {recentUsers.length > 0 ? (
              <List
                size="small"
                dataSource={recentUsers}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: user.accountStatus === 0 ? '#87d068' : '#f50' 
                          }}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text strong>{user.name || user.username}</Text>
                          {getUserStatusTag(user.accountStatus)}
                        </div>
                      }
                      description={
                        <div>
                          <div>ID: {user.userId}</div>
                          <div>手机: {user.phone}</div>
                          <div>注册: {formatRelativeTime(user.createdTime)}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无最近注册用户
              </div>
            )}
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
                value={stats.todayIncome}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Statistic
                title="总支出"
                value={stats.todayOutcome}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: 8
            }}>
              <Text type="secondary">交易笔数:</Text>
              <Text strong>{stats.todayTransactions} 笔</Text>
            </div>
            {stats.pendingTransactions !== undefined && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: 8
              }}>
                <Text type="secondary">处理中交易:</Text>
                <Text strong>{stats.pendingTransactions} 笔</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;