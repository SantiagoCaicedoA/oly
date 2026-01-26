import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import CustomInput from "@/constants/custom-input";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
interface OnboardingScreen1Values {
  name: string;
  country: string;
  age: string;
  weight: string;
  experience: string;
  sex: string;
}
export default function OnboardingScreen1() {
  const { colors } = useTheme();

  const onSubmit = (data: OnboardingScreen1Values) => {
    router.push("/auth/onboarding/onboarding-screen3");
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingScreen1Values>({
    defaultValues: {
      name: "",
      country: "",
      age: "",
      weight: "",
      experience: "",
      sex: "male",
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
      <View style={{ padding: 20, backgroundColor: "red" }}></View>
      <Header
        mainText="Athlete profile"
        subText="Used to set up your training profile"
      />
      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="your name"
              label="FULL NAME"
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="colombia"
              label="YOUR COUNTRY"
              onChangeText={onChange}
              value={value}
              error={errors.country?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="age"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="AGE"
              placeholder="colombia"
              onChangeText={onChange}
              value={value}
              error={errors.country?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="BODY WEIGHT"
              placeholder="97 kg"
              onChangeText={onChange}
              value={value}
              error={errors.weight?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="experience"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="EXPERIENCE"
              placeholder="Beginner / Intermediate"
              onChangeText={onChange}
              value={value}
              error={errors.experience?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="sex"
          render={({ field: { onChange, value } }) => (
            <SegmentedSelector
              title="SEX"
              selectedValue={value}
              onChange={onChange}
              options={[
                { label: "Female", value: "female" },
                { label: "Male", value: "male" },
                { label: "Other", value: "other" },
              ]}
            />
          )}
        />
      </View>

      <ActionButtonsRow onPrimaryPress={handleSubmit(onSubmit)} />
    </View>
  );
}
