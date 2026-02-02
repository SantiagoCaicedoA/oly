export const API_BASE_URL = "http://192.168.100.240:8080";
export const AUTH_ROUTES = {
  SIGNUP: "/api/users",
  LOGIN: "/api/users/signin",
  ONBOARDING: "/api/profile",
} as const;

export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
} as const;
