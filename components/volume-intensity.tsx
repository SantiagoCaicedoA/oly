import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function VolumeIntensity() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: scale(18),
      borderRadius: scale(10),
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
      width: scale(150),
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
  });
  return (
    <View>
      <Text style={styles.heading}>THIS WEEK VOLUME VS INTENSITY</Text>
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.intensity}>Peaking block: High intensity</Text>
          <View style={styles.compareContainer}>
            <View style={styles.dot}></View>
            <Text style={styles.compare}>Volume</Text>
          </View>
          <View style={styles.compareContainer}>
            <View style={styles.dot}></View>
            <Text style={styles.compare}>Intensity</Text>
          </View>
        </View>

        <Image
          source={Images.graph}
          style={styles.graph}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
