/**
 * OlyFormField — Label + input + error wrapper
 * Source: Design Bible v3.0, Section 8.2 Form Field
 *
 * Label: glass kicker (caption, ALL-CAPS, tracked 1.5)
 * Label → input gap: 8px
 * Input → error gap: 4px
 *
 * Figma: oly/form-field/default
 */

import React from "react";
import { StyleSheet, Text, TextInputProps, View, ViewStyle } from "react-native";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
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
  /** Static text displayed on the right side of the input (e.g. "kg", "lbs") */
  suffix?: string;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyFormField: React.FC<OlyFormFieldProps> = ({
  label,
  error,
  disabled,
  containerStyle,
  suffix,
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
        suffix={suffix}
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  label: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  inputContainer: {
    marginTop: olySpacing[8],
  },
});

export default OlyFormField;
