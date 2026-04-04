import { Images } from "@/assets";
import PostVisibility from "@/components/post-visibility";
import SessionDetail from "@/components/session-detail";
import CustomInput from "@/constants/custom-input";
import ActionButtonsRow from "@/constants/custom-row-buttons";
import { useToast } from "@/context/toast-context";
import { useCreateNewPostMutation } from "@/store/api";
import { Exercise } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { getFirstError } from "@/utils/get-error";
import { createPostSchema } from "@/utils/validation-schemas";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { InferType } from "yup";

/* ── Types ──────────────────────────────────────────── */

type CreatePostFormValues = InferType<typeof createPostSchema>;
type PostVisibilityType = "public" | "private";

interface SetVideo {
  setNumber: number;
  videoUri: string;
  thumbnailUri?: string;
  weight?: number;
  rpmPercent?: number;
  barSpeed?: string;
  positionQuality?: string;
}

/* ── Constants ──────────────────────────────────────── */

const LIFT_NAME_OPTIONS = [
  "Snatch",
  "Clean & Jerk",
  "Power Snatch",
  "Clean",
  "Power Clean",
  "Back Squat",
  "Front Squat",
  "Overhead Squat",
  "Strict Press",
  "Push Press",
  "Power Jerk",
  "Jerk",
];

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/* ── Component ──────────────────────────────────────── */

export default function CreateNewPost() {
  const params = useLocalSearchParams();
  const { showSuccess, showError } = useToast();
  const [createPost, { isLoading }] = useCreateNewPostMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const days = useSelector((state: RootState) => state.training.days);

  /* ── Route params (from training-exercise) ── */
  const exerciseName = params.exerciseName as string | undefined;
  const setsWithVideoParam = params.setsWithVideo as string | undefined;
  const setsWithVideo: SetVideo[] = useMemo(() => {
    if (!setsWithVideoParam) return [];
    try {
      return JSON.parse(setsWithVideoParam);
    } catch (e) {
      return [];
    }
  }, [setsWithVideoParam]);

  /* ── Mode detection ── */
  const isStandalone = !exerciseName && setsWithVideo.length === 0;

  /* ── Video state ── */
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  /* ── Selected set (for multi-set posts from training) ── */
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const selectedVideo = setsWithVideo[selectedSetIndex] ?? null;

  /* ── Manual / standalone state ── */
  const [manualLiftName, setManualLiftName] = useState("");
  const [manualWeight, setManualWeight] = useState("");
  const [selectedOpt, setSelectedOpt] = useState<string>("");

  /* ── Workout selector state ── */
  const workoutSheetRef = useRef<BottomSheetModal>(null);
  const workoutSnapPoints = useMemo(() => ["50%", "85%"], []);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [filledFromWorkout, setFilledFromWorkout] = useState(false);

  /* ── Visibility ── */
  const [visibility, setVisibility] = useState<PostVisibilityType>("public");

  /* ── Session pills ── */
  const sessionPills = useMemo(() => {
    if (!selectedVideo && !filledFromWorkout) return [];
    const pills: { key: string; label: string }[] = [];
    const w = selectedVideo?.weight ?? (manualWeight ? Number(manualWeight) : 0);
    const rpm = selectedVideo?.rpmPercent ?? 0;
    const speed = selectedVideo?.barSpeed ?? "";
    const position = selectedVideo?.positionQuality ?? "";

    if (w > 0) pills.push({ key: "weight", label: `${w} kg` });
    if (rpm > 0) pills.push({ key: "rpm", label: `${rpm}% 1RM` });
    if (speed) pills.push({ key: "speed", label: `Speed: ${speed}` });
    if (position) pills.push({ key: "position", label: `Pos: ${position}` });
    return pills;
  }, [selectedVideo, filledFromWorkout, manualWeight]);

  /* ── Training days for workout selector ── */
  const trainingDays = useMemo(() => {
    if (!days) return [];
    return Object.entries(days)
      .filter(([, day]) => day.type === "training" && day.exercises?.length > 0)
      .map(([key, day]) => ({
        key,
        label: DAY_LABELS[key] ?? key,
        exercises: day.exercises,
      }));
  }, [days]);

  /* ── Derived values ── */
  const liftName = exerciseName ?? (manualLiftName || "EXERCISE");
  const liftWeight = selectedVideo?.weight ?? (manualWeight ? Number(manualWeight) : 0);
  const setsCount = setsWithVideo.length > 0 ? setsWithVideo.length : 0;
  const showManualInputs = isStandalone && !filledFromWorkout;

  /* ── Form ── */
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: yupResolver(createPostSchema),
    defaultValues: {
      video: "",
      liftName: "",
      opinion: "",
      loadLifted: "0",
      contextEnabled: false,
      contextValue: "",
      intentEnabled: false,
      intentValue: "",
      effortEnabled: false,
      effortRating: 0,
    },
  });

  useEffect(() => {
    const firstError = getFirstError(errors);
    if (firstError) showError(firstError);
  }, [errors]);

  /* ── Generate thumbnails for sets ── */
  useEffect(() => {
    setsWithVideo.forEach(async (sv, i) => {
      if (!sv.thumbnailUri && sv.videoUri) {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(sv.videoUri, { time: 1000 });
          setsWithVideo[i].thumbnailUri = uri;
        } catch (e) {}
      }
    });
  }, [setsWithVideo]);

  /* ── Handlers ── */
  const handleBackPress = () => router.push("/(tabs)/home");

  const pickVideo = async () => {
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
      setLoadingMedia(true);
      const uri = result.assets[0].uri;
      setVideoUri(uri);
      setValue("video", uri);
      try {
        const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(uri, { time: 1000 });
        setThumbnailUri(thumb);
      } catch (e) {
        console.log("Thumbnail error:", e);
      } finally {
        setLoadingMedia(false);
      }
    }
  };

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setManualLiftName(exercise.exercise_name);
    const topSet = exercise.sets?.reduce(
      (max, s) => (s.weight > max.weight ? s : max),
      exercise.sets[0],
    );
    if (topSet) {
      setManualWeight(String(topSet.weight));
    }
    setSelectedOpt(exercise.exercise_name);
    setValue("liftName", exercise.exercise_name);
    setValue("loadLifted", String(topSet?.weight ?? 0));
    setFilledFromWorkout(true);
    workoutSheetRef.current?.dismiss();
  }, [setValue]);

  const handleClearWorkout = () => {
    setFilledFromWorkout(false);
    setManualLiftName("");
    setManualWeight("");
    setSelectedOpt("");
    setValue("liftName", "");
    setValue("loadLifted", "0");
  };

  const onSubmit = async (data: CreatePostFormValues) => {
    const activeVideo = selectedVideo?.videoUri ?? videoUri;
    if (!activeVideo) {
      showError("Please select a video");
      return;
    }

    const formData = new FormData();
    formData.append("video", {
      uri: activeVideo,
      type: "video/mp4",
      name: "post-video.mp4",
    } as any);

    const session_detail: any = {
      lifted_kg: Number(data.loadLifted),
      context: data.contextEnabled,
    };
    if (data.effortEnabled) {
      session_detail.isEffort = true;
      session_detail.effort_value = data.effortRating;
    }
    if (data.intentEnabled) {
      session_detail.isIntent = true;
      session_detail.intent_opt = data.intentValue;
    }

    const payload = {
      lift_name: selectedOpt || manualLiftName,
      opinion: data.opinion,
      session_detail,
      is_public: visibility === "public",
      is_private: visibility === "private",
      username: user?.username,
      name: user?.name,
    };

    formData.append("data", JSON.stringify(payload));

    try {
      await createPost({ formData }).unwrap();
      showSuccess("Post created!", "");
      router.push("/(tabs)/home");
    } catch (error: any) {
      console.error("Create post error:", error);
      showError("Failed to create post");
    }
  };

  /* ── Active video URI (training-linked vs standalone) ── */
  const activeVideoUri = selectedVideo?.videoUri ?? videoUri;
  const activeThumbnailUri = selectedVideo?.thumbnailUri ?? thumbnailUri;

  /* ── Render ── */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <BottomSheetModalProvider>
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={Images.arrowBack}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>NEW POST</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.previewTopRow}>
            {/* Left column: info */}
            <View style={styles.previewInfoCol}>
              {/* User header */}
              <View style={styles.userRow}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(user?.name ?? "U")[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{user?.name ?? "You"}</Text>
                  <Text style={styles.userHandle}>@{user?.username ?? "user"}</Text>
                </View>
              </View>

              {/* Lift name */}
              <Text style={styles.liftNameHero}>{liftName}</Text>

              {/* Weight display */}
              {liftWeight > 0 && (
                <Text style={styles.weightHero}>
                  {liftWeight}
                  <Text style={styles.weightUnit}> kg</Text>
                </Text>
              )}

              {/* Preview chips */}
              {sessionPills.length > 0 && (
                <View style={styles.previewChipRow}>
                  {sessionPills.map((pill) => (
                    <View key={pill.key} style={styles.previewChip}>
                      <Text style={styles.previewChipText}>{pill.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Right column: video thumbnail */}
            <View style={styles.previewVideoCol}>
              {activeVideoUri ? (
                <View style={styles.videoContainer}>
                  {activeThumbnailUri ? (
                    <Image
                      source={{ uri: activeThumbnailUri }}
                      style={styles.videoPreview}
                    />
                  ) : (
                    <View style={[styles.videoPreview, styles.videoPlaceholder]}>
                      <Text style={styles.videoPlaceholderText}>No preview</Text>
                    </View>
                  )}
                  <View style={styles.playOverlay}>
                    <Image source={Images.play} style={styles.playIcon} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.videoContainer, styles.videoEmpty]}
                  onPress={pickVideo}
                  activeOpacity={0.7}
                >
                  {loadingMedia ? (
                    <ActivityIndicator size="small" color={olyPalette.primary} />
                  ) : (
                    <View style={styles.emptyVideoContent}>
                      <Image source={Images.uploadicon} style={styles.uploadIcon} />
                      <Text style={styles.uploadText}>Add video</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* Mini set thumbnails */}
              {setsWithVideo.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.miniThumbScroll}
                  contentContainerStyle={styles.miniThumbContainer}
                >
                  {setsWithVideo.map((sv, i) => (
                    <TouchableOpacity
                      key={sv.setNumber}
                      style={[
                        styles.miniThumb,
                        i === selectedSetIndex && styles.miniThumbActive,
                      ]}
                      onPress={() => {
                        setSelectedSetIndex(i);
                        setIsPlaying(false);
                      }}
                      activeOpacity={0.7}
                    >
                      {sv.thumbnailUri ? (
                        <Image
                          source={{ uri: sv.thumbnailUri }}
                          style={styles.miniThumbImage}
                        />
                      ) : (
                        <Text style={styles.miniThumbText}>S{sv.setNumber}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Standalone: change video button */}
          {isStandalone && activeVideoUri && (
            <TouchableOpacity
              style={styles.changeVideoButton}
              onPress={pickVideo}
              activeOpacity={0.7}
            >
              <Text style={styles.changeVideoText}>CHANGE VIDEO</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Standalone: Select from workout OR manual inputs ── */}
        {isStandalone && !filledFromWorkout && (
          <TouchableOpacity
            style={styles.workoutSelectorButton}
            onPress={() => workoutSheetRef.current?.present()}
            activeOpacity={0.7}
          >
            <Text style={styles.workoutSelectorText}>SELECT FROM A WORKOUT</Text>
          </TouchableOpacity>
        )}

        {filledFromWorkout && (
          <TouchableOpacity
            style={styles.clearWorkoutButton}
            onPress={handleClearWorkout}
            activeOpacity={0.7}
          >
            <Text style={styles.clearWorkoutText}>
              Filled from workout
            </Text>
            <Text style={styles.clearWorkoutAction}>Clear</Text>
          </TouchableOpacity>
        )}

        {/* ── Manual inputs (standalone, no workout selected) ── */}
        {showManualInputs && (
          <>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>LIFT NAME</Text>
              <View style={styles.chipsContainer}>
                {LIFT_NAME_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.chip,
                      selectedOpt === opt && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setSelectedOpt(opt);
                      setManualLiftName(opt);
                      setValue("liftName", opt);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedOpt === opt && styles.chipTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.weightInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>WEIGHT</Text>
                <View style={styles.weightInputContainer}>
                  <TextInput
                    style={styles.weightInput}
                    value={manualWeight}
                    onChangeText={(v) => {
                      setManualWeight(v);
                      setValue("loadLifted", v);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={olyColors.text.disabled}
                  />
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitBadgeText}>kg</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── Lift name chips (training-linked or workout-filled) ── */}
        {!showManualInputs && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>LIFT NAME</Text>
            <View style={styles.chipsContainer}>
              {LIFT_NAME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chip,
                    (selectedOpt === opt || liftName === opt) && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setSelectedOpt(opt);
                    setValue("liftName", opt);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      (selectedOpt === opt || liftName === opt) && styles.chipTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Opinion ── */}
        <Controller
          control={control}
          name="opinion"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="OPINION"
              placeholder="Missed behind, felt slow off the floor, shoulder tight but we're still grinding baby"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />

        {/* ── Session Detail ── */}
        <SessionDetail
          loadLifted={watch("loadLifted")}
          onLoadLiftedChange={(value: string) =>
            setValue("loadLifted", value, { shouldDirty: true })
          }
          contextEnabled={watch("contextEnabled")}
          onContextEnabledChange={(value: boolean) =>
            setValue("contextEnabled", value, { shouldDirty: true })
          }
          contextValue={watch("contextValue")}
          onContextValueChange={(value: string) =>
            setValue("contextValue", value, { shouldDirty: true })
          }
          intentEnabled={watch("intentEnabled")}
          onIntentEnabledChange={(value: boolean) =>
            setValue("intentEnabled", value, { shouldDirty: true })
          }
          intentValue={watch("intentValue")}
          onIntentValueChange={(value: string) =>
            setValue("intentValue", value, { shouldDirty: true })
          }
          effortEnabled={watch("effortEnabled")}
          onEffortEnabledChange={(value: boolean) =>
            setValue("effortEnabled", value, { shouldDirty: true })
          }
          effortRating={watch("effortRating")}
          onEffortRatingChange={(value: number) =>
            setValue("effortRating", value, { shouldDirty: true })
          }
        />

        {/* ── Post Visibility ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>POST VISIBILITY</Text>
          <PostVisibility
            title="JUST ME"
            description="Saved privately"
            checked={visibility === "private"}
            onToggle={() => setVisibility("private")}
            icon={Images.privateicon}
          />
          <PostVisibility
            title="PUBLIC"
            description="Shared with your friends"
            checked={visibility === "public"}
            onToggle={() => setVisibility("public")}
            icon={Images.publicicon}
          />
        </View>

        {/* ── Action Buttons ── */}
        <ActionButtonsRow
          onPrimaryPress={handleSubmit(onSubmit)}
          primaryTitle={isLoading ? "CREATING..." : "POST"}
          secondaryTitle="CANCEL"
        />
      </ScrollView>

      {/* ── Loading overlay ── */}
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={olyPalette.primary} />
        </View>
      )}

      {/* ── Workout Selector Bottom Sheet ── */}
      <BottomSheetModal
        ref={workoutSheetRef}
        snapPoints={workoutSnapPoints}
        backgroundStyle={{ backgroundColor: olyPalette.card }}
        handleIndicatorStyle={{ backgroundColor: olyColors.text.disabled }}
      >
        <BottomSheetScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sheetTitle}>SELECT FROM A WORKOUT</Text>
          <Text style={styles.sheetSubtitle}>
            Choose a training day and exercise to auto-fill your post
          </Text>

          {trainingDays.length === 0 ? (
            <View style={styles.sheetEmpty}>
              <Text style={styles.sheetEmptyText}>
                No training sessions found
              </Text>
            </View>
          ) : (
            <View style={styles.sheetDayList}>
              {trainingDays.map(({ key, label, exercises }) => (
                <View key={key}>
                  {/* Day row */}
                  <TouchableOpacity
                    style={styles.dayRow}
                    onPress={() =>
                      setExpandedDay(expandedDay === key ? null : key)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dayLabel}>{label}</Text>
                    <Text style={styles.dayExCount}>
                      {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
                    </Text>
                  </TouchableOpacity>

                  {/* Expanded exercise list */}
                  {expandedDay === key &&
                    exercises.map((exercise) => {
                      const topWeight = exercise.sets?.reduce(
                        (max, s) => Math.max(max, s.weight),
                        0,
                      ) ?? 0;
                      return (
                        <TouchableOpacity
                          key={exercise.exercise_name}
                          style={styles.exerciseRow}
                          onPress={() => handleSelectExercise(exercise)}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.exerciseName}>
                              {exercise.exercise_name}
                            </Text>
                            <Text style={styles.exerciseMeta}>
                              {exercise.no_of_set} sets · Top: {topWeight} kg
                            </Text>
                          </View>
                          <Text style={styles.selectText}>Select</Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ))}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
    </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: olyPalette.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: olyLayout.navBarHeight,
    position: "relative",
    backgroundColor: olyPalette.background,
  },
  backButton: {
    position: "absolute",
    left: olyLayout.screenPadding,
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 12,
    height: 12,
    tintColor: olyColors.text.primary,
  },
  headerText: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },

  /* Scroll */
  scrollContent: {
    paddingVertical: olySpacing[16],
    paddingHorizontal: olyLayout.screenPadding,
    gap: olySpacing[16],
  },

  /* Hero card */
  heroCard: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    gap: olySpacing[12],
  },
  previewTopRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  previewInfoCol: {
    flex: 1,
    gap: olySpacing[8],
  },
  previewVideoCol: {
    width: 90,
    gap: olySpacing[8],
    alignItems: "center",
  },

  /* User row */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.bg.activeHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  userName: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  userHandle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Lift info */
  liftNameHero: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    textTransform: "capitalize",
  },
  weightHero: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  weightUnit: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Preview chips */
  previewChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[4],
  },
  previewChip: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    paddingHorizontal: olySpacing[8],
    paddingVertical: olySpacing[4],
  },
  previewChipText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Video preview */
  videoContainer: {
    width: 90,
    height: 120,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  videoEmpty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: olyColors.border.brandUnselected,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholderText: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.bg.overlay,
  },
  playIcon: {
    width: 24,
    height: 24,
    tintColor: olyPalette.white,
  },
  emptyVideoContent: {
    alignItems: "center",
    gap: olySpacing[4],
  },
  uploadIcon: {
    width: 24,
    height: 24,
    tintColor: olyColors.text.secondary,
  },
  uploadText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Mini thumbnails */
  miniThumbScroll: {
    maxHeight: 28,
  },
  miniThumbContainer: {
    flexDirection: "row",
    gap: olySpacing[4],
  },
  miniThumb: {
    width: 24,
    height: 24,
    borderRadius: olyRadius.sm,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  miniThumbActive: {
    borderColor: olyPalette.primary,
  },
  miniThumbImage: {
    width: "100%",
    height: "100%",
    borderRadius: olyRadius.sm,
  },
  miniThumbText: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    fontSize: 12,
  },

  /* Change video button */
  changeVideoButton: {
    alignSelf: "flex-start",
  },
  changeVideoText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },

  /* Workout selector button */
  workoutSelectorButton: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    height: olyLayout.gymTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutSelectorText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Clear workout */
  clearWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brand,
    height: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
  },
  clearWorkoutText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  clearWorkoutAction: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Section blocks */
  sectionBlock: {
    gap: olySpacing[8],
  },
  sectionLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },

  /* Lift name chips */
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  chip: {
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[8],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    backgroundColor: olyColors.bg.activeHighlight,
  },
  chipSelected: {
    backgroundColor: olyColors.bg.cardSelected,
    borderColor: olyColors.border.brand,
  },
  chipText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  chipTextSelected: {
    color: olyColors.text.primary,
  },

  /* Weight input */
  weightInputRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    height: olyLayout.inputHeight,
    paddingHorizontal: olySpacing[16],
    gap: olySpacing[8],
  },
  weightInput: {
    flex: 1,
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  unitBadge: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[8],
    paddingVertical: olySpacing[4],
  },
  unitBadgeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  /* Loading overlay */
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  /* ── Bottom Sheet ── */
  sheetContent: {
    flex: 1,
    padding: olyLayout.screenPadding,
  },
  sheetTitle: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: olySpacing[4],
  },
  sheetSubtitle: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginBottom: olySpacing[24],
  },
  sheetEmpty: {
    alignItems: "center",
    paddingVertical: olySpacing[40],
  },
  sheetEmptyText: {
    ...olyTypography.body,
    color: olyColors.text.disabled,
  },
  sheetDayList: {
    gap: olySpacing[4],
  },

  /* Day rows */
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: olyPalette.cardElevated,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[16],
    minHeight: olyLayout.gymTouchTarget,
  },
  dayLabel: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  dayExCount: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Exercise rows */
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olySpacing[16],
    paddingLeft: olySpacing[32],
    minHeight: olyLayout.minTouchTarget,
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  exerciseName: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    textTransform: "capitalize",
  },
  exerciseMeta: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  selectText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.primary,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
  },
});
