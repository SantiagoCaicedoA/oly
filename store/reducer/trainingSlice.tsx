import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Exercise {
  exercise_name: string;
  time: string;
  no_of_set: number;
}

interface TrainingDay {
  day: number;
  day_label: string;
  exercises: Exercise[];
}

interface SuggestedExercise {
  lift_name: string;
  description: string;
  label: string;
}

interface TrainingState {
  coachNote: string;
  keyCues: string[];
  trainingDays: TrainingDay[];
  todaysTraining: Exercise[];
  sleepQuality: number;
  stressLevel: number;
  mentalReadiness: number;
  coachPrescription: string;
  keyCuesOfSpecificLift: string[];
  weightLifted: number | null;
  reps: number | null;
  suggestedExercises: SuggestedExercise[];
}

const initialState: TrainingState = {
  coachNote: "",
  keyCues: [],
  trainingDays: [],
  todaysTraining: [],
  sleepQuality: 0,
  stressLevel: 0,
  mentalReadiness: 0,
  coachPrescription: "",
  keyCuesOfSpecificLift: [],
  weightLifted: null,
  reps: null,
  suggestedExercises: [],
};

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    setTrainingData: (state, action: PayloadAction<any>) => {
      const data = action.payload.data;
      state.coachNote = data.coach_note;
      state.keyCues = data.key_cues;
      state.trainingDays = data.training_days;
      state.todaysTraining = data.todays_training;
      state.sleepQuality = data.sleep_quality;
      state.stressLevel = data.stress_level;
      state.mentalReadiness = data.mental_readiness;
      state.coachPrescription = data.coach_prescription;
      state.keyCuesOfSpecificLift = data.key_cues_of_specific_lift;
      state.weightLifted = data.weight_lifted;
      state.reps = data.reps;
      state.suggestedExercises = data.suggested_exercises;
    },
    clearTrainingData: (state) => {
      return initialState;
    },
  },
});

export const { setTrainingData, clearTrainingData } = trainingSlice.actions;
export default trainingSlice.reducer;
