/**
 * Oly Design System — Typography
 * Source: Design Bible v3.0, Sections 3.1–3.6
 *
 * RULES:
 * - No Bold (700) weight. If Medium isn't enough, use size or color.
 * - All sizes even. Line height = size x 1.25, rounded to nearest even.
 * - Minimum text size: 12px. Nothing smaller, ever.
 * - Letter spacing: 0 everywhere. Exception: ALL-CAPS gets +0.5px.
 * - Max line length: 70 characters for body text.
 */

import { TextStyle } from "react-native";

// ─── 3.1 Typeface ────────────────────────────────────────────────
export const olyFonts = {
  regular: "Ubuntu-Regular",
  medium: "Ubuntu-Medium",
} as const;

// ─── 3.2 Type Scale ──────────────────────────────────────────────

type OlyTextStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
  fontFamily: string;
};

export const olyTypography: Record<string, OlyTextStyle> = {
  /** 32/40 Medium — Hero numbers: weight on bar, PR display */
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "500",
    fontFamily: olyFonts.medium,
  },
  /** 28/36 Medium — Screen titles */
  title1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "500",
    fontFamily: olyFonts.medium,
  },
  /** 24/30 Medium — Section titles, exercise names (Title Case) */
  title2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "500",
    fontFamily: olyFonts.medium,
  },
  /** 16/20 Regular — Body text, coach notes, descriptions */
  body: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "400",
    fontFamily: olyFonts.regular,
  },
  /** 14/18 Regular — Secondary text, set row data, metadata */
  bodySmall: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    fontFamily: olyFonts.regular,
  },
  /** 14/18 Medium — Section headers, field labels (ALL-CAPS) */
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
    fontFamily: olyFonts.medium,
  },
  /** 16/20 Medium — Button text (ALL-CAPS) */
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: olyFonts.medium,
  },
  /** 20/26 Medium — Set/rep numbers, stepper values, percentages */
  number: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "500",
    fontFamily: olyFonts.medium,
  },
  /** 12/16 Regular — Tab labels (ALL-CAPS), timestamps, captions */
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    fontFamily: olyFonts.regular,
  },
} as const;

// ─── 3.3 Casing Rules ───────────────────────────────────────────
/**
 * Reference only — applied per-instance, not baked into styles.
 * ALL-CAPS: section headers, button labels, tab labels, field labels,
 *           day abbreviations, set labels.
 * Title Case: exercise names.
 * Sentence case: questions, body text, coach notes.
 */
export const olyCasing = {
  structural: "uppercase" as const,
  exerciseNames: "capitalize" as const,
  content: "none" as const,
};

// ─── 3.5 Dynamic Type Caps ───────────────────────────────────────
export const olyMaxFontScale: Record<string, number> = {
  display: 1.2,
  title1: 1.5,
  title2: 1.5,
  body: 2.0,
  bodySmall: 2.0,
  label: 1.3,
  button: 1.3,
  number: 1.2,
  caption: 1.3,
};

// ─── 3.6 Letter Spacing ─────────────────────────────────────────
export const olyLetterSpacing = {
  default: 0,
  /** ALL-CAPS text only */
  uppercase: 0.5,
} as const;
