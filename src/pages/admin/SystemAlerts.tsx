// src/pages/admin/SystemAlerts.tsx - 简化版
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Typography,
  Badge,
  Modal
} from 'antd';
import { BellOutlined, EyeOutlined, CheckOutlined, FilterOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { formatDateTime } from '../../utils/formatter';

const { Title, Text } = Typography;
const { Option } = Select;

const SystemAlerts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSystemAlerts();
      const alertsData = response.alerts || [];
      setAlerts(alertsData);
    } catch (error) {
      console.error('加载系统告警失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          error: { color: 'red', text: '错误' },
          warning: { color: 'orange', text: '警告' },
          info: { color: 'blue', text: '信息' }
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return (
          <Tag color={config.color} icon={<BellOutlined />}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <Space>
          <Text strong>{title}</Text>
          {record.status === '未处理' && <Badge status="processing" />}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          '未处理': 'error',
          '已查看': 'processing',
          '已处理': 'success'
        };
        return <Tag color={statusMap[status]}>{status}</Tag>;
      }
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 150,
      render: (time: string) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelectedAlert(record)}
          >
            查看
          </Button>
          {record.status === '未处理' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => {
                // 标记为已处理
              }}
            >
              标记已处理
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={3}>系统告警</Title>
      <Text type="secondary">监控系统运行状态和安全事件</Text>

      <Table
        columns={columns}
        dataSource={alerts}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true
        }}
      />

      {/* 告警详情模态框 */}
      <Modal
        title="告警详情"
        open={!!selectedAlert}
        onCancel={() => setSelectedAlert(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedAlert(null)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedAlert && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color={selectedAlert.type === 'error' ? 'red' : selectedAlert.type === 'warning' ? 'orange' : 'blue'}>
                {selectedAlert.type === 'error' ? '错误' : selectedAlert.type === 'warning' ? '警告' : '信息'}
              </Tag>
              <Tag color={selectedAlert.status === '未处理' ? 'red' : selectedAlert.status === '已处理' ? 'green' : 'blue'}>
                {selectedAlert.status}
              </Tag>
            </div>
            
            <h3>{selectedAlert.title}</h3>
            <p style={{ margin: '16px 0' }}>{selectedAlert.description}</p>
            
            <div style={{ color: '#666', fontSize: 14 }}>
              <p><strong>发生时间:</strong> {formatDateTime(selectedAlert.time)}</p>
              <p><strong>告警ID:</strong> {selectedAlert.id}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemAlerts;