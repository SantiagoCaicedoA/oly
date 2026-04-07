/**
 * Onboarding Screen 7 — Performance Gaps (Redesigned v2)
 *
 * Multi-select gaps across 4 categories. Tap to toggle.
 * Active = activeHighlight bg + primary border (same as screens 3–5).
 *
 * Abdul's data flow unchanged — dispatches to onboardingSlice.
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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen7Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
}

interface OnboardingScreen7Values {
  pulling_positioning: string[];
  receiving_bar: string[];
  squat_leg_strength: string[];
  overhead_stability: string[];
}

/* ── Data ──────────────────────────────────────────────── */

const PERFORMANCE_GAPS = {
  pulling_positioning: {
    heading: "PULLING & POSITIONING",
    items: [
      "Limited leg drive",
      "Bar drifts away",
      "Early arm bend",
      "Weak off the floor",
    ],
  },
  receiving_bar: {
    heading: "RECEIVING",
    items: [
      "Slow turnover",
      "Unstable snatch catch",
      "Unstable clean catch",
    ],
  },
  squat_leg_strength: {
    heading: "SQUAT & LEG STRENGTH",
    items: [
      "Weak front squat recovery",
      "Fade under volume",
      "Limited squat mobility",
      "Lose tension at the bottom",
    ],
  },
  overhead_stability: {
    heading: "OVERHEAD STABILITY",
    items: [
      "Limited lockout strength",
      "Jerk dip/drive issues",
      "Press-out on snatches",
      "Limited overhead mobility",
      "Inconsistent jerk footwork",
    ],
  },
} as const;

type CategoryKey = keyof typeof PERFORMANCE_GAPS;
const CATEGORY_KEYS: CategoryKey[] = [
  "pulling_positioning",
  "receiving_bar",
  "squat_leg_strength",
  "overhead_stability",
];

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen7({
  onBack,
  onComplete,
  mode = "onboarding",
}: OnboardingScreen7Props) {
  const isSettings = mode === "settings";
  const dispatch = useDispatch();
  const onboardingData = useSelector(selectOnboardingData);
  const navigation = useNavigation();
  const getValuesRef = useRef<() => OnboardingScreen7Values>(() => ({} as OnboardingScreen7Values));

  const { control, handleSubmit, getValues } =
    useForm<OnboardingScreen7Values>({
      defaultValues: {
        pulling_positioning: onboardingData?.pulling_positioning ?? [],
        receiving_bar: onboardingData?.receiving_bar ?? [],
        squat_leg_strength: onboardingData?.squat_leg_strength ?? [],
        overhead_stability: onboardingData?.overhead_stability ?? [],
      },
    });

  /* Keep ref in sync for auto-save */
  getValuesRef.current = getValues;

  /* Auto-save on back (settings mode) */
  useEffect(() => {
    if (!isSettings) return;
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      const data = getValuesRef.current();
      const performance_gaps = [
        ...data.pulling_positioning,
        ...data.receiving_bar,
        ...data.squat_leg_strength,
        ...data.overhead_stability,
      ];
      dispatch(saveOnboardingData({ ...onboardingData, ...data, performance_gaps }));
    });
    return unsubscribe;
  }, [navigation, isSettings, dispatch, onboardingData]);

  /* ── Back (save progress) ── */
  const handleBack = () => {
    const data = getValues();
    const performance_gaps = [
      ...data.pulling_positioning,
      ...data.receiving_bar,
      ...data.squat_leg_strength,
      ...data.overhead_stability,
    ];
    dispatch(
      saveOnboardingData({
        ...onboardingData,
        ...data,
        performance_gaps,
      })
    );
    if (onBack) onBack();
  };

  /* ── Submit ── */
  const onSubmit = (data: OnboardingScreen7Values) => {
    const performance_gaps = [
      ...data.pulling_positioning,
      ...data.receiving_bar,
      ...data.squat_leg_strength,
      ...data.overhead_stability,
    ];
    dispatch(
      saveOnboardingData({
        ...onboardingData,
        ...data,
        performance_gaps,
      })
    );
    if (onComplete) onComplete();
  };

  /* ── Render ── */
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        {!isSettings && (
          <View style={styles.titleBlock}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2}>
              Performance gaps
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
              Used to emphasize areas that need the most attention
            </Text>
          </View>
        )}

        {/* Categories */}
        <View style={styles.formGroup}>
          {CATEGORY_KEYS.map((key) => {
            const category = PERFORMANCE_GAPS[key];
            return (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.categoryBlock}>
                    <Text style={styles.sectionLabel}>{category.heading}</Text>
                    <View style={styles.gapList}>
                      {category.items.map((gap) => {
                        const isActive = value.includes(gap);
                        return (
                          <Pressable
                            key={gap}
                            onPress={() =>
                              onChange(
                                isActive
                                  ? value.filter((g: string) => g !== gap)
                                  : [...value, gap]
                              )
                            }
                            style={({ pressed }) => [
                              styles.gapPill,
                              isActive && styles.gapPillActive,
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.gapPillText,
                                isActive && styles.gapPillTextActive,
                              ]}
                              maxFontSizeMultiplier={1.3}
                            >
                              {gap}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
              />
            );
          })}
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
              label="FINISH"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              fullWidth
              style={styles.halfButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  /* Title — matches all other screens */
  titleBlock: { marginBottom: olySpacing[20] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* Form */
  formGroup: { gap: olySpacing[24] },
  categoryBlock: {},
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },

  /* Gap pills — horizontal wrap, tap to toggle */
  gapList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  gapPill: {
    height: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
    alignItems: "center",
    justifyContent: "center",
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
  },
  gapPillActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  gapPillText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.primary,
  },
  gapPillTextActive: {
    color: olyPalette.white,
    fontFamily: olyFonts.medium,
  },

  /* Bottom buttons — matches all other screens */
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
