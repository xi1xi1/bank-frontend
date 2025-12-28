import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Descriptions,
  Modal
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  BankOutlined,
  HistoryOutlined,
  SafetyOutlined,
  LockOutlined,
  MoneyCollectOutlined,
  KeyOutlined,
  UsergroupAddOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatDateTime } from '../../utils/formatter';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

interface OperationLog {
  logId: number;
  userId: string;
  userName: string;
  userRole: number;
  userRoleText: string;
  module: string;
  moduleText: string;
  operationType: string;
  operationTypeText: string;
  operationDetail: string;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string;
  status: number;
  statusText: string;
  createdTime: string;
  executionTime: number;
  errorMessage: string | null;
}

const OperationLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    user_id: '',
    operationType: '', // 修复：改为 operationType，和后端一致
    start_time: '',
    end_time: '',
    page: 1
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      // 构建请求参数，移除空值
      const requestParams: Record<string, any> = {
        page: filters.page,
        pageSize: 10  // 固定为10条每页
      };

      // 只添加有值的筛选条件
      if (filters.user_id) {
        requestParams.userId = filters.user_id;
      }
      if (filters.operationType) {
        requestParams.operationType = filters.operationType;
      }
      if (filters.start_time) {
        requestParams.startTime = filters.start_time;
      }
      if (filters.end_time) {
        requestParams.endTime = filters.end_time;
      }

      console.log('发送请求参数:', requestParams);
      const response = await adminApi.getOperationLogs(requestParams);
      const responseData = response.data;

      console.log('操作日志响应:', responseData);

      // 直接使用返回的数据
      if (responseData && responseData.logs) {
        setLogs(responseData.logs || []);
        if (responseData.pagination) {
          setTotal(responseData.pagination.total || 0);
        }
      } else {
        console.warn('返回数据格式异常:', responseData);
        setLogs([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('加载操作日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters.page]); // 只在页码变化时重新加载

  // 操作类型图标映射 - 添加新类型
  const getOperationIcon = (operationType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'LOGIN': <UserOutlined />,
      'LOGOUT': <UserOutlined />,
      'REGISTER': <UserOutlined />,
      'RESET_USER_PASSWORD': <KeyOutlined />, // 新增
      'BIND_CARD': <BankOutlined />,
      'UNBIND_CARD': <BankOutlined />,
      'DEPOSIT': <MoneyCollectOutlined />,
      'WITHDRAW': <MoneyCollectOutlined />,
      'FREEZE_CARD': <LockOutlined />,
      'UNFREEZE_CARD': <LockOutlined />,
      'CREATE_FD': <MoneyCollectOutlined />,
      'EARLY_WITHDRAW_FD': <MoneyCollectOutlined />,
      'MATURE_FD': <MoneyCollectOutlined />,
      'CHANGE_PASSWORD': <SafetyOutlined />,
      'UPDATE_INFO': <UserOutlined />,
      'ADD_ADMIN': <UsergroupAddOutlined />, // 新增
      'ADMIN_FREEZE': <LockOutlined />,
      'ADMIN_UNFREEZE': <LockOutlined />,
      'ADMIN_LOST_REPORT': <WarningOutlined />, // 新增
      'ADMIN_CANCEL_LOST': <CheckCircleOutlined />, // 新增
      'LOST_REPORT': <SafetyOutlined />,
      'CANCEL_LOST': <SafetyOutlined />
    };
    return iconMap[operationType] || <HistoryOutlined />;
  };

  // 操作类型颜色映射 - 添加新类型
  const getOperationColor = (operationType: string) => {
    const colorMap: Record<string, string> = {
      'LOGIN': 'success',
      'LOGOUT': 'default',
      'REGISTER': 'processing',
      'RESET_USER_PASSWORD': 'purple', // 新增
      'BIND_CARD': 'blue',
      'UNBIND_CARD': 'orange',
      'DEPOSIT': 'green',
      'WITHDRAW': 'volcano',
      'FREEZE_CARD': 'red',
      'UNFREEZE_CARD': 'green',
      'CREATE_FD': 'cyan',
      'EARLY_WITHDRAW_FD': 'gold',
      'MATURE_FD': 'lime',
      'CHANGE_PASSWORD': 'purple',
      'UPDATE_INFO': 'geekblue',
      'ADD_ADMIN': 'magenta',
      'ADMIN_FREEZE': 'red',
      'ADMIN_UNFREEZE': 'green',
      'ADMIN_LOST_REPORT': 'warning', // 新增
      'ADMIN_CANCEL_LOST': 'success', // 新增
      'LOST_REPORT': 'warning',
      'CANCEL_LOST': 'success'
    };
    return colorMap[operationType] || 'default';
  };

  // 操作类型文本映射（后备方案）
  const getOperationText = (operationType: string, defaultText?: string) => {
    const textMap: Record<string, string> = {
      'LOGIN': '登录',
      'LOGOUT': '退出登录',
      'REGISTER': '注册',
      'RESET_USER_PASSWORD': '重置用户密码',
      'BIND_CARD': '绑定银行卡',
      'UNBIND_CARD': '解绑银行卡',
      'DEPOSIT': '存款',
      'WITHDRAW': '取款',
      'FREEZE_CARD': '冻结银行卡',
      'UNFREEZE_CARD': '解冻银行卡',
      'CREATE_FD': '创建定期存款',
      'EARLY_WITHDRAW_FD': '提前支取定期',
      'MATURE_FD': '到期支取定期',
      'CHANGE_PASSWORD': '修改密码',
      'UPDATE_INFO': '更新信息',
      'ADD_ADMIN': '添加管理员',
      'ADMIN_FREEZE': '管理员冻结',
      'ADMIN_UNFREEZE': '管理员解冻',
      'ADMIN_LOST_REPORT': '管理员挂失银行卡',
      'ADMIN_CANCEL_LOST': '管理员解挂银行卡',
      'LOST_REPORT': '挂失银行卡',
      'CANCEL_LOST': '解挂银行卡'
    };
    return textMap[operationType] || defaultText || operationType;
  };

  const columns = [
    {
      title: '操作ID',
      dataIndex: 'logId',
      key: 'logId',
      width: 80,
      render: (id: number) => <Text code>#{id}</Text>
    },
    {
      title: '操作用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      render: (name: string, record: OperationLog) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <Tag color={record.userRole === 1 ? 'red' : 'blue'}>
                {record.userRoleText || (record.userRole === 1 ? '管理员' : '用户')}
              </Tag>
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 120,
      render: (operationType: string, record: OperationLog) => {
        const icon = getOperationIcon(record.operationType);
        const color = getOperationColor(record.operationType);
        // 使用后备映射确保有中文显示
        const displayText = getOperationText(operationType);
        return (
          <Tag color={color} icon={icon}>
            {displayText}
          </Tag>
        );
      }
    },
    {
      title: '操作模块',
      dataIndex: 'moduleText',
      key: 'module',
      width: 80,
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: '操作详情',
      dataIndex: 'operationDetail',
      key: 'operationDetail',
      ellipsis: true
    },
    {
      title: '操作时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      render: (time: string) => formatDateTime(time)
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip: string) => <Text code>{ip}</Text>
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'status',
      width: 70,
      render: (text: string, record: OperationLog) => (
        <Tag color={record.status === 1 ? 'green' : 'red'}>{text}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: OperationLog) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setSelectedLog(record)}
        >
          详情
        </Button>
      )
    }
  ];

  // 搜索按钮点击处理
  const handleSearch = () => {
    setFilters({ ...filters, page: 1 }); // 重置页码为1
    loadLogs(); // 手动触发加载
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>操作日志</Title>
      <Text type="secondary">查看系统所有用户和管理员的操作记录</Text>

      {/* 筛选条件 */}
      <div style={{ marginBottom: 24, marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {/* <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索用户ID"
              allowClear
              onSearch={(value) => {
                setFilters({ ...filters, user_id: value, page: 1 });
                // 立即搜索
                setTimeout(() => loadLogs(), 0);
              }}
            />
          </Col> */}
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="操作类型"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => {
                setFilters({ ...filters, operationType: value, page: 1 });
                // 立即搜索
                setTimeout(() => loadLogs(), 0);
              }}
            >
              <Option value="LOGIN">登录</Option>
              {/* <Option value="LOGOUT">退出登录</Option>
              <Option value="REGISTER">注册</Option> */}
              <Option value="DEPOSIT">存款</Option>
              <Option value="WITHDRAW">取款</Option>
              <Option value="BIND_CARD">绑定银行卡</Option>
              <Option value="UNBIND_CARD">解绑银行卡</Option>
              <Option value="CHANGE_PASSWORD">修改密码</Option>
              <Option value="RESET_USER_PASSWORD">重置用户密码</Option> {/* 修正 */}
              <Option value="FREEZE_CARD">冻结银行卡</Option>
              <Option value="UNFREEZE_CARD">解冻银行卡</Option>
              <Option value="CREATE_FD">创建定期存款</Option>
              <Option value="EARLY_WITHDRAW_FD">提前支取定期</Option>
              <Option value="MATURE_FD">到期支取定期</Option>
              <Option value="ADD_ADMIN">添加管理员</Option>
              <Option value="ADMIN_FREEZE">管理员冻结</Option>
              <Option value="ADMIN_UNFREEZE">管理员解冻</Option>
              {/* <Option value="LOST_REPORT">挂失银行卡</Option>
              <Option value="CANCEL_LOST">解挂银行卡</Option> */}
              <Option value="ADMIN_LOST_REPORT">管理员挂失银行卡</Option> {/* 修正 */}
              <Option value="ADMIN_CANCEL_LOST">管理员解挂银行卡</Option> {/* 修正 */}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    start_time: dates[0]?.format('YYYY-MM-DD') || '',
                    end_time: dates[1]?.format('YYYY-MM-DD') || '',
                    page: 1
                  });
                } else {
                  setFilters({
                    ...filters,
                    start_time: '',
                    end_time: '',
                    page: 1
                  });
                }
                // 立即搜索
                setTimeout(() => loadLogs(), 0);
              }}
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
              block
            >
              搜索
            </Button>
          </Col>
        </Row>
      </div>

      {/* 日志表格 */}
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="logId"
        loading={loading}
        pagination={{
          current: filters.page,
          pageSize: 10,  // 固定为10
          total: total,
          showSizeChanger: false,  // 隐藏每页条数选择器
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
          onChange: (page, pageSize) => {
            console.log('分页变化:', { page, pageSize });
            setFilters({ ...filters, page });
          }
        }}
        scroll={{ x: 1200 }}
      />

      {/* 日志详情模态框 */}
      <Modal
        title="操作日志详情"
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedLog(null)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedLog && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="日志ID" span={2}>
                <Text strong>#{selectedLog.logId}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作用户">
                <Space>
                  <UserOutlined />
                  <div>
                    <div><strong>{selectedLog.userName}</strong></div>
                    <div>
                      <Tag color={selectedLog.userRole === 1 ? 'red' : 'blue'}>
                        {selectedLog.userRoleText}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
                        ID: {selectedLog.userId}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作类型">
                <Space>
                  {getOperationIcon(selectedLog.operationType)}
                  <Tag color={getOperationColor(selectedLog.operationType)}>
                    {selectedLog.operationTypeText || getOperationText(selectedLog.operationType)}
                  </Tag>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作模块">
                <Tag>{selectedLog.moduleText}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作状态">
                <Tag color={selectedLog.status === 1 ? 'green' : 'red'}>
                  {selectedLog.statusText}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="执行时间">
                {selectedLog.executionTime}ms
              </Descriptions.Item>
              
              <Descriptions.Item label="操作详情" span={2}>
                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                  {selectedLog.operationDetail}
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="目标类型">
                {selectedLog.targetType || '无'}
              </Descriptions.Item>
              
              <Descriptions.Item label="目标ID">
                {selectedLog.targetId || '无'}
              </Descriptions.Item>
              
              <Descriptions.Item label="操作时间">
                {formatDateTime(selectedLog.createdTime)}
              </Descriptions.Item>
              
              <Descriptions.Item label="IP地址">
                <Text code>{selectedLog.ipAddress}</Text>
              </Descriptions.Item>
              
              {selectedLog.errorMessage && (
                <Descriptions.Item label="错误信息" span={2}>
                  <div style={{ color: '#ff4d4f', background: '#fff2f0', padding: '8px', borderRadius: '4px' }}>
                    {selectedLog.errorMessage}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogs;