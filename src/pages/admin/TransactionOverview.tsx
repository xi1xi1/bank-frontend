import React, { useState, useEffect, useCallback } from 'react';
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
  Spin,
  message,
  Tooltip,
  Alert,
  Input,
  Form,
  Tag
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatCurrency } from '../../utils/formatter';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 交易概览接口类型
interface DailyStat {
  date: string;
  deposit_count: number;
  deposit_amount: number;
  withdraw_count: number;
  withdraw_amount: number;
  total_count: number;
}

interface TypeStat {
  trans_type: string;
  count: number;
  total_amount: number;
}

interface OverviewData {
  dailyStats: DailyStat[];
  typeStats: TypeStat[];
  totalStats: {
    totalTransactions: number;
    totalDeposit: number;
    totalWithdraw: number;
    netFlow: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// 交易记录接口类型
interface TransactionRecord {
  trans_id: number;
  trans_no: string;
  card_id: string;
  user_id: string;
  user_name?: string;
  trans_type: string;
  amount: number;
  balance_before?: number;
  balance_after?: number;
  fee?: number;
  status: number;
  remark?: string;
  trans_time: string;
  ip_address?: string;
  device_info?: string;
}

interface TransactionListResponse {
  transactions: TransactionRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const TransactionOverview: React.FC = () => {
  // 交易概览状态
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewData>({
    dailyStats: [],
    typeStats: [],
    totalStats: {
      totalTransactions: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      netFlow: 0
    },
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });
  
  // 交易记录状态
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  
  const [timeRange, setTimeRange] = useState('week');
  const [customDates, setCustomDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [error, setError] = useState<string>('');
  
  // 交易记录搜索参数
  const [searchParams, setSearchParams] = useState({
    userId: '',
    cardId: '',
    transType: '',
    // transNo: '',
    // status: undefined as number | undefined,
    startDate: '',
    endDate: ''
  });

  // 加载交易概览数据
  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let params: any = {};
      
      if (timeRange === 'custom' && customDates) {
        params.startDate = customDates[0].format('YYYY-MM-DD');
        params.endDate = customDates[1].format('YYYY-MM-DD');
      } else if (timeRange !== 'custom') {
        params.dateRange = timeRange;
      }
      
      const response = await adminApi.getTransactionOverview(params);
      const transactionData = response.data;
      
      if (transactionData && transactionData.totalStats) {
        setOverviewData(transactionData);
      } else {
        throw new Error('数据格式不正确');
      }
      
    } catch (error: any) {
      console.error('❌ 加载交易概览失败:', error);
      let errorMsg = '网络请求失败';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setError(errorMsg);
      message.error(`加载失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [timeRange, customDates]);

  // 加载交易记录
  const loadTransactions = useCallback(async (page = 1, pageSize = 10) => {
    setTransactionLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        ...searchParams
      };
      
      // 清理空参数
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await adminApi.getTransactionList(params);
      const data = response.data;
      
      setTransactions(data.transactions || []);
      setPagination(data.pagination || {
        page,
        pageSize,
        total: 0,
        totalPages: 0
      });
      
    } catch (error) {
      console.error('加载交易记录失败:', error);
      message.error('加载交易记录失败');
    } finally {
      setTransactionLoading(false);
    }
  }, [searchParams]);

  // 初始化加载
  useEffect(() => {
    loadOverview();
    loadTransactions();
  }, [loadOverview, loadTransactions]);

  // 时间范围改变时重新加载概览
  useEffect(() => {
    if (timeRange !== 'custom') {
      loadOverview();
    }
  }, [timeRange, loadOverview]);

  // 处理自定义日期范围确认
  const handleCustomDateConfirm = () => {
    if (!customDates) {
      message.warning('请选择日期范围');
      return;
    }
    loadOverview();
  };

  // 处理交易记录搜索
  const handleSearch = () => {
    loadTransactions(1, pagination.pageSize);
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    loadTransactions(pagination.current, pagination.pageSize);
  };

  // 格式化日期显示
  const formatDate = (date: string) => {
    return dayjs(date).format('MM-DD');
  };

  // 格式化完整日期
  const formatFullDate = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  // 格式化日期时间
  const formatDateTime = (dateTime: string) => {
    return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
  };

  // 交易类型中文转换
  const getTransTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'DEPOSIT': '存款',
      'WITHDRAW': '取款',
      'TRANSFER': '转账',
     // 'INTEREST': '利息'
    };
    return typeMap[type] || type;
  };

  // 交易状态中文转换
  const getStatusText = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      0: { text: '失败', color: 'red' },
      1: { text: '成功', color: 'green' },
      2: { text: '处理中', color: 'orange' }
    };
    const config = statusMap[status] || { text: '未知', color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 交易记录表格列定义
  const transactionColumns = [
    {
      title: '流水号',
      dataIndex: 'trans_no',
      key: 'trans_no',
      width: 160,
      ellipsis: true
    },
    {
      title: '交易时间',
      dataIndex: 'trans_time',
      key: 'trans_time',
      width: 160,
      render: (time: string) => formatDateTime(time)
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100
    },
    {
      title: '卡号',
      dataIndex: 'card_id',
      key: 'card_id',
      width: 140
    },
    {
      title: '交易类型',
      dataIndex: 'trans_type',
      key: 'trans_type',
      width: 80,
      render: (type: string) => getTransTypeText(type)
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: TransactionRecord) => {
        // const isDeposit = record.trans_type === 'DEPOSIT' || record.trans_type === 'INTEREST';
        // return (
        //   <span style={{ 
        //     color: isDeposit ? '#52c41a' : '#f5222d',
        //     fontWeight: 500
        //   }}>
        //     {isDeposit ? '+' : '-'}{formatCurrency(amount)}
        //   </span>
        // );
            const isAddMoney = 
      record.trans_type === 'DEPOSIT' || 
      (record.trans_type === 'WITHDRAW' && record.remark && record.remark.includes('定期存款'));
    
    return (
      <span style={{ 
        color: isAddMoney ? '#52c41a' : '#f5222d',
        fontWeight: 500
      }}>
        {isAddMoney ? '+' : '-'}{formatCurrency(amount)}
      </span>
    );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => getStatusText(status)
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      width: 150
    }
    // {
    //   title: '操作',
    //   key: 'action',
    //   width: 80,
    //   render: (_: any, record: TransactionRecord) => (
    //     <Button type="link" size="small" onClick={() => {
    //       // 查看详情
    //       console.log('查看交易详情:', record);
    //       message.info(`查看交易 ${record.trans_no} 详情`);
    //     }}>
    //       详情
    //     </Button>
    //   )
    // }
  ];

  // 统计卡片
  const statCards = (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="总存款金额"
            value={overviewData.totalStats.totalDeposit}
            precision={2}
            valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            prefix="¥"
            suffix={<ArrowUpOutlined />}
          />
          {/* <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
            存款笔数: {overviewData.dailyStats.reduce((sum, item) => sum + (item.deposit_count || 0), 0)}
          </Text> */}
            <Text type="secondary" style={{ 
            fontSize: '12px', 
             display: 'block', 
            marginTop: 4 
           }}>
              &nbsp;
            </Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="总取款金额"
            value={overviewData.totalStats.totalWithdraw}
            precision={2}
            valueStyle={{ color: '#f5222d', fontSize: '20px' }}
            prefix="¥"
            suffix={<ArrowDownOutlined />}
          />
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
            取款笔数: {overviewData.dailyStats.reduce((sum, item) => sum + (item.withdraw_count || 0), 0)}
          </Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="净现金流"
            value={overviewData.totalStats.netFlow}
            precision={2}
            valueStyle={{ 
              color: overviewData.totalStats.netFlow >= 0 ? '#52c41a' : '#f5222d',
              fontSize: '20px'
            }}
            prefix="¥"
          />
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
            {overviewData.totalStats.netFlow >= 0 ? '现金净流入' : '现金净流出'}
          </Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="交易总笔数"
            value={overviewData.totalStats.totalTransactions}
            valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
          />
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
            统计周期: {formatFullDate(overviewData.dateRange.startDate)} 至 {formatFullDate(overviewData.dateRange.endDate)}
          </Text>
        </Card>
      </Col>
    </Row>
  );

const searchForm = (
  <Card style={{ marginBottom: 24 }} title="交易记录查询">
    <Form layout="inline">
      <Form.Item label="用户ID">
        <Input
          placeholder="输入用户ID"
          value={searchParams.userId}
          onChange={e => setSearchParams({...searchParams, userId: e.target.value})}
          style={{ width: 120 }}
        />
      </Form.Item>
      <Form.Item label="银行卡号">
        <Input
          placeholder="输入卡号"
          value={searchParams.cardId}
          onChange={e => setSearchParams({...searchParams, cardId: e.target.value})}
          style={{ width: 150 }}
        />
      </Form.Item>
      <Form.Item label="交易类型">
        <Select
          placeholder="选择类型"
          value={searchParams.transType || undefined}
          onChange={value => setSearchParams({...searchParams, transType: value})}
          style={{ width: 100 }}
          allowClear
        >
          <Option value="DEPOSIT">存款</Option>
          <Option value="WITHDRAW">取款</Option>
          <Option value="TRANSFER">转账</Option>
        </Select>
      </Form.Item>
      <Form.Item label="交易日期">
        <RangePicker
            value={
      searchParams.startDate && searchParams.endDate
        ? [dayjs(searchParams.startDate), dayjs(searchParams.endDate)]
        : null  // 重置时设为 null
    }
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setSearchParams({
                ...searchParams,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
              });
            } else {
              setSearchParams({
                ...searchParams,
                startDate: '',
                endDate: ''
              });
            }
          }}
          format="YYYY-MM-DD"
        />
      </Form.Item>
      <Form.Item>
        {/* <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={transactionLoading}
        >
          搜索
        </Button> */}
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => {
            setSearchParams({
              userId: '',
              cardId: '',
              transType: '',
              startDate: '',
              endDate: ''
            });
          }}
        >
          重置
        </Button>
      </Form.Item>
    </Form>
  </Card>
);

  // 加载状态
  if (loading && overviewData.dailyStats.length === 0) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="加载交易数据..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <LineChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        交易监控
      </Title>
      
      {/* 错误提示 */}
      {error && (
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={loadOverview}>
              重试
            </Button>
          }
        />
      )}
      
      {/* 统计卡片 */}
      {statCards}
      
      {/* 交易概览控制面板
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Title level={5} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            交易概览设置
          </Title>
          
          <Space wrap size="middle">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text style={{ marginRight: 8, fontSize: '14px' }}>时间范围:</Text>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
                disabled={loading}
              >
                <Option value="today">今日</Option>
                <Option value="week">本周</Option>
                <Option value="month">本月</Option>
                <Option value="year">本年</Option>
                <Option value="custom">自定义</Option>
              </Select>
            </div>
            
            {timeRange === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RangePicker
                  value={customDates}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setCustomDates([dates[0], dates[1]]);
                    } else {
                      setCustomDates(null);
                    }
                  }}
                  format="YYYY-MM-DD"
                  disabled={loading}
                  style={{ width: 240 }}
                />
                <Button 
                  type="primary" 
                  onClick={handleCustomDateConfirm}
                  disabled={!customDates || loading}
                  icon={<CalendarOutlined />}
                  loading={loading}
                >
                  确认
                </Button>
              </div>
            )}
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadOverview}
              loading={loading}
            >
              刷新概览
            </Button>
          </Space>
        </div>
      </Card> */}
      
      {/* 交易记录查询 */}
      {searchForm}
      
      {/* 交易记录表格 */}
      <Card 
        title={`交易记录列表 (共 ${pagination.total} 条)`}
        loading={transactionLoading}
      >
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">暂无交易记录</Text>
          </div>
        ) : (
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="trans_id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};

export default TransactionOverview;