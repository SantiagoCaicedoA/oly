/**
 * OlyDivider — Divider line atom
 * Source: Design Bible v3.0, Section 8.1 Divider
 *
 * Height: 1px
 * Variants: full-width, inset (16px from each edge)
 *
 * Figma: oly/divider/full-width
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlyDividerProps {
  /** "full" spans edge to edge, "inset" has 16px margins */
  variant?: "full" | "inset";
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyDivider: React.FC<OlyDividerProps> = ({
  variant = "full",
  style,
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === "inset" && styles.inset,
        style,
      ]}
    />
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    height: 1,
    backgroundColor: olyColors.border.default,
  },
  inset: {
    marginHorizontal: olySpacing[16],
  },
});

export default OlyDivider;
