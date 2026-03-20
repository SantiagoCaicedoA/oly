/**
 * Oly Design System — Border Radius
 * Source: Design Bible v3.0, Section 5
 *
 * RULES:
 * - Cards are always lg (12px). Non-negotiable.
 * - Buttons are always full (9999px). Non-negotiable.
 * - Elements inside cards use sm (4px) — nested radius principle.
 * - Full-width elements touching screen edges get no radius.
 */

export const olyRadius = {
  /** Inner-card elements: inputs, badges, tags, nested containers */
  sm: 4,
  /** Cards, modals, sheets, bottom sheets */
  lg: 12,
  /** Buttons, pills, avatars, toggles, segmented controls */
  full: 9999,
} as const;
