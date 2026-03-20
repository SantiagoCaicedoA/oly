/**
 * OlySetLogRow — The most critical gym component
 * Source: Design Bible v3.0, Section 8.2 Set Log Row
 *
 * Height: 56px minimum (oversized for gym use)
 * Make/miss touch target: 56x56px
 * Default state is "made" — athlete only toggles on miss
 *
 * Figma: oly/set-log-row/default
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import {
  olyTypography,
  olyLetterSpacing,
  olyMaxFontScale,
} from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyLayout } from "@/src/oly-theme/oly-spacing";
import { OlyBadge } from "@/src/oly-components/atoms/OlyBadge";

// ─── Types ───────────────────────────────────────────────────────
interface OlySetLogRowProps {
  setNumber: number;
  reps: number;
  weight: number;
  /** Unit: "kg" or "lb" */
  unit?: string;
  percentage?: number;
  /** Default: false (made). True = missed. */
  isMissed?: boolean;
  /** Is this the current active set */
  isActive?: boolean;
  onMissToggle?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlySetLogRow: React.FC<OlySetLogRowProps> = ({
  setNumber,
  reps,
  weight,
  unit = "kg",
  percentage,
  isMissed = false,
  isActive = false,
  onMissToggle,
  onPress,
  style,
}) => {
  const handleMissToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMissToggle?.();
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isActive && styles.containerActive,
        style,
      ]}
      accessibilityLabel={`Set ${setNumber}, ${reps} reps, ${weight} ${unit}, ${percentage ? `${percentage} percent, ` : ""}${isMissed ? "missed" : "made"}`}
      accessibilityRole="button"
    >
      {/* Set number */}
      <View style={styles.setColumn}>
        <Text
          style={styles.setLabel}
          maxFontSizeMultiplier={olyMaxFontScale.label}
        >
          SET {setNumber}
        </Text>
      </View>

      {/* Reps */}
      <View style={styles.dataColumn}>
        <Text
          style={styles.numberText}
          maxFontSizeMultiplier={olyMaxFontScale.number}
        >
          {reps}
        </Text>
        <Text
          style={styles.unitText}
          maxFontSizeMultiplier={olyMaxFontScale.caption}
        >
          REPS
        </Text>
      </View>

      {/* Weight */}
      <View style={styles.dataColumn}>
        <Text
          style={styles.numberText}
          maxFontSizeMultiplier={olyMaxFontScale.number}
        >
          {weight}
        </Text>
        <Text
          style={styles.unitText}
          maxFontSizeMultiplier={olyMaxFontScale.caption}
        >
          {unit.toUpperCase()}
        </Text>
      </View>

      {/* Percentage */}
      {percentage !== undefined && (
        <View style={styles.percentColumn}>
          <Text
            style={styles.percentText}
            maxFontSizeMultiplier={olyMaxFontScale.bodySmall}
          >
            {percentage}%
          </Text>
        </View>
      )}

      {/* Make/Miss toggle */}
      <Pressable
        onPress={handleMissToggle}
        style={styles.badgeContainer}
        accessibilityLabel={isMissed ? "Missed, tap to mark as made" : "Made, tap to mark as missed"}
        accessibilityRole="button"
        hitSlop={0}
      >
        <OlyBadge variant={isMissed ? "missed" : "made"} />
        <Text
          style={[
            styles.badgeLabel,
            { color: isMissed ? olyColors.text.error : olyColors.text.success },
          ]}
          maxFontSizeMultiplier={olyMaxFontScale.caption}
        >
          {isMissed ? "MISS" : "MADE"}
        </Text>
      </Pressable>
    </Pressable>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: olyLayout.gymTouchTarget,
    paddingHorizontal: olySpacing[16],
    backgroundColor: olyElevation.level1.backgroundColor,
    borderRadius: 0,
  },
  containerActive: {
    backgroundColor: olyElevation.level2.backgroundColor,
  },
  setColumn: {
    width: 52,
  },
  setLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  dataColumn: {
    flex: 1,
    alignItems: "center",
  },
  numberText: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  unitText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginTop: 2,
  },
  percentColumn: {
    width: 48,
    alignItems: "center",
  },
  percentText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  badgeContainer: {
    width: olyLayout.gymTouchTarget,
    height: olyLayout.gymTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    ...olyTypography.caption,
    letterSpacing: olyLetterSpacing.uppercase,
    marginTop: olySpacing[4],
  },
});

export default OlySetLogRow;
