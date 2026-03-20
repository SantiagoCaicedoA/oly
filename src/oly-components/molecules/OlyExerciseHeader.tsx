/**
 * OlyExerciseHeader — Exercise name + prescription + intensity bar
 * Source: Design Bible v3.0, Section 8.2 Exercise Header
 *
 * Name: oly-title-2 (24px Medium, Title Case)
 * Prescription: oly-body-small (14px Regular) — "4 × 3 @ 80%"
 * Intensity bar: 4px left edge
 *
 * Figma: oly/exercise-header
 */

import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { OlyIntensityBar } from "@/src/oly-components/atoms/OlyIntensityBar";

// ─── Types ───────────────────────────────────────────────────────
interface OlyExerciseHeaderProps {
  /** Exercise name — rendered in Title Case */
  name: string;
  /** e.g. "4 × 3 @ 80%" */
  prescription?: string;
  /** Intensity level for the left bar */
  intensity?: "low" | "mid" | "high";
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyExerciseHeader: React.FC<OlyExerciseHeaderProps> = ({
  name,
  prescription,
  intensity = "mid",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <OlyIntensityBar level={intensity} style={styles.bar} />
      <View style={styles.textContainer}>
        <Text
          style={styles.name}
          maxFontSizeMultiplier={olyMaxFontScale.title2}
        >
          {name}
        </Text>
        {prescription ? (
          <Text
            style={styles.prescription}
            maxFontSizeMultiplier={olyMaxFontScale.bodySmall}
          >
            {prescription}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  bar: {
    marginRight: olySpacing[12],
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    gap: olySpacing[4],
  },
  name: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  prescription: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
});

export default OlyExerciseHeader;
