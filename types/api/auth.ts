export interface Athlete {
  _id: string;
  name: string;
  email: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
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
  token: TokenData;
}
export interface LoginValues {
  email: string;
  password: string;
}

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

/**
 * Form-level values for the redesigned Sign Up screen.
 * firstName + lastName get concatenated into `name` before
 * being sent as a SignUpPayload — backend contract unchanged.
 */
export interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
