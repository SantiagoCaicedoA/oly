/**
 * OlySelectionChip — Selection chip atom
 * Source: Design Bible v3.0, Section 8.1 Selection Chip
 *
 * States: selected, unselected
 * Used for: multi-select grids (equipment, preferences, affected areas)
 *
 * Figma: oly/chip/selection/selected
 */

import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlySelectionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Use ALL-CAPS for short labels (field labels), normal for longer text */
  uppercase?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlySelectionChip: React.FC<OlySelectionChipProps> = ({
  label,
  selected,
  onPress,
  uppercase = false,
  style,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          uppercase ? styles.labelUppercase : styles.label,
          { color: olyColors.text.primary },
        ]}
        maxFontSizeMultiplier={1.3}
      >
        {uppercase ? label.toUpperCase() : label}
      </Text>
    </Pressable>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
    borderRadius: olyRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: olyColors.bg.cardSelected,
  },
  unselected: {
    backgroundColor: olyColors.bg.cardUnselected,
    borderWidth: 1,
    borderColor: olyColors.border.brand,
  },
  label: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  labelUppercase: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
});

export default OlySelectionChip;
