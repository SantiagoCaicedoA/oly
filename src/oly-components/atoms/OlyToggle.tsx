/**
 * OlyToggle — Toggle switch atom
 * Source: Design Bible v3.0, Section 8.1 Toggle Switch
 *
 * Size: 51 x 31px (iOS standard)
 * Uses iOS-native toggle behavior and animation
 *
 * Figma: oly/toggle/on
 */

import React from "react";
import { Platform, StyleSheet, Switch, View } from "react-native";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyPalette } from "@/src/oly-theme/oly-colors";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlyToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyToggle: React.FC<OlyToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}) => {
  const handleChange = (newValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      <Switch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        trackColor={{
          false: olyColors.text.secondary,
          true: olyPalette.primary,
        }}
        thumbColor={olyPalette.white}
        ios_backgroundColor={olyColors.text.secondary}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    minWidth: olyLayout.minTouchTarget,
    minHeight: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OlyToggle;
