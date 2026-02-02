import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import TrainingDetail from "./training-detail";

export default function TodaysTraining() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginTop: scale(6),
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
    start: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });
  return (
    <View>
      <View style={styles.rowContainer}>
        <Text style={styles.heading}>TODAY'S TRAINING</Text>
        <Text style={styles.start}>START</Text>
      </View>

      <View style={styles.container}>
        <TrainingDetail />
      </View>
    </View>
  );
}
