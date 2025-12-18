// src/utils/validate.ts
/**
 * 验证工具函数
 */

// ========== 基础验证函数 ==========

/**
 * 验证手机号格式
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证身份证号格式（18位）
 */
export const validateIdCard = (idCard: string): boolean => {
  const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return idCardRegex.test(idCard);
};

/**
 * 验证银行卡号格式（简单验证）
 */
export const validateBankCard = (cardNumber: string): boolean => {
  const cardRegex = /^\d{12,19}$/;
  return cardRegex.test(cardNumber);
};

/**
 * 验证银行卡号格式（12位数字，符合数据库设计）
 */
export const validateCardId = (cardId: string): boolean => {
  const result = /^\d{12}$/.test(cardId);
  console.log('银行卡号验证:', { cardId, result });
  return result;
};

/**
 * 验证交易密码（6位数字）
 */
export const validateTransactionPassword = (password: string): boolean => {
  const result = /^\d{6}$/.test(password);
  console.log('交易密码验证:', { password: '******', result });
  return result;
};

/**
 * 验证银行卡密码（6位数字交易密码）
 */
export const validateCardPassword = (password: string): boolean => {
  const result = /^\d{6}$/.test(password);
  console.log('银行卡密码验证:', { password: '******', result });
  return result;
};

/**
 * 验证姓名格式（中英文姓名，2-20字符）- 放宽版
 */
export const validateCardHolderName = (name: string): boolean => {
  if (!name || name.length < 2 || name.length > 20) {
    console.log('姓名长度验证失败:', { name, length: name?.length });
    return false;
  }
  
  // 更宽松的姓名正则：允许中文、英文、空格、点、中间点
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\s·.\u00b7\u2022\u2027]+$/u;
  const result = nameRegex.test(name);
  console.log('姓名正则验证结果:', { name, result });
  return result;
};

/**
 * 验证身份证号格式（18位）- 放宽版
 */
export const validateIdNumber = (idNumber: string): boolean => {
  if (!idNumber || idNumber.length !== 18) {
    console.log('身份证号长度验证失败:', { idNumber, length: idNumber?.length });
    return false;
  }
  
  // 更通用的身份证验证：前17位数字，最后一位数字或X
  const idRegex = /^\d{17}[\dXx]$/;
  const result = idRegex.test(idNumber);
  console.log('身份证号正则验证结果:', { idNumber, result });
  return result;
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
 * 验证姓名格式（通用版）
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

// ========== 表单验证器集合 ==========

/**
 * 表单字段验证器集合
 */
export const validators = {
  /**
   * 必填验证
   */
  required: (value: string | number | undefined | null): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return '该字段为必填项';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return '该字段为必填项';
    }
    return undefined;
  },
  
  /**
   * 手机号验证
   */
  phone: (value: string): string | undefined => {
    if (value && !validatePhone(value)) {
      return '请输入正确的手机号（11位数字）';
    }
    return undefined;
  },
  
  /**
   * 身份证号验证
   */
  idCard: (value: string): string | undefined => {
    if (value && !validateIdCard(value)) {
      return '请输入正确的身份证号（18位）';
    }
    return undefined;
  },
  
  /**
   * 银行卡号验证（12-19位数字）
   */
  bankCard: (value: string): string | undefined => {
    if (value && !validateBankCard(value)) {
      return '银行卡号格式不正确（12-19位数字）';
    }
    return undefined;
  },
  
  /**
   * 银行卡号验证（12位数字）
   */
  cardId: (value: string): string | undefined => {
    const result = validateCardId(value);
    if (value && !result) {
      return '银行卡号必须是12位数字';
    }
    return undefined;
  },
  
  /**
   * 交易密码验证
   */
  transactionPassword: (value: string): string | undefined => {
    if (value && !validateTransactionPassword(value)) {
      return '交易密码必须是6位数字';
    }
    return undefined;
  },
  
  /**
   * 银行卡密码验证
   */
  cardPassword: (value: string): string | undefined => {
    if (value && !validateCardPassword(value)) {
      return '交易密码必须是6位数字';
    }
    return undefined;
  },
  
  /**
   * 持卡人姓名验证
   */
  cardHolderName: (value: string): string | undefined => {
    if (value && !validateCardHolderName(value)) {
      return '姓名格式不正确（2-20位中英文，可包含空格和点号）';
    }
    return undefined;
  },
  
  /**
   * 身份证号验证（18位）- 放宽版
   */
  idNumber: (value: string): string | undefined => {
    if (value && !validateIdNumber(value)) {
      return '身份证号格式不正确（18位，前17位数字，最后一位数字或X）';
    }
    return undefined;
  },
  
  /**
   * 金额验证
   */
  amount: (value: string | number): string | undefined => {
    if (value) {
      const strValue = typeof value === 'number' ? value.toString() : value;
      if (!validateAmount(strValue)) {
        return '请输入正确的金额（最多两位小数，最大100万）';
      }
    }
    return undefined;
  },
  
  /**
   * 密码强度验证
   */
  password: (value: string): string | undefined => {
    if (value) {
      const { isValid, message } = validatePasswordStrength(value);
      if (!isValid) return message;
    }
    return undefined;
  },
  
  /**
   * 用户名验证
   */
  username: (value: string): string | undefined => {
    if (value) {
      const { isValid, message } = validateUsername(value);
      if (!isValid) return message;
    }
    return undefined;
  },
  
  /**
   * 姓名验证（通用版）
   */
  name: (value: string): string | undefined => {
    if (value && !validateName(value)) {
      return '姓名格式不正确（2-20位中英文）';
    }
    return undefined;
  },
  
  /**
   * 邮箱验证
   */
  email: (value: string): string | undefined => {
    if (value && !validateEmail(value)) {
      return '请输入正确的邮箱地址';
    }
    return undefined;
  },
};

// ========== 复合验证器 ==========

/**
 * 验证银行卡绑定表单数据（带调试）
 */
export const validateBindCardForm = (data: {
  card_id: string;
  card_password: string;
  name: string;
  id_number: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  console.log('=== 开始验证银行卡绑定表单 ===');
  console.log('表单数据:', {
    card_id: data.card_id,
    card_password: data.card_password ? '******' : '空',
    name: data.name,
    id_number: data.id_number
  });
  
  // 验证银行卡号
  const cardIdError = validators.cardId(data.card_id);
  if (cardIdError) {
    console.log('❌ 银行卡号验证失败:', cardIdError);
    errors.card_id = cardIdError;
  } else {
    console.log('✅ 银行卡号验证通过');
  }
  
  // 验证交易密码
  const cardPasswordError = validators.cardPassword(data.card_password);
  if (cardPasswordError) {
    console.log('❌ 交易密码验证失败:', cardPasswordError);
    errors.card_password = cardPasswordError;
  } else {
    console.log('✅ 交易密码验证通过');
  }
  
  // 验证姓名
  const nameError = validators.cardHolderName(data.name);
  if (nameError) {
    console.log('❌ 姓名验证失败:', nameError);
    errors.name = nameError;
  } else {
    console.log('✅ 姓名验证通过');
  }
  
  // 验证身份证号
  const idNumberError = validators.idNumber(data.id_number);
  if (idNumberError) {
    console.log('❌ 身份证号验证失败:', idNumberError);
    errors.id_number = idNumberError;
  } else {
    console.log('✅ 身份证号验证通过');
  }
  
  console.log('=== 验证结果 ===');
  console.log('是否有效:', Object.keys(errors).length === 0);
  console.log('错误详情:', errors);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证存款表单数据
 */
export const validateDepositForm = (data: {
  card_id: string;
  amount: string | number;
  card_password: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // 验证银行卡号
  const cardIdError = validators.cardId(data.card_id);
  if (cardIdError) errors.card_id = cardIdError;
  
  // 验证金额
  const amountError = validators.amount(data.amount);
  if (amountError) errors.amount = amountError;
  
  // 验证交易密码
  const passwordError = validators.cardPassword(data.card_password);
  if (passwordError) errors.card_password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证取款表单数据
 */
export const validateWithdrawForm = (data: {
  card_id: string;
  amount: string | number;
  card_password: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // 验证银行卡号
  const cardIdError = validators.cardId(data.card_id);
  if (cardIdError) errors.card_id = cardIdError;
  
  // 验证金额
  const amountError = validators.amount(data.amount);
  if (amountError) errors.amount = amountError;
  
  // 验证交易密码
  const passwordError = validators.cardPassword(data.card_password);
  if (passwordError) errors.card_password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 验证注册表单数据
 */
export const validateRegisterForm = (data: {
  username: string;
  password: string;
  phone: string;
  name: string;
  id_number: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // 验证用户名
  const usernameError = validators.username(data.username);
  if (usernameError) errors.username = usernameError;
  
  // 验证密码
  const passwordError = validators.password(data.password);
  if (passwordError) errors.password = passwordError;
  
  // 验证手机号
  const phoneError = validators.phone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  // 验证姓名
  const nameError = validators.name(data.name);
  if (nameError) errors.name = nameError;
  
  // 验证身份证号
  const idNumberError = validators.idNumber(data.id_number);
  if (idNumberError) errors.id_number = idNumberError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ========== 实用验证函数 ==========

/**
 * 验证字符串长度范围
 */
export const validateLength = (
  value: string, 
  min: number, 
  max: number, 
  fieldName: string = '字段'
): string | undefined => {
  if (!value && min > 0) return `${fieldName}不能为空`;
  if (value.length < min) return `${fieldName}至少${min}个字符`;
  if (value.length > max) return `${fieldName}最多${max}个字符`;
  return undefined;
};

/**
 * 验证数字范围
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = '数值'
): string | undefined => {
  if (value < min) return `${fieldName}不能小于${min}`;
  if (value > max) return `${fieldName}不能大于${max}`;
  return undefined;
};

/**
 * 验证是否为数字
 */
export const validateIsNumber = (value: string): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

/**
 * 验证是否为正数
 */
export const validatePositiveNumber = (value: number): boolean => {
  return value > 0;
};

/**
 * 验证是否为整数
 */
export const validateInteger = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isInteger(num);
};

/**
 * 生成验证规则
 */
export const createValidationRules = (
  field: string, 
  rules: Array<keyof typeof validators | ((value: any) => string | undefined)>
) => {
  return rules.map(rule => {
    if (typeof rule === 'string') {
      return {
        validator: (_: any, value: any) => {
          const error = validators[rule as keyof typeof validators](value);
          if (error) return Promise.reject(new Error(error));
          return Promise.resolve();
        }
      };
    } else {
      return { validator: rule };
    }
  });
};

/**
 * 清理身份证号（移除空格，X转为大写）
 */
export const cleanIdNumber = (idNumber: string): string => {
  if (!idNumber) return '';
  // 移除所有空格
  const cleaned = idNumber.replace(/\s+/g, '');
  // 将最后一位x转为X
  if (cleaned.length === 18 && cleaned[17].toLowerCase() === 'x') {
    return cleaned.slice(0, 17) + 'X';
  }
  return cleaned;
};

/**
 * 清理姓名（移除首尾空格，多个空格合并为一个）
 */
export const cleanName = (name: string): string => {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
};

// 默认导出
export default {
  // 基础验证函数
  validatePhone,
  validateIdCard,
  validateBankCard,
  validateCardId,
  validateTransactionPassword,
  validateCardPassword,
  validateCardHolderName,
  validateIdNumber,
  validatePasswordStrength,
  validateAmount,
  validateUsername,
  validateName,
  validateEmail,
  
  // 验证器集合
  validators,
  
  // 复合验证器
  validateBindCardForm,
  validateDepositForm,
  validateWithdrawForm,
  validateRegisterForm,
  
  // 实用验证函数
  validateLength,
  validateNumberRange,
  validateIsNumber,
  validatePositiveNumber,
  validateInteger,
  
  // 清理函数
  cleanIdNumber,
  cleanName,
  
  // 工具函数
  createValidationRules,
};