import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { useToast } from "@/context/toast-context";
import { useLoadingMessages } from "@/hooks/useLoadingMessage";
import { useSubmitProfileMutation } from "@/store/api";
import { setUser } from "@/store/reducer/authSlice";
import { selectOnboardingData } from "@/store/reducer/onboardingSlice";
import { RootState } from "@/store/store";
import { OnboardingApiPayload } from "@/types/api/onboarding";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function OnboardingScreen8() {
  const allData = useSelector(selectOnboardingData);
  const [submitProfile, { isLoading }] = useSubmitProfileMutation();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const loadingMessage = useLoadingMessages(isLoading, 25000);

  const onSubmit = async () => {
    try {
      const apiPayload: OnboardingApiPayload = {
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

      const result = await submitProfile(apiPayload).unwrap();
      dispatch(setUser(result.data));
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

  if (isLoading) {
    return (
      <OlyScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={olyColors.button.primary.bg}
          />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      </OlyScreenWrapper>
    );
  }

  return (
    <OlyScreenWrapper>
      <View style={styles.centerContainer}>
        <View style={styles.headerBlock}>
          <Text
            style={styles.mainText}
            maxFontSizeMultiplier={1.2}
          >
            Are you ready to start training?
          </Text>
          <Text
            style={styles.subText}
            maxFontSizeMultiplier={1.5}
          >
            You'll be able to update the past personal data in your profile
            settings
          </Text>
        </View>

        <OlyButton
          label={isLoading ? "SAVING..." : "SAVE"}
          onPress={onSubmit}
          disabled={isLoading}
          loading={isLoading}
          fullWidth
        />
      </View>
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[16],
  },
  headerBlock: {
    marginBottom: olySpacing[24],
  },
  mainText: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
  },
  subText: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
  },
  loadingText: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },
});
