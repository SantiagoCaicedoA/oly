// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    // App Configuration
    APP_VARIANT?: "dev" | "prod";
    EAS_BUILD_PROFILE?: string;

    // API URLs
    API_URL: string;

    // Add other environment variables here as you use them
    SENTRY_DSN?: string;
    FIREBASE_API_KEY?: string;
    FIREBASE_AUTH_DOMAIN?: string;
    FIREBASE_PROJECT_ID?: string;
    // ... etc
  }
}
