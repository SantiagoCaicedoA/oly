export interface Athlete {
  _id: string;
  name: string;
  email: string;
  phoneNumber: number | null;

  //role: "athlete";
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  user: Athlete | null;
  token: string | null;
  isLoggedIn: boolean;
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
