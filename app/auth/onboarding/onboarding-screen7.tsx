import EquipmentList from "@/components/equipment";
import Header from "@/components/header";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
interface OnboardingScreen7Props {
  onBack?: () => void;
  onComplete?: () => void;
}
interface OnboardingScreen7Values {
  pulling_positioning: string[];
  receiving_bar: string[];
  squat_leg_strength: string[];
  overhead_stability: string[];
}

export default function OnboardingScreen7({
  onBack,
  onComplete,
}: OnboardingScreen7Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const PERFORMANCE_GAPS = {
    pulling_positioning: {
      heading: "PULLING & POSITIONING",
      items: [
        "Limited leg drive",
        "Difficulty maintaining bar proximity",
        "Early arm bend",
        "Slow pull from the floor",
      ],
    },
    receiving_bar: {
      heading: "RECEIVING THE BAR",
      items: [
        "Slow turnover",
        "Limited leg endurance",
        "Instability in the catch",
      ],
    },
    squat_leg_strength: {
      heading: "SQUAT AND LEG STRENGTH",
      items: [
        "Difficulty standing up cleans",
        "Poor leg endurance",
        "Limited squat mobility",
      ],
    },
    overhead_stability: {
      heading: "OVERHEAD STABILITY",
      items: [
        "Limited lockout strength",
        "Jerk drive timing",
        "Overhead timing",
        "Limited overhead mobility",
      ],
    },
  };

  const onSubmit = (data: OnboardingScreen7Values) => {
    const performance_gaps = [
      ...data.pulling_positioning,
      ...data.receiving_bar,
      ...data.squat_leg_strength,
      ...data.overhead_stability,
    ];

    dispatch(saveOnboardingData({ performance_gaps }));

    if (onComplete) onComplete();
  };

  const { control, handleSubmit } = useForm<OnboardingScreen7Values>({
    defaultValues: {
      pulling_positioning: [],
      receiving_bar: [],
      squat_leg_strength: [],
      overhead_stability: [],
    },
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {},
    formGroup: {
      marginVertical: scale(20),
      gap: scale(12),
      marginBottom: scale(50),
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Header
        mainText="Performance gaps"
        subText="Used to emphasize areas that need the most attention."
      />

      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="pulling_positioning"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading={PERFORMANCE_GAPS.pulling_positioning.heading}
              showCheckbox
              items={PERFORMANCE_GAPS.pulling_positioning.items.map((gap) => ({
                description: gap,
                checked: value.includes(gap),
              }))}
              onToggle={(index) => {
                const gap = PERFORMANCE_GAPS.pulling_positioning.items[index];
                onChange(
                  value.includes(gap)
                    ? value.filter((g) => g !== gap)
                    : [...value, gap],
                );
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="receiving_bar"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading={PERFORMANCE_GAPS.receiving_bar.heading}
              showCheckbox
              items={PERFORMANCE_GAPS.receiving_bar.items.map((gap) => ({
                description: gap,
                checked: value.includes(gap),
              }))}
              onToggle={(index) => {
                const gap = PERFORMANCE_GAPS.receiving_bar.items[index];
                onChange(
                  value.includes(gap)
                    ? value.filter((g) => g !== gap)
                    : [...value, gap],
                );
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="squat_leg_strength"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading={PERFORMANCE_GAPS.squat_leg_strength.heading}
              showCheckbox
              items={PERFORMANCE_GAPS.squat_leg_strength.items.map((gap) => ({
                description: gap,
                checked: value.includes(gap),
              }))}
              onToggle={(index) => {
                const gap = PERFORMANCE_GAPS.squat_leg_strength.items[index];
                onChange(
                  value.includes(gap)
                    ? value.filter((g) => g !== gap)
                    : [...value, gap],
                );
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="overhead_stability"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading={PERFORMANCE_GAPS.overhead_stability.heading}
              showCheckbox
              items={PERFORMANCE_GAPS.overhead_stability.items.map((gap) => ({
                description: gap,
                checked: value.includes(gap),
              }))}
              onToggle={(index) => {
                const gap = PERFORMANCE_GAPS.overhead_stability.items[index];
                onChange(
                  value.includes(gap)
                    ? value.filter((g) => g !== gap)
                    : [...value, gap],
                );
              }}
            />
          )}
        />
      </View>
      <ActionButtonsRow
        onPrimaryPress={handleSubmit(onSubmit)}
        onSecondaryPress={onBack}
      />
    </ScrollView>
  );
}
