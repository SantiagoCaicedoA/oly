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
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
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
  videosMap?: Record<number, string>;
  onSaved?: (setNumber: number) => void;
  onVideoChange?: (setNumber: number, uri: string | null) => void;
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
    const { set, exercise, coachPrescription, videosMap, onSaved, onVideoChange } = props;
    const [weight, setWeight] = useState(set?.weight ?? 0);
    const [reps, setReps] = useState(set?.reps ?? 0);
    const snapPoints = useMemo(() => ["95%"], []);

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
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    const videoRef = useRef<Video>(null);
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
        const existingVideo = videosMap?.[set.set_number] ?? null;
        setVideoUri(existingVideo);
        if (existingVideo) {
          VideoThumbnails.getThumbnailAsync(existingVideo, { time: 500 })
            .then((thumb) => setThumbnailUri(thumb.uri))
            .catch(() => setThumbnailUri(null));
        } else {
          setThumbnailUri(null);
        }
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
      if (!exercise) return; // only the single set being edited. Therefore, this handler MUST perform a merge/upsert
      // by \`set_number\`, rather than a full array replacement, to avoid wiping out other sets.
      // IMPORTANT: The frontend (e.g., action-sheet.tsx) often sends partial updates containing
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
        await updateTraining(payload).unwrap();
        (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
        onSaved?.(set?.set_number ?? 1);
      } catch (_e) {
        showError("Couldn't save — check your connection");
      }
    };

    const handleUploadVideo = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showError("Please allow access to your media library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 30,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setVideoUri(uri);
        if (set) onVideoChange?.(set.set_number, uri);
        try {
          const thumb = await VideoThumbnails.getThumbnailAsync(uri, { time: 500 });
          setThumbnailUri(thumb.uri);
        } catch (_e) {
          setThumbnailUri(null);
        }
      }
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
          {!videoUri ? (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadVideo}
              activeOpacity={0.7}
            >
              <Ionicons
                name="videocam-outline"
                size={18}
                color={olyColors.text.secondary}
              />
              <Text style={styles.uploadText}>UPLOAD VIDEO</Text>
            </TouchableOpacity>
          ) : (
            <Pressable
              style={styles.videoPreviewCard}
              onPress={() => setIsPlayerVisible(true)}
            >
              {/* Thumbnail */}
              <View style={styles.videoThumbnailWrap}>
                {thumbnailUri ? (
                  <Image
                    source={{ uri: thumbnailUri }}
                    style={styles.videoThumbnail}
                  />
                ) : (
                  <View style={styles.videoThumbnailFallback} />
                )}
                {/* Gradient overlay */}
                <View style={styles.thumbnailOverlay} />

                {/* Play button */}
                <View style={styles.playButton}>
                  <Ionicons name="play" size={18} color={olyPalette.white} />
                </View>

                {/* Remove — top-right */}
                <Pressable
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert(
                      "Remove video?",
                      "You'll need to re-upload if you change your mind.",
                      [
                        { text: "Keep", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => {
                            setVideoUri(null);
                            setThumbnailUri(null);
                            if (set) onVideoChange?.(set.set_number, null);
                          },
                        },
                      ],
                    );
                  }}
                  hitSlop={olySpacing[8]}
                >
                  <Ionicons name="close" size={14} color={olyPalette.white} />
                </Pressable>
              </View>
            </Pressable>
          )}

          {/* Fullscreen Video Player */}
          <Modal
            visible={isPlayerVisible}
            animationType="fade"
            transparent
            statusBarTranslucent
            onRequestClose={() => setIsPlayerVisible(false)}
          >
            <Pressable
              style={styles.playerBackdrop}
              onPress={() => setIsPlayerVisible(false)}
            >
              <View style={styles.playerContainer}>
                <Video
                  ref={videoRef}
                  source={{ uri: videoUri ?? "" }}
                  style={styles.player}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isLooping
                  useNativeControls={false}
                />
              </View>
              <Pressable
                style={styles.playerClose}
                onPress={() => setIsPlayerVisible(false)}
                hitSlop={olySpacing[12]}
              >
                <Ionicons name="close" size={24} color={olyPalette.white} />
              </Pressable>
            </Pressable>
          </Modal>
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
    padding: olyLayout.cardPadding,
    minHeight: 72,
  },

  /* Upload Video */
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    height: olyLayout.minTouchTarget,
  },
  uploadText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Video preview */
  videoPreviewCard: {
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  videoThumbnailWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
    backgroundColor: olyPalette.card,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoThumbnailFallback: {
    flex: 1,
    backgroundColor: olyPalette.card,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  removeButton: {
    position: "absolute",
    top: olySpacing[8],
    right: olySpacing[8],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Fullscreen player */
  playerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    maxHeight: "80%",
  },
  player: {
    flex: 1,
  },
  playerClose: {
    position: "absolute",
    top: 60,
    right: 24,
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
