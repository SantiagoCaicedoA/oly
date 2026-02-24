import { Images } from "@/assets";
import PhysicalState from "@/components/physical-state";
import RecoveryMetrics from "@/components/slider";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useTheme } from "@/context/theme-context";
import { useDailyCheckInMutation } from "@/store/api";
import { Days } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { DailyCheckInPayload } from "@/types/api/dashboard";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";

export default function DailyCheckIn() {
  const DAY_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const { colors } = useTheme();
  const selectedExerciseName = useSelector(
    (state: RootState) => state.training.selectedExerciseName,
  );
  const days = useSelector((state: RootState) => state.training.days);

  const dayKey = DAY_KEYS[new Date().getDay()] as keyof Days;
  const todayData = days?.[dayKey];
  const exerciseData =
    todayData?.exercises?.find(
      (ex) => ex.exercise_name === selectedExerciseName,
    ) ?? null;

  const dailyCheckIn = todayData?.daily_check_in;
  const [motivationValue, setMotivationValue] = useState("Neutral");
  const [sleepQuality, setSleepQuality] = useState(
    dailyCheckIn?.sleep_quality ?? 0,
  );
  const [stressLevel, setStressLevel] = useState(
    dailyCheckIn?.stress_level ?? 0,
  );
  const [mentalReadiness, setMentalReadiness] = useState(
    dailyCheckIn?.mental_readiness ?? 0,
  );
  const [muscleSoreness, setMuscleSoreness] = useState(0);
  const [soreAreas, setSoreAreas] = useState(["LOWER BACK"]);
  const [specificArea, setSpecificArea] = useState("");
  const [areaIntensities, setAreaIntensities] = useState<{
    [key: string]: number;
  }>({
    "LOWER BACK": 8,
    SHOULDER: 5,
  });
  const [selectedIntensityArea, setSelectedIntensityArea] = useState<
    string | null
  >(null);

  const todayKey = DAY_KEYS[new Date().getDay()];
  const [submitCheckIn, { isLoading }] = useDailyCheckInMutation();
  const handleAreaIntensityChange = (area: string, value: number) => {
    setAreaIntensities((prev) => ({
      ...prev,
      [area]: value,
    }));
    setSelectedIntensityArea(area);
  };
  const handleBackPress = () => {
    router.back();
  };
  const handleStartPress = async () => {
    const payload: DailyCheckInPayload = {
      day: todayKey,
      daily_check_in: {
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        mental_readiness: mentalReadiness,
        motivation: motivationValue,
        muscle_soreness: muscleSoreness,
        sore_areas: soreAreas,
        intensity: selectedIntensityArea
          ? (areaIntensities[selectedIntensityArea] ?? 0)
          : 0,
      },
    };

    try {
      const result = await submitCheckIn(payload).unwrap();

      router.push("athlete/training-exercise");
    } catch (error) {
      console.error("Daily check-in error:", error);
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(10),
      position: "relative",
      backgroundColor: colors.headerBackground,
    },
    backButton: {
      position: "absolute",
      left: scale(15),
      width: scale(12),
      height: scale(12),
    },
    headerText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
      textAlign: "center",
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={Images.arrowBack}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        <Text style={styles.headerText}>DAILY CHECK-IN</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RecoveryMetrics
          title="RECOVERY METRICS"
          metrics={[
            {
              label: "Sleep quality",
              value: sleepQuality,
              onChange: setSleepQuality,
            },
          ]}
        />

        <RecoveryMetrics
          title="MENTAL LOAD"
          metrics={[
            {
              label: "Stress level",
              value: stressLevel,
              onChange: setStressLevel,
            },
            {
              title: "CURRENT MOOD",
              label: "Mental readiness",
              value: mentalReadiness,
              onChange: setMentalReadiness,
              segmentedSelector: {
                title: "Motivation",
                options: [
                  { label: "Low", value: "Low" },
                  { label: "Neutral", value: "Neutral" },
                  { label: "High", value: "High" },
                ],
                selectedValue: motivationValue,
                onChange: (value) => {
                  if (typeof value === "string") {
                    setMotivationValue(value);
                  }
                },
                segments: 4,
              },
            },
          ]}
        />

        <PhysicalState
          muscleSoreness={muscleSoreness}
          onMuscleSorenessChange={setMuscleSoreness}
          soreAreas={soreAreas}
          onSoreAreasChange={setSoreAreas}
          specificArea={specificArea}
          onSpecificAreaChange={setSpecificArea}
          areaIntensities={areaIntensities}
          onAreaIntensityChange={handleAreaIntensityChange}
        />
        <ActionButtonsRow
          primaryTitle={isLoading ? "SAVING" : "START"}
          secondaryTitle="Skip"
          onPrimaryPress={handleStartPress}
          onSecondaryPress={() => router.push("athlete/training-exercise")}
        />
      </ScrollView>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}
