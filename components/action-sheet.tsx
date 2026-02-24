import { Images } from "@/assets";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useUpdateTrainingDataMutation } from "@/store/api";
import { Exercise, ExerciseSet } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { UpdateTrainingPayload } from "@/types/api/dashboard";
import { Typography } from "@/utils/custom-styles";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";
import LiftAnalysis from "./lift-analysis";
import MissAndPain from "./miss-and-pain";
import WeightAndRep from "./weight-and-rep";
interface ActionSheetProps {
  set?: ExerciseSet | null;
  exercise?: Exercise | null;
  coachPrescription?: string;
  key_cues?: string[];
}
const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const ActionSheet = forwardRef<BottomSheetModal, ActionSheetProps>(
  (props, ref) => {
    const { colors } = useTheme();
    const { set, exercise, coachPrescription } = props;
    const [weight, setWeight] = useState(set?.weight ?? 0);

    const [reps, setReps] = useState(set?.reps ?? 0);
    const snapPoints = useMemo(() => ["50%", "90%"], []);

    const [limitingFactor, setLimitingFactor] = useState("");
    const [wasMiss, setWasMiss] = useState(false);
    const [failLocation, setFailLocation] = useState("");
    const [missedWhere, setMissedWhere] = useState("");
    const [barSpeed, setBarSpeed] = useState("Poor");
    const [positionQuality, setPositionQuality] = useState("Poor");
    const [primaryLimitingFactor, setPrimaryLimitingFactor] = useState<
      string | null
    >(null);
    const [painLevel, setPainLevel] = useState<string>("None");
    const painLevelTextMap: Record<string, string> = {
      None: "Normal soreness",
      Minor: "Sore but manageable",
      Moderate: "Affecting my technique",
      Sharp: "Can't lift safely",
    };
    const days = useSelector((state: RootState) => state.training.days);

    const [wasPain, setWasPain] = useState(false);
    const [wherePain, setWherePain] = useState("");
    const todayKey = DAY_KEYS[new Date().getDay()];
    const { showSuccess, showError } = useToast();
    const [updateTraining, { isLoading }] = useUpdateTrainingDataMutation();

    useEffect(() => {
      if (set) {
        setWeight(set.weight);
        setReps(set.reps);
        setBarSpeed(set.bar_speed ?? "Poor");
        setPositionQuality(set.position_quality ?? "Poor");
        setWasMiss(set.was_it_a_miss ?? false);
        setFailLocation(set.where_did_it_fail ?? "");
        setMissedWhere(set.missed_where ?? "");
        setWasPain(set.any_pain_or_discomfort ?? false);
        setPainLevel(set.pain_level ?? "None");
        setWherePain(set.pain_where?.[0] ?? "");
      }
    }, [set]);
    useEffect(() => {
      if (positionQuality !== "Poor") {
        setPrimaryLimitingFactor(null);
      }
    }, [positionQuality]);
    useEffect(() => {
      if (!wasMiss) {
        setFailLocation("");
        setMissedWhere("");
      }
    }, [wasMiss]);

    useEffect(() => {
      if (!wasPain) {
        setWherePain("");
        setPainLevel("None");
      }
    }, [wasPain]);

    const handlePress = async () => {
      if (!exercise) return;
      const payload: UpdateTrainingPayload = {
        day: todayKey,
        exercises: [
          {
            exercise_name: exercise.exercise_name,

            no_of_set: exercise.no_of_set,
            sets: [
              {
                set_number: set?.set_number ?? 1,
                weight,
                reps,
                rpm_percent: set?.rpm_percent ?? 0,
                bar_speed: barSpeed,
                position_quality: positionQuality,
                was_it_a_miss: wasMiss,
                where_did_it_fail: failLocation,
                missed_where: missedWhere,
                any_pain_or_discomfort: wasPain,
                pain_level: painLevel,
                pain_where: wherePain ? [wherePain] : [],
              },
            ],
          },
        ],
      };

      try {
        await updateTraining(payload).unwrap();
        (showSuccess("Set updated successfully", ""),
          (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss());
      } catch (error) {
        console.error("Update training error:", error);
      }
    };
    const styles = StyleSheet.create({
      contentContainer: {
        flex: 1,
        backgroundColor: colors.background,
        padding: scale(10),
        marginBottom: scale(12),
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: scale(6),
      },
      profile: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        marginRight: scale(10),
      },
      userInfo: {
        flex: 1,
      },
      name: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
      },
      userName: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.textSecondary,
      },
      optionIcon: {
        width: scale(12),
        height: scale(15),
      },
      prescriptionContainer: {
        backgroundColor: colors.lightBlue,
        borderRadius: scale(15),
        borderWidth: scale(1),
        borderColor: colors.primary,
        paddingHorizontal: scale(12),
        paddingVertical: scale(8),
        gap: scale(5),
        marginTop: scale(15),
        marginBottom: scale(10),
      },
      prescriptionText: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.textSecondary,
      },
      coachText: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.medium,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
      },
      weightRowContainer: {
        flexDirection: "row",
        gap: scale(8),
        marginTop: scale(9),
      },
      weight: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
      },
      unit: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.textSecondary,
      },
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      scrollContent: {
        paddingVertical: scale(15),
        paddingHorizontal: scale(14),
        gap: scale(16),
      },
      keyContainer: {
        backgroundColor: colors.semiLightBlue,
        borderColor: colors.primary,
        borderWidth: scale(1),
        borderRadius: scale(15),
        paddingHorizontal: scale(13),
        paddingVertical: scale(10),
      },
      dotContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(5),
      },
      keyCues: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.medium,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
      },
      dot: {
        backgroundColor: colors.primary,
        width: scale(5),
        height: scale(5),
        borderRadius: scale(5),
      },
      point: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
        color: colors.text,
      },
      centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: scale(12),
        paddingHorizontal: scale(24),
      },
    });
    if (isLoading) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.text }}
      >
        <BottomSheetScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={Images.profile} style={styles.profile} />
            <View style={styles.userInfo}>
              <View
                style={{
                  flexDirection: "row",
                  gap: scale(7),
                  alignItems: "center",
                }}
              >
                <Text style={styles.userName}>VIDEO UPLOADED </Text>
              </View>

              <Text style={styles.name}>{exercise?.exercise_name}</Text>
            </View>
            <TouchableOpacity>
              <Image
                source={Images.optionicon}
                style={styles.optionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.prescriptionContainer}>
            <Text style={styles.coachText}>COACHES PRESCRIPTION</Text>
            <Text style={styles.prescriptionText}>
              {set?.coach_prescription ?? ""}
            </Text>
            <View style={styles.keyContainer}>
              <Text style={styles.keyCues}>KEY CUES</Text>
              <View style={{ padding: scale(6), gap: scale(5) }}>
                {(set?.key_cues ?? []).map((cue, index) => (
                  <View key={index} style={styles.dotContainer}>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.point}>{cue}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.weightRowContainer}>
              <Text style={styles.weight}>
                {set?.weight ?? 0}
                <Text style={styles.unit}> kg</Text>
              </Text>
              <Text style={styles.weight}>
                {set?.rpm_percent ?? 0}{" "}
                <Text style={styles.unit}>% of 1 RM</Text>
              </Text>
            </View>
          </View>
          <View style={{ gap: scale(12) }}>
            <WeightAndRep
              weight={weight}
              onWeightChange={setWeight}
              reps={reps}
              onRepsChange={setReps}
            />
            <LiftAnalysis
              barSpeed={barSpeed}
              onBarSpeedChange={setBarSpeed}
              positionQuality={positionQuality}
              onPositionQualityChange={setPositionQuality}
              primaryLimitingFactor={primaryLimitingFactor}
              onPrimaryLimitingFactorChange={setPrimaryLimitingFactor}
            />

            <MissAndPain
              wasMiss={wasMiss}
              onWasMissChange={setWasMiss}
              failLocation={failLocation}
              onFailLocationChange={setFailLocation}
              missedWhere={missedWhere}
              onMissedWhereChange={setMissedWhere}
              painLevel={painLevel}
              onPainLevelChange={setPainLevel}
              painLevelTextMap={painLevelTextMap}
              wherePain={wherePain}
              onWherePainChange={setWherePain}
              wasPain={wasPain}
              onWasPainChange={setWasPain}
            />
            <CustomButton
              title={isLoading ? "SAVING" : "SAVE"}
              onPress={handlePress}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default ActionSheet;
