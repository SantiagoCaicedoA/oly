/**
 * OlyButton — Primary atom component
 * Source: Design Bible v3.0, Section 8.1 Button
 *
 * Variants: primary, secondary, destructive
 * Sizes: large (50px), medium (44px)
 * States: default, pressed, disabled, loading
 *
 * Figma: oly/button/primary/large-default
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────────
type OlyButtonVariant = "primary" | "secondary" | "destructive";
type OlyButtonSize = "large" | "medium";

interface OlyButtonProps {
  /** Button label — ALL-CAPS by default, use preserveCase to keep as-is */
  label: string;
  onPress: () => void;
  variant?: OlyButtonVariant;
  size?: OlyButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Full width stretches to fill container */
  fullWidth?: boolean;
  /** When true, label is rendered as-is without toUpperCase() */
  preserveCase?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────
export const OlyButton: React.FC<OlyButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "large",
  disabled = false,
  loading = false,
  fullWidth = false,
  preserveCase = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const displayLabel = preserveCase ? label : label.toUpperCase();

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !isDisabled && pressedStyles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary"
              ? olyColors.text.primary
              : olyColors.button[variant]?.text ?? olyColors.text.primary
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            !preserveCase && { letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase" },
            isDisabled && styles.disabledText,
            variant === "secondary" && !isDisabled && styles.secondaryText,
          ]}
          maxFontSizeMultiplier={1.3}
        >
          {displayLabel}
        </Text>
      )}
    </Pressable>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: olyLayout.minTouchTarget,
    minHeight: olyLayout.minTouchTarget,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    ...olyTypography.button,
    color: olyColors.text.primary,
  },
  disabled: {
    backgroundColor: olyColors.button.disabled.bg,
  },
  disabledText: {
    color: olyColors.button.disabled.text,
  },
  secondaryText: {
    color: olyColors.button.secondary.text,
  },
});

const sizeStyles: Record<OlyButtonSize, ViewStyle> = {
  large: {
    height: 52,
    paddingHorizontal: olySpacing[24],
  },
  medium: {
    height: 44,
    paddingHorizontal: olySpacing[20],
  },
};

const variantStyles: Record<OlyButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: olyColors.button.primary.bg,
  },
  secondary: {
    backgroundColor: olyColors.button.secondary.bg,
    borderWidth: 1,
    borderColor: olyColors.button.secondary.border,
  },
  destructive: {
    backgroundColor: olyColors.button.destructive.bg,
  },
};

const pressedStyles: Record<OlyButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: olyColors.button.primary.pressed,
  },
  secondary: {
    backgroundColor: olyColors.button.secondary.pressed,
  },
  destructive: {
    backgroundColor: olyColors.button.destructive.bg,
    opacity: 0.8,
  },
};

export default OlyButton;
