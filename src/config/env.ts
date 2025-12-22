// src/config/env.ts
/**
 * 环境变量配置
 */

export const ENV = {
  // 是否启用Mock - 直接设为false彻底禁用
  MOCK_ENABLED: false,
  
  // API配置 - 指向真实后端API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // 应用配置
  APP_NAME: import.meta.env.VITE_APP_NAME || '银行管理系统',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // 开发配置
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD
} as const;

// 开发环境特殊配置
if (ENV.IS_DEV) {
  console.log('开发环境配置:', {
    mockEnabled: ENV.MOCK_ENABLED,
    apiBaseUrl: ENV.API_BASE_URL,
    appName: ENV.APP_NAME
  });
}