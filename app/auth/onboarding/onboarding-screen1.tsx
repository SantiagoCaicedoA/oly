import CounterInput from "@/components/counter-input";
import Header from "@/components/header";
import ProgressBar from "@/components/progress-bar";
import SegmentedSelector from "@/components/segmented-selector";
import WeightInput from "@/components/weight-input";
import CustomInput from "@/constants/custom-input";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import { router } from "expo-router";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
interface OnboardingScreen1Values {
  name: string;
  country: string;
  age: string;
  weight: string;
  weightUnit: "KG" | "LB";
  experience: string;
  sex: string;
}
export default function OnboardingScreen1() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const onSubmit = (data: OnboardingScreen1Values) => {
    dispatch(saveOnboardingData(data));

    router.push("/auth/onboarding/onboarding-screen2");
  };
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingScreen1Values>({
    defaultValues: {
      name: "",
      country: "",
      age: "",
      weight: "",
      weightUnit: "KG",
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
      <ProgressBar totalSteps={7} currentStep={1} />
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
              placeholder="Years"
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
            <WeightInput
              label="BODY WEIGHT"
              value={value}
              onChangeText={onChange}
              unit={watch("weightUnit")}
              onUnitChange={(unit) => setValue("weightUnit", unit)}
              error={errors.weight?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="experience"
          render={({ field: { onChange, value } }) => (
            <CounterInput
              label="EXPERIENCE"
              value={value}
              onChangeText={onChange}
              //  suffix="YEARS"
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
