import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

type DaysNameProps = {
  value: string[];
  onChange: (selected: string[]) => void;
};

export default function DaysName({ value, onChange }: DaysNameProps) {
  const { colors } = useTheme();

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const firstRow = days.slice(0, 3);
  const secondRow = days.slice(3);

  const styles = StyleSheet.create({
    container: { gap: scale(6) },
    row: { flexDirection: "row", gap: scale(2), flexWrap: "nowrap" },
    daysContainer: {
      height: scale(35),
      paddingHorizontal: scale(10),
      borderRadius: scale(25),
      alignItems: "center",
      justifyContent: "center",
      borderColor: colors.primary,
      borderWidth: 1,
      backgroundColor: colors.lightBlue,
    },
    activeDaysContainer: { backgroundColor: colors.primary },
    text: {
      color: colors.textSecondary,
      fontWeight: Typography.fontWeight.bold,
      fontSize: Typography.fontSize.md,
      letterSpacing: Typography.letterSpacing.normal,
    },
    activeText: { color: colors.text },
    restDays: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });

  const toggleDay = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  const renderRow = (rowDays: string[]) => (
    <View style={styles.row}>
      {rowDays.map((day) => {
        const isActive = value.includes(day);
        return (
          <TouchableOpacity
            key={day}
            style={[
              styles.daysContainer,
              isActive && styles.activeDaysContainer,
            ]}
            activeOpacity={0.8}
            onPress={() => toggleDay(day)}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.restDays}>PREFERRED REST DAYS</Text>
      {renderRow(firstRow)}
      {renderRow(secondRow)}
    </View>
  );
}
