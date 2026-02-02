export interface User {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  title: string;
  dob: string;
  gender: string;
  telephone_no: string;
  telephone_type: string;
  user_type: string;
  createdat: string;
  updatedat: string;
  // Legacy fields for compatibility
  uid?: string;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  phoneNumber?: string | null;
  accessToken?: string;
  metadata?: {
    createdAt?: string;
    lastLoginAt?: string;
  };
  providerData?: Array<{
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    photoURL?: string | null;
    providerId: string;
    uid: string;
  }>;
  theme?: "light" | "dark";
  calendars?: Calendar[];
}

export interface Calendar {
  id: string;
  name: string;
  [key: string]: any;
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
  calendars: Calendar[];
  selectedCalendarId: string | null;
  tempCredentials: { email: string; password: string } | null;
  userEmailToVerify: string | null;
}
