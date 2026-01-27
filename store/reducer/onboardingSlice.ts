import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface OnboardingState {
  data: Record<string, any>;
}

const initialState: OnboardingState = {
  data: {},
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    saveOnboardingData: (state, action: PayloadAction<Record<string, any>>) => {
      state.data = { ...state.data, ...action.payload };
    },

    clearOnboardingData: (state) => {
      state.data = {};
    },
  },
});

export const { saveOnboardingData, clearOnboardingData } =
  onboardingSlice.actions;

export const selectOnboardingData = (state: RootState) => state.onboarding.data;

export default onboardingSlice.reducer;
