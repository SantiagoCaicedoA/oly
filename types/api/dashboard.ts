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
export interface GetPostsParams {
  page: number;
  limit: number;
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
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  country: string;
}

export interface SessionDetail {
  context: boolean;
  effort_value: number;
  intent_opt: string;
  isEffort: boolean;
  isIntent: boolean;
  lifted_kg: number;
  rpe: string;
  context_value: string;
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
  user: PostUserById;
  session_detail: SessionDetail;
  name: string;
  username: string;
  is_liked: boolean;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  thumbnail_url: string;
}
export interface PostUserById {
  _id: string;
  name: string;
  profile: {
    country: string;
  };
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

  no_of_set: number;
  sets: SetPayload[];
}

export interface UpdateTrainingPayload {
  day: string;
  exercises: ExercisePayload[];
}
export interface DailyCheckInPayload {
  day: string;
  daily_check_in: {
    sleep_quality: number;
    stress_level: number;
    mental_readiness: number;
    motivation: string;
    muscle_soreness: number;
    sore_areas: string[];
    intensity: number;
  };
}
export interface CustomSetPayload {
  day: string;
  exercise_index: number;
}

export interface KeyCue {
  [index: number]: string;
}

export interface SetDetail {
  set_number: number;
  weight: number;
  reps: number;
  rpm_percent: number;
  isComplete: boolean;
  coach_prescription: string;
  key_cues: string[];
  was_it_a_miss: boolean;
  any_pain_or_discomfort: boolean;
  pain_where: string[];
  intent: string;
  context: string;
}

export interface AiExerciseDetail {
  exercise_name: string;
  time: string;
  no_of_set: number;
  sets: SetDetail[];
  coach_note: string;
}

export interface DailyCheckIn {
  sleep_quality: number | null;
  stress_level: number | null;
  mental_readiness: number | null;
  motivation: string;
  muscle_soreness: number;
  sore_areas: string[];
  intensity: number;
}

export interface Completion {
  isComplete: boolean;
  completed_at: string | null;
  sets_logged: number;
}

export interface AiTrainingDay {
  type: "training";
  coach_note: string;
  key_cues: string[];
  daily_check_in: DailyCheckIn;
  exercises: AiExerciseDetail[];
  coach_prescription: string;
  key_cues_of_specific_lift: string[];
  weight_lifted: number | null;
  reps: number | null;
  completion: Completion;
}

export interface RestDay {
  type: "rest";
  key_cues: string[];
  key_cues_of_specific_lift: string[];
  completion: Completion;
  daily_check_in: DailyCheckIn;
  exercises: [];
}

export type DayPlan = AiTrainingDay | RestDay;

export interface WeekSchedule {
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

export interface AiTrainingPlan {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
  is_first_week: boolean;
  profile_snapshot: ProfileSnapshot;
}

export interface AiTrainingResponse {
  data: AiTrainingPlan;
}
export interface UpdateTrainingResponse {
  success: boolean;
  message: string;
  data: UpdatedTrainingDay;
}

export interface UpdatedTrainingDay {
  completion: Completion;
  type: "training" | "rest";
  coach_note: string;
  key_cues: string[];
  daily_check_in: DailyCheckIn;
  exercises: UpdatedExercise[];
  coach_prescription: string;
  key_cues_of_specific_lift: string[];
  weight_lifted: number | null;
  reps: number | null;
}

export interface UpdatedExercise {
  exercise_name: string;
  time: string;
  no_of_set: number;
  sets: UpdatedSetDetail[];
  coach_note: string;
}

export interface UpdatedSetDetail {
  set_number: number;
  weight: number;
  reps: number;
  rpm_percent: number;
  isComplete: boolean;
  coach_prescription: string;
  key_cues: string[];
  was_it_a_miss: boolean;
  any_pain_or_discomfort: boolean;
  pain_where: string[];
  intent: string;
  context: string;

  bar_speed?: string;
  position_quality?: string;
  where_did_it_fail?: string;
  missed_where?: string;
  pain_level?: string;
}

export interface CustomSetResponse {
  success: boolean;
  message: string;
  data: {
    set: UpdatedSetDetail;
    total_sets: number;
  };
}

export interface LikeUnlikeResponse {
  success: boolean;
  message: string;
  likeCount: number;
  isLiked: boolean;
}
