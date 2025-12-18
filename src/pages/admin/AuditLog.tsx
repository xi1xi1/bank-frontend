// src/pages/admin/AuditLog.tsx - 简化版
import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AuditLog: React.FC = () => {
  return (
    <div>
      <Title level={3}>安全审计</Title>
      <p>这里是操作日志页面</p>
    </div>
  );
};

export default AuditLog;