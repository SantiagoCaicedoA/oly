import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
interface AddExerciseCardProps {
  title: string;
  cards: {
    exerciseName: string;
    detailLabel: string;
  }[];
}

export default function AddExerciseCard({
  title,
  cards,
}: AddExerciseCardProps) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    suggestion: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      letterSpacing: Typography.letterSpacing.normal,
    },
    thumbnail: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(10),
      backgroundColor: "white",
    },
    descriptionContainer: {
      backgroundColor: colors.lightYellow,
      paddingHorizontal: scale(15),
      paddingVertical: scale(2),
      borderRadius: scale(15),
      borderColor: colors.yellow,
      borderWidth: scale(0.5),
      alignSelf: "flex-start",
    },
    descriptionText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.yellow,
      letterSpacing: Typography.letterSpacing.normal,
      textTransform: "uppercase",
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: scale(8),
    },

    liftName: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
    },
    checkbox: {
      width: scale(22),
      height: scale(22),
      borderRadius: scale(11),
      borderWidth: scale(0.5),
      borderColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    checked: {
      backgroundColor: colors.primary,
    },
    tick: {
      color: colors.text,
      fontSize: scale(14),
      fontWeight: "bold",
    },
    divider: {
      width: "100%",
      backgroundColor: colors.text,
      height: scale(0.5),
      marginVertical: scale(12),
    },
  });
  return (
    <View>
      <Text style={styles.suggestion}>{title}</Text>

      {cards.map((item, index) => (
        <View key={index}>
          <View style={styles.rowContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: scale(8),
                paddingHorizontal: scale(12),
              }}
            >
              <View style={styles.thumbnail} />
              <View style={{ gap: scale(5) }}>
                <Text style={styles.liftName}>{item.exerciseName}</Text>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{item.detailLabel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.checkbox} />
          </View>

          <View style={styles.divider} />
        </View>
      ))}
    </View>
  );
}
