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
  pulling_positioning: boolean[];
  receiving_bar: boolean[];
  squat_leg_strength: boolean[];
  overhead_stability: boolean[];
}
export default function OnboardingScreen7({
  onBack,
  onComplete,
}: OnboardingScreen7Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const onSubmit = (data: OnboardingScreen7Values) => {
    dispatch(saveOnboardingData(data));
    if (onComplete) {
      onComplete();
    }
  };

  const { control, handleSubmit } = useForm<OnboardingScreen7Values>({
    defaultValues: {
      pulling_positioning: [false, false, false, false],
      receiving_bar: [false, false, false],
      squat_leg_strength: [false, false, false],
      overhead_stability: [false, false, false, false],
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
              heading="PULLING & POSITIONING"
              showCheckbox
              items={[
                { description: "Limited leg drive", checked: value[0] },
                {
                  description: "Difficulty maintaining bar proximity",
                  checked: value[1],
                },
                { description: "Early arm bend", checked: value[2] },
                { description: "Slow pull from the floor", checked: value[3] },
              ]}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="receiving_bar"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading="RECEIVING THE BAR"
              showCheckbox
              items={[
                { description: "Slow turnover", checked: value[0] },
                { description: "Limited leg endurance", checked: value[1] },
                { description: "Instability in the catch", checked: value[2] },
              ]}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="squat_leg_strength"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading="SQUAT AND LEG STRENGTH"
              showCheckbox
              items={[
                {
                  description: "Difficulty standing up cleans",
                  checked: value[0],
                },
                { description: "Poor leg endurance", checked: value[1] },
                { description: "Limited squat mobility", checked: value[2] },
              ]}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="overhead_stability"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading="OVERHEAD STABILITY"
              showCheckbox
              items={[
                { description: "Limited lockout strength", checked: value[0] },
                { description: "Jerk drive timing", checked: value[1] },
                { description: "Overhead timing", checked: value[2] },
                { description: "Limited overhead mobility", checked: value[3] },
              ]}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
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
