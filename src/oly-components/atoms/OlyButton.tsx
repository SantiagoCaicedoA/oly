/**
 * OlyButton — Primary atom component
 * Source: Design Bible v3.0, Section 8.1 Button
 *
 * Variants: primary, secondary, destructive, ghost
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

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────────
type OlyButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
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
            variant === "secondary" || variant === "ghost"
              ? olyColors.text.secondary
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
            variant === "ghost" && !isDisabled && styles.ghostText,
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
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 0,
  },
  disabledText: {
    color: olyColors.text.secondary,
  },
  secondaryText: {
    color: olyColors.button.secondary.text,
  },
  ghostText: {
    color: olyColors.text.secondary,
  },
});

const sizeStyles: Record<OlyButtonSize, ViewStyle> = {
  large: {
    height: olyLayout.inputHeight,
    paddingHorizontal: olySpacing[24],
  },
  medium: {
    height: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[20],
  },
};

const variantStyles: Record<OlyButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: olyColors.button.primary.bg,
  },
  secondary: {
    backgroundColor: olyPalette.card,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  destructive: {
    backgroundColor: olyColors.button.destructive.bg,
  },
  ghost: {
    backgroundColor: "transparent",
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
  ghost: {
    opacity: 0.6,
  },
};

export default OlyButton;
