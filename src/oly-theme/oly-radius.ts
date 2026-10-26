/**
 * Oly Design System — Border Radius
 * Source: Design Bible v3.0, Section 5, plus the glass scale.
 *
 * RULES:
 * - Buttons, chips, inputs and pills are always full (9999px).
 * - Glass screens use the glass scale, outside in: sheet 28, card (xl) 24,
 *   tile 20, inner 14. Each step nests inside the one above it.
 * - Older solid-surface screens still use lg (12) for cards and sm (4)
 *   inside them.
 * - Full-width elements touching screen edges get no radius.
 */

export const olyRadius = {
  /** Inner-card elements: inputs, badges, tags, nested containers */
  sm: 4,
  /** Cards, modals, sheets on the older solid-surface screens */
  lg: 12,
  /** Glass: wells and photos nested inside a card */
  inner: 14,
  /** Glass: tiles, video frames, grouped lists */
  tile: 20,
  /** Glass: cards */
  xl: 24,
  /** Glass: bottom sheets and dialogs */
  sheet: 28,
  /** Buttons, pills, avatars, toggles, segmented controls */
  full: 9999,
} as const;
