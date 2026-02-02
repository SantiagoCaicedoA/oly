import { Images } from "@/assets";
import PhysicalState from "@/components/physical-state";
import RecoveryMetrics from "@/components/slider";
import ActionButtonsRow from "@/constants/custom-row-buttons";

import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

export default function DailyCheckIn() {
  const { colors } = useTheme();
  const [motivationValue, setMotivationValue] = useState("Neutral");

  const [sleepQuality, setSleepQuality] = useState(8);

  const [stressLevel, setStressLevel] = useState(3);
  const [mentalReadiness, setMentalReadiness] = useState(6);

  const [muscleSoreness, setMuscleSoreness] = useState(0);
  const [soreAreas, setSoreAreas] = useState(["LOWER BACK"]);
  const [specificArea, setSpecificArea] = useState("");
  const [areaIntensities, setAreaIntensities] = useState<{
    [key: string]: number;
  }>({
    "LOWER BACK": 8,
    SHOULDER: 5,
  });

  const handleAreaIntensityChange = (area: string, value: number) => {
    setAreaIntensities((prev) => ({
      ...prev,
      [area]: value,
    }));
  };

  const handleBackPress = () => {
    router.back();
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
        <ActionButtonsRow primaryTitle="Start" secondaryTitle="Skip" />
      </ScrollView>
    </SafeAreaView>
  );
}
