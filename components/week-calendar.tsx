import { useTheme } from "@/context/theme-context";
import { Days } from "@/store/reducer/trainingSlice";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface WeekCalendarProps {
  days: Days | null;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function WeekCalendar({
  days,
  selectedDate,
  onDateChange,
}: WeekCalendarProps) {
  const { colors } = useTheme();

  const weekDayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const getThisWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getThisWeekDates();

  const formattedSelected = selectedDate
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase()
    .replace(",", " ·");

  const styles = StyleSheet.create({
    container: {
      gap: scale(10),
      paddingHorizontal: scale(8),
    },
    selectedLabel: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
      textAlign: "left",
      alignSelf: "flex-start",
    },
    row: {
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: scale(16),
    },
    dayCol: {
      alignItems: "center",
      gap: scale(6),
      flex: 1,
    },
    dayLabel: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
    },
    dateText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
    },
    dateCircle: {
      alignItems: "center",
      justifyContent: "center",
      width: scale(32),
      height: scale(32),
    },
    selectedCircle: {
      backgroundColor: colors.primary,
      borderRadius: scale(20),
      width: scale(32),
      height: scale(32),
      alignItems: "center",
      justifyContent: "center",
      gap: scale(2),
    },
    selectedDateText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
    },
    dot: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.textSecondary,
    },
    dotWhite: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.text,
    },
    dotPlaceholder: {
      width: scale(4),
      height: scale(4),
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.selectedLabel}>{formattedSelected}</Text>

      <View style={styles.row}>
        {weekDates.map((date, index) => {
          const dayKey = DAY_KEYS[date.getDay()] as keyof Days;
          const isTraining = days?.[dayKey]?.type === "training";
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCol}
              onPress={() => onDateChange(date)}
            >
              <Text style={styles.dayLabel}>{weekDayLabels[index]}</Text>
              {isSelected ? (
                <View style={styles.selectedCircle}>
                  <Text style={styles.selectedDateText}>{date.getDate()}</Text>
                  {isTraining ? (
                    <View style={styles.dotWhite} />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
                </View>
              ) : (
                <View style={styles.dateCircle}>
                  <Text style={styles.dateText}>{date.getDate()}</Text>
                  {isTraining ? (
                    <View style={styles.dot} />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
