/**
 * Oly Design System — Motion & Animation
 * Source: Design Bible v3.0, Sections 9.1–9.5
 *
 * RULES:
 * - Never animate data changes in session logger (weight, reps). Instant swap.
 * - Nav bar title changes: instant cut.
 * - In-gym: minimize. Only miss toggle, add set, and PR get animation.
 * - Reduce Motion ON → ALL animations become instant cuts. Only haptics remain.
 */

// ─── 9.1 Transitions ────────────────────────────────────────────
export const olyTransitions = {
  /** Standard iOS stack navigation */
  screenPush: 300,
  /** Sheet slides up — spring with damping 0.85 */
  sheetUp: 350,
  /** Sheet dismisses — faster down than up */
  sheetDown: 250,
  /** Tab bar content cuts instantly. Indicator slides. */
  tabSwitch: 200,
} as const;

// ─── 9.2 Micro-interactions ──────────────────────────────────────
export const olyMicro = {
  /** Scale to 0.97 on press, 1.0 on release */
  buttonPress: 100,
  /** Cross-fade between selected/unselected */
  chipToggle: 150,
  /** Scale pulse 1.0 → 1.05 → 1.0 + haptic */
  missToggle: 200,
  /** Active pill slides to new position */
  segmentSlide: 200,
  /** Button scale 0.95 → 1.0, number cross-fades */
  stepperTap: 80,
} as const;

// ─── 9.3 Content Appearance ──────────────────────────────────────
export const olyAppearance = {
  /** Fade in + 8px upward drift per card */
  cardLoad: 200,
  /** Stagger between cards */
  cardStagger: 50,
  /** Fade in + slide down from top */
  toastAppear: 200,
  /** Fade out + slide up */
  toastDismiss: 150,
  /** Fade in + height expands from 0 */
  newSetRow: 200,
  /** Gold pulse + badge scale 1.0 → 1.15 → 1.0 + success haptic */
  prAchieve: 300,
} as const;

// ─── 9.1 Spring Config ───────────────────────────────────────────
export const olySpring = {
  /** Bottom sheet spring damping */
  sheetDamping: 0.85,
} as const;

// ─── 9.4 Haptics ─────────────────────────────────────────────────
/**
 * Maps to expo-haptics:
 * - light   → Haptics.impactAsync(ImpactFeedbackStyle.Light)
 * - medium  → Haptics.impactAsync(ImpactFeedbackStyle.Medium)
 * - heavy   → Haptics.impactAsync(ImpactFeedbackStyle.Heavy)
 * - success → Haptics.notificationAsync(NotificationFeedbackType.Success)
 * - warning → Haptics.notificationAsync(NotificationFeedbackType.Warning)
 */
export const olyHaptics = {
  buttonPress: "light",
  missToggle: "medium",
  prAchieve: "success",
  destructive: "warning",
  stepper: "light",
  timerComplete: "heavy",
} as const;
