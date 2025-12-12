import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Transactions: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>交易记录</Title>
        <p>这里是交易记录页面</p>
      </Card>
    </div>
  );
};

export default Transactions;