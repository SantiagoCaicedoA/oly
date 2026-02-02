import { Athlete, AuthState } from "@/types/api/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Athlete | null>) {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },

    setTokens(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },

    loginSuccess(
      state,
      action: PayloadAction<{ user: Athlete; token: string }>,
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

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectUserId = (state: RootState) => state.auth.user?._id || null;

export default authSlice.reducer;
