import { Images } from "@/assets";
import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { Exercise, ExerciseSet } from "@/store/reducer/trainingSlice";
import { Typography } from "@/utils/custom-styles";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
import LiftAnalysis from "./lift-analysis";
import MissAndPain from "./miss-and-pain";
import WeightAndRep from "./weight-and-rep";
interface ActionSheetProps {
  set?: ExerciseSet | null;
  exercise?: Exercise | null;
  coachPrescription?: string;
  keyCues?: string[];
}

const ActionSheet = forwardRef<BottomSheetModal, ActionSheetProps>(
  (props, ref) => {
    const { colors } = useTheme();
    const { set, exercise, coachPrescription, keyCues } = props;
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

    const [wasPain, setWasPain] = useState(false);

    const [wherePain, setWherePain] = useState("");
    useEffect(() => {
      if (set) {
        setWeight(set.weight);
        setReps(set.reps);
      }
    }, [set]);
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
    });

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

              <Text style={styles.name}>PAUSE POWER SNATCH..</Text>
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
              {coachPrescription ?? ""}
            </Text>
            <View style={styles.keyContainer}>
              <Text style={styles.keyCues}>KEY CUES</Text>
              <View style={{ padding: scale(6), gap: scale(5) }}>
                {(keyCues ?? []).map((cue, index) => (
                  <View key={index} style={styles.dotContainer}>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.point}>{cue}</Text>
                  </View>
                ))}
                <View style={styles.dotContainer}>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.point}>Fast elbows in the catch</Text>
                </View>
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
            <CustomButton title="SAVE" />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

export default ActionSheet;
