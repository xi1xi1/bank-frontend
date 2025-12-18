// src/types/index.ts - 修改 CardInfo 定义
export interface CardInfo {
  cardId: string;
  maskedCardId?: string;
  balance: number;
  availableBalance: number;
  frozenAmount?: number;  // 改为可选
  status: string | number;  // 允许字符串和数字
  statusText?: string;
  bindTime: string;
  cardType?: string;  // 改为 string，后端返回的是 "储蓄卡"、"信用卡"
  lastTransactionTime?: string | null;
  dailyLimit?: number;
  monthlyLimit?: number;
}

// 其他接口保持不变
export interface User {
  userId: string;
  username: string;
  phone: string;
  name: string;
  role: number;
  token: string;
  createdTime?: string;
  accountStatus?: number;
  lastLoginTime?: string;
}

export interface LoginRequest {
  loginType: 'phone' | 'username';
  phone?: string;
  username?: string;
  password: string;
}

export interface Transaction {
  transId?: number;
  transNo: string;
  cardId: string;
  transType: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter: number;
  fee?: number;
  time?: string;
  transTime?: string;
  remark?: string;
  operatorId?: string;
  status?: string;
}

export interface UserStatistics {
  userId: string;
  totalBalance: number;
  availableBalance: number;
  frozenAmount?: number;
  fixedDepositAmount?: number;
  cardCount: number;
  activeCardCount: number;
  accountStatus?: number;
  thisMonth?: {
    depositCount: number;
    depositAmount: number;
    withdrawCount: number;
    withdrawAmount: number;
    interestEarned: number;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export interface StatsCard {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}