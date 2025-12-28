// src/pages/DebugAuth.tsx
import React, { useState } from 'react';
import { Card, Button, message, Typography, Space, Divider } from 'antd';
import { authApi } from '../api/auth';
import { saveUser, getCurrentUser, clearUser } from '../utils/auth';

const { Title, Text } = Typography;

const DebugAuth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [storedUser, setStoredUser] = useState<any>(null);

  // 测试登录
  const testLogin = async () => {
    setLoading(true);
    try {
      // 测试用账号（需要根据你的后端调整）
      const response = await authApi.simpleLogin('testuser', 'password123');
      console.log('登录响应:', response);
      
      setResponseData(response);
      
      if (response.code === 200) {
        // 保存用户信息
        const savedUser = saveUser(response.data);
        console.log('保存的用户信息:', savedUser);
        
        // 获取存储的用户信息
        const stored = getCurrentUser();
        setStoredUser(stored);
        
        message.success('登录成功！');
      } else {
        message.error('登录失败: ' + response.message);
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      message.error('登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 清除用户信息
  const clearData = () => {
    clearUser();
    setStoredUser(null);
    message.success('已清除用户信息');
  };

  // 查看localStorage
  const viewLocalStorage = () => {
    const userStr = localStorage.getItem('user');
    console.log('localStorage user:', userStr);
    alert('localStorage user:\n' + userStr);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>认证调试页面</Title>
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card title="操作">
          <Space>
            <Button type="primary" onClick={testLogin} loading={loading}>
              测试登录
            </Button>
            <Button onClick={clearData}>清除用户信息</Button>
            <Button onClick={viewLocalStorage}>查看localStorage</Button>
          </Space>
        </Card>

        {responseData && (
          <Card title="登录响应数据">
            <Text strong>响应码: </Text>{responseData.code}<br />
            <Text strong>消息: </Text>{responseData.message}<br />
            <Divider />
            <Text strong>数据详情:</Text>
            <pre style={{ 
              background: '#f6f8fa', 
              padding: 16, 
              borderRadius: 6,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              {JSON.stringify(responseData.data, null, 2)}
            </pre>
          </Card>
        )}

        {storedUser && (
          <Card title="存储的用户信息">
            <Text strong>userId: </Text>{storedUser.userId}<br />
            <Text strong>username: </Text>{storedUser.username}<br />
            <Text strong>role: </Text>{storedUser.role}<br />
            <Text strong>token: </Text>{storedUser.token ? '已保存' : '未保存'}<br />
            <Divider />
            <Text strong>完整信息:</Text>
            <pre style={{ 
              background: '#f6f8fa', 
              padding: 16, 
              borderRadius: 6,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              {JSON.stringify(storedUser, null, 2)}
            </pre>
          </Card>
        )}

        <Card title="当前问题分析">
          <Text strong>已知问题:</Text>
          <ul>
            <li>1. 后端返回的字段名可能是 user_id，但前端期望的是 userId</li>
            <li>2. Dashboard页面无法获取正确的用户ID</li>
            <li>3. API调用路径可能不正确</li>
          </ul>
          <Text strong>解决方案:</Text>
          <ol>
            <li>使用此页面测试登录，查看实际返回的数据格式</li>
            <li>根据返回的数据格式修改前端代码</li>
            <li>确保后端API路径正确</li>
          </ol>
        </Card>
      </Space>
    </div>
  );
};

export default DebugAuth;