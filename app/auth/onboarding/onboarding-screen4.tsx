/**
 * Onboarding Screen 4 — Availability (Redesigned v2)
 *
 * Collects training days per week, session duration,
 * and preferred rest days.
 *
 * Abdul's data flow is unchanged — dispatches to onboardingSlice.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import {
  olyTypography,
  olyFonts,
  olyLetterSpacing,
} from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useToast } from "@/context/toast-context";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen4Props {
  onBack?: () => void;
  onComplete?: () => void;
}

interface OnboardingScreen4Values {
  days_per_week: number;
  duration: number;
  rest_days: string[];
}

/* ── Data ──────────────────────────────────────────────── */

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

const DURATION_OPTIONS = [
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "75 min", value: 75 },
  { label: "90+ min", value: 90 },
] as const;

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen4({
  onBack,
  onComplete,
}: OnboardingScreen4Props) {
  const dispatch = useDispatch();
  const { showError } = useToast();
  const onboardingData = useSelector(selectOnboardingData);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
  } = useForm<OnboardingScreen4Values>({
    defaultValues: {
      days_per_week: onboardingData?.days_per_week ?? 1,
      duration: onboardingData?.duration ?? 45,
      rest_days: onboardingData?.rest_days ?? [],
    },
  });

  const daysPerWeek = watch("days_per_week");
  const maxRestDays = 7 - (daysPerWeek || 1);

  /* ── Back (save progress) ── */

  const handleBack = () => {
    dispatch(saveOnboardingData(getValues()));
    if (onBack) onBack();
  };

  /* ── Submit ── */

  const onSubmit = (data: OnboardingScreen4Values) => {
    dispatch(saveOnboardingData(data));
    if (onComplete) onComplete();
  };

  /* ── Render ── */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title} maxFontSizeMultiplier={1.2}>
          Availability
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
          Used to structure your weekly training
        </Text>
      </View>

      <View style={styles.formGroup}>
        {/* Training Days Per Week — numbered circles */}
        <View>
          <Text style={styles.sectionLabel}>TRAINING DAYS PER WEEK</Text>
          <Controller
            control={control}
            name="days_per_week"
            render={({ field: { onChange, value } }) => (
              <View style={styles.daysRow}>
                {DAYS_OPTIONS.map((day) => {
                  const isActive = value === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCircle,
                        isActive && styles.dayCircleActive,
                      ]}
                      onPress={() => onChange(day)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dayCircleText,
                          isActive && styles.dayCircleTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Session Duration — 2x2 pill grid, single-select */}
        <View>
          <Text style={styles.sectionLabel}>SESSION DURATION</Text>
          <Controller
            control={control}
            name="duration"
            render={({ field: { onChange, value } }) => (
              <View style={styles.durationGrid}>
                {DURATION_OPTIONS.map((option) => {
                  const isActive = value === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.durationPill,
                        isActive && styles.durationPillActive,
                      ]}
                      onPress={() => onChange(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          isActive && styles.durationTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Preferred Rest Days — day pills, multi-select */}
        <View>
          <Text style={styles.sectionLabel}>PREFERRED REST DAYS</Text>
          <Controller
            control={control}
            name="rest_days"
            render={({ field: { onChange, value } }) => (
              <View style={styles.restDaysGrid}>
                {WEEK_DAYS.map((day) => {
                  const isActive = (value || []).includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.restDayPill,
                        isActive && styles.restDayPillActive,
                      ]}
                      onPress={() => {
                        const current = value || [];
                        if (current.includes(day)) {
                          onChange(current.filter((d) => d !== day));
                        } else {
                          if (current.length >= maxRestDays) {
                            showError(
                              `Maximum ${maxRestDays} rest days for ${daysPerWeek}-day training`,
                            );
                            return;
                          }
                          onChange([...current, day]);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.restDayText,
                          isActive && styles.restDayTextActive,
                        ]}
                      >
                        {day.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <OlyButton
          label="BACK"
          variant="secondary"
          onPress={handleBack}
          fullWidth
          style={styles.halfButton}
        />
        <OlyButton
          label="NEXT"
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          fullWidth
          style={styles.halfButton}
        />
      </View>
    </ScrollView>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: olySpacing[32] },

  /* Title */
  titleBlock: { marginBottom: olySpacing[20] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* Form */
  formGroup: { gap: olySpacing[24] },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },

  /* Training days circles */
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
  },
  dayCircleText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  dayCircleTextActive: {
    color: olyPalette.white,
  },

  /* Session duration — 2x2 pill grid */
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  durationPill: {
    width: "48%",
    height: 48,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  durationPillActive: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
  },
  durationText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  durationTextActive: {
    color: olyPalette.white,
  },

  /* Rest day pills */
  restDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  restDayPill: {
    paddingHorizontal: olySpacing[16],
    height: 40,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  restDayPillActive: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
  },
  restDayText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  restDayTextActive: {
    color: olyPalette.white,
  },

  /* Bottom buttons */
  bottomButtons: {
    flexDirection: "row",
    gap: olySpacing[12],
    paddingTop: olySpacing[32],
  },
  halfButton: {
    flex: 1,
  },
});
