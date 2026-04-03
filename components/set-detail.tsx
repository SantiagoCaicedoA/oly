import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/* ── Constants ──────────────────────────────────────── */

interface SetDetailProps {
  setNumber: number;
  reps: number;
  weight: number;
  rpm: number;
  onPress?: () => void;
  isComplete?: boolean;
  isMiss?: boolean;
}

export default function SetDetail({
  setNumber,
  reps,
  weight,
  rpm,
  onPress,
  isComplete = false,
  isMiss = false,
}: SetDetailProps) {
  const rowContent = (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* SET label · reps */}
      <Text style={[styles.setLabel, isMiss && styles.textMiss]}>
        SET {setNumber}
      </Text>
      <Text style={[styles.separator, isMiss && styles.textMiss]}>·</Text>
      <Text style={[styles.setReps, isMiss && styles.textMiss]}>
        {reps} reps
      </Text>

      <View style={{ flex: 1 }} />

      {/* Posted/miss dot */}
      {isComplete && !isMiss && (
        <View style={styles.postedDot} />
      )}
      {isMiss && (
        <View style={styles.missDot} />
      )}

      {/* Weight pill */}
      <Text
        style={[
          styles.weightPill,
          isComplete && !isMiss && styles.weightPillComplete,
          isMiss && styles.weightPillMiss,
        ]}
      >
        {weight} kg
      </Text>

      {/* RPM % */}
      <Text style={[styles.rpm, isMiss && styles.textMiss]}>
        {rpm}%
      </Text>

    </TouchableOpacity>
  );

  /* Completed sets get gradient wrapper */
  if (isComplete && !isMiss) {
    return (
      <LinearGradient
        colors={olyColors.bg.cardMade.colors as unknown as string[]}
        start={olyColors.bg.cardMade.start}
        end={olyColors.bg.cardMade.end}
        style={styles.cardComplete}
      >
        {rowContent}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, isMiss && styles.cardMiss]}>
      {rowContent}
    </View>
  );
}

const styles = StyleSheet.create({
  /* Card variants */
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
  },
  cardComplete: {
    borderRadius: olyRadius.lg,
  },
  cardMiss: {
    opacity: 0.5,
  },

  /* Row layout */
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: olyLayout.gymTouchTarget,
    paddingVertical: olySpacing[16],
    paddingRight: olySpacing[16],
    paddingLeft: olySpacing[12],
    gap: olySpacing[8],
  },

  /* Set label */
  setLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  separator: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
  },
  setReps: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Dots */
  postedDot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
  },
  missDot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.lift.missed,
  },

  /* Weight pill */
  weightPill: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
    overflow: "hidden",
  },
  weightPillComplete: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderColor: olyColors.border.focus,
    color: olyPalette.white,
  },
  weightPillMiss: {
    backgroundColor: "transparent",
    borderColor: olyColors.border.default,
    color: olyColors.text.disabled,
  },

  /* RPM */
  rpm: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* States */
  textMiss: {
    color: olyColors.text.disabled,
  },
});
