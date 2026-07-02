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
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen4Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
}

interface OnboardingScreen4Values {
  days_per_week: number;
  duration: number;
  rest_days: string[];
  recent_training_volume: string;
}

/* ── Data ──────────────────────────────────────────────── */

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

const DURATION_OPTIONS = [
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "75 min", value: 75 },
  { label: "90+ min", value: 90 },
] as const;

const RECENT_OPTIONS = [
  { label: "Coming back", value: "returning" },
  { label: "Lightly", value: "light" },
  { label: "Steadily", value: "steady" },
  { label: "Heavy", value: "heavy" },
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
  mode = "onboarding",
}: OnboardingScreen4Props) {
  const isSettings = mode === "settings";
  const dispatch = useDispatch();
  const onboardingData = useSelector(selectOnboardingData);
  const navigation = useNavigation();
  const getValuesRef = useRef<() => OnboardingScreen4Values>(() => ({} as OnboardingScreen4Values));

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
  } = useForm<OnboardingScreen4Values>({
    defaultValues: {
      days_per_week: onboardingData?.days_per_week ?? 1,
      duration: onboardingData?.duration ?? 45,
      rest_days: onboardingData?.rest_days ?? [],
      recent_training_volume: onboardingData?.recent_training_volume ?? "",
    },
  });

  const daysPerWeek = watch("days_per_week");
  const restDays = watch("rest_days");
  const maxRestDays = 7 - (daysPerWeek || 1);
  const allFilled = true; // rest days are optional

  /* Keep ref in sync for auto-save */
  getValuesRef.current = getValues;

  /* Auto-save on back (settings mode) */
  useEffect(() => {
    if (!isSettings) return;
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      dispatch(saveOnboardingData(getValuesRef.current()));
    });
    return unsubscribe;
  }, [navigation, isSettings, dispatch]);

  // Trim rest days when training days increase and selection exceeds new max
  useEffect(() => {
    const currentRestDays = getValues("rest_days");
    if (currentRestDays.length > maxRestDays) {
      setValue("rest_days", currentRestDays.slice(0, maxRestDays));
    }
  }, [daysPerWeek, maxRestDays, getValues, setValue]);

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
      {!isSettings && (
        <View style={styles.titleBlock}>
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            Availability
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Used to structure your weekly training
          </Text>
        </View>
      )}

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
                    <Pressable
                      key={day}
                      onPress={() => onChange(day)}
                      style={({ pressed }) => [
                        styles.dayCircle,
                        isActive && styles.dayCircleActive,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayCircleText,
                          isActive && styles.dayCircleTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
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
                    <Pressable
                      key={option.value}
                      onPress={() => onChange(option.value)}
                      style={({ pressed }) => [
                        styles.durationPill,
                        isActive && styles.durationPillActive,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          isActive && styles.durationTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Recent Training — 2x2 pill grid, single-select */}
        <View>
          <Text style={styles.sectionLabel}>RECENT TRAINING (LAST 4 WEEKS)</Text>
          <Controller
            control={control}
            name="recent_training_volume"
            render={({ field: { onChange, value } }) => (
              <View style={styles.durationGrid}>
                {RECENT_OPTIONS.map((option) => {
                  const isActive = value === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => onChange(option.value)}
                      style={({ pressed }) => [
                        styles.durationPill,
                        isActive && styles.durationPillActive,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          isActive && styles.durationTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
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
            render={({ field: { onChange, value } }) => {
              const current = value || [];
              const limitReached = current.length >= maxRestDays;
              return (
                <View style={styles.restDaysGrid}>
                  {WEEK_DAYS.map((day) => {
                    const isActive = current.includes(day);
                    const isDisabled = !isActive && limitReached;
                    return (
                      <Pressable
                        key={day}
                        onPress={() => {
                          if (isDisabled) return;
                          if (isActive) {
                            onChange(current.filter((d) => d !== day));
                          } else {
                            onChange([...current, day]);
                          }
                        }}
                        style={({ pressed }) => [
                          styles.restDayPill,
                          isActive && styles.restDayPillActive,
                          isDisabled && styles.restDayPillDisabled,
                          pressed && !isDisabled && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.restDayText,
                            isActive && styles.restDayTextActive,
                            isDisabled && styles.restDayTextDisabled,
                          ]}
                        >
                          {day.slice(0, 3)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              );
            }}
          />
        </View>
      </View>

      {/* Bottom buttons */}
      {!isSettings && (
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
            disabled={!allFilled}
            fullWidth
            style={styles.halfButton}
          />
        </View>
      )}
    </ScrollView>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

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
    width: olyLayout.inputHeight,
    height: olyLayout.inputHeight,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  dayCircleText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  dayCircleTextActive: {
    color: olyPalette.white,
  },

  /* Session duration — 2x2 pill grid */
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[12],
  },
  durationPill: {
    width: "48%",
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  durationPillActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  durationText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  durationTextActive: {
    color: olyPalette.white,
  },

  /* Rest day pills */
  restDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[12],
  },
  restDayPill: {
    paddingHorizontal: olySpacing[16],
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  restDayPillActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  restDayPillDisabled: {
    opacity: 0.3,
  },
  restDayText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  restDayTextActive: {
    color: olyPalette.white,
  },
  restDayTextDisabled: {
    color: olyColors.text.disabled,
  },

  /* Bottom buttons */
  bottomButtons: {
    flexDirection: "row",
    gap: olySpacing[12],
    paddingTop: olySpacing[40],
    marginTop: "auto" as const,
  },
  halfButton: {
    flex: 1,
  },
});
