/**
 * OlyTextInput — Text input atom component
 * Source: Design Bible v3.0, Section 8.1 Text Input
 *
 * States: default, focused, error, disabled
 * Supports password visibility toggle when secureTextEntry is true.
 */

import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyMaxFontScale } from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

interface OlyTextInputProps extends Omit<TextInputProps, "style"> {
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

const EYE_BUTTON_WIDTH = 48;

export const OlyTextInput: React.FC<OlyTextInputProps> = ({
  error,
  disabled = false,
  containerStyle,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPasswordField = secureTextEntry === true;
  const shouldHideText = isPasswordField && !passwordVisible;

  const getBorderColor = () => {
    if (error) return olyColors.border.error;
    if (isFocused) return olyColors.border.brand;
    return olyColors.border.default;
  };

  return (
    <View style={containerStyle}>
      <View style={[
        styles.inputWrapper,
        { borderColor: getBorderColor() },
        disabled && styles.inputDisabled,
      ]}>
        <TextInput
          {...textInputProps}
          secureTextEntry={shouldHideText}
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
            isPasswordField && { paddingRight: EYE_BUTTON_WIDTH },
          ]}
          placeholderTextColor={olyColors.text.disabled}
          selectionColor={olyColors.border.brand}
          maxFontSizeMultiplier={olyMaxFontScale.body}
          accessibilityState={{ disabled }}
        />
        {isPasswordField && (
          <Pressable
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
            hitSlop={8}
          >
            <Ionicons
              name={passwordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={olyColors.text.secondary}
            />
          </Pressable>
        )}
      </View>
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

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    backgroundColor: olyElevation.level2.backgroundColor,
    borderWidth: 1,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: olySpacing[16],
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  eyeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: EYE_BUTTON_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...olyTypography.caption,
    color: olyColors.text.error,
    marginTop: olySpacing[4],
  },
});

export default OlyTextInput;
