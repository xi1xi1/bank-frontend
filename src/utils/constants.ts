// src/utils/constants.ts
/**
 * 角色常量
 */
export const ROLES = {
  USER: 0,
  ADMIN: 1,
} as const;

/**
 * 账户状态常量
 */
export const ACCOUNT_STATUS = {
  NORMAL: 0,
  FROZEN: 1,
  LOST: 2,
  UNBOUND: 3,
} as const;

/**
 * 交易类型常量
 */
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  INTEREST: 'interest',
  TRANSFER: 'transfer',
} as const;

/**
 * 银行卡状态常量
 */
export const CARD_STATUS = {
  NORMAL: 0,
  LOST: 1,
  FROZEN: 2,
  UNBOUND: 3,
} as const;

/**
 * 定期存款状态常量
 */
export const FIXED_DEPOSIT_STATUS = {
  IN_PROGRESS: 0,
  MATURED: 1,
  WITHDRAWN: 2,
} as const;

/**
 * 冻结记录状态常量
 */
export const FREEZE_RECORD_STATUS = {
  FROZEN: 1,
  UNFROZEN: 0,
} as const;

/**
 * 操作类型常量
 */
export const OPERATION_TYPES = {
  LOGIN: '登录',
  LOGOUT: '退出登录',
  REGISTER: '注册',
  DEPOSIT: '存款',
  WITHDRAW: '取款',
  BIND_CARD: '绑定银行卡',
  UNBIND_CARD: '解绑银行卡',
  FREEZE_CARD: '冻结银行卡',
  UNFREEZE_CARD: '解冻银行卡',
  REPORT_LOST: '挂失',
  CANCEL_LOST: '解挂',
  UPDATE_INFO: '更新信息',
  CHANGE_PASSWORD: '修改密码',
} as const;

/**
 * 定期存款期限选项
 */
export const TERM_OPTIONS = [
  { value: 3, label: '3个月', rate: 0.01 },
  { value: 6, label: '6个月', rate: 0.013 },
  { value: 12, label: '1年', rate: 0.015 },
  { value: 24, label: '2年', rate: 0.02 },
  { value: 36, label: '3年', rate: 0.025 },
] as const;

/**
 * 响应状态码
 */
export const RESPONSE_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  TIMEOUT_ERROR: '请求超时，请检查网络连接',
  UNAUTHORIZED: '未授权访问，请重新登录',
  FORBIDDEN: '权限不足，无法访问该资源',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入数据验证失败',
  DUPLICATE_ERROR: '数据已存在',
  NOT_ENOUGH_BALANCE: '余额不足',
  WRONG_PASSWORD: '密码错误',
  CARD_FROZEN: '银行卡已被冻结',
  CARD_LOST: '银行卡已挂失',
  USER_FROZEN: '账户已被冻结',
} as const;

/**
 * 成功消息常量
 */
export const SUCCESS_MESSAGES = {
  LOGIN: '登录成功',
  LOGOUT: '退出成功',
  REGISTER: '注册成功',
  UPDATE: '更新成功',
  DELETE: '删除成功',
  DEPOSIT: '存款成功',
  WITHDRAW: '取款成功',
  BIND_CARD: '银行卡绑定成功',
  UNBIND_CARD: '银行卡解绑成功',
  FREEZE_CARD: '银行卡冻结成功',
  UNFREEZE_CARD: '银行卡解冻成功',
  REPORT_LOST: '银行卡挂失成功',
  CANCEL_LOST: '银行卡解挂成功',
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
} as const;

/**
 * 路由路径常量
 */
export const ROUTE_PATHS = {
  // 公开路由
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // 用户路由
  DASHBOARD: '/dashboard',
  CARDS: '/cards',
  DEPOSIT: '/deposit',
  WITHDRAW: '/withdraw',
  TRANSACTIONS: '/transactions',
  FIXED_DEPOSITS: '/fixed-deposits',
  SETTINGS: '/settings',
  
  // 管理员路由
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CARDS: '/admin/cards',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

/**
 * API配置
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * 交易限制配置
 */
export const TRANSACTION_LIMITS = {
  MAX_DEPOSIT_AMOUNT: 1000000,
  MAX_WITHDRAW_AMOUNT: 50000,
  MIN_TRANSACTION_AMOUNT: 1,
  DAILY_WITHDRAW_LIMIT: 100000,
} as const;