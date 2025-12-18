// src/api/report.ts
import axios from 'axios';
import { message } from 'antd';

// 创建独立的axios实例用于下载文件
const downloadRequest = axios.create({
  baseURL: '/api',
  timeout: 60000, // 下载文件需要更长时间
  responseType: 'blob',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
downloadRequest.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
downloadRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('下载请求错误:', {
      url: error.config?.url,
      status: error.response?.status,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
      message.error('登录已过期，请重新登录');
    } else if (error.response?.status === 403) {
      message.error('权限不足，无法下载');
    } else if (error.response?.status === 404) {
      message.error('报告文件不存在');
    } else if (error.response?.status >= 500) {
      message.error('服务器内部错误，请稍后重试');
    }

    return Promise.reject(error);
  }
);

// 导入通用的request
import request from '../utils/request';

// 报表接口定义
export const reportApi = {
  // 生成报表
  generateReport: (data: any) => {
    return request.post('/reports/generate', data);
  },

  // 下载报表
  downloadReport: async (reportId: string, format: string = 'pdf') => {
    try {
      const response = await downloadRequest.get(`/reports/${reportId}/download`, {
        params: { format },
      });
      
      return response.data; // 返回Blob数据
    } catch (error: any) {
      console.error('下载报告失败:', error);
      
      // 如果是blob错误，尝试解析错误信息
      if (error.response && error.response.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorData = JSON.parse(errorText);
          message.error(errorData.message || '下载报告失败');
        } catch (e) {
          message.error('下载报告失败');
        }
      } else {
        message.error(error.response?.data?.message || '下载报告失败');
      }
      
      throw error;
    }
  },

  // 获取报表数据
  getReport: (reportId: string) => {
    return request.get(`/reports/${reportId}`);
  }
};