# Phase 2 — Backend & Logic Improvements (with Abdul)

## Username Uniqueness
- [ ] Add `GET /api/users/check-username/:username` endpoint to backend
- [ ] Return `{ available: true/false }` response
- [ ] Add RTK Query endpoint `useCheckUsernameMutation` or `useCheckUsernameQuery` in frontend
- [ ] Add debounced real-time availability check on username input (300ms debounce)
- [ ] Show inline feedback: green checkmark (available) or red "Username taken" message
- [ ] Fix backend bug: duplicate username error returns "Email already exists" instead of "Username already exists" (in `userService.js` — error code 11000 handler doesn't distinguish between email and username conflicts)

## Shared Component Migration
- [ ] Migrate `SegmentedSelector` (`components/segmented-selector.tsx`) from old `useTheme()` to Oly tokens — used outside onboarding in: archive, slider, physical-state
- [ ] Migrate `ActionButtonsRow` (`constants/custom-row-buttons.tsx`) from old `useTheme()` to Oly tokens — used outside onboarding in: create-new-post, daily-check-in, timer-bottom-sheet
- [ ] Migrate `EquipmentList` (`components/equipment.tsx`) from old `useTheme()` to Oly tokens — used in onboarding screens 5, 6, 7
- [ ] Migrate `NumberOfDays` (`components/days-number.tsx`) from old `useTheme()` to Oly tokens — used in onboarding screen 4
- [ ] Migrate `DaysName` (`components/days-name.tsx`) from old `useTheme()` to Oly tokens — used in onboarding screen 4
- [ ] Migrate `Header` (`components/header.tsx`) from old `useTheme()` to Oly tokens — or deprecate (only used in onboarding, replaced by inline title blocks in redesign)
- [ ] Deprecate `LiftDetailsCard` (`components/lift-details.tsx`) — only used in onboarding screen 2, replaced by inline lift rows in redesign
- [ ] Audit and remove old theme references (`useTheme()`, `colors.xxx`) from all onboarding screens once redesign is complete

## Other
- [ ] Shared element logo animation between Welcome → Sign Up → Login (react-native-reanimated sharedTransitionTag)
- [ ] QA pass: touch targets (44px min), Dynamic Type, Reduce Motion, contrast ratios
