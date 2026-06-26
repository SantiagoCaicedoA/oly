/**
 * Onboarding Screen 8 — Summary & Confirmation (Redesigned v2)
 *
 * Shows a scrollable summary of everything the user entered,
 * then submits to the API. Logo + greeting at top, summary cards
 * for plan & performance gaps, bottom "START TRAINING" button.
 *
 * Abdul's submission logic unchanged.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { useSubmitProfileMutation } from "@/store/api";
import { setUser } from "@/store/reducer/authSlice";
import { selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { RootState } from "@/store/store";
import { OnboardingApiPayload } from "@/types/api/onboarding";
import {
  olyTypography,
  olyFonts,
  olyLetterSpacing,
} from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { getFilteredFacts } from "./loading-facts";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Helpers ───────────────────────────────────────────── */

const MONTHS_SHORT = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TRAINING_PHASE_LABELS: Record<string, string> = {
  starting_fresh: "Starting fresh",
  in_training_block: "In a training block",
  post_competition: "Post-competition",
  deload_recovery: "Deload / Recovery",
  coming_back: "Coming back from injury",
};

const GAP_CATEGORY_LABELS: Record<string, string> = {
  pulling_positioning: "Pulling & positioning",
  receiving_bar: "Receiving",
  squat_leg_strength: "Squat & leg strength",
  overhead_stability: "Overhead stability",
};

const GAP_CATEGORY_KEYS = [
  "pulling_positioning",
  "receiving_bar",
  "squat_leg_strength",
  "overhead_stability",
] as const;

function formatCompDate(day?: string, month?: string, year?: string): string {
  if (!day || !month || !year) return "";
  const m = parseInt(month, 10);
  return `${MONTHS_SHORT[m] || month} ${day}, ${year}`;
}

function weeksUntil(day?: string, month?: string, year?: string): number | null {
  if (!day || !month || !year) return null;
  const target = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  );
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen8() {
  const allData = useSelector(selectOnboardingData);
  const [submitProfile, { isLoading }] = useSubmitProfileMutation();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  /* ── Loading screen: fun facts + progress bar ── */
  const facts = useMemo(
    () => {
      const expMap: Record<string, number> = { new: 0, developing: 1, experienced: 4, competitive: 6 };
      const expYears = allData?.weightliftingExposure ? expMap[allData.weightliftingExposure] ?? undefined : undefined;
      return getFilteredFacts(allData?.sex, expYears);
    },
    [allData?.sex, allData?.weightliftingExposure]
  );

  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const factOpacity = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Show loading screen when submission starts (stays visible until navigation)
  useEffect(() => {
    if (isLoading) setShowLoading(true);
  }, [isLoading]);

  // Rotate facts every 12 seconds with fade transition
  useEffect(() => {
    if (!showLoading || facts.length === 0) return;

    const interval = setInterval(() => {
      Animated.timing(factOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
        Animated.timing(factOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [showLoading, facts.length, factOpacity]);

  // Animate progress bar over ~60 seconds (stops at 95%)
  useEffect(() => {
    if (!showLoading) {
      progressWidth.setValue(0);
      return;
    }

    Animated.timing(progressWidth, {
      toValue: 0.95,
      duration: 55000,
      useNativeDriver: false,
    }).start();
  }, [showLoading, progressWidth]);

  /* ── Derived display values ── */
  const firstName = useMemo(() => {
    const name = allData?.name || "";
    return name.split(" ")[0] || "Athlete";
  }, [allData?.name]);

  const compDate = useMemo(
    () => formatCompDate(allData?.compDay, allData?.compMonth, allData?.compYear),
    [allData?.compDay, allData?.compMonth, allData?.compYear]
  );

  const weeksOut = useMemo(
    () => weeksUntil(allData?.compDay, allData?.compMonth, allData?.compYear),
    [allData?.compDay, allData?.compMonth, allData?.compYear]
  );

  const isCompeting = allData?.preparing_for_competition === true;

  const durationLabel = useMemo(() => {
    const d = allData?.duration;
    if (!d) return "";
    return `${d} min sessions`;
  }, [allData?.duration]);

  const trainingSchedulePills = useMemo(() => {
    const pills: string[] = [];
    if (allData?.days_per_week) pills.push(`${allData.days_per_week} days/wk`);
    if (allData?.duration) pills.push(`${allData.duration} min sessions`);
    return pills;
  }, [allData?.days_per_week, allData?.duration]);

  const restDayNames = useMemo(() => {
    const days = allData?.rest_days;
    if (!Array.isArray(days) || days.length === 0) return [];
    return days;
  }, [allData?.rest_days]);

  const equipmentPills = useMemo(() => {
    const pills: string[] = ["Barbell + Bumpers"];
    const optional = allData?.optional_equipment;
    if (Array.isArray(optional)) {
      optional.forEach((e: string) => pills.push(e));
    }
    return pills;
  }, [allData?.optional_equipment]);

  const phaseLabel = useMemo(() => {
    const phase = allData?.training_phase;
    if (!phase) return "";
    return TRAINING_PHASE_LABELS[phase] || phase;
  }, [allData?.training_phase]);

  // Group selected gaps by category
  const gapsByCategory = useMemo(() => {
    const result: { label: string; gaps: string[] }[] = [];
    for (const key of GAP_CATEGORY_KEYS) {
      const selected = allData?.[key];
      if (Array.isArray(selected) && selected.length > 0) {
        result.push({
          label: GAP_CATEGORY_LABELS[key] || key,
          gaps: selected,
        });
      }
    }
    return result;
  }, [
    allData?.pulling_positioning,
    allData?.receiving_bar,
    allData?.squat_leg_strength,
    allData?.overhead_stability,
  ]);

  /* ── Submit ── */
  const onSubmit = async () => {
    try {
      // ── Compute age from DOB (Screen 1 saves dobDay/Month/Year, not age) ──
      let calculatedAge = 0;
      if (allData.dobYear && allData.dobMonth && allData.dobDay) {
        const birthDate = new Date(
          parseInt(allData.dobYear),
          parseInt(allData.dobMonth) - 1,
          parseInt(allData.dobDay)
        );
        const now = new Date();
        calculatedAge = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
      }

      // ── Map weightliftingExposure to years (Screen 1 saves exposure label, not years) ──
      const experienceMap: Record<string, number> = {
        new: 0,
        developing: 1,
        experienced: 4,
        competitive: 6,
      };
      const experienceYears = experienceMap[allData.weightliftingExposure] ?? 0;

      // ── Derive preferred unit from weightUnit (no measurement_system key exists) ──
      const preferredUnit = allData.weightUnit === "LB" ? "imperial" : "metric";

      // ── Map lift values from Screen 2's categorized arrays ──
      const lv = allData.liftValues ?? { classic: [0, 0], variation: [0, 0, 0], squat: [0, 0, 0], press: [0, 0, 0] };
      const ol = allData.olympic_lifts ?? [false, false];
      const vars = allData.variations ?? [false, false, false];
      const squats = allData.squats ?? [false, false, false];
      const presses = allData.press ?? [false, false, false];

      // ── Build competition object from Screen 6 ──
      const competition = allData.preparing_for_competition
        ? {
            preparing: true,
            name: allData.competition_name ?? "",
            date: allData.compYear && allData.compMonth && allData.compDay
              ? `${allData.compYear}-${allData.compMonth.padStart(2, "0")}-${allData.compDay.padStart(2, "0")}`
              : undefined,
            weight_class: allData.weight_class ?? undefined,
            target_total: allData.target_total ? parseFloat(allData.target_total) : undefined,
          }
        : { preparing: false };

      const apiPayload: OnboardingApiPayload = {
        display_name: allData.name,
        country: allData.country,
        age: calculatedAge,
        user_name: allData.user_name,
        sex: allData.sex,
        experience_years: experienceYears,
        height_cm: parseFloat(allData.height),
        bodyweight_value: parseFloat(allData.weight),
        bodyweight_unit: allData.weightUnit,
        preferred_unit: preferredUnit,
        strength_stats: {
          snatch: {
            value: lv.classic[0] ?? 0,
            checked: ol[0] ?? false,
          },
          power_snatch: {
            value: lv.variation[0] ?? 0,
            checked: vars[0] ?? false,
          },
          clean_jerk: {
            value: lv.classic[1] ?? 0,
            checked: ol[1] ?? false,
          },
          clean: {
            value: lv.variation[1] ?? 0,
            checked: vars[1] ?? false,
          },
          power_clean: {
            value: lv.variation[2] ?? 0,
            checked: vars[2] ?? false,
          },
          jerk: {
            value: lv.press[2] ?? 0,
            checked: presses[2] ?? false,
          },
          back_squat: {
            value: lv.squat[0] ?? 0,
            checked: squats[0] ?? false,
          },
          front_squat: {
            value: lv.squat[1] ?? 0,
            checked: squats[1] ?? false,
          },
        },
        strength_accuracy: allData.accuracy ?? "",
        considerations: {
          has_limitations: allData.limitation ?? false,
          affected_areas: allData.affected_area ?? [],
          impact_level: allData.impact ?? "",
          triggers: allData.when_to_show ?? [],
        },
        availability: {
          training_days_per_week: allData.days_per_week,
          session_duration: allData.duration,
          preferred_rest_days: allData.rest_days ?? [],
        },
        equipment: {
          optional: allData.optional_equipment ?? [],
        },
        training_preference: allData.training_preferences ?? "",
        performance_gaps: allData.performance_gaps ?? [],
        training_phase: allData.training_phase ?? "",
        competition,
      };

      const result = await submitProfile(apiPayload).unwrap();
      dispatch(setUser(result.data));

      // Fill progress bar to 100%, then navigate
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 600);
      });
    } catch (error: any) {
      console.error("Submit Profile Error:", error);

      let errorMessage = "Failed to create profile. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (error?.status === 422) {
        errorMessage = "Invalid data. Please check your inputs.";
      } else if (error?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      }

      setShowLoading(false);
      progressWidth.setValue(0);
      Alert.alert("Error", errorMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "Retry", onPress: onSubmit },
      ]);
    }
  };

  /* ── Loading state ── */
  if (showLoading) {
    return (
      <OlyScreenWrapper>
        <View style={styles.loadingContainer}>
          {/* Logo */}
          <Image
            source={require("@/assets/images/oly-logo.webp")}
            style={styles.loadingLogo}
            resizeMode="contain"
          />

          {/* Status message */}
          <Text style={styles.loadingStatus}>Setting up your training...</Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          {/* Fun fact */}
          <View style={styles.factContainer}>
            <Text style={styles.factLabel}>DID YOU KNOW?</Text>
            <Animated.Text
              style={[styles.factText, { opacity: factOpacity }]}
            >
              {facts[currentFactIndex] || ""}
            </Animated.Text>
          </View>
        </View>
      </OlyScreenWrapper>
    );
  }

  /* ── Render ── */
  return (
    <OlyScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo + Greeting ── */}
        <View style={styles.heroBlock}>
          <Image
            source={require("@/assets/images/oly-logo.webp")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle} maxFontSizeMultiplier={1.2}>
            {firstName}, you're all set
          </Text>
          <Text style={styles.heroSubtitle} maxFontSizeMultiplier={1.5}>
            Here's a summary of your training profile.{"\n"}You can update any of this in settings.
          </Text>
        </View>

        {/* ── Competition countdown (conditional) ── */}
        {isCompeting && allData?.competition_name ? (
          <View style={styles.compCard}>
            <View style={styles.compCardLeft}>
              <Text style={styles.compName} numberOfLines={1}>
                {allData.competition_name}
              </Text>
              {compDate ? (
                <Text style={styles.compDate}>{compDate}</Text>
              ) : null}
            </View>
            {weeksOut != null && (
              <View style={styles.compCardRight}>
                <Text style={styles.weeksNumber}>{weeksOut}</Text>
                <Text style={styles.weeksLabel}>weeks out</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* ── YOUR PLAN — Apple Health-style rows ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>YOUR PLAN</Text>

          {/* Training schedule */}
          {allData?.days_per_week && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Training</Text>
              <Text style={styles.dataValue}>
                {allData.days_per_week} days/wk · {allData.duration} min
              </Text>
            </View>
          )}

          {/* Rest days */}
          {restDayNames.length > 0 && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Rest days</Text>
              <Text style={styles.dataValue}>
                {restDayNames.join(", ")}
              </Text>
            </View>
          )}

          {/* Starting point */}
          {phaseLabel ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Starting point</Text>
              <Text style={styles.dataValue}>{phaseLabel}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Equipment pills ── */}
        {equipmentPills.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>EQUIPMENT</Text>
            <View style={styles.pillRow}>
              {equipmentPills.map((item) => (
                <View key={item} style={styles.infoPill}>
                  <Text style={styles.infoPillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── FOCUS AREAS — grouped pills ── */}
        {gapsByCategory.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>FOCUS AREAS</Text>
            {gapsByCategory.map((cat, idx) => (
              <View key={cat.label}>
                <Text style={styles.gapCategoryLabel}>{cat.label}</Text>
                <View style={styles.pillRow}>
                  {cat.gaps.map((gap) => (
                    <View key={gap} style={styles.infoPill}>
                      <Text style={styles.infoPillText}>{gap}</Text>
                    </View>
                  ))}
                </View>
                {idx < gapsByCategory.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Bottom buttons ── */}
        <View style={styles.bottomButtons}>
          <OlyButton
            label="BACK"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <OlyButton
            label="START TRAINING"
            variant="primary"
            onPress={onSubmit}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.startButton}
          />
        </View>
      </ScrollView>
    </OlyScreenWrapper>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: olySpacing[24],
  },
  loadingLogo: {
    width: 72,
    height: 72,
    marginBottom: olySpacing[24],
  },
  loadingStatus: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    textAlign: "center",
    marginBottom: olySpacing[20],
  },
  progressBarTrack: {
    width: "100%",
    height: 3,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    overflow: "hidden",
    marginBottom: olySpacing[40],
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
  },
  factContainer: {
    alignItems: "center",
    paddingHorizontal: olySpacing[8],
  },
  factLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },
  factText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },

  /* Hero */
  heroBlock: {
    alignItems: "center",
    paddingTop: olySpacing[24],
    marginBottom: olySpacing[24],
  },
  logo: {
    width: olyLayout.gymTouchTarget,
    height: olyLayout.gymTouchTarget,
    marginBottom: olySpacing[16],
  },
  heroTitle: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
    textAlign: "center",
  },
  heroSubtitle: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginTop: olySpacing[4],
  },

  /* Competition card */
  compCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
    marginBottom: olySpacing[24],
  },
  compCardLeft: {
    flex: 1,
  },
  compName: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  compDate: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  compCardRight: {
    alignItems: "center",
    marginLeft: olySpacing[16],
  },
  weeksNumber: {
    ...olyTypography.display,
    color: olyColors.text.primary,
  },
  weeksLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    textAlign: "center",
  },

  /* Sections */
  sectionBlock: {
    marginTop: olySpacing[24],
    gap: olySpacing[8],
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },

  /* Data rows — Apple Health style: label left, value right */
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: olySpacing[12],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: olyColors.border.default,
  },
  dataLabel: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  dataValue: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    textAlign: "right",
    flexShrink: 1,
  },

  /* Pill rows — for equipment & focus areas */
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  infoPill: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  infoPillText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.primary,
  },

  /* Focus area category labels */
  gapCategoryLabel: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    marginBottom: olySpacing[8],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: olyColors.border.default,
    marginVertical: olySpacing[12],
  },

  /* Bottom buttons */
  bottomButtons: {
    flexDirection: "row",
    gap: olySpacing[12],
    paddingTop: olySpacing[40],
    marginTop: "auto" as const,
  },
  backButton: {
    flex: 0,
    paddingHorizontal: olySpacing[24],
  },
  startButton: {
    flex: 1,
  },
});
