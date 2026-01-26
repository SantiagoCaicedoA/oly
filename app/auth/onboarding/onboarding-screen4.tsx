import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
interface OnboardingScreen4Values {
  days_per_week: string;
  duration: string;
  rest_days: string;
}
export default function OnboardingScreen4() {
  const { colors } = useTheme();

  const onSubmit = (data: OnboardingScreen4Values) => {
    router.push("/auth/onboarding/onboarding-screen4");
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingScreen4Values>({
    defaultValues: {
      days_per_week: "",
      duration: "45 min",
      rest_days: "Moderate",
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
        mainText="Availability"
        subText="Used to structure your weekly training."
      />

      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="duration"
          render={({ field: { onChange, value } }) => (
            <SegmentedSelector
              title="Session Duration"
              options={[
                { label: "45 min", value: "45 min" },
                { label: "60 min", value: "60 min" },
                { label: "75 min", value: "75 min" },
                { label: "90+ min", value: "90+ min" },
              ]}
              selectedValue={value}
              onChange={onChange}
              segments={4}
            />
          )}
        />
      </View>
      <ActionButtonsRow onPrimaryPress={handleSubmit(onSubmit)} />
    </View>
  );
}
