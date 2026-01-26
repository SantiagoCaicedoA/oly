import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
interface HeaderProps {
  mainText: string;
  subText: string;
}
export default function Header({ mainText, subText }: HeaderProps) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    mainText: {
      color: colors.text,
      fontSize: Typography.fontSize["2xl"],
      fontFamily: Typography.fontFamily.bold,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
    },
    subText: {
      color: colors.text,
      fontSize: Typography.fontSize.lg,
      fontFamily: Typography.fontFamily.medium,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });
  return (
    <View>
      <Text style={styles.mainText}>{mainText}</Text>
      <Text style={styles.subText}>{subText}</Text>
    </View>
  );
}
