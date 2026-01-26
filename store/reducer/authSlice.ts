import { AuthState, Driver } from "@/types/api/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
    user: null,
    token: null,
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<Driver | null>) {
            state.user = action.payload;
            state.isLoggedIn = !!action.payload;
        },

        setTokens(state, action: PayloadAction<string | null>) {
            state.token = action.payload;
        },

        loginSuccess(
            state,
            action: PayloadAction<{ user: Driver; token: string }>,
        ) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isLoggedIn = true;
        },

        logout(state) {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
        },

        clearUser(state) {
            state.user = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setUser, setTokens, loginSuccess, logout, clearUser } =
    authSlice.actions;

export default authSlice.reducer;
