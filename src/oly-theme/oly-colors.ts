/**
 * Oly Design System — Colors
 * Source: the Oly design system (Claude artifact), superseding Design Bible v3.0 §2.
 *
 * RULES:
 * - Never reference raw hex in components — always use semantic tokens.
 * - primary (#004AAD) is NEVER text, NEVER an icon, NEVER a border that has to
 *   be seen. It is 1.60:1 against level 1. It is a fill and a background.
 *   If blue must be DRAWN rather than filled, use border.focus (#4A90EF),
 *   the one blue light enough to clear 3:1 on every Oly surface.
 * - Red is two tokens. `red` is the destructive button fill. `redInk` is every
 *   red mark drawn on a dark surface. Never swap them.
 * - Depth is surface luminance, not borders. Cards carry no outline.
 * - Opacity replaces gray variants: full 1, muted 0.65, faint 0.3.
 */

// ─── Raw Palette ─────────────────────────────────────────────────
export const olyPalette = {
  primary: "#004AAD",
  primaryPressed: "#003A8C",
  white: "#E2E8F0",
  /** Solid fallback for the gradient background — use olyGradient for the real thing */
  background: "#0F1A24",

  /** Level 1 surface. 1.24:1 above the gradient's brightest stop. */
  card: "#243243",
  /** Level 2 surface. 1.21:1 above level 1. */
  cardElevated: "#2E3F53",

  yellow: "#FBBF24",
  green: "#B4F077",
  /** FILL only — the destructive button. White on it is 4.69:1. */
  red: "#B53A39",
  /** Red DRAWN on a dark surface: error text, missed lifts, error borders. 5.71:1 on level 1. */
  redInk: "#F2918B",
  orange: "#F97316",
  black: "#000000",

  /** The season-leader card only. */
  leader: "#12203A",
  /** The SEASON LEADER pill label. 8.9:1 on leader. */
  leaderInk: "#AFC2FF",
} as const;

// ─── Gradient Background ─────────────────────────────────────────
export const olyGradient = {
  colors: ["#16222B", "#0F1A24", "#0C1620"],
  locations: [0, 0.54, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
} as const;

// ─── Opacity System ──────────────────────────────────────────────
export const olyOpacity = {
  full: 1,
  /** Raised from 0.6: at 0.6 secondary text is 4.26:1 on level 2 and fails AA. */
  muted: 0.65,
  faint: 0.3,
  /** Disabled button fill only */
  subtle: 0.1,
} as const;

// ─── Semantic Tokens ─────────────────────────────────────────────

export const olyColors = {
  // — Backgrounds —
  bg: {
    /** Gradient — use olyGradient with LinearGradient */
    app: "transparent",
    card: olyPalette.card,
    cardSelected: olyPalette.primary,
    /** Active pill or card highlight, and the disc behind an active tab icon */
    activeHighlight: `rgba(0, 74, 173, ${olyOpacity.faint})`,
    /** Subtle highlight band inside a card */
    subtleHighlight: `rgba(0, 74, 173, 0.12)`,
    cardUnselected: `rgba(0, 74, 173, ${olyOpacity.muted})`,
    brand: olyPalette.primary,
    overlay: `rgba(0, 0, 0, 0.4)`,
    /** Completed/made set row — use as LinearGradient 135deg */
    cardMade: {
      colors: [olyPalette.card, `rgba(0, 74, 173, 0.1)`],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    /** Season-leader card fill */
    leader: olyPalette.leader,
  },

  // — Text —
  text: {
    /** 10.6:1 on level 1, 8.7:1 on level 2, 14.3:1 on the gradient */
    primary: olyPalette.white,
    /** 5.4:1 on level 1, 4.7:1 on level 2 */
    secondary: `rgba(226, 232, 240, ${olyOpacity.muted})`,
    /** 2.33:1 — below AA by design. Never carries meaning on its own. */
    disabled: `rgba(226, 232, 240, ${olyOpacity.faint})`,
    /** 6.6:1 on bg.brand. (Bible v3.0 said 8.3:1; measured, it is 6.6:1.) */
    onBrand: olyPalette.white,
    success: olyPalette.green,
    error: olyPalette.redInk,
    warning: olyPalette.yellow,
    leader: olyPalette.leaderInk,
  },

  // — Borders —
  /**
   * ACCENT — the blue you are allowed to DRAW.
   *
   * `primary` #004AAD is 1.60:1 on card. It can be filled, with ink on
   * top, and that is all. Anything drawn in it — a line, a glyph, a word —
   * cannot be seen. This is the tint that does that job instead.
   *
   * 4.05:1 on card, 5.47:1 on the page, 3.34:1 on level 2.
   *
   * Use it for the one thing at a time that should read as tappable.
   * Same value as border.focus, which is the point: a focus ring and an
   * accent are the same promise, that this is where the interaction is.
   */
  accent: "#4A90EF",

  border: {
    /**
     * SEPARATOR ONLY. Between rows inside one surface, the tab bar top border,
     * and the border on interactive controls (input, stepper, segmented
     * control, selectable option). Do NOT outline a card with it: a card is
     * identified by its surface step.
     */
    default: `rgba(226, 232, 240, ${olyOpacity.faint})`,
    /**
     * FULL-BLEED SEPARATOR ONLY. Between posts in the feed, and anywhere
     * else a rule runs the whole width of the screen.
     *
     * `default` is 0.3 and is correct for a short rule inside a card,
     * where it has card edges either side to bound it. Run edge to edge
     * it reads as a stripe, and a screen with three of them reads as a
     * table. 0.1 is enough to separate two posts and not enough to be
     * the first thing you notice.
     */
    hairline: `rgba(226, 232, 240, ${olyOpacity.subtle})`,
    /** Selected and active states. NOT focus — it is 1.60:1 and cannot be seen. */
    brand: olyPalette.primary,
    brandUnselected: `rgba(0, 74, 173, ${olyOpacity.muted})`,
    error: olyPalette.redInk,
    /** Focus rings and the focused state of an input. 4.05 / 3.34 / 5.42 across the three surfaces. */
    focus: "#4A90EF",
    /** @deprecated read olyColors.accent instead. Same value. */
    /**
     * The season-leader card's hairline. 3.35:1 on card.
     *
     * Was rgba(0, 74, 173, 0.9), which composites to #1B4398 and measures
     * 1.43:1 on card and 1.93:1 on the page. A border that carries meaning
     * needs 3:1, so it could not be seen. Solid rather than alpha, because
     * an alpha border composites differently on every surface it lands on
     * and stops being a number you can check.
     */
    leader: "#4482D5",
  },

  // — Buttons —
  button: {
    primary: {
      bg: olyPalette.primary,
      text: olyPalette.white,
      pressed: olyPalette.primaryPressed,
    },
    secondary: {
      bg: olyPalette.card,
      border: `rgba(226, 232, 240, ${olyOpacity.faint})`,
      text: olyPalette.white,
      pressed: olyPalette.cardElevated,
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

  // — Training Feedback (post-MVP, kept) —
  lift: {
    made: olyPalette.green,
    missed: olyPalette.redInk,
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
    sharp: olyPalette.redInk,
  },

  // — Charts —
  // One series, drawn in ink. Never in brand blue.
  chart: {
    ink: olyPalette.white,
    /** Top stop of the area fill; fades to transparent at the baseline */
    area: `rgba(226, 232, 240, 0.14)`,
    /** Deliberately below 3:1 — a gridline carries no information */
    grid: `rgba(226, 232, 240, 0.07)`,
    track: olyPalette.cardElevated,
    /** The ideal/target band inside a meter */
    band: `rgba(0, 74, 173, ${olyOpacity.faint})`,
  },
} as const;

// ─── Medal tiers (SeasonBadges) ──────────────────────────────────
// Six bevel facets lit from the top-left. One light facet, one dark.
export const olyMedal = {
  gold:     { light: "#EBD293", mid: "#D9B96A", deep: "#B08B3C", shadow: "#8E6F26", ink: "#F0DCA4" },
  silver:   { light: "#DFE5EE", mid: "#C2CAD6", deep: "#99A1AD", shadow: "#7A828E", ink: "#EEF2F7" },
  graphite: { light: "#6E7681", mid: "#5A616B", deep: "#454B54", shadow: "#343A42", ink: "#9BA3AF" },
} as const;
