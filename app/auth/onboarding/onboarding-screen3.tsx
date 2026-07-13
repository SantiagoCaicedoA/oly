/**
 * Onboarding Screen 3 — Training Considerations (Redesigned v2)
 *
 * Collects training limitation info: affected body areas,
 * current impact level, and context-specific triggers.
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
import { useToast } from "@/context/toast-context";
import { saveOnboardingData, selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen3Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
}

interface OnboardingScreen3Values {
  limitation: boolean;
  affected_area: string[];
  selected_affected_area: string;
  injury_status: string;
  impact: string;
  when_to_show: string[];
}

/* ── Data ──────────────────────────────────────────────── */

const BODY_AREAS = [
  "Lower back",
  "Knees",
  "Shoulders",
  "Elbows",
  "Wrists",
  "Hips",
  "Ankles",
] as const;

// Friendly labels shown to the athlete; canonical value stored for the engine.
const STATUS_OPTIONS = [
  { label: "Painful now", value: "Acute" },
  { label: "Manageable", value: "Managed" },
  { label: "Healed", value: "Healed" },
] as const;

const IMPACT_OPTIONS = ["Mild", "Moderate", "High"] as const;

const WHEN_TO_SHOW_OPTIONS: Record<
  string,
  Array<{ label: string; value: string }>
> = {
  "Lower back": [
    { label: "Off the floor", value: "Off the floor" },
    { label: "Heavy pulls", value: "Heavy pulls" },
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "High-volume squats", value: "High-volume squats" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Knees: [
    { label: "High-volume squats", value: "High-volume squats" },
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "Rebound out", value: "Rebound out" },
    { label: "Slow eccentrics", value: "Slow eccentrics" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Shoulders: [
    { label: "Front rack position", value: "Front rack position" },
    { label: "Snatch position", value: "Snatch position" },
    { label: "Long sessions", value: "Long sessions" },
    { label: "High OH volume", value: "High OH volume" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Elbows: [
    { label: "Front rack position", value: "Front rack position" },
    { label: "Jerk lockout", value: "Jerk lockout" },
    { label: "Heavy pulls", value: "Heavy pulls" },
    { label: "High OH volume", value: "High OH volume" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Wrists: [
    { label: "During pulls", value: "During pulls" },
    { label: "During squats", value: "During squats" },
    { label: "Over head", value: "Over head" },
    { label: "Catch", value: "Catch" },
    { label: "After training", value: "After training" },
    { label: "Inconsistent", value: "Inconsistent" },
  ],
  Hips: [
    { label: "High-volume squats", value: "High-volume squats" },
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "Limited warm-up", value: "Limited warm-up" },
    { label: "After sitting", value: "After sitting" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
  Ankles: [
    { label: "Bottom of squat", value: "Bottom of squat" },
    { label: "Rebound stress", value: "Rebound stress" },
    { label: "Deep squats", value: "Deep squats" },
    { label: "Foot transition", value: "Foot transition" },
    { label: "When fatigued", value: "When fatigued" },
    { label: "Next-day soreness", value: "Next-day soreness" },
  ],
};

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen3({
  onBack,
  onComplete,
  mode = "onboarding",
}: OnboardingScreen3Props) {
  const isSettings = mode === "settings";
  const dispatch = useDispatch();
  const { showError } = useToast();
  const onboardingData = useSelector(selectOnboardingData);
  const navigation = useNavigation();
  const getValuesRef = useRef<() => OnboardingScreen3Values>(() => ({} as OnboardingScreen3Values));

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
  } = useForm<OnboardingScreen3Values>({
    defaultValues: {
      limitation: onboardingData?.limitation ?? true,
      affected_area: onboardingData?.affected_area ?? ["Lower back"],
      selected_affected_area: onboardingData?.selected_affected_area ?? "Lower back",
      injury_status: onboardingData?.injury_status ?? "Managed",
      impact: onboardingData?.impact ?? "Moderate",
      when_to_show: onboardingData?.when_to_show ?? [],
    },
  });

  const limitationValue = useWatch({ control, name: "limitation" });
  const affectedAreaValue = useWatch({ control, name: "affected_area" });
  const selectedAffectedAreaValue = useWatch({
    control,
    name: "selected_affected_area",
  });

  const whenToShowOptions = useMemo(() => {
    if (!selectedAffectedAreaValue) return [];
    return WHEN_TO_SHOW_OPTIONS[selectedAffectedAreaValue] || [];
  }, [selectedAffectedAreaValue]);

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

  /* ── Side effects (same as Abdul's original logic) ── */

  useEffect(() => {
    if (!limitationValue) {
      setValue("affected_area", []);
      setValue("selected_affected_area", "");
      setValue("injury_status", "");
      setValue("impact", "");
      setValue("when_to_show", []);
    } else {
      setValue("affected_area", ["Lower back"]);
      setValue("selected_affected_area", "Lower back");
      setValue("injury_status", "Managed");
      setValue("impact", "Moderate");
    }
  }, [limitationValue, setValue]);

  useEffect(() => {
    if (affectedAreaValue && affectedAreaValue.length > 0) {
      if (!affectedAreaValue.includes(selectedAffectedAreaValue)) {
        setValue("selected_affected_area", affectedAreaValue[0]);
        setValue("when_to_show", []);
      }
    } else {
      setValue("selected_affected_area", "");
      setValue("when_to_show", []);
    }
  }, [affectedAreaValue, selectedAffectedAreaValue, setValue]);

  useEffect(() => {
    setValue("when_to_show", []);
  }, [selectedAffectedAreaValue, setValue]);

  /* ── Back (save progress) ── */

  const handleBack = () => {
    dispatch(saveOnboardingData(getValues()));
    if (onBack) onBack();
  };

  /* ── Submit ── */

  const onSubmit = (data: OnboardingScreen3Values) => {
    if (
      data.limitation &&
      data.affected_area.length > 0 &&
      !data.selected_affected_area
    ) {
      showError("Please select an affected area");
      return;
    }

    const sanitizedData =
      data.limitation === false
        ? {
            ...data,
            affected_area: [],
            selected_affected_area: "",
            injury_status: "",
            impact: "",
            when_to_show: [],
          }
        : data;

    dispatch(saveOnboardingData(sanitizedData));
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
            Training considerations
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Used to modify training when needed
          </Text>
        </View>
      )}

      <View style={styles.formGroup}>
        {/* Training Limitations YES/NO */}
        <View>
          <Text style={styles.sectionLabel}>TRAINING LIMITATIONS</Text>
          <Controller
            control={control}
            name="limitation"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pillGrid}>
                {(["Yes", "No"] as const).map((option) => {
                  const isActive =
                    (option === "Yes" && value === true) ||
                    (option === "No" && value === false);
                  return (
                    <Pressable
                      key={option}
                      style={({ pressed }) => [
                        styles.pillButton,
                        isActive && styles.pillButtonActive,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => onChange(option === "Yes")}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isActive && styles.pillTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        {limitationValue === true && (
          <>
            {/* Affected Areas — 2-column grid, multi-select */}
            <View>
              <Text style={styles.sectionLabel}>AFFECTED AREAS</Text>
              <Controller
                control={control}
                name="affected_area"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pillGrid}>
                    {BODY_AREAS.map((area) => {
                      const isActive = (value || []).includes(area);
                      return (
                        <Pressable
                          key={area}
                          style={({ pressed }) => [
                            styles.pillButton,
                            isActive && styles.pillButtonActive,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => {
                            const current = value || [];
                            if (current.includes(area)) {
                              onChange(current.filter((a) => a !== area));
                            } else {
                              onChange([...current, area]);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              isActive && styles.pillTextActive,
                            ]}
                          >
                            {area}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Injury state — floating pill style, single-select */}
            <View>
              <Text style={styles.sectionLabel}>RECOVERY STAGE</Text>
              <Controller
                control={control}
                name="injury_status"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.impactRow}>
                    {STATUS_OPTIONS.map((option) => {
                      const isActive = value === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          style={({ pressed }) => [
                            styles.impactPill,
                            isActive && styles.pillButtonActive,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => onChange(option.value)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              isActive && styles.pillTextActive,
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

            {/* Current Impact — floating pill style */}
            <View>
              <Text style={styles.sectionLabel}>CURRENT IMPACT</Text>
              <Controller
                control={control}
                name="impact"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.impactRow}>
                    {IMPACT_OPTIONS.map((option) => {
                      const isActive = value === option;
                      return (
                        <Pressable
                          key={option}
                          style={({ pressed }) => [
                            styles.impactPill,
                            isActive && styles.pillButtonActive,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => onChange(option)}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              isActive && styles.pillTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* When Does It Show Up — 2-column grid, multi-select */}
            {whenToShowOptions.length > 0 && (
              <View>
                <Text style={styles.sectionLabel}>WHEN DOES IT SHOW UP</Text>
                <Controller
                  control={control}
                  name="when_to_show"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.pillGrid}>
                      {whenToShowOptions.map((option) => {
                        const isActive = (value || []).includes(option.value);
                        return (
                          <Pressable
                            key={option.value}
                            style={({ pressed }) => [
                              styles.pillButton,
                              isActive && styles.pillButtonActive,
                              pressed && { opacity: 0.7 },
                            ]}
                            onPress={() => {
                              const current = value || [];
                              if (current.includes(option.value)) {
                                onChange(
                                  current.filter((v) => v !== option.value),
                                );
                              } else {
                                onChange([...current, option.value]);
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                isActive && styles.pillTextActive,
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
            )}
          </>
        )}
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

  /* Pill grid (all controls) */
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  pillButton: {
    width: "48%",
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
  },
  pillButtonActive: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
  },
  pillText: {
    ...olyTypography.label,
    color: olyColors.text.primary,
  },
  pillTextActive: {
    color: olyPalette.white,
  },

  /* Impact row — 3 pills in a row */
  impactRow: {
    flexDirection: "row",
    gap: olySpacing[8],
  },
  impactPill: {
    flex: 1,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
    alignItems: "center",
    justifyContent: "center",
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
