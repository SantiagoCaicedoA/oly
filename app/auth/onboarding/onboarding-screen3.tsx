import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
interface OnboardingScreen3Values {
  limitation: string;
  affected_area: string;
  impact: string;
  when_to_show: string;
}
export default function OnboardingScreen3() {
  const { colors } = useTheme();

  const onSubmit = (data: OnboardingScreen3Values) => {
    router.push("/auth/onboarding/onboarding-screen4");
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingScreen3Values>({
    defaultValues: {
      limitation: "yes",
      affected_area: "Lower back",
      impact: "Moderate",
      when_to_show: "During pills",
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
      gap: scale(15),
    },
  });
  return (
    <View style={styles.container}>
      <View style={{ padding: 20, backgroundColor: "red" }}></View>
      <Header
        mainText="Training considerations"
        subText="Used to modify training when needed."
      />

      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="limitation"
          render={({ field: { onChange, value } }) => (
            <SegmentedSelector
              title="Training Limitations"
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]}
              selectedValue={value}
              onChange={onChange}
              segments={2}
            />
          )}
        />

        <Controller
          control={control}
          name="affected_area"
          render={({ field: { onChange, value } }) => (
            <SegmentedSelector
              title="Affected Areas"
              options={[
                { label: "Lower back", value: "Lower back" },
                { label: "Knees", value: "Knees" },
                { label: "Shoulders", value: "Shoulders" },
                { label: "Wrists", value: "Wrists" },
                { label: "Hips", value: "Hips" },
                { label: "Ankles", value: "Ankles" },
              ]}
              selectedValue={value}
              onChange={onChange}
              segments={6}
            />
          )}
        />
        <Controller
          control={control}
          name="impact"
          render={({ field: { onChange, value } }) => (
            <SegmentedSelector
              title="Current Impact"
              options={[
                { label: "Mild", value: "Mild" },
                { label: "Moderate", value: "Moderate" },
                { label: "High", value: "High" },
              ]}
              selectedValue={value}
              onChange={onChange}
              segments={3}
            />
          )}
        />
        <Controller
          control={control}
          name="when_to_show"
          render={({ field: { onChange, value } }) => (
            <SegmentedSelector
              title="When does it show up"
              options={[
                { label: "During pills", value: "During pills" },
                { label: "During squats", value: "During squats" },
                { label: "Overhead", value: "Overhead" },
                { label: "Catch", value: "Catch" },
                { label: "After training", value: "After training" },
                { label: "Inconsistent", value: "Inconsistent" },
              ]}
              selectedValue={value}
              onChange={onChange}
              segments={6}
            />
          )}
        />
      </View>
      <ActionButtonsRow onPrimaryPress={handleSubmit(onSubmit)} />
    </View>
  );
}
