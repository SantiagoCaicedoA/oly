/**
 * DOB Picker Prototype — WHOOP-inspired
 *
 * Standalone screen to iterate on the birthday picker UX.
 * Run via deep link or swap into the onboarding flow temporarily.
 *
 * Design principles:
 * - Zero errors possible — constrained inputs only
 * - Minimal, premium feel — no clutter
 * - Dark, immersive bottom sheet with haptic-like selection
 * - Smart cascading: month → day auto-adjusts
 */

import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette, olyGradient } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ── Data ──────────────────────────────────────────────── */

const MONTHS = [
  { value: "1", short: "Jan", long: "January", num: "01" },
  { value: "2", short: "Feb", long: "February", num: "02" },
  { value: "3", short: "Mar", long: "March", num: "03" },
  { value: "4", short: "Apr", long: "April", num: "04" },
  { value: "5", short: "May", long: "May", num: "05" },
  { value: "6", short: "Jun", long: "June", num: "06" },
  { value: "7", short: "Jul", long: "July", num: "07" },
  { value: "8", short: "Aug", long: "August", num: "08" },
  { value: "9", short: "Sep", long: "September", num: "09" },
  { value: "10", short: "Oct", long: "October", num: "10" },
  { value: "11", short: "Nov", long: "November", num: "11" },
  { value: "12", short: "Dec", long: "December", num: "12" },
];

const currentYear = new Date().getFullYear();
const MIN_AGE = 10;
const MAX_AGE = 110;
const YEARS = Array.from(
  { length: MAX_AGE - MIN_AGE + 1 },
  (_, i) => String(currentYear - MIN_AGE - i)
);

function getDaysInMonth(month: string, year: string): number {
  if (!month) return 31;
  const m = parseInt(month, 10);
  const y = year ? parseInt(year, 10) : 2000;
  return new Date(y, m, 0).getDate();
}

function getMonthShort(value: string): string {
  return MONTHS.find((m) => m.value === value)?.short ?? "";
}

/* ── Component ─────────────────────────────────────────── */

export default function DobPrototype() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [activeField, setActiveField] = useState<"day" | "month" | "year" | null>(null);

  const validDays = useMemo(() => {
    const max = getDaysInMonth(month, year);
    // If current day exceeds max, clear it
    if (day && parseInt(day, 10) > max) {
      setDay("");
    }
    return Array.from({ length: max }, (_, i) => String(i + 1));
  }, [month, year]);

  const modalData = useMemo(() => {
    if (activeField === "month") {
      return MONTHS.map((m) => ({
        value: m.value,
        label: m.long,
        detail: m.num,
      }));
    }
    if (activeField === "year") {
      return YEARS.map((y) => {
        const age = currentYear - parseInt(y, 10);
        return { value: y, label: y, detail: `${age} yrs` };
      });
    }
    if (activeField === "day") {
      return validDays.map((d) => ({
        value: d,
        label: d,
        detail: undefined as string | undefined,
      }));
    }
    return [];
  }, [activeField, validDays]);

  const modalTitle = activeField === "month" ? "Month" : activeField === "year" ? "Year" : "Day";

  const currentValue = activeField === "day" ? day : activeField === "month" ? month : year;

  const handleSelect = useCallback(
    (value: string) => {
      if (activeField === "day") setDay(value);
      else if (activeField === "month") setMonth(value);
      else if (activeField === "year") setYear(value);
      setActiveField(null);
    },
    [activeField]
  );

  const isComplete = day && month && year;

  // Build display string
  const displayDate = isComplete
    ? `${getMonthShort(month)} ${day}, ${year}`
    : null;

  return (
    <LinearGradient
      colors={olyGradient.colors as any}
      locations={olyGradient.locations as any}
      start={olyGradient.start}
      end={olyGradient.end}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Date of birth</Text>
          <Text style={styles.subtitle}>
            Used to personalize your training program
          </Text>
        </View>

        {/* Picker Fields */}
        <View style={styles.fieldRow}>
          {/* Month — wider, shows text */}
          <Pressable
            onPress={() => setActiveField("month")}
            style={({ pressed }) => [
              styles.field,
              styles.fieldMonth,
              month ? styles.fieldFilled : null,
              pressed && styles.fieldPressed,
            ]}
          >
            <Text style={[styles.fieldLabel, !month && styles.fieldLabelEmpty]}>
              {month ? getMonthShort(month) : "MMM"}
            </Text>
          </Pressable>

          {/* Day */}
          <Pressable
            onPress={() => setActiveField("day")}
            style={({ pressed }) => [
              styles.field,
              styles.fieldDay,
              day ? styles.fieldFilled : null,
              pressed && styles.fieldPressed,
            ]}
          >
            <Text style={[styles.fieldLabel, !day && styles.fieldLabelEmpty]}>
              {day || "DD"}
            </Text>
          </Pressable>

          {/* Year */}
          <Pressable
            onPress={() => setActiveField("year")}
            style={({ pressed }) => [
              styles.field,
              styles.fieldYear,
              year ? styles.fieldFilled : null,
              pressed && styles.fieldPressed,
            ]}
          >
            <Text style={[styles.fieldLabel, !year && styles.fieldLabelEmpty]}>
              {year || "YYYY"}
            </Text>
          </Pressable>
        </View>

        {/* Summary */}
        {isComplete && (
          <View style={styles.summaryRow}>
            <Ionicons name="checkmark-circle" size={18} color={olyPalette.green} />
            <Text style={styles.summaryText}>{displayDate}</Text>
          </View>
        )}

        {/* Bottom Sheet Modal */}
        <Modal
          visible={activeField !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActiveField(null)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setActiveField(null)}
          >
            <Pressable style={styles.sheet} onPress={() => {}}>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{modalTitle}</Text>
                <Pressable
                  onPress={() => setActiveField(null)}
                  hitSlop={12}
                >
                  <View style={styles.closeButton}>
                    <Ionicons name="close" size={18} color={olyColors.text.secondary} />
                  </View>
                </Pressable>
              </View>

              {/* List */}
              <FlatList
                data={modalData}
                keyExtractor={(item) => item.value}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialScrollIndex={
                  currentValue
                    ? Math.max(0, modalData.findIndex((d) => d.value === currentValue) - 2)
                    : 0
                }
                getItemLayout={(_, index) => ({
                  length: 52,
                  offset: 52 * index,
                  index,
                })}
                renderItem={({ item }) => {
                  const isSelected = item.value === currentValue;
                  return (
                    <Pressable
                      onPress={() => handleSelect(item.value)}
                      style={({ pressed }) => [
                        styles.listItem,
                        isSelected && styles.listItemSelected,
                        pressed && !isSelected && styles.listItemPressed,
                      ]}
                    >
                      <View style={styles.listItemLeft}>
                        <Text
                          style={[
                            styles.listItemText,
                            isSelected && styles.listItemTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.detail && (
                          <Text
                            style={[
                              styles.listItemDetail,
                              isSelected && styles.listItemDetailSelected,
                            ]}
                          >
                            {item.detail}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={olyPalette.primary}
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: olySpacing[16],
  },

  // Title
  titleBlock: {
    marginTop: olySpacing[40],
    marginBottom: olySpacing[32],
  },
  title: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
    marginBottom: olySpacing[4],
  },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },

  // Fields row
  fieldRow: {
    flexDirection: "row",
    gap: olySpacing[8],
  },
  field: {
    minHeight: 56,
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: olySpacing[12],
  },
  fieldMonth: {
    flex: 1.4,
  },
  fieldDay: {
    flex: 1,
  },
  fieldYear: {
    flex: 1.3,
  },
  fieldFilled: {
    borderColor: olyPalette.primary,
    backgroundColor: `rgba(0, 74, 173, 0.08)`,
  },
  fieldPressed: {
    opacity: 0.7,
  },
  fieldLabel: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  fieldLabelEmpty: {
    color: olyColors.text.disabled,
    fontFamily: olyFonts.regular,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    marginTop: olySpacing[16],
    paddingHorizontal: olySpacing[4],
  },
  summaryText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  // Bottom sheet
  sheet: {
    backgroundColor: olyPalette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: olySpacing[32],
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: olyColors.border.default,
    alignSelf: "center",
    marginTop: olySpacing[8],
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: olySpacing[20],
    paddingVertical: olySpacing[12],
  },
  sheetTitle: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: {
    paddingHorizontal: olySpacing[12],
    paddingBottom: olySpacing[20],
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.lg,
    marginBottom: 2,
  },
  listItemSelected: {
    backgroundColor: `rgba(0, 74, 173, 0.12)`,
  },
  listItemPressed: {
    backgroundColor: olyPalette.cardElevated,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
  },
  listItemText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  listItemTextSelected: {
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
  },
  listItemDetail: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
  },
  listItemDetailSelected: {
    color: olyColors.text.secondary,
  },
});
