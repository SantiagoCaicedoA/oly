export interface Athlete {
  _id: string;
  name: string;
  email: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenData {
  token: string;
  refresh_token?: string;
}

export interface AuthState {
  user: Athlete | null;
  token: TokenData | null;
  isLoggedIn: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponseData {
  __v: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  username: string;
  name: string;
}

export interface SignupResponse {
  data: SignupResponseData;
  success: boolean;
  token: string;
  refresh_token?: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}
