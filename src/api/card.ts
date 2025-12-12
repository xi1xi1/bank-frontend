import api from '../utils/request';

export interface BindCardRequest {
  user_id: string;
  card_id: string;
  card_password: string;
  name: string;
  id_number: string;
}

export interface CardInfo {
  card_id: string;
  balance: number;
  available_balance: number;
  frozen_amount: number;
  status: number;
  status_text: string;
  bind_time: string;
}

export const cardApi = {
  // 绑定银行卡
  bindCard: (data: BindCardRequest) =>
    api.post('/cards/bind', data),
  
  // 查询用户所有银行卡
  getUserCards: (userId: string) =>
    api.get(`/users/${userId}/cards`),
  
  // 查询单张卡详情
  getCardDetail: (cardId: string) =>
    api.get(`/cards/${cardId}`),
  
  // 解绑银行卡
  unbindCard: (cardId: string, userId: string, cardPassword: string) =>
    api.post(`/cards/${cardId}/unbind`, {
      user_id: userId,
      card_password: cardPassword,
    }),
};