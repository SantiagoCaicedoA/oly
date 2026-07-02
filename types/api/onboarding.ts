export interface OnboardingReduxState {
  name?: string;
  country?: string;
  age?: string;
  sex?: string;
  experience?: string;
  height?: string;
  weight?: string;
  weightUnit?: string;
  measurement_system?: string;
  snatch?: string;
  snatch_checked?: boolean;
  power_snatch?: string;
  power_snatch_checked?: boolean;
  clean_jerk?: string;
  clean_jerk_checked?: boolean;
  clean?: string;
  clean_checked?: boolean;
  power_clean?: string;
  power_clean_checked?: boolean;
  jerk?: string;
  jerk_checked?: boolean;
  back_squat?: string;
  back_squat_checked?: boolean;
  front_squat?: string;
  front_squat_checked?: boolean;
  strength_accuracy?: string;
  limitation?: boolean;
  affected_area?: string[];
  selected_affected_area?: string;
  impact?: string;
  when_to_show?: string[];
  days_per_week?: number;
  duration?: number;
  rest_days?: string[];
  optional_equipment?: string[];
  training_preferences?: string;
  performance_gaps?: string[];
}

export interface StrengthStat {
  value: number;
  checked: boolean;
}

export interface StrengthStats {
  snatch: StrengthStat;
  power_snatch: StrengthStat;
  clean_jerk: StrengthStat;
  clean: StrengthStat;
  power_clean: StrengthStat;
  jerk: StrengthStat;
  back_squat: StrengthStat;
  front_squat: StrengthStat;
}

export interface Considerations {
  has_limitations: boolean;
  affected_areas: string[];
  impact_level: string;
  triggers: string[];
}

export interface Availability {
  training_days_per_week: number;
  session_duration: number;
  preferred_rest_days: string[];
}

export interface Equipment {
  optional: string[];
}

export interface CompetitionInfo {
  preparing: boolean;
  name?: string;
  date?: string;
  weight_class?: string;
  target_total?: number;
}

export interface OnboardingApiPayload {
  display_name: string;
  country: string;
  age: number;
  sex: string;
  user_name: string;
  experience_years: number;
  height_cm: number;
  bodyweight_value: number;
  bodyweight_unit: string;
  preferred_unit: string;
  strength_stats: StrengthStats;
  strength_accuracy: string;
  considerations: Considerations;
  availability: Availability;
  equipment: Equipment;
  training_preference: string;
  performance_gaps: string[];
  training_phase: string;
  recent_training_volume?: string;
  competition?: CompetitionInfo;
}
export interface StrengthItem {
  value: number;
  checked: boolean;
}

export interface Considerations {
  has_limitations: boolean;
  affected_areas: string[];
  impact_level: string;
  triggers: string[];
}

export interface Availability {
  training_days_per_week: number;
  session_duration: number;
  preferred_rest_days: string[];
}

export interface Equipment {
  optional: string[];
}
export interface Profile {
  image_url: string;
  video_urls: string[];
  display_name: string;
  country: string;
  age: number;
  sex: string;
  experience_years: number;
  height_cm: number;
  bodyweight_value: number;
  bodyweight_unit: string;
  preferred_unit: string;
  strength_stats: StrengthStats;
  considerations: Considerations;
  availability: Availability;
  equipment: Equipment;
  training_preference: string;
  performance_gaps: string[];
}
export interface OnboardingUser {
  _id: string;
  name: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  profile: Profile;
}
export interface OnboardingApiResponse {
  success: boolean;
  message?: string;
  data: OnboardingUser;
}

export interface UploadProfileImageResponse {
  success: boolean;
  message: string;
  url: string;
  data: {
    availability: {
      preferred_rest_days: string[];
    };
    bodyweight_unit: string;
    considerations: {
      affected_areas: string[];
      triggers: string[];
    };
    equipment: {
      optional: string[];
    };
    image_url: string;
    performance_gaps: string[];
    preferred_unit: string;
    username: string;
    video_urls: string[];
  };
}
export interface UploadAthleteVideoResponse {
  success: boolean;
  message: string;
  url: string;
  video_urls: string[];
  data: UploadAthleteVideoData;
}

export interface UploadAthleteVideoData {
  availability: {
    preferred_rest_days: string[];
  };
  bodyweight_unit: string;
  considerations: {
    affected_areas: string[];
    triggers: string[];
  };
  equipment: {
    optional: string[];
  };
  image_url: string;
  performance_gaps: string[];
  preferred_unit: string;
  username: string;
  video_urls: string[];
}
