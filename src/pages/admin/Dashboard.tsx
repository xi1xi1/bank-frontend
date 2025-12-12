import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>管理员仪表盘</Title>
        <p>这里是管理员仪表盘页面</p>
      </Card>
    </div>
  );
};

export default AdminDashboard;