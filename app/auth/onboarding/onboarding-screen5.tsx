/**
 * Onboarding Screen 5 — Equipment (Redesigned v2)
 *
 * Essential (always included, non-interactive) and Optional (tap to toggle).
 * No checkboxes — active state = highlight bg + primary border.
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
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";
import React from "react";
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

interface OnboardingScreen5Props {
  onBack?: () => void;
  onComplete?: () => void;
}

interface OnboardingScreen5Values {
  optional_equipment: string[];
}

/* ── Data ──────────────────────────────────────────────── */

const ESSENTIAL_EQUIPMENT = [
  {
    title: "Barbell + Bumper Plates",
    description: "Required for core lifting sessions",
  },
];

const OPTIONAL_EQUIPMENT = [
  { title: "Squat Rack", description: "Required for squats and press variations" },
  { title: "Lifting Blocks", description: "Used for pull and lift variations" },
  { title: "Pull-up Bar", description: "Used for upper-body and accessory work" },
  { title: "Dumbbells & Kettlebells", description: "Used for unilateral and general strength work" },
  { title: "GHD Machine", description: "Used for posterior-chain and trunk work" },
  { title: "Resistance Bands", description: "Used for warm-ups and mobility drills" },
  { title: "Plyo Box", description: "Used for jumps and elevated positions" },
];

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen5({
  onBack,
  onComplete,
}: OnboardingScreen5Props) {
  const dispatch = useDispatch();
  const onboardingData = useSelector(selectOnboardingData);

  const { control, handleSubmit, getValues } =
    useForm<OnboardingScreen5Values>({
      defaultValues: {
        optional_equipment: onboardingData?.optional_equipment ?? [],
      },
    });

  const handleBack = () => {
    dispatch(saveOnboardingData({ ...onboardingData, ...getValues() }));
    if (onBack) onBack();
  };

  const onSubmit = (data: OnboardingScreen5Values) => {
    dispatch(saveOnboardingData({ ...onboardingData, ...data }));
    if (onComplete) onComplete();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Equipment</Text>
          <Text style={styles.subtitle}>
            Used to tailor exercise selection and loading
          </Text>
        </View>

        {/* Essential Equipment */}
        <View style={styles.section}>
          <Text style={styles.label}>ESSENTIAL EQUIPMENT</Text>
          {ESSENTIAL_EQUIPMENT.map((item, index) => (
            <View key={index} style={[styles.card, styles.cardActive]}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* Optional Equipment */}
        <Controller
          control={control}
          name="optional_equipment"
          render={({ field: { value, onChange } }) => (
            <View style={styles.section}>
              <Text style={styles.label}>OPTIONAL EQUIPMENT</Text>
              {OPTIONAL_EQUIPMENT.map((item, index) => {
                const isActive = (value || []).includes(item.title);
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      if (isActive) {
                        onChange(value.filter((v) => v !== item.title));
                      } else {
                        onChange([...value, item.title]);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.card,
                      isActive && styles.cardActive,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cardTitle,
                        !isActive && styles.cardTitleInactive,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.cardDescription}>
                      {item.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <OlyButton
            label="BACK"
            variant="secondary"
            onPress={handleBack}
            fullWidth
            style={styles.buttonHalf}
          />
          <OlyButton
            label="NEXT"
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            fullWidth
            style={styles.buttonHalf}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Title
  titleBlock: { marginBottom: olySpacing[24] },
  title: { ...olyTypography.title1, color: olyColors.text.primary },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  // Section
  section: {
    marginTop: olySpacing[24],
    gap: olySpacing[8],
  },
  label: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },

  // Cards
  card: {
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  cardActive: {
    borderColor: olyPalette.primary,
    backgroundColor: olyColors.bg.activeHighlight,
  },
  cardTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  cardTitleInactive: {
    color: olyColors.text.secondary,
  },
  cardDescription: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  // Bottom buttons
  bottomButtons: {
    flexDirection: "row",
    gap: olySpacing[12],
    paddingTop: olySpacing[40],
    marginTop: "auto" as const,
  },
  buttonHalf: {
    flex: 1,
  },
});
