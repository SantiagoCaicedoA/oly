/**
 * Oly Design System — Elevation
 * Source: the Oly design system (Claude artifact), superseding Design Bible v3.0 §6.
 *
 * DEPTH IS SURFACE LUMINANCE. NOTHING ELSE.
 *
 * A surface is identified by being lighter than what it sits on, the way iOS
 * dark mode works. iOS steps its surfaces by roughly 1.22:1 at every level.
 * Oly used to step by 1.05:1 and 1.06:1, about a quarter of that, and made up
 * the difference with a 1px outline that measured 2.42:1 — under the 3:1 the
 * accessibility rules require. The surfaces now do the work and cards carry
 * no outline.
 *
 * CHOOSING A SURFACE — answer in order, stop at the first yes:
 *   1. Is it the screen background?              Level 0, the gradient.
 *   2. Does it sit on the screen background?     Level 1, no border.
 *   3. Does it sit inside a level 1 surface?     Level 2, no border.
 *   4. Is it an interactive control (input,
 *      stepper, segmented control, option)?      Its level + a 1px
 *                                                olyColors.border.default.
 *   5. Is it a row inside a surface?             No background of its own.
 *                                                Separate with a divider or
 *                                                spacing; active lifts to L2.
 *
 * There is no level 3. The one exception to "no shadows" is olyGlow below:
 * glass screens light blue elements from within, and olyShadow.float lifts
 * the floating tab bar.
 */

import { olyPalette, olyColors } from "./oly-colors";

// ─── Elevation Levels ────────────────────────────────────────────

export const olyElevation = {
  /** Level 0 — the gradient. Use olyGradient with LinearGradient. */
  level0: "transparent",

  /** Level 1 — cards, sheets, the tab bar. 1.24:1 above the gradient's brightest stop. */
  level1: {
    backgroundColor: olyPalette.card,
  },

  /** Level 2 — anything nested inside a level 1 surface. 1.21:1 above level 1. */
  level2: {
    backgroundColor: olyPalette.cardElevated,
  },
} as const;

// ─── Separator ───────────────────────────────────────────────────

/**
 * The one rule weight in the system. Between rows inside one surface, the tab
 * bar top border, and interactive control borders. Never a card outline.
 */
export const olyHairline = {
  height: 1,
  backgroundColor: olyColors.border.default,
} as const;

// ─── Glow (glass screens) ────────────────────────────────────────

/**
 * Brand-blue light around an element. Spread into a style:
 * `{ backgroundColor: olyPalette.primary, ...olyGlow.md }`.
 *   sm — dots, progress fills, meters, checks
 *   md — buttons, hot chips, badges
 *   lg — sticky bars and large icon discs
 */
const glowOf = (shadowOpacity: number, shadowRadius: number) => ({
  shadowColor: olyPalette.primary,
  shadowOpacity,
  shadowRadius,
  shadowOffset: { width: 0, height: 0 },
});

export const olyGlow = {
  sm: glowOf(0.8, 6),
  md: glowOf(0.6, 14),
  lg: glowOf(0.45, 18),
} as const;

/** Lifts a floating element (the tab bar) off the screen. */
export const olyShadow = {
  float: {
    shadowColor: olyPalette.black,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
} as const;
