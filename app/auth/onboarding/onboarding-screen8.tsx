import Header from "@/components/header";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useSubmitProfileMutation } from "@/store/api";

import { selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

export default function OnboardingScreen8() {
  const { colors } = useTheme();
  const allData = useSelector(selectOnboardingData);

  const [submitProfile, { isLoading }] = useSubmitProfileMutation();
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const onSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please sign in again.", [
        {
          text: "OK",
          onPress: () => router.push("/auth/signin"),
        },
      ]);
      return;
    }

    try {
      const apiPayload = {
        display_name: allData.name,
        country: allData.country,
        age: parseInt(allData.age),
        user_name: allData.user_name,
        sex: allData.sex,
        experience_years: parseInt(allData.experience),
        height_cm: parseFloat(allData.height),
        bodyweight_value: parseFloat(allData.weight),
        bodyweight_unit: allData.weightUnit,
        preferred_unit: allData.measurement_system,
        strength_stats: {
          snatch: {
            value: parseFloat(allData.snatch),
            checked: allData.snatch_checked,
          },
          power_snatch: {
            value: parseFloat(allData.power_snatch),
            checked: allData.power_snatch_checked,
          },
          clean_jerk: {
            value: parseFloat(allData.clean_jerk),
            checked: allData.clean_jerk_checked,
          },
          clean: {
            value: parseFloat(allData.clean),
            checked: allData.clean_checked,
          },
          power_clean: {
            value: parseFloat(allData.power_clean),
            checked: allData.power_clean_checked,
          },
          jerk: {
            value: parseFloat(allData.jerk),
            checked: allData.jerk_checked,
          },
          back_squat: {
            value: parseFloat(allData.back_squat),
            checked: allData.back_squat_checked,
          },
          front_squat: {
            value: parseFloat(allData.front_squat),
            checked: allData.front_squat_checked,
          },
        },
        strength_accuracy: allData.strength_accuracy,
        considerations: {
          has_limitations: allData.limitation,
          affected_areas: allData.affected_area,
          impact_level: allData.impact,
          triggers: allData.when_to_show,
        },
        availability: {
          training_days_per_week: allData.days_per_week,
          session_duration: allData.duration,
          preferred_rest_days: allData.rest_days,
        },
        equipment: {
          optional: allData.optional_equipment,
        },
        training_preference: allData.training_preferences,
        performance_gaps: allData.performance_gaps,
      };

      // console.log("APIkjh Payload:", JSON.stringify(apiPayload, null, 2));

      const response = await submitProfile(apiPayload).unwrap();
      // console.log("API Payload:", JSON.stringify(response, null, 2));
      Alert.alert(
        "Success",
        "Your profile has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/home"),
          },
        ],
        { cancelable: false },
      );
    } catch (error: any) {
      console.error("Submit Profile Error:", error);

      let errorMessage = "Failed to create profile. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (error?.status === 422) {
        errorMessage = "Invalid data. Please check your inputs.";
      } else if (error?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Error", errorMessage, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Retry",
          onPress: onSubmit,
        },
      ]);
    }
  };

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
    loadingContainer: {
      marginVertical: scale(20),
    },
    loaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
  });

  return (
    <View style={styles.container}>
      <Header
        mainText="Are you ready to start training?"
        subText="You'll be able to update the past personal data in your profile settings"
      />

      <ActionButtonsRow
        onPrimaryPress={onSubmit}
        primaryTitle={isLoading ? "SAVING..." : "SAVE"}
      />
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}
