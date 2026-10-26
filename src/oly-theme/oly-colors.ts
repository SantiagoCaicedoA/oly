/**
 * Oly Design System — Colors
 * Source: the Oly design system (Claude artifact), superseding Design Bible v3.0 §2.
 *
 * RULES:
 * - Never reference raw hex in components — always use semantic tokens.
 * - primary (#107BDB) CAN be drawn. It measures 3.77:1 on level 1 and 4.51:1
 *   on the page, so it clears 3:1 as a border, an icon or a rule. It does not
 *   clear 4.5:1, so it is still not body text. White on it is 4.30:1.
 *
 *   (It used to be #004AAD at 1.60:1, which could only ever be a fill. That
 *   restriction is gone and `accent` is no longer a separate escape hatch.)
 *
 * - Ink is #EFF1F4, carrying the ground's own cool cast. 16.17:1 on the
 *   ground, 14.09:1 on a card.
 * - Red is two tokens. `red` is the destructive button fill. `redInk` is every
 *   red mark drawn on a dark surface. Never swap them.
 * - Depth is surface luminance AND hairlines. The card sits 1.15:1 above
 *   the ground, down from 1.35:1 on the old blue-grey, because dark values
 *   cannot hold a large step. Where a surface needs a visible edge, give it
 *   border.hairline rather than reaching for a lighter fill.
 *
 * - The ground is COOL GRAPHITE, hue 218 at 18% saturation. The hue matters
 *   more than the lightness: the old ground was hue 209 and the accent is
 *   hue 208, one degree apart, so the blue read as a brighter patch of the
 *   background rather than as a colour. Dropping saturation from 41% to 18%
 *   is what buys the separation back. Do not push this ground bluer.
 * - Opacity replaces gray variants: full 1, muted 0.65, faint 0.3.
 */

// ─── Raw Palette ─────────────────────────────────────────────────
export const olyPalette = {
  primary: "#107BDB",
  primaryPressed: "#0C63B0",
  white: "#EFF1F4",
  /** Solid fallback for the gradient background — use olyGradient for the real thing */
  background: "#12151A",

  /** Level 1 surface. 1.24:1 above the gradient's brightest stop. */
  card: "#1E222A",
  /** Level 2 surface. 1.21:1 above level 1. */
  cardElevated: "#2C323D",

  yellow: "#FBBF24",
  green: "#B4F077",
  /** FILL only — the destructive button. White on it is 4.69:1. */
  red: "#B53A39",
  /** Red DRAWN on a dark surface: error text, missed lifts, error borders. 5.71:1 on level 1. */
  redInk: "#F2918B",
  orange: "#F97316",
  black: "#000000",
} as const;

// ─── Gradient Background ─────────────────────────────────────────
export const olyGradient = {
  colors: ["#171B22", "#12151A", "#0E1116"],
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
    /**
     * The solid ground, for screens that do not draw the gradient.
     * `app` is transparent because most screens sit on olyGradient; a
     * full-bleed media screen wants one flat dark value behind the footage
     * instead, so the video is the only thing with any luminance on it.
     */
    page: olyPalette.background,
    card: olyPalette.card,
    cardSelected: olyPalette.primary,
    /** Active pill or card highlight, and the disc behind an active tab icon */
    activeHighlight: `rgba(16, 123, 219, ${olyOpacity.faint})`,
    /** Subtle highlight band inside a card */
    subtleHighlight: `rgba(16, 123, 219, 0.12)`,
    cardUnselected: `rgba(16, 123, 219, ${olyOpacity.muted})`,
    brand: olyPalette.primary,
    overlay: `rgba(0, 0, 0, 0.4)`,
    /** Completed/made set row — use as LinearGradient 135deg */
    cardMade: {
      colors: [olyPalette.card, `rgba(16, 123, 219, 0.1)`],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    /**
     * The disc behind an avatar with no image. Quiet by design: this is a
     * placeholder, not a brand moment, and a column of them in a comment
     * thread is the loudest thing on the screen if you let it be.
     */
    avatar: `rgba(239, 241, 244, 0.10)`,
    /**
     * Avatar discs picked by hashing a name. Categorical rather than
     * semantic — the only requirement is that they are all quiet and all
     * distinguishable. These were six shades of brand blue once; against a
     * drawable accent that made every comment compete with the post.
     */
    avatarTints: [
      `rgba(239, 241, 244, 0.10)`,
      `rgba(239, 241, 244, 0.16)`,
      `rgba(239, 241, 244, 0.13)`,
      `rgba(239, 241, 244, 0.19)`,
      `rgba(239, 241, 244, 0.08)`,
      `rgba(239, 241, 244, 0.22)`,
    ],
  },

  // — Text —
  text: {
    /** 10.6:1 on level 1, 8.7:1 on level 2, 14.3:1 on the gradient */
    primary: olyPalette.white,
    /** 5.4:1 on level 1, 4.7:1 on level 2 */
    secondary: `rgba(239, 241, 244, ${olyOpacity.muted})`,
    /** 2.33:1 — below AA by design. Never carries meaning on its own. */
    disabled: `rgba(239, 241, 244, ${olyOpacity.faint})`,
    /** Ink on a brand-blue fill. */
    onBrand: olyPalette.white,
    /**
     * Ink on a SMALL accent fill — a pill, a badge, a chip.
     *
     * Pure white, not chalk. On #107BDB chalk measures 3.83:1 and white
     * measures 4.30:1, and these labels run at 11-12px where the difference
     * decides whether they can be read. `onBrand` stays chalk because it
     * sits on large surfaces where 3.83:1 is fine.
     */
    onAccent: "#FFFFFF",
    success: olyPalette.green,
    error: olyPalette.redInk,
    warning: olyPalette.yellow,
    /** Timestamps, hints, placeholders on glass. Between secondary and disabled. */
    hint: "rgba(239, 241, 244, 0.4)",
  },

  // — Borders —
  /**
   * ACCENT — the one thing on a screen that should read as tappable.
   *
   * Now the same value as `primary`. It used to be a lighter tint (#4A90EF)
   * because primary was #004AAD at 1.60:1 and could not be drawn at all, so
   * the system needed a second blue to do the drawing. The new primary
   * measures 3.77:1 on card and 4.51:1 on the page, so one blue does both
   * jobs and there is no longer a pair to keep in sync.
   *
   * Still not body text: 3.77:1 clears 3:1 for a border, an icon or a rule,
   * and does not clear 4.5:1 for a sentence.
   */
  accent: olyPalette.primary,

  border: {
    /**
     * SEPARATOR ONLY. Between rows inside one surface, the tab bar top border,
     * and the border on interactive controls (input, stepper, segmented
     * control, selectable option). Do NOT outline a card with it: a card is
     * identified by its surface step.
     */
    default: `rgba(239, 241, 244, ${olyOpacity.faint})`,
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
    hairline: `rgba(239, 241, 244, ${olyOpacity.subtle})`,
    /** Selected and active states. */
    brand: olyPalette.primary,
    brandUnselected: `rgba(16, 123, 219, ${olyOpacity.muted})`,
    error: olyPalette.redInk,
    /** Focus rings and the focused state of an input. Same blue as accent. */
    focus: olyPalette.primary,
  },

  // — Buttons —
  button: {
    primary: {
      bg: olyPalette.primary,
      text: olyPalette.white,
      pressed: olyPalette.primaryPressed,
    },
    secondary: {
      text: olyPalette.white,
    },
    disabled: {
      bg: `rgba(239, 241, 244, ${olyOpacity.subtle})`,
      text: `rgba(239, 241, 244, ${olyOpacity.faint})`,
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

  // — Over media —
  /**
   * Ink and chrome drawn ON a photo or video, where the ground is unknown.
   * Pure white plus black scrims, not the chalk ink, because the frame can
   * be anything from a white gym wall to a black stage.
   */
  media: {
    ink: "#FFFFFF",
    /** Labels beside a big number on the frame: "KG", the lift name. */
    inkSoft: "rgba(255, 255, 255, 0.82)",
    /** Secondary text on a tile: units, dates. */
    inkMuted: "rgba(255, 255, 255, 0.75)",
    /** Unplayed part of a scrub track. */
    track: "rgba(255, 255, 255, 0.28)",
    /** Outlined pill on video (speed). */
    outline: "rgba(255, 255, 255, 0.4)",
    /** Empty selection ring on a tile. */
    ring: "rgba(255, 255, 255, 0.8)",
    /** Small dark well behind a badge or play button. */
    chip: "rgba(0, 0, 0, 0.45)",
    chipFaint: "rgba(0, 0, 0, 0.2)",
    /** Simple two-stop fade at the bottom of a thumbnail. */
    fade: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"] as readonly [string, string, ...string[]],
  },

  // — Glass —
  /**
   * The app-wide surface language: frosted panels over the soft blue Glows.
   * Every value is the ink, the primary or the page at a set opacity, so
   * nothing new enters the palette. Cards here DO carry a hairline
   * (`border`), because a 6% fill alone cannot hold an edge over the glow.
   *
   * Surfaces, light to dark: card 6%, control 8%, raised 10%, selected 14%.
   * `fill` is the blurred variant, paired with expo-blur (see <Glass>).
   */
  glass: {
    fill: ["rgba(239, 241, 244, 0.10)", "rgba(239, 241, 244, 0.03)"] as readonly [string, string, ...string[]],
    /** Cards, lists, chips, groups. Always with `border`. */
    card: "rgba(239, 241, 244, 0.06)",
    /** Secondary buttons: Cancel, Delete, a dim Post. */
    control: "rgba(239, 241, 244, 0.08)",
    /** Icon circles, steppers, toggles, meter tracks. */
    raised: "rgba(239, 241, 244, 0.10)",
    /** The active segment or tab. */
    selected: "rgba(239, 241, 244, 0.14)",
    /** Wells inside a card: inputs, bubbles, nested panels. */
    inset: "rgba(0, 0, 0, 0.22)",
    /** Inactive story segments, sheet grabbers, empty dots. */
    idle: "rgba(239, 241, 244, 0.22)",
    border: "rgba(239, 241, 244, 0.14)",
    rule: "rgba(239, 241, 244, 0.08)",
    bar: "rgba(239, 241, 244, 0.16)",
    accentFill: "rgba(16, 123, 219, 0.16)",
    accentBorder: "rgba(16, 123, 219, 0.55)",
    glow: olyPalette.primary,
    glowDeep: olyPalette.primaryPressed,
    progress: [olyPalette.primaryPressed, olyPalette.primary] as readonly [string, string, ...string[]],
    /** Hero cards: challenge, tier, ticket. Pair with `accentBorder`. */
    ticket: ["rgba(16, 123, 219, 0.22)", "rgba(239, 241, 244, 0.04)"] as readonly [string, string, ...string[]],
    ticketBorder: "rgba(16, 123, 219, 0.30)",
    /** The sticky "you" bar on Rank. Solid enough to read over any row. */
    accentBar: "rgba(20, 42, 70, 0.96)",
    drop: ["rgba(16, 123, 219, 0.28)", "rgba(18, 32, 58, 0.35)", "rgba(239, 241, 244, 0.04)"] as readonly [string, string, ...string[]],
    dropBorder: "rgba(16, 123, 219, 0.35)",
    dropTag: "rgba(16, 123, 219, 0.55)",
    dash: "rgba(239, 241, 244, 0.20)",
    /** Sheets, dialogs, menus. Solid, so nothing shows through. */
    sheet: ["#262B35", olyPalette.card] as readonly [string, string, ...string[]],
    /** Behind sheets and dialogs. */
    scrim: "rgba(0, 0, 0, 0.55)",
    /** A video before it loads. */
    media: "#1A1E25",
    /** Glass chips and bars drawn on a video. */
    onMedia: "rgba(18, 21, 26, 0.35)",
    /** Floating header: content fades out under it. */
    fadeHeader: ["rgba(18, 21, 26, 0.9)", "rgba(18, 21, 26, 0.75)", "rgba(18, 21, 26, 0)"] as readonly [string, string, ...string[]],
    fadeHeaderLocations: [0, 0.65, 1] as readonly [number, number, ...number[]],
    /** Sticky footer bar: content fades out above it. */
    fadeFooter: ["rgba(18, 21, 26, 0)", "rgba(18, 21, 26, 0.7)", "rgba(18, 21, 26, 0.85)"] as readonly [string, string, ...string[]],
    fadeFooterLocations: [0, 0.45, 1] as readonly [number, number, ...number[]],
    friend: "rgba(16, 123, 219, 0.16)",
    friendBorder: "rgba(16, 123, 219, 0.45)",
    readyFill: "rgba(16, 123, 219, 0.25)",
    photo: ["rgba(16, 123, 219, 0.10)", "rgba(239, 241, 244, 0.02)"] as readonly [string, string, ...string[]],
    photoReady: ["rgba(16, 123, 219, 0.22)", "rgba(239, 241, 244, 0.02)"] as readonly [string, string, ...string[]],
  },

  // — Charts —
  // One series, drawn in ink. Never in brand blue.
  chart: {
    ink: olyPalette.white,
    /** Top stop of the area fill; fades to transparent at the baseline */
    area: `rgba(239, 241, 244, 0.14)`,
    /** Deliberately below 3:1 — a gridline carries no information */
    grid: `rgba(239, 241, 244, 0.07)`,
    track: olyPalette.cardElevated,
    /** The ideal/target band inside a meter */
    band: `rgba(16, 123, 219, ${olyOpacity.faint})`,
  },
} as const;

// ─── Medal facets (meet picker) ──────────────────────────────────
// Bevel facets lit from the top-left.
export const olyMedal = {
  graphite: { light: "#6E7681", mid: "#5A616B", deep: "#454B54" },
} as const;

// ─── Badge metal ─────────────────────────────────────────────────
/**
 * The season badge's facets: two light (L) and two dark (D) blues, plus the
 * grey set a lift sent back for review wears. Shared by the profile badges
 * and the notification badges so they can never drift apart.
 */
export const olyBadge = {
  L1: "#7FBAF2",
  L2: "#3D95E3",
  D1: "#0F6FC4",
  D2: "#0A4E8C",
  greyL1: "#8A93A3",
  greyL2: "#5E6675",
  greyD1: "#454C58",
  greyD2: "#343A44",
} as const;

// ─── Oly coin ────────────────────────────────────────────────────
/** The olys coin: the badge blues on the rim, a lit metallic face. */
export const olyCoin = {
  rim: ["#9CCBF6", olyBadge.L2, olyBadge.D1, olyBadge.D2] as readonly [string, string, string, string],
  face: ["#4A9BEA", "#1B6FC6", "#0C4F98", "#083A72"] as readonly [string, string, string, string],
} as const;

/** A soft red ring for destructive icons on glass. Drawn, never filled. */
export const olyDestructiveRing = "rgba(242, 145, 139, 0.35)";
