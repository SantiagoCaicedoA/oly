
import { Athlete, AuthState, TokenData } from "@/types/api/auth";
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
    setUser(state, action: PayloadAction<Athlete | null>) {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },

    loginSuccess(
      state,
      action: PayloadAction<{ user: Athlete; token: TokenData }>,
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

export const {
  setUser,

  loginSuccess,
  logout,
  clearUser,
} = authSlice.actions;

export default authSlice.reducer;
