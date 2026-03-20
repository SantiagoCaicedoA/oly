/**
 * OlyIntensityBar — Exercise card intensity indicator
 * Source: Design Bible v3.0, Section 8.1 Intensity Bar
 *
 * Width: 4px, Height: full card height
 * Position: Left edge of exercise card
 * Colors: low (yellow), mid (green), high (blue)
 *
 * Figma: oly/intensity-bar/mid
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";

// ─── Types ───────────────────────────────────────────────────────
type IntensityLevel = "low" | "mid" | "high";

interface OlyIntensityBarProps {
  level: IntensityLevel;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyIntensityBar: React.FC<OlyIntensityBarProps> = ({
  level,
  style,
}) => {
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: olyColors.intensity[level] },
        style,
      ]}
      accessibilityLabel={`${level} intensity`}
    />
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bar: {
    width: 4,
    borderTopLeftRadius: olyRadius.lg,
    borderBottomLeftRadius: olyRadius.lg,
  },
});

export default OlyIntensityBar;
