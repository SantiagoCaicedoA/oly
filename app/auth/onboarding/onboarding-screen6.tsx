import EquipmentList from "@/components/equipment";
import Header from "@/components/header";
import ProgressBar from "@/components/progress-bar";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
interface OnboardingScreen6Values {
  high_intensity: boolean;
  balanced: boolean;
  higher_volume: boolean;
  adaptive: boolean;
}

export default function OnboardingScreen6() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const onSubmit = (data: OnboardingScreen6Values) => {
    dispatch(saveOnboardingData(data));
    router.push("/auth/onboarding/onboarding-screen7");
  };
  const { control, handleSubmit } = useForm<OnboardingScreen6Values>({
    defaultValues: {
      high_intensity: false,
      balanced: false,
      higher_volume: false,
      adaptive: false,
    },
  });
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: scale(60),
      paddingHorizontal: scale(20),
    },
    formGroup: {
      marginVertical: scale(20),
      gap: scale(7),
    },
  });

  return (
    <View style={styles.container}>
      <ProgressBar totalSteps={7} currentStep={6} />

      <Header
        mainText="Training preference"
        subText="Select how you prefer training to be emphasized."
      />

      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="high_intensity"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading="Essential Equipment"
              showCheckbox
              items={[
                {
                  title: "High Intensity",
                  description:
                    "Frequent heavy singles and doubles to prioritize neural output.",
                  checked: value,
                },
              ]}
              onToggle={() => onChange(!value)}
            />
          )}
        />

        <Controller
          control={control}
          name="balanced"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              showCheckbox
              heading=""
              items={[
                {
                  title: "Balanced",
                  description:
                    "Structured progression with balanced volume and intensity.",
                  checked: value,
                },
              ]}
              onToggle={() => onChange(!value)}
            />
          )}
        />

        <Controller
          control={control}
          name="higher_volume"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              showCheckbox
              heading=""
              items={[
                {
                  title: "Higher Volume",
                  description:
                    "Higher repetition work to build technical and work capacity.",
                  checked: value,
                },
              ]}
              onToggle={() => onChange(!value)}
            />
          )}
        />

        <Controller
          control={control}
          name="adaptive"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              showCheckbox
              heading=""
              items={[
                {
                  title: "Adaptive",
                  description:
                    "Automatically adjusts based on readiness and recent performance.",
                  checked: value,
                },
              ]}
              onToggle={() => onChange(!value)}
            />
          )}
        />
      </View>

      <ActionButtonsRow onPrimaryPress={handleSubmit(onSubmit)} />
    </View>
  );
}
