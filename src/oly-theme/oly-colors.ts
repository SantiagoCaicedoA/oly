/**
 * Oly Design System — Colors
 * Source: Design Bible v3.0, Sections 2.1–2.3
 *
 * RULES:
 * - Never reference raw hex in components — always use semantic tokens.
 * - #004AAD is NEVER used as text color (fails contrast ~1.4:1 on dark).
 * - Opacity system replaces gray variants: full (1), muted (0.6), faint (0.3).
 */

// ─── 2.1 Raw Palette ─────────────────────────────────────────────
export const olyPalette = {
  primary: "#004AAD",
  primaryPressed: "#003A8C",
  white: "#E2E8F0",
  card: "#1A2533",
  cardElevated: "#1E2A36",
  yellow: "#FBBF24",
  green: "#B4F077",
  red: "#D24B4B",
  orange: "#F97316",
  black: "#000000",
} as const;

// ─── 2.1 Gradient Background ─────────────────────────────────────
export const olyGradient = {
  colors: ["#16222B", "#0F1A24", "#0C1620"],
  locations: [0, 0.54, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
} as const;

// ─── 2.2 Opacity System ──────────────────────────────────────────
export const olyOpacity = {
  full: 1,
  muted: 0.6,
  faint: 0.3,
  /** Used for disabled button bg */
  subtle: 0.1,
} as const;

// ─── 2.3 Semantic Tokens ─────────────────────────────────────────

export const olyColors = {
  // — Backgrounds —
  bg: {
    /** Gradient — use olyGradient with LinearGradient */
    app: "transparent",
    card: olyPalette.card,
    cardSelected: olyPalette.primary,
    cardUnselected: `rgba(0, 74, 173, ${olyOpacity.muted})`,
    brand: olyPalette.primary,
    overlay: `rgba(0, 0, 0, 0.4)`,
    /** Completed/made set row — use as LinearGradient 135deg */
    cardMade: {
      colors: [olyPalette.card, `rgba(0, 74, 173, 0.1)`],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // — Text —
  text: {
    primary: olyPalette.white,
    secondary: `rgba(226, 232, 240, ${olyOpacity.muted})`,
    disabled: `rgba(226, 232, 240, ${olyOpacity.faint})`,
    onBrand: olyPalette.white,
    success: olyPalette.green,
    error: olyPalette.red,
    warning: olyPalette.yellow,
  },

  // — Borders —
  border: {
    default: `rgba(226, 232, 240, ${olyOpacity.faint})`,
    brand: olyPalette.primary,
    brandUnselected: `rgba(0, 74, 173, ${olyOpacity.muted})`,
    error: olyPalette.red,
    focus: `rgba(0, 74, 173, 0.5)`,
  },

  // — Buttons —
  button: {
    primary: {
      bg: olyPalette.primary,
      text: olyPalette.white,
      pressed: olyPalette.primaryPressed,
    },
    secondary: {
      bg: "transparent",
      border: olyPalette.primary,
      text: olyPalette.white,
      pressed: `rgba(0, 74, 173, ${olyOpacity.faint})`,
    },
    disabled: {
      bg: `rgba(226, 232, 240, ${olyOpacity.subtle})`,
      text: `rgba(226, 232, 240, ${olyOpacity.faint})`,
    },
    destructive: {
      bg: olyPalette.red,
      text: olyPalette.white,
    },
  },

  // — Training Feedback —
  lift: {
    made: olyPalette.green,
    missed: olyPalette.red,
  },

  intensity: {
    low: olyPalette.yellow,
    mid: olyPalette.green,
    high: olyPalette.primary,
  },

  pain: {
    none: olyPalette.green,
    minor: olyPalette.yellow,
    moderate: olyPalette.orange,
    sharp: olyPalette.red,
  },
} as const;
