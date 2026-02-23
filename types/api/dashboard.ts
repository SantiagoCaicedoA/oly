export interface CreateNewPostResponse {
  success: boolean;
  message: string;
  data: CreateNewPostData;
}

export interface CreateNewPostData {
  _id: string;
  createdAt: string;
  updatedAt: string;
  is_private: boolean;
  is_public: boolean;
  lift_name: string;
  opinion: string;
  status: "DRAFT" | string;
  user: string;
  video_url: string;
  session_detail: {
    context: boolean;
    effort_value: number;
    intent_opt: string;
    isEffort: boolean;
    isIntent: boolean;
    lifted_kg: number;
    rpe: string;
  };
}

export interface GetPostsResponse {
  success: boolean;
  count: number;
  total: number;
  data: Post[];
}

export interface Post {
  _id: string;
  createdAt: string;
  updatedAt: string;
  is_private: boolean;
  is_public: boolean;
  lift_name: string;
  opinion: string;
  status: "DRAFT" | string;
  video_url: string;
  session_detail: SessionDetail | null;
  user: PostUser;
  username: string;
  name: string;
}

export interface SessionDetail {
  context: boolean;
  effort_value: number;
  intent_opt: string;
  isEffort: boolean;
  isIntent: boolean;
  lifted_kg: number;
  rpe: string;
}

export interface PostUser {
  _id: string;
  username?: string;
  profile_image?: string;
}

export interface GetPostByIdResponse {
  success: boolean;
  data: PostById;
}

export interface PostById {
  _id: string;
  createdAt: string;
  updatedAt: string;
  is_private: boolean;
  is_public: boolean;
  lift_name: string;
  opinion: string;
  status: "DRAFT" | "PUBLISHED" | string;
  video_url: string;
  user: string;
  session_detail: SessionDetail;
  name: string;
  username: string;
}

export interface SessionDetail {
  context: boolean;
  effort_value: number;
  intent_opt: string;
  isEffort: boolean;
  isIntent: boolean;
  lifted_kg: number;
  rpe: string;
}
export interface SubmitAIPayload {
  request: string;
  response_format: "workout_tab" | string;
}
export interface AIExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number | null;
  [key: string]: any;
}

export interface Training {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number | null;
  [key: string]: any;
}

export interface TrainingDay {
  day: string;
  exercises: Training[];
  [key: string]: any;
}

export interface SubmitAIResponse {
  data: {
    coach_note: string;
    coach_prescription: string;
    key_cues: string[];
    key_cues_of_specific_lift: string[];
    mental_readiness: number | null;
    reps: number | null;
    sleep_quality: number | null;
    stress_level: number | null;
    suggested_exercises: AIExercise[][];

    todays_training: Training[][];
    training_days: TrainingDay[][];
    weight_lifted: number | null;
  };
  success: boolean;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
  };
}
export interface SetPayload {
  set_number: number;
  weight: number;
  reps: number;
  rpm_percent: number;
  bar_speed: string;
  position_quality: string;
  was_it_a_miss: boolean;
  where_did_it_fail: string;
  missed_where: string;
  any_pain_or_discomfort: boolean;
  pain_level: string;
  pain_where: string[];
}

export interface ExercisePayload {
  exercise_name: string;
  time: string;
  no_of_set: number;
  sets: SetPayload[];
}

export interface UpdateTrainingPayload {
  day: string;
  exercises: ExercisePayload[];
}