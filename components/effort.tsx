import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function Effort() {
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
    bar: {
      width: scale(55),
      height: scale(8),
      backgroundColor: colors.primary,
      borderRadius: scale(12),
    },
    barContainer: {
      flexDirection: "row",
      gap: scale(7),
      marginTop: scale(10),
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.row}>
          <Image source={Images.efforticon} style={styles.icon} />
          <Text style={styles.detail}>EFFORT</Text>
        </View>
        <View style={{ flexDirection: "row", gap: scale(3) }}>
          <Text style={styles.value}>Bar Speed: FAST</Text>
        </View>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.bar}></View>
        <View style={styles.bar}></View>
        <View style={styles.bar}></View>
        <View style={styles.bar}></View>
        <View style={styles.bar}></View>
      </View>
    </View>
  );
}
