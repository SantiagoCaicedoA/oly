import Header from "@/components/header";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { selectOnboardingData } from "@/store/reducer/onboardingSlice";
import React from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

export default function OnboardingScreen8() {
  const { colors } = useTheme();
  const allData = useSelector(selectOnboardingData);

  const onSubmit = () => {};
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: scale(60),
      paddingHorizontal: scale(20),
      alignItems: "center",
      justifyContent: "center",
      gap: scale(15),
    },
  });

  return (
    <View style={styles.container}>
      <Header
        mainText="Are you ready to start training?"
        subText="You’ll be able to update the past personal data in your profile settings"
      />

      <ActionButtonsRow onPrimaryPress={onSubmit} />
    </View>
  );
}
