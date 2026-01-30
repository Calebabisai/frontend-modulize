export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  roleId: number;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}
