import Constants from "expo-constants";
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:8000";
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
  AI_TRAINING: "/api/training/generate",
};
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ATHLETE: ATHLETE_ROUTES,
} as const;
