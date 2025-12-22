// src/api/card.ts
import api from '../utils/request';
import type { ApiResponse } from '../utils/request';

// 银行卡信息接口
export interface CardInfo {
  cardId: string;
  maskedCardId?: string;
  balance: number;
  availableBalance: number;
  frozenAmount?: number;
  status: string | number;
  statusText?: string;
  bindTime: string;
  cardType: string;
  lastTransactionTime?: string | null;
  dailyLimit?: number;
  monthlyLimit?: number;
}

// 绑定银行卡请求
export interface BindCardRequest {
  userId?: string;
  cardId: string;
  cardPassword: string;
  name: string;
  idNumber: string;
}

// 冻结银行卡请求
export interface FreezeCardRequest {
  cardId: string;
  cardPassword: string;
  reason: string;
  contactPhone?: string;
}

// 解冻银行卡请求
export interface UnfreezeCardRequest {
  cardId: string;
  cardPassword: string;
  reason?: string;
}

// 冻结记录接口
export interface FreezeRecord {
  recordId: number;
  freezeNo: string;
  freezeType: number;      // 冻结类型：1=银行卡冻结，2=账户冻结
  freezeLevel: number;     // 冻结级别：1=用户申请，2=管理员操作，3=系统风控
  targetId: string;
  userId: string;
  cardId: string;
  reasonType: string;      // 原因类型
  reasonDetail: string;    // 详细原因
  freezeTime: string;
  unfreezeTime?: string;
  plannedUnfreezeTime?: string;
  operatorId: string;
  operatorRole: number;
  status: number;          // 状态：1=冻结中，0=已解冻，2=已过期
}

// 银行卡列表响应
interface CardListResponse {
  cards: CardInfo[];
  total: number;
  totalBalance?: number;
}

// 冻结记录列表响应
interface FreezeRecordsResponse {
  records: FreezeRecord[];
  total: number;
}

// 状态判断辅助函数
export const isCardNormal = (card: CardInfo): boolean => {
  if (typeof card.status === 'string') {
    return card.status === '正常';
  } else if (typeof card.status === 'number') {
    return card.status === 0;
  }
  return false;
};

export const isCardFrozen = (card: CardInfo): boolean => {
  if (typeof card.status === 'string') {
    return card.status === '冻结';
  } else if (typeof card.status === 'number') {
    return card.status === 2;
  }
  return false;
};

export const isCardLost = (card: CardInfo): boolean => {
  if (typeof card.status === 'string') {
    return card.status === '挂失';
  } else if (typeof card.status === 'number') {
    return card.status === 1;
  }
  return false;
};

export const isCardUnbound = (card: CardInfo): boolean => {
  if (typeof card.status === 'string') {
    return card.status === '已注销' || card.status === '已解绑';
  } else if (typeof card.status === 'number') {
    return card.status === 3;
  }
  return false;
};

export const cardApi = {
  // 绑定银行卡
  bindCard: (data: BindCardRequest): Promise<ApiResponse> =>
    api.post('/cards/bind', data),
  
  // 获取用户银行卡列表
  getUserCards: (): Promise<ApiResponse<CardListResponse>> =>
    api.get<CardListResponse>('/cards/my'),
  
  // 查询单张卡详情
  getCardDetail: (cardId: string): Promise<ApiResponse<CardInfo>> =>
    api.get<CardInfo>(`/cards/${cardId}`),
  
  // 解绑银行卡
  unbindCard: (cardId: string, cardPassword: string): Promise<ApiResponse> =>
    api.post(`/cards/${cardId}/unbind`, {
      cardId,
      cardPassword,
    }),
  
  // 余额查询接口
  getCardBalance: (cardId: string): Promise<ApiResponse<CardInfo>> =>
    api.get<CardInfo>(`/cards/${cardId}/balance`),
  
  // ============ 冻结相关API ============
  
  /**
   * 冻结银行卡 - 路径修改为 /security/freeze/card
   */
  freezeCard: (data: FreezeCardRequest): Promise<ApiResponse> =>
    api.post('/security/freeze/card', data),
  
  /**
   * 解冻银行卡 - 路径修改为 /security/unfreeze/card
   */
  unfreezeCard: (data: UnfreezeCardRequest): Promise<ApiResponse> =>
    api.post('/security/unfreeze/card', data),
  
  /**
   * 获取银行卡冻结记录 - 路径修改为 /security/freeze-records
   */
  getFreezeRecords: (cardId?: string): Promise<ApiResponse<FreezeRecordsResponse>> => {
    const params = cardId ? { cardId } : undefined;
    return api.get<FreezeRecordsResponse>('/security/freeze-records', { params });
  },
  
  // ============ 挂失相关API（暂时注释，因为可能需要管理员权限）============
  
  /**
   * 挂失银行卡 - 管理员接口
   */
  reportLoss: (data: {
    cardId: string;
    cardPassword: string;
    reason: string;
    contactPhone?: string;
  }): Promise<ApiResponse> =>
    api.post('/security/admin/lost-report', data),
  
  /**
   * 解除挂失 - 管理员接口
   */
  cancelLossReport: (data: {
    cardId: string;
    cardPassword: string;
  }): Promise<ApiResponse> =>
    api.post('/security/admin/cancel-loss', data),
  
  // ============ 其他功能API ============
  
  /**
   * 修改银行卡限额
   */
  updateCardLimits: (data: {
    cardId: string;
    dailyLimit?: number;
    monthlyLimit?: number;
    cardPassword: string;
  }): Promise<ApiResponse> =>
    api.put('/cards/limits', data),
  
  /**
   * 重置银行卡交易密码
   */
  resetCardPassword: (data: {
    cardId: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> =>
    api.post('/cards/reset-password', data),
  
  /**
   * 获取银行卡统计信息
   */
  getCardStats: (): Promise<ApiResponse<{
    total: number;
    active: number;
    frozen: number;
    lost: number;
    totalBalance: number;
    totalFrozenAmount: number;
  }>> =>
    api.get('/cards/stats'),
};