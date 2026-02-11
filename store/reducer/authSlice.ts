import { AuthState, TokenData } from '@/types/api/auth';
import { User } from '@/types/store/auth';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },

    loginSuccess(
      state,
      action: PayloadAction<{ user: User; tokens: TokenData }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.tokens;
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
