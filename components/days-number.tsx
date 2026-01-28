import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

type NumberOfDaysProps = {
  value: number | null;
  onChange: (selected: number) => void;
};

export default function NumberOfDays({ value, onChange }: NumberOfDaysProps) {
  const { colors } = useTheme();

  const days = [1, 2, 3, 4, 5, 6];

  const styles = StyleSheet.create({
    container: { gap: scale(6) },
    row: { flexDirection: "row", justifyContent: "space-between" },
    circle: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(25),
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.primary,
      borderWidth: 1,
      backgroundColor: colors.lightBlue,
    },
    activeCircle: { backgroundColor: colors.primary },
    text: {
      color: colors.textSecondary,
      fontWeight: Typography.fontWeight.bold,
      fontSize: Typography.fontSize.md,
      letterSpacing: Typography.letterSpacing.normal,
    },
    activeText: {
      color: colors.text,
      fontWeight: Typography.fontWeight.bold,
      fontSize: Typography.fontSize.md,
      letterSpacing: Typography.letterSpacing.normal,
    },
    training: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.training}>TRAINING DAYS PER WEEK</Text>

      <View style={styles.row}>
        {days.map((day) => {
          const isActive = value === day;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.circle, isActive && styles.activeCircle]}
              activeOpacity={0.8}
              onPress={() => onChange(day)}
            >
              <Text style={[styles.text, isActive && styles.activeText]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
