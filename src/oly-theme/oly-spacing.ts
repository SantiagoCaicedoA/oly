/**
 * Oly Design System — Spacing
 * Source: Design Bible v3.0, Sections 4.1–4.4
 *
 * RULES:
 * - All spacing uses a 4px base. No exceptions, no arbitrary values.
 * - If you need 13px, use 12 or 16.
 * - Screen padding is always 16px horizontal.
 * - Cards: 16px internal padding, 16px gap between them.
 */

// ─── 4.2 Spacing Scale ──────────────────────────────────────────
export const olySpacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
} as const;

// ─── 4.3 Layout Constants ────────────────────────────────────────
export const olyLayout = {
  /** Screen horizontal padding — Apple HIG */
  screenPadding: 16,
  /** Card internal padding */
  cardPadding: 16,
  /** Card-to-card gap */
  cardGap: 16,
  /** Section header to content gap */
  sectionHeaderGap: 8,
  /** List item vertical padding */
  listItemPadding: 12,
  /** Navigation bar height — Apple HIG */
  navBarHeight: 44,
  /** Tab bar height (add safe area bottom dynamically) */
  tabBarHeight: 49,
  /** Minimum touch target everywhere — Apple HIG */
  minTouchTarget: 44,
  /** In-gym touch target (chalk/sweat/fatigue) */
  gymTouchTarget: 56,
} as const;
