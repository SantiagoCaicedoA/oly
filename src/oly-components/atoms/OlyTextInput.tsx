/**
 * OlyTextInput — Text input atom component
 * Source: Design Bible v3.0, Section 8.1 Text Input
 *
 * States: default, focused, error, disabled
 *
 * Figma: oly/input/text/default
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlyTextInputProps extends Omit<TextInputProps, "style"> {
  /** Error message — shows below input when present */
  error?: string;
  /** Disables the input */
  disabled?: boolean;
  /** Optional container style override */
  containerStyle?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyTextInput: React.FC<OlyTextInputProps> = ({
  error,
  disabled = false,
  containerStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return olyColors.border.error;
    if (isFocused) return olyColors.border.brand;
    return olyColors.border.default;
  };

  return (
    <View style={containerStyle}>
      <TextInput
        {...textInputProps}
        editable={!disabled}
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
        style={[
          styles.input,
          { borderColor: getBorderColor() },
          disabled && styles.inputDisabled,
        ]}
        placeholderTextColor={olyColors.text.secondary}
        selectionColor={olyColors.border.brand}
        maxFontSizeMultiplier={olyMaxFontScale.body}
        accessibilityState={{ disabled }}
      />
      {error ? (
        <Text
          style={styles.errorText}
          maxFontSizeMultiplier={olyMaxFontScale.caption}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  input: {
    minHeight: olyLayout.minTouchTarget,
    backgroundColor: olyElevation.level2.backgroundColor,
    borderWidth: 1,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[12],
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  inputDisabled: {
    color: olyColors.text.disabled,
    opacity: 0.6,
  },
  errorText: {
    ...olyTypography.caption,
    color: olyColors.text.error,
    marginTop: olySpacing[4],
  },
});

export default OlyTextInput;
