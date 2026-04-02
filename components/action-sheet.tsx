import CustomButton from "@/constants/custom-button";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { useToast } from "@/context/toast-context";
import { useUpdateTrainingDataMutation } from "@/store/api";
import { Exercise, ExerciseSet } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { UpdateTrainingPayload } from "@/types/api/dashboard";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    const { set, exercise, coachPrescription } = props;
    const [weight, setWeight] = useState(set?.weight ?? 0);
    const [reps, setReps] = useState(set?.reps ?? 0);
    const snapPoints = useMemo(() => ["95%"], []);

    const [limitingFactor, setLimitingFactor] = useState("");
    const [wasMiss, setWasMiss] = useState(false);
    const [failLocation, setFailLocation] = useState("");
    const [missedWhere, setMissedWhere] = useState("");
    const [barSpeed, setBarSpeed] = useState("Good");
    const [positionQuality, setPositionQuality] = useState("Good");
    const [primaryLimitingFactor, setPrimaryLimitingFactor] = useState<
      string | null
    >(null);
    const [painLevel, setPainLevel] = useState<string>("None");
    const [setNotes, setSetNotes] = useState("");
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
    const selectedDayKey = useSelector(
      (state: RootState) => state.training.selectedDayKey,
    );
    const [updateTraining, { isLoading }] = useUpdateTrainingDataMutation();

    useEffect(() => {
      if (set) {
        setWeight(set.weight);
        setReps(set.reps);
        setBarSpeed(set.bar_speed ?? "Good");
        setPositionQuality(set.position_quality ?? "Good");
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
        day: selectedDayKey ?? "",
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
        const res = await updateTraining(payload).unwrap();
        showSuccess("Set updated successfully", "");
        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
      } catch (error) {
        console.error("Update training error:", error);
      }
    };

    const handleUploadPost = () => {
      router.push({
        pathname: "/athlete/create-new-post",
        params: {
          weight: set?.weight ?? 0,
          exerciseName: exercise?.exercise_name ?? "",
          intent: set?.intent,
          context: set?.context,
        },
      });
    };

    /* Build subtitle: exercise name · reps */
    const subtitle = [
      exercise?.exercise_name,
      set?.reps ? `${set.reps} reps` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: olyPalette.background }}
        handleIndicatorStyle={{ backgroundColor: olyColors.text.secondary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.7}
          />
        )}
      >
        <BottomSheetScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Loader */}
          {isLoading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={olyPalette.primary} />
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.setTitle}>SET {set?.set_number ?? 1}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
              }
              hitSlop={12}
            >
              <Ionicons
                name="close"
                size={22}
                color={olyColors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Weight & Reps */}
          <WeightAndRep
            weight={weight}
            onWeightChange={setWeight}
            reps={reps}
            onRepsChange={setReps}
            prescribedWeight={set?.weight}
            prescribedRpm={set?.rpm_percent}
            prescribedReps={set?.reps ? String(set.reps) : undefined}
          />

          {/* Lift Analysis */}
          <LiftAnalysis
            barSpeed={barSpeed}
            onBarSpeedChange={setBarSpeed}
            positionQuality={positionQuality}
            onPositionQualityChange={setPositionQuality}
            primaryLimitingFactor={primaryLimitingFactor}
            onPrimaryLimitingFactorChange={setPrimaryLimitingFactor}
          />

          {/* Miss & Pain */}
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
            wasPain={wasPain}
            onWasPainChange={setWasPain}
            wherePain={wherePain}
            onWherePainChange={setWherePain}
          />

          {/* Set Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>SET NOTES</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add a note (optional)"
              placeholderTextColor={olyColors.text.disabled}
              value={setNotes}
              onChangeText={setSetNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Upload Video */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPost}
            activeOpacity={0.7}
          >
            <Ionicons
              name="videocam-outline"
              size={18}
              color={olyColors.text.primary}
            />
            <Text style={styles.uploadText}>UPLOAD VIDEO</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>

        {/* Sticky Save CTA */}
        <View style={styles.stickyFooter}>
          <CustomButton
            title={isLoading ? "SAVING..." : "SAVE SET"}
            onPress={handlePress}
          />
        </View>
      </BottomSheetModal>
    );
  },
);

export default ActionSheet;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: olyPalette.background,
  },
  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[32],
    gap: olySpacing[16],
  },

  /* Loader */
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: olyColors.bg.overlay,
    zIndex: 999,
    borderRadius: olyRadius.lg,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: olySpacing[12],
  },
  headerInfo: {
    flex: 1,
    gap: olySpacing[4],
  },
  setTitle: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  subtitle: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Set Notes */
  notesSection: {
    gap: olySpacing[8],
  },
  notesLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  notesInput: {
    ...olyTypography.bodySmall,
    color: olyColors.text.primary,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    padding: olyLayout.cardPadding,
    minHeight: 72,
  },

  /* Upload Video */
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderStyle: "dashed",
    borderRadius: olyRadius.full,
    paddingVertical: olySpacing[12],
  },
  uploadText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Sticky footer */
  stickyFooter: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[32],
    borderTopWidth: 1,
    borderTopColor: olyColors.border.default,
    backgroundColor: olyPalette.background,
  },
});
