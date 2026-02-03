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

interface OnboardingScreen5Props {
  onBack?: () => void;
  onComplete?: () => void;
}

interface OnboardingScreen5Values {
  optional_equipment: string[];
}

export default function OnboardingScreen5({
  onBack,
  onComplete,
}: OnboardingScreen5Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const OPTIONAL_EQUIPMENT = [
    "Lifting Blocks",
    "Pull-up Bar",
    "Dumbbells & Kettlebells",
    "GHD Machine",
  ];

  const onSubmit = (data: OnboardingScreen5Values) => {
    dispatch(saveOnboardingData(data));
    if (onComplete) {
      onComplete();
    }
  };

  const { control, handleSubmit } = useForm<OnboardingScreen5Values>({
    defaultValues: {
      optional_equipment: [],
    },
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {},
    formGroup: {
      marginVertical: scale(20),
      gap: scale(12),
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
        mainText="Equipment"
        subText="Used to tailor exercise selection and loading."
      />

      <View style={styles.formGroup}>
        <EquipmentList
          heading="Essential Equipment"
          items={[
            {
              title: "Barbell + Bumper Plates",
              description: "Required for core lifting sessions",
            },
            {
              title: "Squat Rack",
              description: "Required for squats and press variations",
            },
          ]}
        />

        <Controller
          control={control}
          name="optional_equipment"
          render={({ field: { value, onChange } }) => (
            <EquipmentList
              heading="Optional Equipment"
              showCheckbox
              items={OPTIONAL_EQUIPMENT.map((title) => ({
                title,
                description: "",
                checked: value.includes(title),
              }))}
              onToggle={(index) => {
                const item = OPTIONAL_EQUIPMENT[index];

                if (value.includes(item)) {
                  onChange(value.filter((v) => v !== item));
                } else {
                  onChange([...value, item]);
                }
              }}
            />
          )}
        />
      </View>

      <ActionButtonsRow
        onPrimaryPress={handleSubmit(onSubmit)}
        onSecondaryPress={onBack}
      />
    </ScrollView>
  );
}
