import Constants from "expo-constants";
export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl;

export const AUTH_ROUTES = {
  SIGNUP: "/api/users",
  LOGIN: "/api/users/signin",
  ONBOARDING: "/api/profile",
  ONBOARDING_IMAGE_UPLOAD: "/api/profile/upload-image",
  ONBOARDING_VIDEO_UPLOAD: "/api/profile/upload-video",
} as const;

export const ATHLETE_ROUTES = {
  CREATE_NEW_POST: "/api/posts",
  GET_POSTS: "/api/posts",
  GET_POST_BY_ID: "/api/posts",
  GET_AI_TRAINING: "api/training/week",
  UPDATE_TRAINING_DATA: "/api/training/log",
  DAILY_CHECK_IN: "/api/daily/check-in",
  LIKE_POST_BY_ID: (postId: string) => `/api/posts/${postId}/like`,
  UN_LIKE_POST_BY_ID: (postId: string) => `/api/posts/${postId}/like`,
  COMMENT_POST_BY_ID: (postId: string) => `/api/posts/${postId}/comments`,
  GET_COMMENTS_BY_POST_ID: (postId: string) => `/api/posts/${postId}/comments`,
  DELETE_COMMENT_BY_ID: "/api/posts/${postId}/comments/${commentId}",
};
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ATHLETE: ATHLETE_ROUTES,
} as const;
