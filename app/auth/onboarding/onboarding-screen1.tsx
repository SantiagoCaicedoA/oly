import CounterInput from "@/components/counter-input";
import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import WeightInput from "@/components/weight-input";
import CustomInput from "@/constants/custom-input";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import { router } from "expo-router";

import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
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
  height: string;
  measurement_system: "Metric" | "Imperial";
}
interface OnboardingScreen1Props {
  onComplete?: () => void;
  name?: string;
  email?: string;
}
export default function OnboardingScreen1({
  onComplete,
  name,
  email,
}: OnboardingScreen1Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const onSubmit = (data: OnboardingScreen1Values) => {
    dispatch(saveOnboardingData(data));

    if (onComplete) {
      onComplete();
    } else {
      router.push("/auth/onboarding/onboarding-screen2");
    }
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
      height: "",
      measurement_system: "Metric",
    },
  });
  useEffect(() => {
    if (name) {
      setValue("name", name);
    }
  }, [name, setValue]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {},
    formGroup: {
      marginVertical: scale(20),
      gap: scale(7),
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
        mainText="Athlete profile"
        subText="Used to set up your training profile"
      />
      <View style={styles.formGroup}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="Your name"
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
              placeholder="Select your country"
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
          name="measurement_system"
          render={({ field: { onChange, value } }) => (
            <WeightInput
              label="UNITS"
              value={value}
              onChangeText={onChange}
              unit={watch("measurement_system")}
              onUnitChange={(unit: string) =>
                setValue("measurement_system", unit as "Metric" | "Imperial")
              }
              error={errors.measurement_system?.message}
              units={["Metric", "Imperial"]}
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
              onUnitChange={(unit: string) =>
                setValue("weightUnit", unit as "KG" | "LB")
              }
              error={errors.weight?.message}
              units={["KG", "LB"]}
            />
          )}
        />
        <Controller
          control={control}
          name="height"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="HEIGHT"
              placeholder="0 cm"
              onChangeText={onChange}
              value={value}
              error={errors.height?.message}
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
    </ScrollView>
  );
}
