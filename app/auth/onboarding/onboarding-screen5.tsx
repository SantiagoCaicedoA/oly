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
  optional_equipment: boolean[];
}

export default function OnboardingScreen5({
  onBack,
  onComplete,
}: OnboardingScreen5Props) {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const onSubmit = (data: OnboardingScreen5Values) => {
    dispatch(saveOnboardingData(data));
    if (onComplete) {
      onComplete();
    }
  };

  const { control, handleSubmit } = useForm<OnboardingScreen5Values>({
    defaultValues: {
      optional_equipment: [false, false, false, false],
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
              items={[
                {
                  title: "Lifting Blocks",
                  description: "Used for pull and lift variations",
                  checked: value[0] || false,
                },
                {
                  title: "Pull-up Bar",
                  description: "Used for upper-body and accessory work",
                  checked: value[1] || false,
                },
                {
                  title: "Dumbbells & Kettlebells",
                  description: "Used for unilateral and general strength work",
                  checked: value[2] || false,
                },
                {
                  title: "GHD Machine",
                  description: "Used for posterior-chain and trunk work",
                  checked: value[3] || false,
                },
              ]}
              onToggle={(index) => {
                const updated = [...value];
                updated[index] = !updated[index];
                onChange(updated);
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
