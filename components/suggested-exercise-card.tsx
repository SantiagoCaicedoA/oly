import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function SuggestedExerciseCard() {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingHorizontal: scale(15),
      paddingVertical: scale(12),
      borderRadius: scale(15),
    },
    rowContainer: {
      flexDirection: "row",
      gap: scale(5),
      alignItems: "center",
    },
    descriptionContainer: {
      backgroundColor: colors.lightYellow,
      paddingHorizontal: scale(15),
      paddingVertical: scale(4),
      borderRadius: scale(15),
      borderColor: colors.yellow,
      borderWidth: scale(1),
    },
    descriptionText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.yellow,
      letterSpacing: Typography.letterSpacing.normal,
    },
    liftName: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.yellow,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });
  return (
    <>
      <Text>AI COACH SUGGESTION</Text>
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={styles.liftName}>Snatch</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>EXERCISE FIT</Text>
          </View>
        </View>
      </View>
    </>
  );
}
