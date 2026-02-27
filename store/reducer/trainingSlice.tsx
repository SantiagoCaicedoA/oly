import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ExerciseSet {
  set_number: number;
  weight: number;
  reps: number;
  rpm_percent: number;
  bar_speed?: string;
  position_quality?: string;
  was_it_a_miss?: boolean;
  where_did_it_fail?: string;
  missed_where?: string;
  any_pain_or_discomfort?: boolean;
  pain_level?: string;
  pain_where?: string[];
  key_cues?: string[];
  coach_prescription?: string;
  intent: string;
  context: string;
}

export interface Exercise {
  exercise_name: string;
  time: string;
  no_of_set: number;
  sets: ExerciseSet[];
  reps: number | null;
  weight_lifted: number | null;
  rpm_percent: number | null;
  coach_note: string;
  coach_prescription?: string;
  key_cues_of_specific_lift?: string[];
}
export interface DailyCheckIn {
  sleep_quality: number;
  stress_level: number;
  mental_readiness: number;
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
  daily_check_in?: DailyCheckIn;
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
  selectedExerciseName: string | null;
  selectedDayKey: string | null;
  sleepQuality: number;
  stressLevel: number;
  mentalReadiness: number;
  selectedDayExercises: Exercise[] | null;
}

const initialState: TrainingState = {
  weekStart: null,
  days: null,
  isFirstWeek: false,
  profileSnapshot: null,
  sleepQuality: 0,
  stressLevel: 0,
  mentalReadiness: 0,
  selectedExerciseName: null,
  selectedDayKey: null,
  selectedDayExercises: null,
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    setTrainingData: (state, action: PayloadAction<any>) => {
      const apiData = action.payload?.data ?? action.payload;
      if (!apiData) return;
      const { week_start, days, is_first_week, profile_snapshot } = apiData;
      state.weekStart = week_start;
      state.days = days;
      state.isFirstWeek = is_first_week;
      state.profileSnapshot = profile_snapshot;
      if (state.selectedDayKey && days?.[state.selectedDayKey as keyof Days]) {
        state.selectedDayExercises =
          days[state.selectedDayKey as keyof Days].exercises;
      }
    },
    setSelectedExercise: (
      state,
      action: PayloadAction<{
        name: string | null;
        dayKey: string | null;
        exercises: Exercise[];
      }>,
    ) => {
      state.selectedExerciseName = action.payload.name;
      state.selectedDayKey = action.payload.dayKey;
      state.selectedDayExercises = action.payload.exercises;
    },
    clearTrainingData: () => initialState,
  },
});

export const { setTrainingData, clearTrainingData, setSelectedExercise } =
  trainingSlice.actions;
export default trainingSlice.reducer;
