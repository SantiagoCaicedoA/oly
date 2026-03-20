/**
 * OlyProgressDots — Onboarding pagination dots
 * Source: Design Bible v3.0, Section 8.1 Progress Dots
 *
 * Dot size: 8px, Gap: 8px
 * Active: oly-primary, Inactive: oly-text/disabled
 *
 * Figma: oly/progress-dots
 */

import React from "react";
import { StyleSheet, View } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";

// ─── Types ───────────────────────────────────────────────────────
interface OlyProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyProgressDots: React.FC<OlyProgressDotsProps> = ({
  totalSteps,
  currentStep,
}) => {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === currentStep
                  ? olyPalette.primary
                  : olyColors.text.disabled,
            },
          ]}
        />
      ))}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
  },
});

export default OlyProgressDots;
