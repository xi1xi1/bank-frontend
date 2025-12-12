import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, message, Tag } from 'antd';
import { 
  WalletOutlined, 
  CreditCardOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { userApi } from '../../api/user';
import { cardApi } from '../../api/card';
import { transactionApi } from '../../api/transaction';
import type { UserStatistics } from '../../api/user';
import type { CardInfo } from '../../api/card';
import type { Transaction } from '../../api/transaction';

interface DashboardCardInfo extends CardInfo {
  status_text: string;
}

interface DashboardTransaction extends Transaction {
  status_text?: string;
}

const Dashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [cards, setCards] = useState<DashboardCardInfo[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadData = async () => {
    setLoading(true);
    try {
      // 获取用户统计信息
      const statsRes = await userApi.getUserStatistics(user.user_id);
      setUserStats(statsRes.data);

      // 获取银行卡列表
      const cardsRes = await cardApi.getUserCards(user.user_id);
      setCards(cardsRes.data.cards);

      // 获取最近交易
      const transRes = await transactionApi.getTransactions({
        user_id: user.user_id,
        page: 1,
        page_size: 5
      });
      setRecentTransactions(transRes.data.transactions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '数据加载失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      title: '交易时间',
      dataIndex: 'time',
      key: 'time',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '交易类型',
      dataIndex: 'trans_type',
      key: 'trans_type',
      render: (type: string) => {
        const color = type === '存款' ? 'green' : 'red';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: amount > 0 ? 'green' : 'red' }}>
          {amount > 0 ? '+' : ''}{amount.toFixed(2)}
        </span>
      )
    },
    {
      title: '余额',
      dataIndex: 'balance_after',
      key: 'balance_after',
      render: (balance: number) => `¥${balance.toFixed(2)}`
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
        <h2>欢迎回来，{user.name}</h2>
        <Button icon={<ReloadOutlined />} onClick={loadData}>刷新数据</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总资产"
              value={userStats?.total_balance || 0}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
              suffix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="可用余额"
              value={userStats?.available_balance || 0}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={userStats?.this_month?.deposit_amount || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月支出"
              value={userStats?.this_month?.withdraw_amount || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="最近交易记录" style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={recentTransactions}
              rowKey="trans_id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="我的银行卡">
            {cards.map(card => (
              <Card.Grid key={card.card_id} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardOutlined style={{ fontSize: 24, marginRight: 12 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      **** **** **** {card.card_id.slice(-4)}
                    </div>
                    <div>余额: ¥{card.balance.toFixed(2)}</div>
                    <div>
                      <Tag color={card.status === 0 ? 'success' : 'error'}>
                        {card.status_text}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card.Grid>
            ))}
            <Button 
              type="dashed" 
              block 
              style={{ marginTop: 12 }}
              onClick={() => window.location.href = '/cards'}
            >
              管理银行卡
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;