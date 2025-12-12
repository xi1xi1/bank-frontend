import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Deposit: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>存款</Title>
        <p>这里是存款页面</p>
      </Card>
    </div>
  );
};

export default Deposit;