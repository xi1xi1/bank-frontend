// src/components/common/Loading.tsx
import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  text?: string; // ✅ 添加这行
  fullscreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...', fullscreen = false }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: 50,
      ...(fullscreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)',
        zIndex: 9999
      })
    }}>
      <Spin size="large" tip={text} /> {/* ✅ 使用 tip 属性 */}
    </div>
  );
};

export default Loading;