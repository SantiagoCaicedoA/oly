import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
type SuggestedExerciseCardProps = {
  exerciseName: string;
  fitLabel: string;
  explanation: string;
  width: number;
};

export default function SuggestedExerciseCard({
  exerciseName,
  fitLabel,
  explanation,
  width,
}: SuggestedExerciseCardProps) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      width,
      backgroundColor: colors.surface,
      paddingHorizontal: scale(15),
      paddingVertical: scale(12),
      borderRadius: scale(15),
      gap: scale(25),
      borderColor: colors.text,
      borderWidth: scale(0.2),
    },
    rowContainer: {
      flexDirection: "row",
      gap: scale(5),
      alignItems: "center",
    },
    descriptionContainer: {
      backgroundColor: colors.lightYellow,
      paddingHorizontal: scale(15),
      paddingVertical: scale(2),
      borderRadius: scale(15),
      borderColor: colors.yellow,
      borderWidth: scale(0.5),
    },
    descriptionText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.yellow,
      letterSpacing: Typography.letterSpacing.normal,
    },
    liftName: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    explanation: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    suggestion: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
      marginBottom: scale(10),
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={styles.liftName}>{exerciseName}</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{fitLabel}</Text>
        </View>
      </View>
      <Text style={styles.explanation}>{explanation}</Text>
    </View>
  );
}
