/**
 * OlyBadge — Made/Missed indicator badge
 * Source: Design Bible v3.0, Section 8.1 Badge / Indicator
 *
 * Size: 12px circle
 * Always accompanied by text label for color independence
 *
 * Figma: oly/badge/made
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";

// ─── Types ───────────────────────────────────────────────────────
interface OlyBadgeProps {
  variant: "made" | "missed";
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyBadge: React.FC<OlyBadgeProps> = ({ variant, style }) => {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            variant === "made"
              ? olyColors.lift.made
              : olyColors.lift.missed,
        },
        style,
      ]}
      accessibilityLabel={variant === "made" ? "Made lift" : "Missed lift"}
    />
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: {
    width: 12,
    height: 12,
    borderRadius: olyRadius.full,
  },
});

export default OlyBadge;
