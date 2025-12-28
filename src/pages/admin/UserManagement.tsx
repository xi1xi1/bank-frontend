// src/pages/admin/UserManagement.tsx - 修复完整版
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Select,
  message,
  Typography,
  Tooltip,
  Row,
  Col,
  Statistic,
  Badge,
  Form
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  UserOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// 定义用户接口
interface User {
  userId?: string;
  username?: string;
  phone?: string;
  name?: string;
  role?: number;
  accountStatus?: number;
  cardCount?: number;
  totalBalance?: number;
  createdTime?: string;
  lastLoginTime?: string;
  
  // 兼容字段
  user_id?: string;
  account_status?: number;
  card_count?: number;
  total_balance?: number;
  created_time?: string;
  last_login_time?: string;
}

const UserManagement: React.FC = () => {
  // 用户列表相关状态
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 添加管理员相关状态
  const [addAdminModalVisible, setAddAdminModalVisible] = useState(false);
  const [adminForm] = Form.useForm();

  // 统一字段获取函数
  const getField = (user: User, fieldName: string): any => {
    switch (fieldName) {
      case 'user_id':
        return String(user.userId || user.user_id || '');
      case 'username':
        return String(user.username || '');
      case 'phone':
        return String(user.phone || '');
      case 'name':
        return String(user.name || '');
      case 'role':
        return Number(user.role || 0);
      case 'account_status':
        return user.accountStatus !== undefined ? user.accountStatus : 
               (user.account_status !== undefined ? user.account_status : 0);
      case 'card_count':
        return user.cardCount !== undefined ? user.cardCount : 
               (user.card_count !== undefined ? user.card_count : 0);
      case 'total_balance':
        return user.totalBalance !== undefined ? user.totalBalance : 
               (user.total_balance !== undefined ? user.total_balance : 0);
      case 'created_time':
        return String(user.createdTime || user.created_time || '-');
      case 'last_login_time':
        return String(user.lastLoginTime || user.last_login_time || '-');
      default:
        return '';
    }
  };

  // 加载用户数据
  const loadUsers = async (
    page = 1, 
    pageSize = 10,  
    currentSearchText = searchText, 
    currentStatusFilter = statusFilter
  ) => {
    setLoading(true);
    try {
      const params = {
      page,
      pageSize,  // 改为 pageSize（驼峰）
      search: currentSearchText || undefined,
      accountStatus: currentStatusFilter !== 'all' ? parseInt(currentStatusFilter) : undefined  // 改为 accountStatus（驼峰）
      };

      console.log('加载用户参数:', params);
      
      const response = await adminApi.getAllUsers(params);
      
      console.log('API响应:', response);
      
      if (response.code === 200 && response.data) {
        const { users: userList, pagination: pagi } = response.data;
        
        if (Array.isArray(userList)) {
          setUsers(userList);
          
          if (pagi) {
            setPagination({
              current: pagi.page || page,
              pageSize: pagi.page_size || pageSize,
              total: pagi.total || 0
            });
          } else {
            setPagination({
              current: page,
              pageSize: pageSize,
              total: userList.length
            });
          }
        } else {
          console.error('用户数据不是数组:', userList);
          setUsers([]);
          setPagination({ current: page, pageSize: pageSize, total: 0 });
        }
      } else {
        message.error(response.message || '加载用户数据失败');
        setUsers([]);
      }
    } catch (error: any) {
      console.error('加载用户失败:', error);
      message.error(error.message || '加载用户数据失败');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadUsers(pagination.current, pagination.pageSize);
  }, []);

  // 搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    loadUsers(1, pagination.pageSize, value, statusFilter);
  };

  // 过滤状态
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    loadUsers(1, pagination.pageSize, searchText, value);
  };

  // 刷新
  const handleRefresh = () => {
    loadUsers(pagination.current, pagination.pageSize);
  };

  // 处理添加管理员
  const handleAddAdmin = () => {
    adminForm.resetFields();
    setAddAdminModalVisible(true);
  };

  const handleAddAdminSubmit = async () => {
    try {
      const values = await adminForm.validateFields();
      console.log('添加管理员参数:', values);
      
      const response = await adminApi.addAdmin(values);
      
      if (response.code === 200) {
        message.success('管理员添加成功');
        setAddAdminModalVisible(false);
        adminForm.resetFields();
        loadUsers(pagination.current, pagination.pageSize); // 刷新列表
      } else {
        message.error(response.message || '添加失败');
      }
    } catch (error: any) {
      console.error('添加管理员失败:', error);
      message.error(error.message || '添加失败');
    }
  };

  // 冻结/解冻用户
  const handleToggleFreeze = async (user: User, operation: 'freeze' | 'unfreeze') => {
    const userId = getField(user, 'user_id');
    const userName = getField(user, 'name') || getField(user, 'username');
    
    Modal.confirm({
      title: `${operation === 'freeze' ? '冻结' : '解冻'}用户`,
      icon: <ExclamationCircleOutlined />,
      content: `确定要${operation === 'freeze' ? '冻结' : '解冻'}用户 ${userName} 吗？`,
      onOk: async () => {
        try {
          // 按照正确的参数格式调用
          const response = await adminApi.freezeUser({
            targetType: 'account',  // 账户冻结
            targetId: userId,       // 用户ID
            operation: operation,   // 'freeze' 或 'unfreeze'
            reasonType: 'administrative', // 管理员操作
            reasonDetail: `${operation === 'freeze' ? '冻结' : '解冻'}用户 ${userName}`,
            freezeDuration: 0,      // 0=永久
            notifyUser: true        // 通知用户
          });
          
          if (response.code === 200) {
            message.success(`用户${operation === 'freeze' ? '冻结' : '解冻'}成功`);
            loadUsers(pagination.current, pagination.pageSize);
          } else {
            message.error(response.message || '操作失败');
          }
        } catch (error: any) {
          console.error('操作失败:', error);
          message.error(error.message || '操作失败');
        }
      }
    });
  };

  // 重置密码
  const handleResetPassword = async (user: User) => {
    const userId = getField(user, 'user_id');
    const userName = getField(user, 'name') || getField(user, 'username');
    
    Modal.confirm({
      title: '重置用户密码',
      icon: <ExclamationCircleOutlined />,
      content: `确定要重置用户 ${userName} 的密码吗？新密码将是 "123456"`,
      okText: '重置',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 调用重置密码API
          const response = await adminApi.resetUserPassword({
            targetUserId: userId,
            reason: '管理员重置密码'
          });
          
          if (response.code === 200) {
            message.success(`密码重置成功，新密码：123456`);
          } else {
            message.error(response.message || '重置密码失败');
          }
        } catch (error: any) {
          console.error('重置密码失败:', error);
          message.error(error.message || '重置密码失败');
        }
      }
    });
  };

  // 分页变化
  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
    loadUsers(newPagination.current, newPagination.pageSize);
  };

  // 列定义 - 简化操作列
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
      render: (_: any, record: User) => (
        <Text code>{getField(record, 'user_id')}</Text>
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (_: any, record: User) => getField(record, 'name') || '-'
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (_: any, record: User) => getField(record, 'username') || '-'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (_: any, record: User) => getField(record, 'phone') || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (_: any, record: User) => {
        const status = getField(record, 'account_status');
        return (
          <Tag color={status === 0 ? 'success' : 'error'}>
            {status === 0 ? '正常' : '冻结'}
          </Tag>
        );
      }
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      render: (_: any, record: User) => {
        const role = getField(record, 'role');
        return (
          <Tag color={role === 1 ? 'purple' : 'blue'}>
            {role === 1 ? '管理员' : '用户'}
          </Tag>
        );
      }
    },
    {
      title: '银行卡',
      dataIndex: 'card_count',
      key: 'card_count',
      width: 80,
      render: (_: any, record: User) => {
        const count = getField(record, 'card_count');
        return <Badge count={count} showZero color="#1890ff" />;
      }
    },
    {
      title: '总余额',
      dataIndex: 'total_balance',
      key: 'total_balance',
      width: 120,
      render: (_: any, record: User) => (
        <Text strong style={{ color: '#52c41a' }}>
          ¥{(getField(record, 'total_balance') as number).toFixed(2)}
        </Text>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'created_time',
      key: 'created_time',
      width: 150,
      render: (_: any, record: User) => getField(record, 'created_time')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: User) => {
        const status = getField(record, 'account_status');
        const role = getField(record, 'role');
        
        // 不能操作管理员和自己（TODO: 从上下文获取当前用户ID）
        const isSelf = false;
        const isAdmin = role === 1;
        const disabled = isAdmin || isSelf;
        
        return (
          <Space size="small">
            {/* 冻结/解冻按钮 - 文字按钮 */}
            <Button
              type="text"
              size="small"
              danger={status === 0}
              disabled={disabled}
              onClick={() => handleToggleFreeze(
                record, 
                status === 0 ? 'freeze' : 'unfreeze'
              )}
            >
              {status === 0 ? '冻结' : '解冻'}
            </Button>
            
            {/* 重置密码按钮 - 文字按钮 */}
            <Button
              type="text"
              size="small"
              disabled={disabled}
              onClick={() => handleResetPassword(record)}
            >
              重置密码
            </Button>
          </Space>
        );
      }
    }
  ];

  // 统计信息
  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => getField(u, 'account_status') === 0).length;
    const frozen = users.filter(u => getField(u, 'account_status') === 1).length;
    const admins = users.filter(u => getField(u, 'role') === 1).length;
    const totalBalance = users.reduce((sum, user) => 
      sum + (getField(user, 'total_balance') as number), 0
    );

    return { total, active, frozen, admins, totalBalance };
  };

  const stats = getStats();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <UserOutlined /> 用户管理
      </Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.active}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="冻结用户"
              value={stats.frozen}
              prefix={<LockOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总资产"
              value={stats.totalBalance}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和过滤区域 */}
<Card style={{ marginBottom: 16 }}>
  <Row gutter={16} align="middle">
    <Col flex="auto">
      <Search
        placeholder="搜索用户（姓名、用户名、手机号）"
        allowClear
        enterButton="搜索"
        onSearch={handleSearch}
        style={{ width: 300 }}
      />
    </Col>
    {/* 添加管理员按钮 - 放在刷新左边 */}
    <Col>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={handleAddAdmin}
      >
        添加管理员
      </Button>
    </Col>
    <Col>
      <Button
        icon={<ReloadOutlined />}
        onClick={handleRefresh}
        loading={loading}
      >
        刷新
      </Button>
    </Col>
  </Row>
</Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record) => getField(record, 'user_id')}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* 添加管理员模态框 */}
      <Modal
        title="添加管理员"
        open={addAdminModalVisible}
        onCancel={() => setAddAdminModalVisible(false)}
        onOk={handleAddAdminSubmit}
        confirmLoading={loading}
        width={500}
      >
        <Form form={adminForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="身份证号"
                name="idNumber"
                rules={[
                  { required: true, message: '请输入身份证号' },
                  { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号' }
                ]}
              >
                <Input placeholder="请输入身份证号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;