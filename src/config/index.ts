/**
 * 应用配置
 */

// 使用更具体的类型代替any
type EnvValue = string | number | boolean | undefined;

export const APP_CONFIG = {
  // 应用信息
  APP_NAME: '银行管理系统',
  APP_VERSION: '1.0.0',
  
  // API配置
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: 10000,
  
  // 分页配置
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  
  // 交易配置
  MAX_DEPOSIT_AMOUNT: 1000000, // 最大存款金额
  MAX_WITHDRAW_AMOUNT: 50000,  // 最大取款金额
  MIN_TRANSACTION_AMOUNT: 1,   // 最小交易金额
  
  // 安全配置
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30分钟
  TOKEN_REFRESH_INTERVAL: 15 * 60 * 1000, // 15分钟
  
  // 上传配置
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.pdf'],
  
  // 导出配置
  EXPORT_MAX_ROWS: 10000,
  
  // 通知配置
  NOTIFICATION_DURATION: 5, // 消息显示时间（秒）
  
  // 开发配置
  DEBUG_MODE: import.meta.env.DEV,
  LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
} as const;

/**
 * 获取环境变量
 */
export const getEnv = (key: string, defaultValue: EnvValue = ''): EnvValue => {
  return import.meta.env[key] || defaultValue;
};

/**
 * 检查是否是生产环境
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * 检查是否是开发环境
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};