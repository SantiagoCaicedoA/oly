import { olyTypography } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type CustomButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function CustomButton({
  title,
  onPress,
  disabled,
  style,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.containerDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.title, disabled && styles.titleDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: olySpacing[12],
    backgroundColor: olyColors.button.primary.bg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: olyRadius.full,
  },
  containerDisabled: {
    backgroundColor: olyColors.button.disabled.bg,
  },
  title: {
    ...olyTypography.button,
    color: olyColors.button.primary.text,
  },
  titleDisabled: {
    color: olyColors.button.disabled.text,
  },
});
