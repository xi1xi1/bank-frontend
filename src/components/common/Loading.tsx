import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 20
    }}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
      />
      <div style={{ fontSize: 16, color: '#666' }}>
        加载中...
      </div>
    </div>
  );
};

export default Loading;