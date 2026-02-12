import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { scale } from "react-native-size-matters";

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
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: scale(12),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: scale(15),
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}
