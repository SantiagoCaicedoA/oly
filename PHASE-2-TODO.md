# Phase 2 — Backend & Logic Improvements (with Abdul)

## Username Uniqueness
- [ ] Add `GET /api/users/check-username/:username` endpoint to backend
- [ ] Return `{ available: true/false }` response
- [ ] Add RTK Query endpoint `useCheckUsernameMutation` or `useCheckUsernameQuery` in frontend
- [ ] Add debounced real-time availability check on username input (300ms debounce)
- [ ] Show inline feedback: green checkmark (available) or red "Username taken" message
- [ ] Fix backend bug: duplicate username error returns "Email already exists" instead of "Username already exists" (in `userService.js` — error code 11000 handler doesn't distinguish between email and username conflicts)

## Other
- [ ] Shared element logo animation between Welcome → Sign Up → Login (react-native-reanimated sharedTransitionTag)
- [ ] QA pass: touch targets (44px min), Dynamic Type, Reduce Motion, contrast ratios
