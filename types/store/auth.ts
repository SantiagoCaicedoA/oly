export interface User {
  _id: string;
  name: string;
  email: string;
  //role: "athlete";
  createdAt?: string;
  updatedAt?: string;

  accessToken?: string;
  metadata?: {
    createdAt?: string;
    lastLoginAt?: string;
  };

  theme?: "light" | "dark";
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  tokens: TokenData | null;
  isLoggedIn: boolean;
}
