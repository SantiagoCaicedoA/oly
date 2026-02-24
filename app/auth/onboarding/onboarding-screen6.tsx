import EquipmentList from "@/components/equipment";
import Header from "@/components/header";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { saveOnboardingData } from "@/store/reducer/onboardingSlice";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";

interface OnboardingScreen6Props {
  onBack?: () => void;
  onComplete?: () => void;
}

interface OnboardingScreen6Values {
  training_preferences: string;
}
const TRAINING_PREFERENCES = [
  {
    title: "High Intensity",
    badgeTitle: "High Load",
    description:
      "Frequent heavy singles and doubles to prioritize neural output.",
  },
  {
    title: "Balanced",
    badgeTitle: "Progressive",
    description: "Structured progression with balanced volume and intensity.",
  },
  {
    title: "Higher Volume",
    badgeTitle: "Repitetion",
    description: "Higher repetition work to build technical and work capacity.",
  },
  {
    title: "Adaptive",
    description:
      "Automatically adjusts based on readiness and recent performance.",
  },
];
export default function OnboardingScreen6({
  onBack,
  onComplete,
}: OnboardingScreen6Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { showError } = useToast();

  const onSubmit = (data: OnboardingScreen6Values) => {
    if (!data.training_preferences) {
      showError("Please select a training preference");
      return;
    }
    dispatch(saveOnboardingData(data));
    if (onComplete) {
      onComplete();
    }
  };

  const { control, handleSubmit } = useForm<OnboardingScreen6Values>({
    defaultValues: {
      training_preferences: "",
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
      gap: scale(7),
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          mainText="Training preference"
          subText="Select how you prefer training to be emphasized."
        />

        <View style={styles.formGroup}>
          <Controller
            control={control}
            name="training_preferences"
            render={({ field: { value, onChange } }) => (
              <EquipmentList
                heading="TRAINING PREFERENCES"
                showCheckbox
                singleSelect
                items={TRAINING_PREFERENCES.map((item) => ({
                  title: item.title,
                  description: item.description,
                  badgeTitle: item.badgeTitle,
                  checked: value === item.title,
                }))}
                onToggle={(index) => {
                  onChange(TRAINING_PREFERENCES[index].title);
                }}
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
