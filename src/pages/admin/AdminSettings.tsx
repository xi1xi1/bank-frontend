// src/pages/admin/AdminSettings.tsx - 简化版
import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Alert,
  Tabs,
  Slider,
  Upload,
  message,
  Modal
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  BellOutlined,
  DatabaseOutlined,
  ApiOutlined,
  MonitorOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  const defaultSettings = {
    system_name: '银行管理系统',
    system_version: '1.0.0',
    system_language: 'zh-CN',
    system_timezone: 'Asia/Shanghai',
    system_currency: 'CNY',
    
    password_min_length: 8,
    login_max_attempts: 5,
    session_timeout: 30,
    ip_whitelist: '',
    mfa_required: false,
    
    email_enabled: true,
    sms_enabled: true,
    email_host: 'smtp.example.com',
    email_port: 465,
    email_username: '',
    email_password: '',
    sms_provider: 'aliyun',
    
    db_backup_enabled: true,
    db_backup_frequency: 'daily',
    db_backup_time: '02:00',
    db_backup_keep_days: 30,
    db_cleanup_enabled: true,
    db_cleanup_days: 180,
    
    api_rate_limit: 1000,
    api_cors_origins: '*',
    api_swagger_enabled: true,
    
    monitor_enabled: true,
    monitor_interval: 60,
    alert_email: 'admin@example.com',
    alert_sms: '13800138000',
    disk_warning_percent: 80,
    memory_warning_percent: 85
  };

  const handleSaveSettings = async (values: any) => {
    setLoading(true);
    try {
      console.log('保存设置:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('设置保存成功！');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>系统设置</Title>
      <Paragraph type="secondary">
        管理系统配置、安全设置、通知设置等
      </Paragraph>

      <Card>
        <Tabs defaultActiveKey="system">
          <TabPane tab="系统设置" key="system">
            <Form
              form={form}
              layout="vertical"
              initialValues={defaultSettings}
              onFinish={handleSaveSettings}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="系统名称"
                    name="system_name"
                    rules={[{ required: true, message: '请输入系统名称' }]}
                  >
                    <Input placeholder="请输入系统名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="系统版本"
                    name="system_version"
                    rules={[{ required: true, message: '请输入系统版本' }]}
                  >
                    <Input placeholder="例如: 1.0.0" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="系统语言"
                    name="system_language"
                  >
                    <Select>
                      <Option value="zh-CN">简体中文</Option>
                      <Option value="en-US">English</Option>
                      <Option value="zh-TW">繁體中文</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="时区"
                    name="system_timezone"
                  >
                    <Select>
                      <Option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</Option>
                      <Option value="UTC">UTC</Option>
                      <Option value="America/New_York">America/New_York (GMT-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="货币单位"
                    name="system_currency"
                  >
                    <Select>
                      <Option value="CNY">人民币 (¥)</Option>
                      <Option value="USD">美元 ($)</Option>
                      <Option value="EUR">欧元 (€)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  保存系统设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="安全设置" key="security">
            <Alert
              message="安全配置"
              description="这些设置影响系统的安全性和用户密码策略"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              initialValues={defaultSettings}
              onFinish={handleSaveSettings}
            >
              <Title level={5}>密码策略</Title>
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="密码最小长度"
                    name="password_min_length"
                  >
                    <InputNumber min={6} max={32} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="登录最大尝试次数"
                    name="login_max_attempts"
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="会话超时(分钟)"
                    name="session_timeout"
                  >
                    <InputNumber min={5} max={480} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="启用双因素认证"
                    name="mfa_required"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Text type="secondary">管理员登录时要求短信或邮箱验证码</Text>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  保存安全设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="通知设置" key="notification">
            <Form
              form={form}
              layout="vertical"
              initialValues={defaultSettings}
              onFinish={handleSaveSettings}
            >
              <Title level={5}>邮件通知</Title>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="启用邮件通知"
                    name="email_enabled"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="SMTP服务器"
                    name="email_host"
                    rules={[{ required: true, message: '请输入SMTP服务器' }]}
                  >
                    <Input placeholder="smtp.example.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="端口"
                    name="email_port"
                    rules={[{ required: true, message: '请输入端口' }]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="465" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  保存通知设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminSettings;