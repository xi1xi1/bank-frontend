// src/pages/user/UserTransactions.tsx - 修复日期转换错误版本
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Typography,
  Input,
  DatePicker,
  Select,
  Space,
  Button,
  Tag,
  Spin,
  Empty,
  message,
  Row,
  Col,
  Statistic,
  Pagination,
  Modal,
  Radio,
  Form,
  Descriptions,
  Progress,
  Alert,
  Checkbox
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { transactionApi } from '../../api/transaction';
import { reportApi } from '../../api/report';
import { userApi } from '../../api/user';
import { formatCurrency } from '../../utils/formatter';
import type { UserStatistics, Transaction } from '../../types';
import { getCurrentUserId, requireLogin } from '../../utils/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 报告状态接口
interface ReportStatus {
  status: 'idle' | 'generating' | 'downloading' | 'success' | 'error';
  reportId?: string;
  progress?: number;
  message?: string;
}

// 报告类型
type ReportPeriod = 'monthly' | 'yearly';

// 生成报告的请求数据
interface GenerateReportRequest {
  userId: string;
  cardId?: string;
  reportType: ReportPeriod;
  year: number;
  month?: number;
  includeDetails: boolean;
}

// 获取交易记录的参数
interface FetchTransactionsParams {
  userId: string;
  page: number;
  pageSize: number;
  transType?: 'DEPOSIT' | 'WITHDRAW';
  startDate?: string;
  endDate?: string;
}

const UserTransactions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // 导出相关状态
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportForm] = Form.useForm();
  
  // 报告相关状态
  const [reportStatus, setReportStatus] = useState<ReportStatus>({ status: 'idle' });
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  
  // 本月统计数据 - 从后端获取
  const [monthlyStats, setMonthlyStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    totalTransaction: 0,
    transactionCount: 0
  });

  // 详情模态框状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const navigate = useNavigate();

  // 加载用户统计信息（按月统计）
  const loadUserStatistics = async (userId: string) => {
    setStatsLoading(true);
    try {
      const response = await userApi.getUserStatistics(userId);
      if (response.code === 200) {
        const statsData = response.data as any;
        setUserStats(statsData as UserStatistics);
        
        // 设置本月统计数据
        if (statsData.thisMonth) {
          const depositAmount = statsData.thisMonth.depositAmount || 0;
          const withdrawAmount = statsData.thisMonth.withdrawAmount || 0;
          const depositCount = statsData.thisMonth.depositCount || 0;
          const withdrawCount = statsData.thisMonth.withdrawCount || 0;
          const transactionCount = statsData.thisMonth.transactionCount || (depositCount + withdrawCount);
          
          setMonthlyStats({
            totalDeposit: depositAmount,
            totalWithdraw: withdrawAmount,
            totalTransaction: depositAmount + withdrawAmount,
            transactionCount: transactionCount
          });
        }
      } else {
        console.warn('获取用户统计信息失败:', response.message);
      }
    } catch (error: any) {
      console.error('获取用户统计信息失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // 获取交易记录
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        message.error('用户未登录');
        navigate('/login');
        return;
      }

      const params: FetchTransactionsParams = {
        userId: userId,
        page: currentPage,
        pageSize: pageSize
      };

      // 添加类型筛选
      if (typeFilter !== 'all') {
        params.transType = typeFilter === 'deposit' ? 'DEPOSIT' : 'WITHDRAW';
      }

      // 添加日期筛选
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      console.log('获取交易记录参数:', params);

      const transResponse = await transactionApi.getTransactions(params);

      if (transResponse.code === 200) {
        const data = transResponse.data;
        const transactionList = data?.transactions || [];
        const paginationData = data?.pagination;
        
        console.log('获取到的交易数据:', {
          total: paginationData?.total,
          currentPage: paginationData?.page,
          pageSize: paginationData?.pageSize,
          transactionsCount: transactionList.length
        });
        
        // 转换数据格式
        const safeData: Transaction[] = Array.isArray(transactionList) 
          ? transactionList.map((item: any, index: number) => ({
              transId: item.transId || `temp-${currentPage}-${index}`,
              transNo: item.transNo || `TX${item.transId}`,
              cardId: item.cardId,
              userId: item.userId,
              transType: item.transType,
              transSubtype: item.transSubtype,
              amount: item.amount || 0,
              balanceBefore: item.balanceBefore || 0,
              balanceAfter: item.balanceAfter || 0,
              fee: item.fee || 0,
              currency: item.currency || 'CNY',
              remark: item.remark,
              transTime: item.transTime || item.time,
              time: item.transTime || item.time,
              status: item.status || 'SUCCESS',
              operatorId: item.operatorId,
              operatorType: item.operatorType,
              completedTime: item.completedTime
            }))
          : [];
        
        setTransactions(safeData);
        
        // 更新分页信息
        if (paginationData) {
          setTotal(paginationData.total || 0);
        } else {
          setTotal(safeData.length);
        }
      } else {
        message.error(transResponse.message || '获取交易记录失败');
        setTransactions([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取交易记录失败:', error);
      message.error(error.message || '获取交易记录失败');
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, typeFilter, dateRange, navigate]);

  // 获取所有符合条件的交易（用于导出或统计）
  const fetchAllTransactions = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return [];
      }

      const params: FetchTransactionsParams = {
        userId: userId,
        page: 1,
        pageSize: 1000 // 获取较大数量的数据用于筛选
      };

      // 添加类型筛选
      if (typeFilter !== 'all') {
        params.transType = typeFilter === 'deposit' ? 'DEPOSIT' : 'WITHDRAW';
      }

      // 添加日期筛选
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await transactionApi.getTransactions(params);

      if (response.code === 200) {
        return response.data?.transactions || [];
      }
      return [];
    } catch (error) {
      console.error('获取所有交易失败:', error);
      return [];
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
      loadUserStatistics(userId); // 加载月度统计
    }
  }, [navigate]);

  // 当页码、页大小或筛选条件变化时，重新加载交易记录
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      // 当筛选条件变化时，重置到第一页
      if (searchText !== '' || typeFilter !== 'all' || dateRange) {
        setCurrentPage(1);
        setTimeout(() => fetchTransactions(), 0);
      } else {
        fetchTransactions();
      }
    }
  }, [currentPage, pageSize, typeFilter, dateRange, fetchTransactions]);

  const handleResetFilters = () => {
    setSearchText('');
    setTypeFilter('all');
    setDateRange(null);
    setCurrentPage(1);
  };

  // 应用搜索筛选（本地筛选，用于显示搜索结果）
  const applySearchFilter = (data: Transaction[]) => {
    if (!searchText.trim()) {
      return data;
    }
    
    const searchLower = searchText.toLowerCase();
    return data.filter(tx =>
      (tx.remark && tx.remark.toLowerCase().includes(searchLower)) ||
      (tx.transNo && tx.transNo.toLowerCase().includes(searchLower)) ||
      (tx.cardId && tx.cardId.toLowerCase().includes(searchLower))
    );
  };

  // 获取当前页显示的数据（应用本地搜索筛选）
  const getCurrentPageData = () => {
    return applySearchFilter(transactions);
  };

  // 查看交易详情
  const handleViewDetails = (record: Transaction) => {
    setSelectedTransaction(record);
    setDetailModalVisible(true);
  };

  // 生成报告
  const handleGenerateReport = async () => {
    try {
      const values = await exportForm.validateFields();
      setReportStatus({ 
        status: 'generating', 
        progress: 0,
        message: '正在生成报告...' 
      });
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        setReportStatus(prev => ({
          ...prev,
          progress: Math.min(90, (prev.progress || 0) + 10)
        }));
      }, 300);

      const userId = getCurrentUserId();
      if (!userId) {
        message.error('用户未登录');
        clearInterval(progressInterval);
        setReportStatus({ status: 'error', message: '用户未登录' });
        return;
      }

      // 获取所有符合条件的交易数据
      const allTransactions = await fetchAllTransactions();
      if (allTransactions.length === 0) {
        clearInterval(progressInterval);
        setReportStatus({ 
          status: 'error', 
          message: '没有找到符合条件的交易记录' 
        });
        message.error('没有找到符合条件的交易记录');
        return;
      }

      // 准备报告数据
      const reportData: GenerateReportRequest = {
        userId: userId,
        reportType: values.exportPeriod,
        year: values.reportYear,
        month: values.exportPeriod === 'monthly' ? values.reportMonth : undefined,
        includeDetails: true,
      };

      // 调用后端API生成报告
      const response = await reportApi.generateReport(reportData);
      
      clearInterval(progressInterval);
      
      if (response.code === 200) {
        setGeneratedReport(response.data);
        setReportStatus({ 
          status: 'success', 
          reportId: response.data.reportId,
          progress: 100,
          message: '报告生成成功！' 
        });
        
        message.success('报告生成成功！');
        
        // 如果选择了自动下载，开始下载
        if (values.autoDownload) {
          await handleDownloadReport(response.data.reportId, values.exportFormat);
        }
      } else {
        setReportStatus({ 
          status: 'error', 
          message: response.message || '生成报告失败' 
        });
        message.error(response.message || '生成报告失败');
      }
    } catch (error: any) {
      console.error('生成报告失败:', error);
      setReportStatus({ 
        status: 'error', 
        message: error.response?.data?.message || error.message || '生成报告失败' 
      });
      message.error(error.response?.data?.message || error.message || '生成报告失败');
    }
  };

  // 下载报告
  const handleDownloadReport = async (reportId: string, format: string) => {
    try {
      setReportStatus({ 
        status: 'downloading', 
        reportId,
        progress: 0,
        message: '正在下载报告...' 
      });
      
      setExportLoading(true);

      const blob = await reportApi.downloadReport(reportId, format);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `交易报告_${reportId}.${format}`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setReportStatus({ 
        status: 'success', 
        reportId,
        progress: 100,
        message: '报告下载成功！' 
      });
      
      message.success(`${format.toUpperCase()}报告下载成功！`);
      
      // 3秒后关闭模态框
      setTimeout(() => {
        if (exportModalVisible) {
          setExportModalVisible(false);
          setReportStatus({ status: 'idle' });
        }
      }, 3000);
    } catch (error: any) {
      console.error('下载报告失败:', error);
      setReportStatus({ 
        status: 'error', 
        message: error.response?.data?.message || error.message || '下载报告失败' 
      });
      message.error(error.response?.data?.message || error.message || '下载报告失败');
    } finally {
      setExportLoading(false);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    console.log('页码变化:', { page, pageSize, currentPage });
    if (page !== currentPage) {
      setCurrentPage(page);
    }
    if (pageSize && pageSize !== pageSize) {
      setPageSize(pageSize);
      setCurrentPage(1); // 改变页大小时回到第一页
    }
  };

  // 交易类型图标和颜色
  const getTypeConfig = (type?: string) => {
    const typeStr = type?.toUpperCase() || 'UNKNOWN';
    const configMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      '存款': { color: '#52c41a', icon: <ArrowUpOutlined />, text: '存款' },
      '取款': { color: '#ff4d4f', icon: <ArrowDownOutlined />, text: '取款' },
      '利息': { color: '#1890ff', icon: <DownloadOutlined />, text: '利息' },
      '转账': { color: '#722ed1', icon: <ArrowDownOutlined />, text: '转账' },
      'DEPOSIT': { color: '#52c41a', icon: <ArrowUpOutlined />, text: '存款' },
      'WITHDRAW': { color: '#ff4d4f', icon: <ArrowDownOutlined />, text: '取款' },
      'INTEREST': { color: '#1890ff', icon: <DownloadOutlined />, text: '利息' },
      'TRANSFER': { color: '#722ed1', icon: <ArrowDownOutlined />, text: '转账' },
      'CURRENT_DEPOSIT': { color: '#52c41a', icon: <ArrowUpOutlined />, text: '存款' },
      'CURRENT_WITHDRAW': { color: '#ff4d4f', icon: <ArrowDownOutlined />, text: '取款' },
      'FIXED_DEPOSIT_IN': { color: '#fa8c16', icon: <ArrowUpOutlined />, text: '定期存入' },
      'FIXED_DEPOSIT_EARLY': { color: '#13c2c2', icon: <ArrowUpOutlined />, text: '定期支取' },
      'UNKNOWN': { color: '#666', icon: null, text: '未知' }
    };
    
    return configMap[typeStr] || configMap['UNKNOWN'];
  };

  // 交易状态标签
  const getStatusColor = (status?: string) => {
    const statusStr = status?.toUpperCase() || '';
    const colors: Record<string, string> = {
      '成功': 'success',
      '失败': 'error',
      '处理中': 'processing',
      'SUCCESS': 'success',
      'FAILED': 'error',
      'PENDING': 'processing',
      'PROCESSING': 'processing'
    };
    return colors[statusStr] || 'default';
  };

  // 格式化时间显示
  const formatDateTime = (time?: string) => {
    if (!time) return { date: '-', time: '-' };
    
    try {
      const date = new Date(time);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString()
      };
    } catch (error) {
      console.error('日期解析错误:', error, '值:', time);
      return { date: time || '-', time: '时间格式错误' };
    }
  };

  // 格式化日期时间字符串 - 修复函数
  const formatDateTimeString = (dateTime?: string) => {
    if (!dateTime) return '-';
    
    try {
      const date = new Date(dateTime);
      return date.toLocaleString();
    } catch (error) {
      console.error('日期解析错误:', error, '值:', dateTime);
      return dateTime;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '交易时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
      render: (time?: string) => {
        const { date, time: timeStr } = formatDateTime(time);
        return (
          <div>
            <div>{date}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {timeStr}
            </Text>
          </div>
        );
      }
    },
    {
      title: '交易类型',
      dataIndex: 'transType',
      key: 'transType',
      width: 120,
      render: (type?: string, record?: Transaction) => {
        // 优先使用 transSubtype 显示更具体的交易类型
        const displayType = record?.transSubtype || type;
        const config = getTypeConfig(displayType);
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
      title: '交易流水号',
      dataIndex: 'transNo',
      key: 'transNo',
      width: 180,
      render: (transNo?: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {transNo || '-'}
        </Text>
      )
    },
    {
      title: '交易金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (amount?: number, record?: Transaction) => {
        const type = record?.transType?.toUpperCase();
        const subtype = record?.transSubtype?.toUpperCase();
        const amountNum = amount || 0;
        
        // 判断是否是存款类型
        const isDeposit = 
          type === '存款' || 
          type === 'DEPOSIT' ||
          subtype === 'CURRENT_DEPOSIT' ||
          subtype === 'FIXED_DEPOSIT_EARLY' ||
          (subtype === 'FIXED_DEPOSIT_IN' && amountNum > 0);
        
        // 判断是否是取款或转账转出
        const isWithdraw = 
          type === '取款' || 
          type === 'WITHDRAW' ||
          subtype === 'CURRENT_WITHDRAW' ||
          (subtype === 'FIXED_DEPOSIT_IN' && amountNum < 0);
        
        let color = '#333';
        let prefix = '';
        
        if (isDeposit) {
          color = '#52c41a';
          prefix = '+';
        } else if (isWithdraw) {
          color = '#ff4d4f';
          prefix = '-';
        }
        
        const displayAmount = Math.abs(amountNum);
        
        return (
          <Text strong style={{ 
            color,
            fontSize: '14px'
          }}>
            {prefix}{formatCurrency(displayAmount)}
          </Text>
        );
      }
    },
    {
      title: '交易后余额',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 140,
      render: (balance?: number) => (
        <Text strong>{formatCurrency(balance || 0)}</Text>
      )
    },
    {
      title: '银行卡号',
      dataIndex: 'cardId',
      key: 'cardId',
      width: 150,
      render: (cardId?: string) => (
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {cardId || '-'}
        </Text>
      )
    },
    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status?: string) => {
        const statusUpper = status?.toUpperCase() || '';
        const statusText = statusUpper === 'SUCCESS' ? '成功' : 
                          statusUpper === 'FAILED' ? '失败' : 
                          statusUpper === 'PENDING' || statusUpper === 'PROCESSING' ? '处理中' : status || '未知';
        return (
          <Tag color={getStatusColor(status)} style={{ margin: 0 }}>
            {statusText}
          </Tag>
        );
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark?: string) => (
        <div>
          <div>{remark || '-'}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Transaction) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
        >
          详情
        </Button>
      )
    }
  ];

  // 渲染报告状态
  const renderReportStatus = () => {
    if (reportStatus.status === 'idle') return null;

    let statusIcon = null;
    let statusColor = 'blue';
    
    switch (reportStatus.status) {
      case 'generating':
        statusIcon = <ClockCircleOutlined />;
        statusColor = 'blue';
        break;
      case 'downloading':
        statusIcon = <ClockCircleOutlined />;
        statusColor = 'blue';
        break;
      case 'success':
        statusIcon = <CheckCircleOutlined />;
        statusColor = 'green';
        break;
      case 'error':
        statusIcon = null;
        statusColor = 'red';
        break;
    }

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          message={
            <div>
              <strong>{reportStatus.message}</strong>
              {reportStatus.reportId && (
                <div style={{ marginTop: 4 }}>
                  报告ID: <Text code>{reportStatus.reportId}</Text>
                </div>
              )}
            </div>
          }
          type={reportStatus.status === 'error' ? 'error' : 'info'}
          icon={statusIcon}
          showIcon
          action={
            reportStatus.status === 'success' && generatedReport && (
              <Space>
                <Button 
                  size="small" 
                  onClick={() => handleDownloadReport(generatedReport.reportId, 'pdf')}
                >
                  下载PDF
                </Button>
                <Button 
                  size="small" 
                  onClick={() => handleDownloadReport(generatedReport.reportId, 'csv')}
                >
                  下载CSV
                </Button>
              </Space>
            )
          }
        />
        {(reportStatus.status === 'generating' || reportStatus.status === 'downloading') && (
          <Progress 
            percent={reportStatus.progress} 
            status="active"
            style={{ marginTop: 8 }}
          />
        )}
      </div>
    );
  };

  const currentPageData = getCurrentPageData();
  const displayData = currentPageData;

  return (
    <div style={{ padding: '0 16px', maxWidth: 1400, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>交易记录</Title>
      
      {/* 统计卡片 - 按月统计，从后端获取 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月存款总额"
              value={monthlyStats.totalDeposit}
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
              title="本月取款总额"
              value={monthlyStats.totalWithdraw}
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
              title="本月交易总额"
              value={monthlyStats.totalTransaction}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix="¥"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月交易笔数"
              value={monthlyStats.transactionCount}
              valueStyle={{ color: '#fa8c16' }}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="搜索交易流水号、银行卡号或备注..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          
          <Select
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1); // 改变类型筛选时回到第一页
            }}
            style={{ width: 120 }}
          >
            <Option value="all">全部类型</Option>
            <Option value="deposit">存款</Option>
            <Option value="withdraw">取款</Option>
          </Select>
          
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setCurrentPage(1); // 改变日期筛选时回到第一页
            }}
            style={{ width: 240 }}
            placeholder={['开始日期', '结束日期']}
          />
          
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              onClick={handleResetFilters}
            >
              重置筛选
            </Button>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                const userId = getCurrentUserId();
                if (userId) {
                  loadUserStatistics(userId); // 重新加载月度统计
                  fetchTransactions();
                }
              }}
              loading={loading || statsLoading}
            >
              刷新
            </Button>
            
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                setExportModalVisible(true);
                setReportStatus({ status: 'idle' });
                setGeneratedReport(null);
              }}
              disabled={total === 0}
            >
              生成报告
            </Button>
          </Space>
        </Space>
        
        <Text type="secondary">
          共 {total} 条记录，当前显示第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
          {searchText && `（搜索: "${searchText}"）`}
          {typeFilter !== 'all' && `（类型: ${typeFilter === 'deposit' ? '存款' : '取款'}）`}
        </Text>
      </Card>

      {/* 交易记录表格 - 正常分页 */}
      <Card>
        <Spin spinning={loading}>
          {displayData.length > 0 ? (
            <>
              <Table
                columns={columns}
                dataSource={displayData}
                rowKey={(record) => record.transNo || record.transId || `trans-${Math.random()}`}
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
              <div style={{ 
                marginTop: 24, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text type="secondary">
                  共 {total} 条记录，当前显示第 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} 条
                </Text>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                    setCurrentPage(1); // 改变页大小时回到第一页
                  }}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                />
              </div>
            </>
          ) : (
            <Empty
              description={
                total === 0 
                  ? "暂无交易记录" 
                  : "没有找到符合条件的交易"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {total === 0 && (
                <Button type="primary" onClick={fetchTransactions}>
                  加载交易记录
                </Button>
              )}
            </Empty>
          )}
        </Spin>
      </Card>

      {/* 生成报告模态框 */}
      <Modal
        title="生成账单报告"
        open={exportModalVisible}
        onCancel={() => {
          setExportModalVisible(false);
          setReportStatus({ status: 'idle' });
          setGeneratedReport(null);
        }}
        width={600}
        footer={null}
        destroyOnClose
      >
        <Form
          form={exportForm}
          layout="vertical"
          initialValues={{
            exportPeriod: 'monthly',
            exportFormat: 'pdf',
            reportYear: new Date().getFullYear(),
            reportMonth: new Date().getMonth() + 1,
            autoDownload: true
          }}
        >
          {/* 报告类型 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="报告类型"
                name="exportPeriod"
                rules={[{ required: true, message: '请选择报告类型' }]}
              >
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="monthly">月度报告</Radio.Button>
                  <Radio.Button value="yearly">年度报告</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="下载格式"
                name="exportFormat"
                rules={[{ required: true, message: '请选择下载格式' }]}
              >
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="pdf">
                    <Space>
                      <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                      PDF (.pdf)
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="csv">
                    <Space>
                      <FileTextOutlined style={{ color: '#1890ff' }} />
                      CSV (.csv)
                    </Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="年份"
                name="reportYear"
                rules={[{ required: true, message: '请选择年份' }]}
              >
                <Select placeholder="选择年份">
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <Option key={year} value={year}>{year}年</Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.exportPeriod !== currentValues.exportPeriod
                }
              >
                {({ getFieldValue }) => 
                  getFieldValue('exportPeriod') === 'monthly' ? (
                    <Form.Item
                      label="月份"
                      name="reportMonth"
                      rules={[{ required: true, message: '请选择月份' }]}
                    >
                      <Select placeholder="选择月份">
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1;
                          return (
                            <Option key={month} value={month}>
                              {month}月
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="autoDownload"
            valuePropName="checked"
          >
            <Checkbox>
              <Text>生成后自动下载</Text>
            </Checkbox>
          </Form.Item>

          {/* 报告状态显示 */}
          {renderReportStatus()}

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setExportModalVisible(false);
                  setReportStatus({ status: 'idle' });
                  setGeneratedReport(null);
                }}
              >
                取消
              </Button>
              <Button 
                type="primary"
                loading={reportStatus.status === 'generating' || reportStatus.status === 'downloading'}
                onClick={handleGenerateReport}
                disabled={reportStatus.status === 'generating' || reportStatus.status === 'downloading'}
                icon={<DownloadOutlined />}
              >
                生成报告
              </Button>
            </Space>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#f6f6f6', borderRadius: 4 }}>
            <strong>账单报告特点：</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>生成专业的银行账单报告</li>
              <li>包含期初余额、期末余额、交易汇总等完整信息</li>
              <li>PDF格式适合打印和存档</li>
              <li>CSV格式适合数据分析和处理</li>
              <li>所有数据直接从服务器获取，确保准确性</li>
            </ul>
          </div>
        </Form>
      </Modal>

      {/* 交易详情模态框 */}
      <Modal
        title="交易详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedTransaction && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="交易流水号">
                <Text strong>{selectedTransaction.transNo || `TX${selectedTransaction.transId}`}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="交易ID">
                <Text code>{selectedTransaction.transId}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="交易时间">
                {formatDateTimeString(selectedTransaction.transTime || selectedTransaction.time)}
              </Descriptions.Item>
              
              <Descriptions.Item label="交易类型">
                {(() => {
                  const displayType = selectedTransaction.transSubtype || selectedTransaction.transType;
                  const config = getTypeConfig(displayType);
                  return (
                    <Tag color={config.color} icon={config.icon}>
                      {config.text}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>
              
              <Descriptions.Item label="交易金额">
                <Text 
                  strong 
                  style={{ 
                    fontSize: '18px',
                    color: (selectedTransaction.amount || 0) >= 0 ? '#52c41a' : '#ff4d4f'
                  }}
                >
                  {(selectedTransaction.amount || 0) >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(selectedTransaction.amount || 0))}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="交易前余额">
                {formatCurrency(selectedTransaction.balanceBefore || 0)}
              </Descriptions.Item>
              
              <Descriptions.Item label="交易后余额">
                <Text strong>{formatCurrency(selectedTransaction.balanceAfter || 0)}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="银行卡号">
                {selectedTransaction.cardId || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="交易状态">
                <Tag color={getStatusColor(selectedTransaction.status)}>
                  {selectedTransaction.status === '成功' || selectedTransaction.status === 'SUCCESS' ? '成功' : 
                   selectedTransaction.status === '失败' || selectedTransaction.status === 'FAILED' ? '失败' : 
                   selectedTransaction.status === '处理中' || selectedTransaction.status === 'PENDING' ? '处理中' : 
                   selectedTransaction.status || '未知'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="手续费">
                {formatCurrency(selectedTransaction.fee || 0)}
              </Descriptions.Item>
              
              <Descriptions.Item label="交易子类型">
                {selectedTransaction.transSubtype || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="操作员">
                {selectedTransaction.operatorId || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="备注">
                {selectedTransaction.remark || '-'}
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 24, padding: 16, background: '#f6f6f6', borderRadius: 4 }}>
              <Text strong>交易说明：</Text>
              <div style={{ marginTop: 8 }}>
                {(selectedTransaction.amount || 0) >= 0 ? (
                  <p>资金已成功存入您的账户，可用于后续交易。</p>
                ) : (
                  <p>资金已从您的账户扣除，请确认资金到账情况。</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserTransactions;