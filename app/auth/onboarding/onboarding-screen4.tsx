import DaysName from "@/components/days-name";
import NumberOfDays from "@/components/days-number";
import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
interface OnboardingScreen4Props {
  onBack?: () => void;
  onComplete?: () => void;
}
interface OnboardingScreen4Values {
  days_per_week: string;
  duration: string;
  rest_days: string;
}
export default function OnboardingScreen4({
  onBack,
  onComplete,
}: OnboardingScreen4Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const onSubmit = (data: OnboardingScreen4Values) => {
    dispatch(saveOnboardingData(data));

    if (onComplete) {
      onComplete();
    }
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingScreen4Values>({
    defaultValues: {
      days_per_week: "",
      duration: "45 min",
      rest_days: "",
    },
  });
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    formGroup: {
      marginVertical: scale(20),
      gap: scale(20),
    },
  });
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          mainText="Availability"
          subText="Used to structure your weekly training."
        />

        <View style={styles.formGroup}>
          <Controller
            control={control}
            name="days_per_week"
            render={({ field: { onChange, value } }) => (
              <NumberOfDays
                value={value ? Number(value) : null}
                onChange={(v) => onChange(v.toString())}
              />
            )}
          />
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
          <Controller
            control={control}
            name="rest_days"
            render={({ field: { onChange, value } }) => (
              <DaysName
                value={value ? value.split(",") : []}
                onChange={(v) => onChange(v.join(","))}
              />
            )}
          />
        </View>
      </ScrollView>
      <View>
        <ActionButtonsRow
          onPrimaryPress={handleSubmit(onSubmit)}
          onSecondaryPress={onBack}
        />
      </View>
    </View>
  );
}
