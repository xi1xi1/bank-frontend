import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const UserManagement: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>用户管理</Title>
        <p>这里是用户管理页面</p>
      </Card>
    </div>
  );
};

export default UserManagement;