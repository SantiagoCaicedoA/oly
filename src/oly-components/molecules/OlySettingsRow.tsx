/**
 * OlySettingsRow — List row with icon + label + chevron
 * Source: Design Bible v3.0, Section 8.2 Settings List Row
 *
 * Height: 44px
 * Icon: oly-icon/md (24px)
 * Label: oly-body (16px Regular)
 * Chevron: right-pointing, oly-text/secondary
 *
 * Figma: oly/settings-row
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlySettingsRowProps {
  label: string;
  /** Ionicons name for left icon */
  icon?: string;
  /** Right-side value text */
  value?: string;
  onPress?: () => void;
  /** Show chevron arrow */
  showChevron?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlySettingsRow: React.FC<OlySettingsRowProps> = ({
  label,
  icon,
  value,
  onPress,
  showChevron = true,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? (
        <Ionicons
          name={icon as any}
          size={24}
          color={olyColors.text.secondary as string}
          style={styles.icon}
        />
      ) : null}

      <Text
        style={styles.label}
        maxFontSizeMultiplier={olyMaxFontScale.body}
        numberOfLines={1}
      >
        {label}
      </Text>

      {value ? (
        <Text
          style={styles.value}
          maxFontSizeMultiplier={olyMaxFontScale.bodySmall}
        >
          {value}
        </Text>
      ) : null}

      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={olyColors.text.secondary as string}
        />
      ) : null}
    </Pressable>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
  },
  icon: {
    marginRight: olySpacing[12],
  },
  label: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    flex: 1,
  },
  value: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginRight: olySpacing[8],
  },
});

export default OlySettingsRow;
