export const API_BASE_URL = "http://192.168.100.240:8080";
export const AUTH_ROUTES = {
  SIGNUP: "/api/users",
  LOGIN: "/api/users/signin",
  ONBOARDING: "/api/profile",
  ONBOARDING_IMAGE_UPLOAD: "/api/profile/upload-image",
  ONBOARDING_VIDEO_UPLOAD: "/api/videos/upload",
} as const;

export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
} as const;
