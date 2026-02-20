import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ExerciseSet {
  set_number: number;
  weight: number;
  reps: number;
  rpm_percent: number;
}

export interface Exercise {
  exercise_name: string;
  time: string;
  no_of_set: number;
  sets: ExerciseSet[];
  reps: number | null;
  weight_lifted: number | null;
  rpm_percent: number | null;
}

export interface DayData {
  type: "training" | "rest";
  coach_note?: string;
  key_cues: string[];
  exercises: Exercise[];
  coach_prescription?: string;
  key_cues_of_specific_lift: string[];
  weight_lifted: number | null;
  reps: number | null;
}

export interface Days {
  monday: DayData;
  tuesday: DayData;
  wednesday: DayData;
  thursday: DayData;
  friday: DayData;
  saturday: DayData;
  sunday: DayData;
}

export interface ProfileSnapshot {
  training_days_per_week: number;
  preferred_rest_days: string[];
  session_duration: number;
}

interface TrainingState {
  weekStart: string | null;
  days: Days | null;
  isFirstWeek: boolean;
  profileSnapshot: ProfileSnapshot | null;

  sleepQuality: number;
  stressLevel: number;
  mentalReadiness: number;
}

const initialState: TrainingState = {
  weekStart: null,
  days: null,
  isFirstWeek: false,
  profileSnapshot: null,
  sleepQuality: 0,
  stressLevel: 0,
  mentalReadiness: 0,
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    setTrainingData: (
      state,
      action: PayloadAction<{
        data: {
          week_start: string;
          days: Days;
          is_first_week: boolean;
          profile_snapshot: ProfileSnapshot;
        };
      }>,
    ) => {
      const { week_start, days, is_first_week, profile_snapshot } =
        action.payload.data;
      state.weekStart = week_start;
      state.days = days;
      state.isFirstWeek = is_first_week;
      state.profileSnapshot = profile_snapshot;
    },
    clearTrainingData: () => initialState,
  },
});

export const { setTrainingData, clearTrainingData } = trainingSlice.actions;
export default trainingSlice.reducer;
