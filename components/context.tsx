import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function Context() {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: scale(12),
      borderWidth: 0.3,
      borderColor: colors.text,
      paddingHorizontal: scale(12),
      paddingVertical: scale(15),
    },
    icon: {
      width: scale(18),
      height: scale(18),
    },
    row: {
      flexDirection: "row",
      gap: scale(7),
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detail: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    value: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    secondValue: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.row}>
          <Image source={Images.contexticon} style={styles.icon} />
          <Text style={styles.detail}>CONTEXT</Text>
        </View>
        <View style={{ gap: scale(3) }}>
          <Text style={styles.secondValue}>Set 5 of 5</Text>
          <Text style={styles.value}>TOP SET</Text>
        </View>
      </View>
    </View>
  );
}
