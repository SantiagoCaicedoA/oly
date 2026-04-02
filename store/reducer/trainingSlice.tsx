import { DayPlan } from "@/types/api/dashboard";
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
  isComplete: boolean;
}

export interface Exercise {
  exercise_name: string;
  time: string;
  no_of_set: number;
  sets: ExerciseSet[];
  reps?: number | null;
  weight_lifted?: number | null;
  rpm_percent?: number | null;
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
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

export interface ProfileSnapshot {
  training_days_per_week: number;
  preferred_rest_days: string[];
  session_duration: number;
}

interface TrainingState {
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
    setTrainingData: (state, action: PayloadAction<{ data: { days: Days; is_first_week: boolean; profile_snapshot: ProfileSnapshot } }>) => {
      const response = action.payload;
      if (!response?.data?.days) return;

      const apiData = response.data;

      // Extract days from nested structure as per actual API response
      state.days = apiData.days;
      state.isFirstWeek = apiData.is_first_week ?? false;
      state.profileSnapshot = apiData.profile_snapshot ?? null;

      // Update selected day exercises if a day is already selected
      if (state.selectedDayKey) {
        const dayKey = state.selectedDayKey as keyof Days;
        if (state.days && state.days[dayKey]) {
          state.selectedDayExercises = state.days[dayKey].exercises;
        }
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
