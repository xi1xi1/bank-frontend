// src/pages/admin/OperationLogs.tsx - 简化版
import React, { useState, useEffect } from 'react';
import {
  Card,
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
  Modal,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  UserOutlined,
  SecurityScanOutlined,
  BankOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatDateTime } from '../../utils/formatter';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const OperationLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filters, setFilters] = useState({
    user_id: '',
    action_type: '',
    start_time: '',
    end_time: '',
    page: 1,
    page_size: 10
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getOperationLogs(filters);
      const logsData = response.logs || [];
      setLogs(logsData);
    } catch (error) {
      console.error('加载操作日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const columns = [
    {
      title: '操作ID',
      dataIndex: 'log_id',
      key: 'log_id',
      width: 80,
      render: (id: number) => <Text code>#{id}</Text>
    },
    {
      title: '操作用户',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
      render: (name: string, record: any) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <Tag color={record.user_role === '管理员' ? 'red' : 'blue'}>
                {record.user_role}
              </Tag>
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '操作类型',
      dataIndex: 'action_type',
      key: 'action_type',
      width: 120,
      render: (type: string) => {
        const actionTypeMap: Record<string, { color: string; icon: React.ReactNode }> = {
          '登录': { color: 'success', icon: <UserOutlined /> },
          '退出登录': { color: 'default', icon: <UserOutlined /> },
          '存款': { color: 'green', icon: <BankOutlined /> },
          '取款': { color: 'volcano', icon: <BankOutlined /> },
          '绑定银行卡': { color: 'blue', icon: <BankOutlined /> },
          '解绑银行卡': { color: 'orange', icon: <BankOutlined /> }
        };
        const config = actionTypeMap[type] || { color: 'default', icon: <HistoryOutlined /> };
        return (
          <Tag color={config.color} icon={config.icon}>
            {type}
          </Tag>
        );
      }
    },
    {
      title: '操作详情',
      dataIndex: 'action_detail',
      key: 'action_detail',
      ellipsis: true
    },
    {
      title: '操作时间',
      dataIndex: 'op_time',
      key: 'op_time',
      width: 150,
      render: (time: string) => formatDateTime(time)
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120,
      render: (ip: string) => <Text code>{ip}</Text>
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
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

  return (
    <div>
      <Title level={3}>操作日志</Title>
      <Text type="secondary">查看系统所有用户和管理员的操作记录</Text>

      {/* 筛选条件 */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜索用户ID或姓名"
              allowClear
              onSearch={(value) => setFilters({ ...filters, user_id: value })}
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="操作类型"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilters({ ...filters, action_type: value })}
            >
              <Option value="登录">登录</Option>
              <Option value="退出登录">退出登录</Option>
              <Option value="存款">存款</Option>
              <Option value="取款">取款</Option>
              <Option value="绑定银行卡">绑定银行卡</Option>
              <Option value="解绑银行卡">解绑银行卡</Option>
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
                    end_time: dates[1]?.format('YYYY-MM-DD') || ''
                  });
                } else {
                  setFilters({
                    ...filters,
                    start_time: '',
                    end_time: ''
                  });
                }
              }}
            />
          </Col>
        </Row>
      </div>

      {/* 日志表格 */}
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="log_id"
        loading={loading}
        pagination={{
          pageSize: filters.page_size,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (page, pageSize) => {
            setFilters({ ...filters, page, page_size: pageSize });
          }
        }}
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
                <Text strong>#{selectedLog.log_id}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作用户">
                <Space>
                  <UserOutlined />
                  <div>
                    <div>{selectedLog.user_name}</div>
                    <div>
                      <Tag color={selectedLog.user_role === '管理员' ? 'red' : 'blue'}>
                        {selectedLog.user_role}
                      </Tag>
                    </div>
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作类型">
                <Tag color="blue">{selectedLog.action_type}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="操作详情" span={2}>
                {selectedLog.action_detail}
              </Descriptions.Item>
              
              <Descriptions.Item label="操作时间">
                {formatDateTime(selectedLog.op_time)}
              </Descriptions.Item>
              
              <Descriptions.Item label="IP地址">
                <Text code>{selectedLog.ip_address}</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogs;