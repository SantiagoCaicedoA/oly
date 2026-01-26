export interface Driver {
    id: string;
    name: string;
    email: string;
    phoneNumber: number | null;
    truckNumber: string;
    role: "driver";
    createdAt?: string;
    updatedAt?: string;
}

export interface TokenData {
    accessToken: string;
    refreshToken?: string;
}

export interface AuthState {
    user: Driver | null;
    token: string | null;
    isLoggedIn: boolean;
}
