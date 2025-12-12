import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const UserCards: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>银行卡管理</Title>
        <p>这里是银行卡管理页面</p>
      </Card>
    </div>
  );
};

export default UserCards;