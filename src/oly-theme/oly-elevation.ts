/**
 * Oly Design System — Elevation
 * Source: Design Bible v3.0, Section 6
 *
 * RULES:
 * - No shadows. Ever. They're invisible on dark surfaces.
 * - Depth = surface color + border. That's the only system.
 * - Card on background → Level 1. Card on card → Level 2. Max 2 levels.
 * - Tab bar uses Level 1 + 1px top border.
 */

import { olyPalette } from "./oly-colors";

// ─── 6.1 Elevation Levels ────────────────────────────────────────

export const olyElevation = {
  /** Level 0 — Gradient background (use olyGradient with LinearGradient) */
  level0: "transparent",

  /** Level 1 — Cards, sheet surfaces, tab bar */
  level1: {
    backgroundColor: olyPalette.card,
  },

  /** Level 2 — Nested cards, popovers, dropdowns */
  level2: {
    backgroundColor: olyPalette.cardElevated,
  },
} as const;

// ─── 6.1 Overlay ─────────────────────────────────────────────────

/** Behind bottom sheets, modals */
export const olyOverlay = "rgba(0, 0, 0, 0.4)";
