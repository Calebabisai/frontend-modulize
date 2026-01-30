export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  roleId?: number;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface RegisterResponse {
  user: User;
  access_token: string;
}
