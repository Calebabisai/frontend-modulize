export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}
