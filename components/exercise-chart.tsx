import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function ExerciseChart() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: scale(12),
      borderRadius: scale(6),
      marginTop: scale(6),
    },
    graph: {
      width: "100%",
      height: scale(140),
    },
    intensity: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    heading: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(10),
      backgroundColor: colors.primary,
    },
    compare: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.light,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    compareContainer: {
      flexDirection: "row",
      gap: scale(5),
    },
    arrowForward: {
      width: scale(7),
      height: scale(7),
    },
    text: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    performance: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.yellow,
      letterSpacing: Typography.letterSpacing.normal,
    },
    rpe: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.green,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });
  return (
    <View>
      <Text style={styles.heading}>SNACK VS CLEAN & JERK</Text>
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.intensity}>FEELING VS PERFORMANCE</Text>
          <TouchableOpacity>
            <Image source={Images.arrowforward} style={styles.arrowForward} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: scale(12) }}>
          <View style={styles.compareContainer}>
            <View style={styles.dot}></View>
            <Text style={styles.compare}>SNATCH</Text>
          </View>
          <View style={styles.compareContainer}>
            <View style={styles.dot}></View>
            <Text style={styles.compare}>CLEAN & JERK</Text>
          </View>
        </View>

        <Image
          source={Images.chart}
          style={styles.graph}
          resizeMode="contain"
        />
        <Text style={styles.text}>
          Your <Text style={styles.performance}>best performance</Text> sessions
          correlate with <Text style={styles.rpe}>moderate RPE</Text> during
          de-load phase
        </Text>
      </View>
    </View>
  );
}
