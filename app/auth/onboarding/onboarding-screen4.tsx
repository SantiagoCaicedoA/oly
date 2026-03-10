import DaysName from "@/components/days-name";
import NumberOfDays from "@/components/days-number";
import Header from "@/components/header";
import SegmentedSelector from "@/components/segmented-selector";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
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
  days_per_week: number;
  duration: number;
  rest_days: string[];
}
export default function OnboardingScreen4({
  onBack,
  onComplete,
}: OnboardingScreen4Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { showError } = useToast();
  const onSubmit = (data: OnboardingScreen4Values) => {
    dispatch(saveOnboardingData(data));

    if (onComplete) {
      onComplete();
    }
  };
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingScreen4Values>({
    defaultValues: {
      days_per_week: 1,
      duration: 45,
      rest_days: [],
    },
  });
  const daysPerWeek = watch("days_per_week");
  const maxRestDays = 7 - (daysPerWeek || 1);
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
                onChange={(v) => onChange(v)}
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
                  { label: "45 min", value: "45" },
                  { label: "60 min", value: "60" },
                  { label: "75 min", value: "75" },
                  { label: "90+ min", value: "90" },
                ]}
                selectedValue={String(value)}
                onChange={(val) => {
                  if (typeof val === "string") {
                    onChange(Number(val));
                  }
                }}
                segments={4}
              />
            )}
          />

          <Controller
            control={control}
            name="rest_days"
            render={({ field: { onChange, value } }) => (
              <DaysName
                value={value}
                onChange={onChange}
                maxRestDays={maxRestDays}
                trainingDays={daysPerWeek}
                onError={(msg) => showError(msg)}
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
