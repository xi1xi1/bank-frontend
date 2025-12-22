// src/pages/user/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  message,
  Tag,
  Typography,
  Grid,
  Statistic,
  Spin,
  Empty,
  Alert,
  Divider,
  Badge
} from 'antd';
import {
  WalletOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  MoneyCollectOutlined,
  LockOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/user';
import { cardApi } from '../../api/card';
import { transactionApi } from '../../api/transaction';
import { formatCurrency, maskCardNumber } from '../../utils/formatter';
import { getCurrentUserId, requireLogin } from '../../utils/auth';
import type { UserStatistics, CardInfo, Transaction } from '../../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// 定义扩展的 MonthStatistics 接口
interface ExtendedMonthStatistics {
  depositCount: number;
  depositAmount: number;
  withdrawCount: number;
  withdrawAmount: number;
  interestEarned: number;
  transactionCount: number; // 添加缺失的字段
}

// 定义统计卡片类型
interface StatsCard {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    cards: true,
    transactions: true
  });
  const [overallLoading, setOverallLoading] = useState(true);
  
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // 格式化值函数，根据类型决定显示方式
  const formatValue = (value: number, type: 'money' | 'count' | 'default' = 'money') => {
    if (type === 'count') {
      // 对于计数类型，显示整数（无千位分隔符）
      return Math.round(value).toString();
    } else if (type === 'money') {
      // 对于金额，使用 formatCurrency
      return formatCurrency(value, false);
    }
    return value.toString();
  };

  // 加载所有数据
  useEffect(() => {
    const loadAllData = async () => {
      if (!requireLogin()) {
        navigate('/login');
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        message.error('用户ID获取失败，请重新登录');
        navigate('/login');
        return;
      }

      setLoading({ stats: true, cards: true, transactions: true });
      setOverallLoading(true);

      try {
        // 并行加载所有数据
        const [statsRes, cardsRes, transRes] = await Promise.allSettled([
          userApi.getUserStatistics(userId),
          cardApi.getUserCards(),
          transactionApi.getTransactions({
            userId: userId,
            page: 1,
            pageSize: 5
          })
        ]);

        // 处理统计信息
        if (statsRes.status === 'fulfilled' && statsRes.value.code === 200) {
          console.log('统计信息加载成功:', statsRes.value.data);
          
          // 处理 transactionCount 字段
          const statsData = statsRes.value.data as any;
          if (statsData.thisMonth) {
            // 计算 transactionCount 如果不存在
            if (!statsData.thisMonth.transactionCount) {
              const depositCount = statsData.thisMonth.depositCount || 0;
              const withdrawCount = statsData.thisMonth.withdrawCount || 0;
              statsData.thisMonth.transactionCount = depositCount + withdrawCount;
            }
          }
          
          setUserStats(statsData);
        } else {
          console.warn('统计信息加载失败:', statsRes);
        }
        setLoading(prev => ({ ...prev, stats: false }));

        // 处理银行卡信息
        if (cardsRes.status === 'fulfilled' && cardsRes.value.code === 200) {
          console.log('银行卡加载成功:', cardsRes.value.data);
          setCards(cardsRes.value.data.cards || []);
        } else {
          console.warn('银行卡加载失败:', cardsRes);
        }
        setLoading(prev => ({ ...prev, cards: false }));

        // 处理交易记录
        if (transRes.status === 'fulfilled' && transRes.value.code === 200) {
          console.log('交易记录加载成功:', transRes.value.data);
          const transactionsData = transRes.value.data?.transactions || [];
          const formattedTransactions = transactionsData.map((tx: any) => ({
            ...tx,
            transNo: tx.transNo || tx.transId || `T${Date.now()}`,
            time: tx.time || tx.transTime,
            transTime: tx.time || tx.transTime,
            transId: tx.transId || tx.transNo,
            transType: tx.transType || '未知',
            amount: tx.amount || 0,
            balanceAfter: tx.balanceAfter || 0
          }));
          setRecentTransactions(formattedTransactions);
        } else {
          console.warn('交易记录加载失败:', transRes);
        }
        setLoading(prev => ({ ...prev, transactions: false }));

      } catch (error) {
        console.error('数据加载失败:', error);
        message.error('数据加载失败');
      } finally {
        setOverallLoading(false);
      }
    };

    loadAllData();
  }, [navigate]);

  // 重新加载数据
  const handleReload = () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    setLoading({ stats: true, cards: true, transactions: true });
    setOverallLoading(true);

    Promise.allSettled([
      userApi.getUserStatistics(userId),
      cardApi.getUserCards(),
      transactionApi.getTransactions({
        userId: userId,
        page: 1,
        pageSize: 5
      })
    ]).then(([statsRes, cardsRes, transRes]) => {
      // 处理统计信息
      if (statsRes.status === 'fulfilled' && statsRes.value.code === 200) {
        const statsData = statsRes.value.data as any;
        if (statsData.thisMonth && !statsData.thisMonth.transactionCount) {
          const depositCount = statsData.thisMonth.depositCount || 0;
          const withdrawCount = statsData.thisMonth.withdrawCount || 0;
          statsData.thisMonth.transactionCount = depositCount + withdrawCount;
        }
        setUserStats(statsData);
      }
      setLoading(prev => ({ ...prev, stats: false }));

      // 处理银行卡信息
      if (cardsRes.status === 'fulfilled' && cardsRes.value.code === 200) {
        setCards(cardsRes.value.data.cards || []);
      }
      setLoading(prev => ({ ...prev, cards: false }));

      // 处理交易记录
      if (transRes.status === 'fulfilled' && transRes.value.code === 200) {
        const transactionsData = transRes.value.data?.transactions || [];
        const formattedTransactions = transactionsData.map((tx: any) => ({
          ...tx,
          transNo: tx.transNo || tx.transId || `T${Date.now()}`,
          time: tx.time || tx.transTime,
          transTime: tx.time || tx.transTime,
          transId: tx.transId || tx.transNo,
          transType: tx.transType || '未知',
          amount: tx.amount || 0,
          balanceAfter: tx.balanceAfter || 0
        }));
        setRecentTransactions(formattedTransactions);
      }
      setLoading(prev => ({ ...prev, transactions: false }));

      message.success('数据刷新成功');
      setOverallLoading(false);
    });
  };

  // 银行卡状态标签
  const getCardStatusTag = (status: number | string) => {
    let config: { color: string; text: string; icon?: React.ReactNode };
    
    if (typeof status === 'string') {
      switch (status) {
        case '正常':
        case '0':
          config = { color: 'success', text: '正常', icon: <CheckCircleOutlined /> };
          break;
        case '挂失':
        case '1':
          config = { color: 'warning', text: '挂失', icon: <WarningOutlined /> };
          break;
        case '冻结':
        case '2':
          config = { color: 'error', text: '冻结', icon: <WarningOutlined /> };
          break;
        case '已注销':
        case '3':
          config = { color: 'default', text: '已注销', icon: null };
          break;
        default:
          config = { color: 'default', text: status, icon: null };
      }
    } else {
      switch (status) {
        case 0:
          config = { color: 'success', text: '正常', icon: <CheckCircleOutlined /> };
          break;
        case 1:
          config = { color: 'warning', text: '挂失', icon: <WarningOutlined /> };
          break;
        case 2:
          config = { color: 'error', text: '冻结', icon: <WarningOutlined /> };
          break;
        case 3:
          config = { color: 'default', text: '已注销', icon: null };
          break;
        default:
          config = { color: 'default', text: '未知', icon: null };
      }
    }
    
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{ margin: 0 }}
      >
        {config.text}
      </Tag>
    );
  };

  // 统计卡片数据 - 根据后端返回的数据结构
  const statsCards: StatsCard[] = [
    {
      title: '总资产',
      value: userStats?.totalBalance || 0,
      prefix: '¥',
      icon: <WalletOutlined />,
      color: '#3f8600',
      description: '所有银行卡余额总和'
    },
    {
      title: '可用余额',
      value: userStats?.availableBalance || 0,
      prefix: '¥',
      icon: <MoneyCollectOutlined />,
      color: '#1890ff',
      description: '可随时使用的资金'
    },
    {
      title: '本月收入',
      value: userStats?.thisMonth?.depositAmount || 0,
      prefix: '¥',
      icon: <ArrowUpOutlined />,
      color: '#52c41a',
      description: '本月存款总额'
    },
    {
      title: '本月支出',
      value: userStats?.thisMonth?.withdrawAmount || 0,
      prefix: '¥',
      icon: <ArrowDownOutlined />,
      color: '#ff4d4f',
      description: '本月取款总额'
    }
  ];

  // 资产概览卡片 - 添加类型标记
  const assetCards: (StatsCard & { valueType: 'money' | 'count' })[] = [
    {
      title: '定期存款',
      value: userStats?.fixedDepositAmount || 0,
      prefix: '¥',
      icon: <BankOutlined />,
      color: '#fa8c16',
      description: '定期存款总额',
      valueType: 'money'
    },
    {
      title: '冻结金额',
      value: userStats?.frozenAmount || 0,
      prefix: '¥',
      icon: <LockOutlined />,
      color: '#d4380d',
      description: '被冻结的资金',
      valueType: 'money'
    },
    {
      title: '银行卡统计',
      value: userStats?.cardCount || 0,
      suffix: `张 (${userStats?.activeCardCount || 0}张正常)`,
      icon: <CreditCardOutlined />,
      color: '#722ed1',
      description: '银行卡总数',
      valueType: 'count'  // 标记为计数类型
    },
    {
      title: '本月交易',
      value: (userStats?.thisMonth as any)?.transactionCount || 0,
      suffix: '笔',
      icon: <LineChartOutlined />,
      color: '#13c2c2',
      description: '本月交易总次数',
      valueType: 'count'  // 标记为计数类型
    }
  ];

  // 计算本月总交易次数（如果后端没返回的话）
  const getMonthlyTransactionCount = () => {
    if (!userStats?.thisMonth) return 0;
    const monthStats = userStats.thisMonth as any;
    
    // 如果后端提供了 transactionCount，直接使用
    if (monthStats.transactionCount !== undefined) {
      return Math.round(monthStats.transactionCount); // 确保是整数
    }
    
    // 否则计算存款+取款次数
    const depositCount = monthStats.depositCount || 0;
    const withdrawCount = monthStats.withdrawCount || 0;
    return depositCount + withdrawCount;
  };

  // 交易表格列定义
  const transactionColumns = [
    {
      title: '交易时间',
      key: 'time',
      width: 180,
      render: (_: any, record: any) => {
        const timeValue = record.time || record.transTime;
        
        if (!timeValue) {
          return (
            <div>
              <div>-</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                -
              </Text>
            </div>
          );
        }
        
        try {
          const date = new Date(timeValue);
          return (
            <div>
              <div>{date.toLocaleDateString()}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {date.toLocaleTimeString()}
              </Text>
            </div>
          );
        } catch (error) {
          return (
            <div>
              <div>{timeValue}</div>
            </div>
          );
        }
      }
    },
    {
      title: '交易类型',
      dataIndex: 'transType',
      key: 'transType',
      width: 100,
      render: (type: string) => {
        const typeConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          'DEPOSIT': { color: '#52c41a', icon: <ArrowUpOutlined />, text: '存款' },
          'WITHDRAW': { color: '#ff4d4f', icon: <ArrowDownOutlined />, text: '取款' },
          'INTEREST': { color: '#1890ff', icon: <MoneyCollectOutlined />, text: '利息' },
          '存款': { color: '#52c41a', icon: <ArrowUpOutlined />, text: '存款' },
          '取款': { color: '#ff4d4f', icon: <ArrowDownOutlined />, text: '取款' },
          '利息': { color: '#1890ff', icon: <MoneyCollectOutlined />, text: '利息' }
        };
        
        const config = typeConfig[type] || { color: '#666', icon: null, text: type || '未知' };
        
        return (
          <Tag 
            color={config.color} 
            icon={config.icon}
            style={{ border: 'none', padding: '4px 8px' }}
          >
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: any) => {
        const isDeposit = record.transType === 'DEPOSIT' || record.transType === '存款';
        const isWithdraw = record.transType === 'WITHDRAW' || record.transType === '取款';
        
        let color = '#333';
        let prefix = '';
        
        if (isDeposit) {
          color = '#52c41a';
          prefix = '+';
        } else if (isWithdraw) {
          color = '#ff4d4f';
          prefix = '-';
        }
        
        return (
          <Text strong style={{ color }}>
            {prefix}{formatCurrency(amount)}
          </Text>
        );
      }
    },
    {
      title: '余额',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 120,
      render: (balance: number) => (
        <Text strong>{formatCurrency(balance)}</Text>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 150 }}>
          {remark || '-'}
        </Text>
      )
    }
  ];

  // 显示加载状态
  if (overallLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: screens.xs ? 0 : 0 }}>
      {/* 页面标题和操作 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <Title level={3} style={{ margin: 0 }}>我的账户</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={handleReload}
          loading={overallLoading}
        >
          刷新数据
        </Button>
      </div>

      {/* 主要统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card 
              loading={loading.stats}
              style={{ height: '100%' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: 12
              }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <div style={{ fontSize: 20, color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {stat.title}
                  </Text>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    color: stat.color, 
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'baseline'
                  }}>
                    {stat.prefix && <span>{stat.prefix}</span>}
                    {formatValue(stat.value, 'money')}
                    {stat.suffix && <Text style={{ fontSize: 14, marginLeft: 4 }}>{stat.suffix}</Text>}
                  </div>
                </div>
              </div>
              {stat.description && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {stat.description}
                </Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 资产概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {assetCards.map((asset, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card 
              loading={loading.stats}
              style={{ height: '100%' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: 12
              }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%',
                  background: `${asset.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <div style={{ fontSize: 20, color: asset.color }}>
                    {asset.icon}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {asset.title}
                  </Text>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    color: asset.color, 
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'baseline'
                  }}>
                    {asset.prefix && `${asset.prefix}`}
                    {formatValue(asset.value, asset.valueType)}
                    {asset.suffix && <Text style={{ fontSize: 14, marginLeft: 4 }}>{asset.suffix}</Text>}
                  </div>
                </div>
              </div>
              {asset.description && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {asset.description}
                </Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 详细内容区域 */}
        <Row gutter={[16, 16]}>
          {/* 最近交易记录 */}
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
                  最近交易记录
                  <span style={{ 
                    fontSize: 12, 
                    color: '#666', 
                    marginLeft: 8,
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    {getMonthlyTransactionCount()} 笔
                  </span>
                </div>
              }
              loading={loading.transactions}
              extra={
                recentTransactions.length > 0 && (
                  <Button 
                    type="link" 
                    onClick={() => navigate('/transactions')}
                    size="small"
                  >
                    查看更多
                  </Button>
                )
              }
            >
              {recentTransactions.length > 0 ? (
                <Table
                  columns={transactionColumns}
                  dataSource={recentTransactions}
                  rowKey={(record) => record.transNo || record.transId || `trans-${Math.random()}`}
                  pagination={false}
                  size="middle"
                  scroll={screens.xs ? { x: 800 } : undefined}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无交易记录"
                />
              )}
            </Card>
          </Col>

          {/* 我的银行卡 */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                  我的银行卡
                  <span style={{ 
                    fontSize: 12, 
                    color: '#666', 
                    marginLeft: 8,
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    {Math.round(userStats?.cardCount || 0)} 张
                  </span>
                </div>
              }
              loading={loading.cards}
              extra={
                cards.length > 0 && (
                  <Button 
                    type="link" 
                    onClick={() => navigate('/cards')}
                    size="small"
                  >
                    管理
                  </Button>
                )
              }
            >
              {cards.length > 0 ? (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {cards.map((card, index) => (
                    <React.Fragment key={card.cardId || index}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '12px 0'
                      }}>
                        <div style={{ marginRight: 12 }}>
                          <CreditCardOutlined style={{ 
                            fontSize: 24, 
                            color: (typeof card.status === 'string' ? 
                              (card.status === '正常' || card.status === '0') : 
                              card.status === 0) ? '#1890ff' : '#999' 
                          }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4
                          }}>
                            <Text strong>
                              {card.maskedCardId || maskCardNumber(card.cardId || '未知卡号')}
                            </Text>
                            {getCardStatusTag(card.status)}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 12
                          }}>
                            <Text type="secondary">
                              余额: {formatCurrency(card.balance || 0)}
                            </Text>
                            <Text type="secondary">
                              可用: {formatCurrency(card.availableBalance || 0)}
                            </Text>
                          </div>
                          {card.cardType && (
                            <div style={{ marginTop: 4 }}>
                              <Tag color="blue">{card.cardType}</Tag>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < cards.length - 1 && <Divider style={{ margin: 0 }} />}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无银行卡"
                />
              )}
            </Card>
          </Col>
        </Row>
    </div>
  );
};

export default Dashboard;