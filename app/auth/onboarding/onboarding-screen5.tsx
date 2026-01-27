import EquipmentList from "@/components/equipment";
import Header from "@/components/header";
import ProgressBar from "@/components/progress-bar";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function OnboardingScreen5() {
  const { colors } = useTheme();
  const onSubmit = () => {
    router.push("/auth/onboarding/onboarding-screen6");
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: scale(60),
      paddingHorizontal: scale(20),
    },
    formGroup: {
      marginVertical: scale(20),
      gap: scale(12),
    },
  });

  return (
    <View style={styles.container}>
      <ProgressBar totalSteps={7} currentStep={5} />

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
        <EquipmentList
          heading="Optional Equipment"
          showCheckbox
          items={[
            {
              title: "Lifting Blocks",
              description: "Used for pull and lift variations",
              checked: false,
            },
            {
              title: "Pull-up Bar",
              description: "Used for upper-body and accessory work",
              checked: false,
            },
            {
              title: "Dumbbells & Kettlebells",
              description: "Used for unilateral and general strength work",
              checked: false,
            },
            {
              title: "GHD Machine",
              description: "Used for posterior-chain and trunk work",
              checked: false,
            },
          ]}
        />
      </View>
      <ActionButtonsRow onPrimaryPress={onSubmit} />
    </View>
  );
}
