export interface User {
  user_id: string;
  username: string;
  phone: string;
  name: string;
  role: number;
  token: string;
}

export interface LoginRequest {
  login_type: 'phone' | 'username';
  phone?: string;
  username?: string;
  password: string;
}