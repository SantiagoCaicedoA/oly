/**
 * OlyFormField — Label + input + error wrapper
 * Source: Design Bible v3.0, Section 8.2 Form Field
 *
 * Label: oly-label (14px Medium, ALL-CAPS)
 * Label → input gap: 8px
 * Input → error gap: 4px
 *
 * Figma: oly/form-field/default
 */

import React from "react";
import { StyleSheet, Text, TextInputProps, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyLetterSpacing, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { OlyTextInput } from "@/src/oly-components/atoms/OlyTextInput";

// ─── Types ───────────────────────────────────────────────────────
interface OlyFormFieldProps extends Omit<TextInputProps, "style"> {
  /** Field label — rendered ALL-CAPS */
  label: string;
  /** Error message */
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyFormField: React.FC<OlyFormFieldProps> = ({
  label,
  error,
  disabled,
  containerStyle,
  ...textInputProps
}) => {
  return (
    <View style={containerStyle}>
      <Text
        style={styles.label}
        maxFontSizeMultiplier={olyMaxFontScale.label}
      >
        {label.toUpperCase()}
      </Text>
      <OlyTextInput
        {...textInputProps}
        error={error}
        disabled={disabled}
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  label: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  inputContainer: {
    marginTop: olySpacing[8],
  },
});

export default OlyFormField;
