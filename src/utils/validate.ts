/**
 * 验证手机号格式
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证身份证号格式
 */
export const validateIdCard = (idCard: string): boolean => {
  const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return idCardRegex.test(idCard);
};

/**
 * 验证银行卡号格式（简单验证）
 */
export const validateBankCard = (cardNumber: string): boolean => {
  // 简单的银行卡号验证：12-19位数字
  const cardRegex = /^\d{12,19}$/;
  return cardRegex.test(cardNumber);
};

/**
 * 验证密码强度
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} => {
  const lengthValid = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let message = '';
  
  if (!lengthValid) {
    message = '密码长度至少8位';
    return { isValid: false, strength, message };
  }
  
  const score = [hasLetter, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (score === 1) {
    strength = 'weak';
    message = '密码强度：弱';
  } else if (score === 2) {
    strength = 'medium';
    message = '密码强度：中';
  } else if (score === 3) {
    strength = 'strong';
    message = '密码强度：强';
  }
  
  const isValid = lengthValid && score >= 2;
  
  return { isValid, strength, message };
};

/**
 * 验证交易密码（6位数字）
 */
export const validateTransactionPassword = (password: string): boolean => {
  const passwordRegex = /^\d{6}$/;
  return passwordRegex.test(password);
};

/**
 * 验证金额格式（最多两位小数）
 */
export const validateAmount = (amount: string): boolean => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  if (!amountRegex.test(amount)) return false;
  
  const numAmount = parseFloat(amount);
  return numAmount > 0 && numAmount <= 1000000; // 最大100万
};

/**
 * 验证用户名格式
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  message: string;
} => {
  if (!username || username.length < 4) {
    return {
      isValid: false,
      message: '用户名至少4个字符'
    };
  }
  
  if (username.length > 20) {
    return {
      isValid: false,
      message: '用户名最多20个字符'
    };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: '用户名只能包含字母、数字和下划线'
    };
  }
  
  return {
    isValid: true,
    message: '用户名格式正确'
  };
};

/**
 * 验证姓名格式
 */
export const validateName = (name: string): boolean => {
  if (!name || name.length < 2 || name.length > 20) return false;
  
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z·\s]+$/;
  return nameRegex.test(name);
};

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 表单字段验证器集合
 */
export const validators = {
  required: (value: string | number | undefined): string | undefined => {
    if (!value && value !== 0) return '该字段为必填项';
    if (typeof value === 'string' && value.trim() === '') return '该字段为必填项';
    return undefined;
  },
  
  phone: (value: string): string | undefined => {
    if (value && !validatePhone(value)) return '请输入正确的手机号';
    return undefined;
  },
  
  idCard: (value: string): string | undefined => {
    if (value && !validateIdCard(value)) return '请输入正确的身份证号';
    return undefined;
  },
  
  amount: (value: string): string | undefined => {
    if (value && !validateAmount(value)) return '请输入正确的金额格式（最多两位小数）';
    return undefined;
  },
  
  password: (value: string): string | undefined => {
    if (value) {
      const { isValid, message } = validatePasswordStrength(value);
      if (!isValid) return message;
    }
    return undefined;
  },
  
  transactionPassword: (value: string): string | undefined => {
    if (value && !validateTransactionPassword(value)) return '交易密码必须是6位数字';
    return undefined;
  },
};