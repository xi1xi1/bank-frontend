// src/utils/formatter.ts
/**
 * 格式化工具函数
 */

/**
 * 格式化金额
 * @param amount 金额数值
 * @param withSymbol 是否显示货币符号
 * @returns 格式化后的金额字符串
 */
export const formatCurrency = (amount: number, withSymbol: boolean = true): string => {
  // 确保amount是数字
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
  
  // 格式化为两位小数，添加千位分隔符
  const formatted = Math.abs(numAmount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const symbol = withSymbol ? '¥' : '';
  const sign = numAmount < 0 ? '-' : '';
  return `${sign}${symbol}${formatted}`;
};

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化日期（只显示日期部分）
 */
export const formatDate = (date: string | Date): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  
  return formatDate(d);
};

/**
 * 隐藏手机号中间四位
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 隐藏身份证号中间部分
 */
export const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length !== 18) return idCard;
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
};

/**
 * 隐藏银行卡号中间部分
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber) return '';
  if (cardNumber.length <= 8) return cardNumber;
  
  const visibleDigits = 4;
  const prefix = cardNumber.slice(0, visibleDigits);
  const suffix = cardNumber.slice(-visibleDigits);
  const hiddenLength = Math.max(cardNumber.length - visibleDigits * 2, 0);
  const hidden = '*'.repeat(hiddenLength);
  return `${prefix}${hidden}${suffix}`;
};

/**
 * 格式化交易类型
 */
export const formatTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'deposit': '存款',
    'withdraw': '取款',
    'interest': '利息',
    'transfer': '转账',
  };
  return typeMap[type.toLowerCase()] || type;
};

/**
 * 格式化账户状态
 */
export const formatAccountStatus = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: '正常',
    1: '冻结',
    2: '挂失',
    3: '已解绑',
  };
  return statusMap[status] || '未知';
};

/**
 * 格式化银行卡状态
 */
export const formatCardStatus = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: '正常',
    1: '挂失',
    2: '冻结',
    3: '已解绑',
  };
  return statusMap[status] || '未知';
};

