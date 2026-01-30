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

interface OnboardingScreen6Props {
  onBack?: () => void;
  onComplete?: () => void;
}

interface OnboardingScreen6Values {
  training_preferences: boolean[];
}

export default function OnboardingScreen6({
  onBack,
  onComplete,
}: OnboardingScreen6Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const onSubmit = (data: OnboardingScreen6Values) => {
    dispatch(saveOnboardingData(data));
    if (onComplete) {
      onComplete();
    }
  };

  const { control, handleSubmit } = useForm<OnboardingScreen6Values>({
    defaultValues: {
      training_preferences: [false, false, false, false],
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
            render={({ field: { value, onChange } }) => {
              const safeValue = Array.isArray(value)
                ? value
                : [false, false, false, false];

              return (
                <EquipmentList
                  heading="TRAINING PREFERENCES"
                  showCheckbox
                  singleSelect={true}
                  items={[
                    {
                      title: "High Intensity",
                      description:
                        "Frequent heavy singles and doubles to prioritize neural output.",
                      checked: safeValue[0] || false,
                    },
                    {
                      title: "Balanced",
                      description:
                        "Structured progression with balanced volume and intensity.",
                      checked: safeValue[1] || false,
                    },
                    {
                      title: "Higher Volume",
                      description:
                        "Higher repetition work to build technical and work capacity.",
                      checked: safeValue[2] || false,
                    },
                    {
                      title: "Adaptive",
                      description:
                        "Automatically adjusts based on readiness and recent performance.",
                      checked: safeValue[3] || false,
                    },
                  ]}
                  onToggle={(index) => {
                    const isCurrentlySelected = safeValue[index];

                    if (isCurrentlySelected) {
                      onChange([false, false, false, false]);
                    } else {
                      const updated = [false, false, false, false];
                      updated[index] = true;
                      onChange(updated);
                    }
                  }}
                />
              );
            }}
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
