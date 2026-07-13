# Oly App — Full Context Handoff

## Who I Am

I'm Santiago, founder of Oly — an Olympic weightlifting app. Think "Strava for Olympic weightlifting." I'm a competitive weightlifter myself. I'm strong on frontend/design but not very experienced with backend, so I need clear explanations on technical backend decisions. I work visually — I like to see changes, review screenshots, and approve things step by step.

## The Vision (Hooked Model — 3 Pillars)

Every feature must strengthen at least one of these loops:

1. **Social Feed (Daily Habit Engine)** — gets users opening Oly every day, even rest days. Default landing screen. Scroll/watch/like/post.
2. **Leaderboard (Identity & Obsession)** — makes Oly the source of truth for the sport. Real-time rankings by weight class, age, region. "If it's not on Oly, it's not verified."
3. **AI Training (Value Anchor)** — makes Oly irreplaceable through personalization. AI coach generates weekly programs, learns from your data over time.

The loops feed each other: Training → hit PR → submit for verification → ranking updates → post to feed → community engages → competitive motivation → train harder.

## Tech Stack

- **Frontend:** Expo + React Native (TypeScript), Redux Toolkit + RTK Query, redux-persist with AsyncStorage
- **Backend:** Node/Express with MongoDB (Mongoose), deployed on **AWS** behind a load balancer with ACM SSL cert
- **Domain:** `olytraining.com` on Bluehost, `api.olytraining.com` CNAME pointing to AWS load balancer
- **Backend repo:** https://github.com/SantiagoCaicedoA/oly-backend (Abdul's work, on `main`)
- **Frontend repo:** https://github.com/SantiagoCaicedoA/oly (my work, on `redesign/oly-v2-visual` branch — 55+ commits ahead of main)
- **API base URL:** loaded from Expo config (`Constants.expoConfig?.extra?.apiUrl`)

## Design System

- Ubuntu font (400/500), 4px grid
- Dark gradients: `#16222B → #0F1A24 → #0C1620`
- Card surfaces: `#1A2533` / `#1E2A36`
- Primary blue: `#004AAD` / `#2B6DD6`
- Green accent: `#B4F077`
- 12px card radius
- Functional blue highlight rule: blue tint ONLY for items needing user action
- Crew avatars = rounded-square, DM avatars = circular

## Current Branch: `redesign/oly-v2-visual`

This is where all work happens. The `main` branch is old. Do NOT work on `main`.

## What WORKS Right Now (Connected to Live Backend)

| Screen | API Endpoint | Status |
|--------|-------------|--------|
| Sign up | POST `/api/users` | ✅ Works |
| Login | POST `/api/users/signin` | ✅ Works |
| Onboarding (8 screens) | PUT `/api/profile` | ✅ Works — just fixed 7 key mismatches |
| Profile image upload | POST `/api/profile/upload-image` | ❌ Fails — likely S3/backend config issue |
| AI Training plan | GET `/api/training/week` | ✅ Works — fetches weekly AI program |
| Daily check-in | POST `/api/daily/check-in` | ✅ Works |
| Log sets | PATCH `/api/training/log` | ✅ Works |
| Custom sets | POST `/api/training/week/custom-set` | ✅ Works |
| Home feed | GET `/api/posts?page=N&limit=N` | ✅ Works — paginated infinite scroll |
| Create post | POST `/api/posts` | ✅ Works — video + lift data |
| Post interactions | Like/unlike/comment/delete | ✅ All work |

**The core training loop is functional end-to-end:** onboard → get AI plan → daily check-in → log sets → post lifts → social feed.

## What DOESN'T Work (Hardcoded / Missing)

| Screen | File | Issue |
|--------|------|-------|
| **Leaderboard** | `app/(tabs)/rank.tsx` | 100% hardcoded fake data ("Oscar Figueroa", 12 fake athletes). No backend endpoint exists. |
| **Analytics** | `app/(tabs)/analytics.tsx` | Empty — only renders a logout button. No backend endpoint. |
| **Profile view** | `app/athlete/my-profile.tsx` | All hardcoded. Data is WRITTEN during onboarding but no GET endpoint to READ it back. |
| **Settings** | Route `/athlete/settings` | Screen file doesn't exist. |
| **Messages** | N/A | No screen, no backend, no real-time connection. |
| **Lift graph** | `components/lift-graph.tsx` | Uses `MOCK_DATA` (5 hardcoded points). No lift history endpoint. |
| **Training phase badge** | Workout screen | Hardcoded "ACCUMULATION / WEEK 3 OF 4". |
| **Bodyweight in check-in** | `app/athlete/daily-check-in.tsx` | Hardcoded at 81.2 kg. Should read from profile. |
| **Feed filters** | `app/(tabs)/home.tsx` | UI pills exist but filters never sent to API. |
| **Profile image upload** | Onboarding screen 1 | Fails with "Failed to upload image" error. |

## RTK Query Setup

All API calls go through `store/api.ts` using `createApi` with a custom `baseQueryWithAuth` that injects the bearer token from `state.auth.token`. Routes defined in `utils/api-routes.tsx`. Currently 19 endpoints, all imported and used somewhere.

## Recent Fix (Just Completed & Pushed)

**Commit `075f1a2` on `redesign/oly-v2-visual`:** Fixed 7 key mismatches in `onboarding-screen8.tsx` where the submission was reading nonexistent Redux keys, sending NaN/undefined to the backend:

- `allData.age` → now computed from `dobDay/Month/Year`
- `allData.experience` → now mapped from `weightliftingExposure` (new=0, developing=1, experienced=4, competitive=6 years)
- `allData.measurement_system` → now derived from `weightUnit` (KG→metric, LB→imperial)
- `allData.snatch/clean_jerk/etc` → now reads from `liftValues` categorized arrays
- `allData.snatch_checked/etc` → now reads from `olympic_lifts/variations/squats/press` boolean arrays
- `allData.strength_accuracy` → now reads `accuracy`
- Added `training_phase` and `competition` to the API payload (collected by Screen 6 but never sent)
- Added `CompetitionInfo` interface to `types/api/onboarding.ts`
- All fields now have `?? fallback` defaults

**Tested:** Ran through full onboarding on iOS simulator, hit START TRAINING, landed on home screen. Backend accepted the payload.

## Known Bugs

1. **Profile image upload fails** — "Failed to upload image" on onboarding Screen 1. Likely S3 or backend config issue.
2. **No token refresh** — if the JWT expires, the user gets silently logged out. Needs refresh token flow.
3. **Training log PATCH may delete sets** — Bug #5 from Abdul's work. The PATCH endpoint might overwrite instead of merge.
4. **Pre-existing TypeScript config errors** — `tsc --noEmit` shows 2 errors about missing type definition files for 'api' and 'context'. Not related to any code changes.

## Backend Context (Abdul's Work)

Abdul (a developer) built the backend. He's no longer actively working on it. His code is functional but needs updates:

- The Mongoose profile schema does NOT yet have `training_phase` or `competition` fields — the frontend sends them but the backend silently ignores unknown fields. These need to be added to the schema.
- The backend is deployed on AWS with a load balancer. I have an AWS account (Free Tier) and Abdul had an IAM user (`abdul-dev`).

## My Goal

**I want to be able to use Oly for actual training as soon as possible.** The core training loop works, but the experience feels incomplete because profile, analytics, and leaderboard are all fake data.

## Recommended Next Steps (Priority Order)

1. **Profile screen** — add a GET profile endpoint to the backend, then wire `my-profile.tsx` to show real data instead of "Oscar Figueroa"
2. **Fix bodyweight in daily check-in** — read from profile data instead of hardcoded 81.2 kg
3. **Backend schema update** — add `training_phase` and `competition` fields to Mongoose profile schema
4. **Fix profile image upload** — debug why the upload endpoint fails
5. **Analytics** — build a basic version showing logged lifts over time
6. **Leaderboard** — new backend endpoint + replace hardcoded frontend data
7. **Settings screen** — create the missing screen so users can update their profile

## Key Files Reference

| Purpose | Path |
|---------|------|
| RTK Query API layer | `store/api.ts` |
| API routes | `utils/api-routes.tsx` |
| Redux auth state | `store/reducer/authSlice.ts` |
| Redux onboarding state | `store/reducer/onboardingSlice.ts` |
| Onboarding submission | `app/auth/onboarding/onboarding-screen8.tsx` |
| Onboarding types | `types/api/onboarding.ts` |
| Home feed | `app/(tabs)/home.tsx` |
| Workout/training | `app/(tabs)/workout.tsx` |
| Daily check-in | `app/athlete/daily-check-in.tsx` |
| Training exercise | `app/athlete/training-exercise.tsx` |
| Create post | `app/athlete/create-new-post.tsx` |
| Post expanded | `app/athlete/post-expanded.tsx` |
| Leaderboard (fake) | `app/(tabs)/rank.tsx` |
| Analytics (empty) | `app/(tabs)/analytics.tsx` |
| Profile (fake) | `app/athlete/my-profile.tsx` |
| Lift graph (mock) | `components/lift-graph.tsx` |
| Design tokens | `src/oly-theme/oly-*.ts` |

## Working Style

- Show me what you're changing and why before doing it
- I review visually — screenshots, before/after comparisons
- Be clear on backend concepts, I'm learning
- Work in chunks, not everything at once
- Always work on the `redesign/oly-v2-visual` branch
- My frontend repo is at `~/Library/Mobile Documents/com~apple~CloudDocs/oly`
- Backend repo needs to be cloned (not on my machine yet)
