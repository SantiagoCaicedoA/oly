import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Days } from "@/store/reducer/trainingSlice";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const CIRCLE_SIZE = 36;

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

  return (
    <View style={styles.container}>
      {/* Day labels row */}
      <View style={styles.row}>
        {weekDates.map((date, index) => {
          const dayKey = DAY_KEYS[date.getDay()] as keyof Days;
          const isTraining = days?.[dayKey]?.type === "training";
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCol}
              onPress={() => onDateChange(date)}
              activeOpacity={0.7}
            >
              <View style={styles.dayLabelRow}>
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelActive,
                  ]}
                >
                  {WEEK_LABELS[index]}
                </Text>
                {isTraining && (
                  <View style={[
                    styles.trainingDot,
                    isSelected && styles.trainingDotActive,
                  ]} />
                )}
              </View>

              <View
                style={[
                  styles.dateCircle,
                  isSelected && styles.dateCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.dateTextSelected,
                    isToday && !isSelected && styles.dateTextToday,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: olySpacing[4],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: {
    alignItems: "center",
    gap: olySpacing[4],
    flex: 1,
  },

  /* Day labels (MON, TUE, etc.) */
  dayLabel: {
    fontSize: 10,
    fontFamily: olyFonts.medium,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[4],
  },
  dayLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dayLabelActive: {
    color: olyColors.text.primary,
  },
  trainingDot: {
    width: 3,
    height: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.text.disabled,
    marginBottom: 2,
  },
  trainingDotActive: {
    backgroundColor: olyColors.text.primary,
  },

  /* Date circle */
  dateCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCircleSelected: {
    backgroundColor: olyPalette.primary,
    shadowColor: olyPalette.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  /* Date text */
  dateText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.disabled,
  },
  dateTextSelected: {
    color: olyPalette.white,
    fontFamily: olyFonts.semiBold,
  },
  dateTextToday: {
    color: olyColors.text.primary,
  },
});
