import { Images } from "@/assets";
import { useToast } from "@/context/toast-context";
import { useCreateNewPostMutation } from "@/store/api";
import { Exercise } from "@/store/reducer/trainingSlice";
import { RootState } from "@/store/store";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────── */

interface SetVideo {
  setNumber: number;
  videoUri: string;
  thumbnailUri?: string;
  weight?: number;
  rpmPercent?: number;
  barSpeed?: string;
  positionQuality?: string;
}

/* ── Constants ─────────────────────────────────────── */

const LIFT_NAME_OPTIONS = [
  "Snatch", "Clean & Jerk", "Power Snatch", "Clean",
  "Power Clean", "Back Squat", "Front Squat", "Overhead Squat",
  "Strict Press", "Push Press", "Power Jerk", "Jerk",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday",
  sunday: "Sunday",
};

const EFFORT_OPTIONS = ["Easy", "Moderate", "Hard", "Max"];

/* ── Size constants (not in design system — screen-specific) ── */
const THUMB_WIDTH = 110;
const THUMB_HEIGHT = 140;
const PLAY_SIZE = 32;
const MINI_THUMB_SIZE = 40;
const CHECK_SIZE = 20;
const ICON_SM = 14;
const ICON_MD = 16;
const ICON_LG = 20;

/* ── Component ─────────────────────────────────────── */

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
    try { return JSON.parse(setsWithVideoParam); }
    catch (e) { return []; }
  }, [setsWithVideoParam]);

  /* ── Mode ── */
  const isStandalone = !exerciseName && setsWithVideo.length === 0;

  /* ── State ── */
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const selectedVideo = setsWithVideo[selectedSetIndex] ?? null;

  const [manualLiftName, setManualLiftName] = useState("");
  const [manualWeight, setManualWeight] = useState(0);
  const [manualReps, setManualReps] = useState(1);
  const [manualRpm, setManualRpm] = useState(0);
  const [manualBarSpeed, setManualBarSpeed] = useState("");
  const [manualPosition, setManualPosition] = useState("");
  const [manualEffort, setManualEffort] = useState<string | null>(null);
  const [isPR, setIsPR] = useState(false);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"private" | "community">("community");
  const [sessionDataVisible, setSessionDataVisible] = useState(true);

  /* ── Workout selector ── */
  const workoutSheetRef = useRef<BottomSheetModal>(null);
  const workoutSnapPoints = useMemo(() => ["50%", "85%"], []);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [filledFromWorkout, setFilledFromWorkout] = useState(false);

  /* ── Show-on-post pills (toggleable) ── */
  const allPills = useMemo(() => {
    const pills: { key: string; label: string; value: string }[] = [];
    const w = selectedVideo?.weight ?? manualWeight;
    const rpm = selectedVideo?.rpmPercent ?? manualRpm;
    const speed = selectedVideo?.barSpeed ?? manualBarSpeed;
    const position = selectedVideo?.positionQuality ?? manualPosition;
    const setCount = setsWithVideo.length;

    if (w > 0) pills.push({ key: "weight", label: "Weight", value: `${w} kg` });
    if (manualReps > 1 || isStandalone) pills.push({ key: "reps", label: "Reps", value: `${manualReps}` });
    if (speed) pills.push({ key: "speed", label: "Bar Speed", value: speed });
    if (rpm > 0) pills.push({ key: "rpm", label: "Intensity", value: `${rpm}% 1RM` });
    if (position) pills.push({ key: "position", label: "Position", value: position });
    if (manualEffort) pills.push({ key: "effort", label: "Effort", value: manualEffort });
    if (isPR) pills.push({ key: "pr", label: "PR", value: "Personal Record" });
    if (setCount > 0) pills.push({ key: "sets", label: "Sets", value: `${setCount}` });
    return pills;
  }, [selectedVideo, manualWeight, manualReps, manualRpm, manualBarSpeed, manualPosition, manualEffort, isPR, setsWithVideo.length, isStandalone]);

  const [enabledPills, setEnabledPills] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    allPills.forEach((p) => { initial[p.key] = true; });
    setEnabledPills(initial);
  }, [allPills.length]);

  const togglePill = (key: string) => {
    setEnabledPills((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const previewPills = useMemo(() => {
    return allPills.filter((p) => enabledPills[p.key]);
  }, [allPills, enabledPills]);

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

  /* ── Generate thumbnails ── */
  const [thumbMap, setThumbMap] = useState<Record<number, string>>({});

  /* ── Derived ── */
  const liftName = exerciseName ?? (manualLiftName || "");
  const liftWeight = selectedVideo?.weight ?? manualWeight;
  const activeVideoUri = selectedVideo?.videoUri ?? videoUri;
  const activeThumbnailUri = (selectedVideo ? thumbMap[selectedVideo.setNumber] : null) ?? thumbnailUri;
  const showManualInputs = isStandalone && !filledFromWorkout;

  useEffect(() => {
    setsWithVideo.forEach((sv) => {
      if (!thumbMap[sv.setNumber] && sv.videoUri) {
        VideoThumbnails.getThumbnailAsync(sv.videoUri, { time: 1000 })
          .then(({ uri }) => {
            setThumbMap((prev) => ({ ...prev, [sv.setNumber]: uri }));
          })
          .catch((_e) => {});
      }
    });
  }, [setsWithVideo]);

  /* ── Handlers ── */
  const handleBackPress = () => router.back();

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
    if (exercise.sets?.length) {
      const topSet = exercise.sets.reduce(
        (max, s) => (s.weight > max.weight ? s : max),
        exercise.sets[0],
      );
      if (topSet) {
        setManualWeight(topSet.weight);
        setManualReps(topSet.reps ?? 1);
        setManualRpm(topSet.rpm_percent ?? 0);
        setManualBarSpeed(topSet.bar_speed ?? "");
        setManualPosition(topSet.position_quality ?? "");
      }
    }
    setFilledFromWorkout(true);
    workoutSheetRef.current?.dismiss();
  }, []);

  const handleClearWorkout = () => {
    setFilledFromWorkout(false);
    setManualLiftName("");
    setManualWeight(0);
    setManualReps(1);
    setManualRpm(0);
    setManualBarSpeed("");
    setManualPosition("");
  };

  const onSubmit = async () => {
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

    const payload = {
      lift_name: liftName,
      opinion: caption,
      session_detail: { lifted_kg: liftWeight },
      is_public: visibility === "community",
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

  /* ── Render ── */
  return (
    <GestureHandlerRootView style={st.container}>
      <BottomSheetModalProvider>
        <SafeAreaView style={st.safeArea}>
          {/* ── Header ── */}
          <View style={st.header}>
            <TouchableOpacity style={st.backBtn} onPress={handleBackPress}>
              <Image source={Images.arrowBack} style={st.backIcon} />
            </TouchableOpacity>
            <Text style={st.headerTitle}>
              {isStandalone ? "NEW POST" : "POST LIFT"}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={st.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Hero Card ── */}
            <View style={st.heroCard}>
              <View style={st.heroRow}>
                {/* Left column */}
                <View style={st.heroLeft}>
                  <View style={st.userRow}>
                    <View style={st.avatar}>
                      <Text style={st.avatarLetter}>
                        {(user?.name || "U")[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text style={st.userName}>{user?.name ?? "You"}</Text>
                    <Text style={st.userDot}>·</Text>
                    <Text style={st.userSub}>Today</Text>
                  </View>

                  <View style={st.liftBlock}>
                    {liftName ? (
                      <Text style={st.liftName}>{liftName.toUpperCase()}</Text>
                    ) : null}
                    {liftWeight > 0 && (
                      <View style={st.weightRow}>
                        <Text style={st.weightNum}>{liftWeight}</Text>
                        <Text style={st.weightUnit}>kg</Text>
                      </View>
                    )}
                  </View>

                  {previewPills.length > 0 && (
                    <View style={st.previewPillWrap}>
                      {previewPills.filter((p) => p.key !== "weight").map((pill) => (
                        <View key={pill.key} style={st.previewPill}>
                          <Text style={st.previewPillText}>{pill.label}: {pill.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Right column */}
                <View style={st.heroRight}>
                  {activeVideoUri ? (
                    <TouchableOpacity
                      style={st.thumbWrap}
                      onPress={isStandalone ? pickVideo : undefined}
                      activeOpacity={0.8}
                    >
                      {activeThumbnailUri ? (
                        <Image source={{ uri: activeThumbnailUri }} style={st.thumbImg} />
                      ) : (
                        <View style={[st.thumbImg, st.thumbEmpty]} />
                      )}
                      <View style={st.playOverlay}>
                        <Image source={Images.play} style={st.playIcon} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[st.thumbWrap, st.thumbDashed]}
                      onPress={pickVideo}
                      activeOpacity={0.7}
                    >
                      {loadingMedia ? (
                        <ActivityIndicator size="small" color={olyPalette.primary} />
                      ) : (
                        <View style={st.uploadContent}>
                          <Image source={Images.uploadicon} style={st.uploadIcon} />
                          <Text style={st.uploadText}>Add video</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}

                  {setsWithVideo.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={st.miniRow}
                    >
                      {setsWithVideo.map((sv, i) => (
                        <TouchableOpacity
                          key={sv.setNumber}
                          style={[st.miniThumb, i === selectedSetIndex && st.miniThumbActive]}
                          onPress={() => setSelectedSetIndex(i)}
                          activeOpacity={0.7}
                        >
                          {thumbMap[sv.setNumber] ? (
                            <Image source={{ uri: thumbMap[sv.setNumber] }} style={st.miniThumbImg} />
                          ) : (
                            <Text style={st.miniThumbText}>S{sv.setNumber}</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>

            {/* ── Standalone: workout selector + manual inputs ── */}
            {isStandalone && !filledFromWorkout && (
              <TouchableOpacity
                style={st.workoutBtn}
                onPress={() => workoutSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                <Text style={st.workoutBtnText}>SELECT FROM A WORKOUT</Text>
              </TouchableOpacity>
            )}

            {filledFromWorkout && (
              <TouchableOpacity style={st.filledBar} onPress={handleClearWorkout} activeOpacity={0.7}>
                <Text style={st.filledBarText}>Filled from workout</Text>
                <Text style={st.filledBarAction}>Clear</Text>
              </TouchableOpacity>
            )}

            {showManualInputs && (
              <>
                {/* Lift Name */}
                <View style={st.section}>
                  <Text style={st.sectionLabel}>LIFT NAME</Text>
                  <View style={st.chipCard}>
                    <View style={st.chipWrap}>
                      {LIFT_NAME_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          style={[st.liftChip, manualLiftName === opt && st.liftChipActive]}
                          onPress={() => setManualLiftName(opt)}
                          activeOpacity={0.7}
                        >
                          <Text style={[st.liftChipText, manualLiftName === opt && st.liftChipTextActive]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Weight & Reps Steppers */}
                <View style={st.stepperRow}>
                  <View style={st.stepperCol}>
                    <Text style={st.sectionLabel}>WEIGHT</Text>
                    <View style={st.stepperCard}>
                      <TouchableOpacity
                        style={st.stepperBtn}
                        onPress={() => setManualWeight((v) => Math.max(0, v - 5))}
                        activeOpacity={0.7}
                      >
                        <Text style={st.stepperBtnText}>–</Text>
                      </TouchableOpacity>
                      <View style={st.stepperCenter}>
                        <Text style={st.stepperValue}>{manualWeight}</Text>
                        <Text style={st.stepperUnit}>KG</Text>
                      </View>
                      <TouchableOpacity
                        style={st.stepperBtn}
                        onPress={() => setManualWeight((v) => v + 5)}
                        activeOpacity={0.7}
                      >
                        <Text style={st.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={st.stepperCol}>
                    <Text style={st.sectionLabel}>REPS</Text>
                    <View style={st.stepperCard}>
                      <TouchableOpacity
                        style={st.stepperBtn}
                        onPress={() => setManualReps((v) => Math.max(1, v - 1))}
                        activeOpacity={0.7}
                      >
                        <Text style={st.stepperBtnText}>–</Text>
                      </TouchableOpacity>
                      <View style={st.stepperCenter}>
                        <Text style={st.stepperValue}>{manualReps}</Text>
                        <Text style={st.stepperUnit}>REPS</Text>
                      </View>
                      <TouchableOpacity
                        style={st.stepperBtn}
                        onPress={() => setManualReps((v) => v + 1)}
                        activeOpacity={0.7}
                      >
                        <Text style={st.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Effort */}
                <View style={st.section}>
                  <Text style={st.sectionLabel}>EFFORT</Text>
                  <View style={st.effortRow}>
                    {EFFORT_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[st.effortChip, manualEffort === opt && st.effortChipActive]}
                        onPress={() => setManualEffort(manualEffort === opt ? null : opt)}
                        activeOpacity={0.7}
                      >
                        <Text style={[st.effortChipText, manualEffort === opt && st.effortChipTextActive]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* PR Toggle */}
                <View style={st.toggleCard}>
                  <View style={st.toggleInfo}>
                    <Text style={st.toggleTitle}>Personal Record</Text>
                    <Text style={st.toggleSub}>Mark if this is a new PR</Text>
                  </View>
                  <TouchableOpacity
                    style={[st.toggleTrack, isPR && st.toggleTrackOn]}
                    onPress={() => setIsPR((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <View style={[st.toggleThumb, isPR && st.toggleThumbOn]} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── Post Settings Card ── */}
            <View style={st.settingsCard}>
              {/* Caption */}
              <View style={st.settingsSection}>
                <Text style={st.settingsLabel}>CAPTION</Text>
                <TextInput
                  style={st.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Say something about this lift..."
                  placeholderTextColor={olyColors.text.disabled}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Show on Post */}
              {allPills.length > 0 && (
                <>
                  <View style={st.settingsDivider} />
                  <View style={st.settingsSection}>
                    <View style={st.sessionHeader}>
                      <Text style={st.settingsLabel}>SHOW ON POST</Text>
                      <TouchableOpacity
                        onPress={() => setSessionDataVisible((v) => !v)}
                        activeOpacity={0.7}
                      >
                        <Text style={st.tapToggle}>
                          {sessionDataVisible ? "Hide" : "Show"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {sessionDataVisible && (
                      <View style={st.sessionList}>
                        {allPills.map((pill, idx) => {
                          const on = enabledPills[pill.key] !== false;
                          return (
                            <React.Fragment key={pill.key}>
                              <TouchableOpacity
                                style={st.sessionRow}
                                onPress={() => togglePill(pill.key)}
                                activeOpacity={0.7}
                              >
                                <View style={[st.sessionCheck, on && st.sessionCheckOn]}>
                                  {on && <Ionicons name="checkmark" size={12} color={olyPalette.white} />}
                                </View>
                                <Text style={[st.sessionLabel, on && st.sessionLabelOn]}>{pill.label}</Text>
                                <Text style={[st.sessionValue, on && st.sessionValueOn]}>{pill.value}</Text>
                              </TouchableOpacity>
                              {idx < allPills.length - 1 && <View style={st.sessionDivider} />}
                            </React.Fragment>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Visibility */}
              <View style={st.settingsDivider} />
              <View style={st.settingsSection}>
                <Text style={st.settingsLabel}>VISIBILITY</Text>
                <View style={st.visRow}>
                  <TouchableOpacity
                    style={[st.visOpt, visibility === "private" && st.visActive]}
                    onPress={() => setVisibility("private")}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="lock-closed-outline" size={ICON_MD} color={visibility === "private" ? olyColors.text.primary : olyColors.text.secondary} />
                    <Text style={[st.visText, visibility === "private" && st.visTextOn]}>PRIVATE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[st.visOpt, visibility === "community" && st.visActive]}
                    onPress={() => setVisibility("community")}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="people-outline" size={ICON_MD} color={visibility === "community" ? olyColors.text.primary : olyColors.text.secondary} />
                    <Text style={[st.visText, visibility === "community" && st.visTextOn]}>COMMUNITY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ── Sticky POST ── */}
          <View style={st.bottomBar}>
            <TouchableOpacity
              style={[st.postBtn, isLoading && st.postBtnOff]}
              onPress={onSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={olyPalette.white} />
              ) : (
                <Text style={st.postBtnText}>POST</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Workout Selector Sheet ── */}
          <BottomSheetModal
            ref={workoutSheetRef}
            snapPoints={workoutSnapPoints}
            backgroundStyle={{ backgroundColor: olyPalette.card }}
            handleIndicatorStyle={{ backgroundColor: olyColors.text.disabled }}
          >
            <BottomSheetScrollView style={st.sheetBody} showsVerticalScrollIndicator={false}>
              <Text style={st.sheetTitle}>SELECT FROM A WORKOUT</Text>
              <Text style={st.sheetSub}>Choose a training day and exercise to auto-fill your post</Text>
              {trainingDays.length === 0 ? (
                <View style={st.sheetEmpty}>
                  <Text style={st.sheetEmptyText}>No training sessions found</Text>
                </View>
              ) : (
                <View style={st.sheetList}>
                  {trainingDays.map(({ key, label, exercises }) => (
                    <View key={key}>
                      <TouchableOpacity
                        style={st.dayRow}
                        onPress={() => setExpandedDay(expandedDay === key ? null : key)}
                        activeOpacity={0.7}
                      >
                        <Text style={st.dayLabel}>{label}</Text>
                        <Text style={st.dayCount}>{exercises.length} exercise{exercises.length !== 1 ? "s" : ""}</Text>
                      </TouchableOpacity>
                      {expandedDay === key && exercises.map((ex) => {
                        const topW = ex.sets?.reduce((m, s) => Math.max(m, s.weight), 0) ?? 0;
                        return (
                          <TouchableOpacity
                            key={ex.exercise_name}
                            style={st.exRow}
                            onPress={() => handleSelectExercise(ex)}
                            activeOpacity={0.7}
                          >
                            <View style={st.exInfo}>
                              <Text style={st.exName}>{ex.exercise_name}</Text>
                              <Text style={st.exMeta}>{ex.no_of_set} sets · Top: {topW} kg</Text>
                            </View>
                            <Text style={st.exSelect}>Select</Text>
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

/* ── Styles ─────────────────────────────────────────── */

const st = StyleSheet.create({
  /* ── Layout ── */
  container: { flex: 1, backgroundColor: olyPalette.background },
  safeArea: { flex: 1, backgroundColor: olyPalette.background },

  /* ── Header ── */
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    height: olyLayout.navBarHeight, position: "relative",
  },
  backBtn: {
    position: "absolute", left: olyLayout.screenPadding,
    width: olyLayout.minTouchTarget, height: olyLayout.minTouchTarget,
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { width: ICON_SM, height: ICON_SM, tintColor: olyColors.text.primary },
  headerTitle: {
    ...olyTypography.label, color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase",
  },

  scroll: {
    padding: olyLayout.screenPadding,
    paddingBottom: olyLayout.gymTouchTarget + olySpacing[40],
    gap: olyLayout.cardGap,
  },

  /* ── Hero Card ── */
  heroCard: {
    backgroundColor: olyPalette.card, borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
  },
  heroRow: { flexDirection: "row", gap: olySpacing[12] },
  heroLeft: { flex: 1, justifyContent: "space-between" },
  heroRight: { alignItems: "flex-start", gap: olySpacing[8] },

  userRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  avatar: {
    width: 24, height: 24, borderRadius: olyRadius.full,
    backgroundColor: olyColors.bg.activeHighlight, alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { ...olyTypography.caption, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  userName: { ...olyTypography.caption, color: olyColors.text.secondary },
  userDot: { ...olyTypography.caption, color: olyColors.text.disabled, marginHorizontal: -olySpacing[4] },
  userSub: { ...olyTypography.caption, color: olyColors.text.disabled },
  liftBlock: { gap: 2, marginTop: olySpacing[8] },
  liftName: {
    ...olyTypography.label, color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase",
  },
  weightRow: { flexDirection: "row", alignItems: "baseline", gap: olySpacing[4] },
  weightNum: { ...olyTypography.display, color: olyColors.text.primary },
  weightUnit: { ...olyTypography.body, color: olyColors.text.disabled },

  previewPillWrap: { flexDirection: "row", flexWrap: "wrap", gap: olySpacing[4] },
  previewPill: {
    borderRadius: olyRadius.full, borderWidth: 1, borderColor: olyColors.border.default,
    paddingHorizontal: olySpacing[8], paddingVertical: olySpacing[4],
  },
  previewPillText: { ...olyTypography.caption, color: olyColors.text.secondary },

  /* ── Video Thumbnail ── */
  thumbWrap: {
    width: THUMB_WIDTH, height: THUMB_HEIGHT, borderRadius: olyRadius.lg,
    overflow: "hidden", backgroundColor: olyPalette.cardElevated,
  },
  thumbDashed: {
    borderWidth: 1, borderStyle: "dashed", borderColor: olyColors.border.default,
    alignItems: "center", justifyContent: "center",
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbEmpty: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderStyle: "dashed" as const,
  },
  playOverlay: {
    position: "absolute", top: "50%", left: "50%",
    marginTop: -(PLAY_SIZE / 2), marginLeft: -(PLAY_SIZE / 2),
    width: PLAY_SIZE, height: PLAY_SIZE,
    borderRadius: olyRadius.full, backgroundColor: olyColors.bg.overlay,
    alignItems: "center", justifyContent: "center",
  },
  playIcon: { width: ICON_SM, height: ICON_SM, tintColor: olyPalette.white },

  uploadContent: { alignItems: "center", gap: olySpacing[4] },
  uploadIcon: { width: ICON_LG, height: ICON_LG, tintColor: olyColors.text.secondary },
  uploadText: { ...olyTypography.caption, color: olyColors.text.secondary },

  /* ── Mini Set Thumbnails ── */
  miniRow: { flexDirection: "row", gap: olySpacing[4], alignSelf: "flex-start" },
  miniThumb: {
    width: MINI_THUMB_SIZE, height: MINI_THUMB_SIZE, borderRadius: olyRadius.sm,
    backgroundColor: olyPalette.cardElevated, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "transparent", overflow: "hidden", opacity: 0.45,
  },
  miniThumbActive: { borderColor: olyPalette.primary, opacity: 1 },
  miniThumbImg: { width: "100%", height: "100%", borderRadius: olyRadius.sm },
  miniThumbText: { ...olyTypography.caption, color: olyColors.text.disabled },

  /* ── Reusable Section ── */
  section: { gap: olySpacing[8] },
  sectionLabel: {
    ...olyTypography.label, color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase",
  },

  /* ── Workout Selector Button ── */
  workoutBtn: {
    backgroundColor: olyPalette.card, borderRadius: olyRadius.full,
    height: olyLayout.gymTouchTarget, alignItems: "center", justifyContent: "center",
  },
  workoutBtnText: { ...olyTypography.label, color: olyColors.text.secondary, letterSpacing: olyLetterSpacing.uppercase },

  filledBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: olyColors.bg.activeHighlight, borderRadius: olyRadius.full,
    borderWidth: 1, borderColor: olyColors.border.brand,
    height: olyLayout.minTouchTarget, paddingHorizontal: olyLayout.cardPadding,
  },
  filledBarText: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  filledBarAction: { ...olyTypography.caption, color: olyColors.text.secondary },

  /* ── Lift Name Chips ── */
  chipCard: {
    backgroundColor: olyPalette.card, borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: olySpacing[8] },
  liftChip: {
    paddingHorizontal: olySpacing[12], paddingVertical: olySpacing[8],
    borderRadius: olyRadius.full, borderWidth: 1,
    borderColor: olyColors.border.brandUnselected, backgroundColor: olyColors.bg.activeHighlight,
  },
  liftChipActive: { backgroundColor: olyColors.bg.cardSelected, borderColor: olyColors.border.brand },
  liftChipText: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  liftChipTextActive: { color: olyColors.text.primary },

  /* ── Weight & Reps Steppers ── */
  stepperRow: { flexDirection: "row", gap: olyLayout.cardGap },
  stepperCol: { flex: 1, gap: olySpacing[8] },
  stepperCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: olyPalette.cardElevated, borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[12], paddingVertical: olySpacing[16],
  },
  stepperBtn: {
    width: olyLayout.minTouchTarget, height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full, backgroundColor: olyPalette.card,
    alignItems: "center", justifyContent: "center",
  },
  stepperBtnText: { ...olyTypography.title1, color: olyColors.text.secondary },
  stepperCenter: { alignItems: "center" },
  stepperValue: { ...olyTypography.display, color: olyColors.text.primary },
  stepperUnit: {
    ...olyTypography.caption, color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* ── Effort Chips ── */
  effortRow: { flexDirection: "row", gap: olySpacing[8] },
  effortChip: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: olySpacing[12], borderRadius: olyRadius.full,
    backgroundColor: olyPalette.card,
  },
  effortChipActive: { backgroundColor: olyPalette.primary },
  effortChipText: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  effortChipTextActive: { color: olyColors.text.primary },

  /* ── PR Toggle ── */
  toggleCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: olyPalette.card, borderRadius: olyRadius.lg,
    paddingHorizontal: olyLayout.cardPadding, paddingVertical: olySpacing[16],
  },
  toggleInfo: { flex: 1, gap: olySpacing[4] },
  toggleTitle: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  toggleSub: { ...olyTypography.caption, color: olyColors.text.secondary },
  toggleTrack: {
    width: 48, height: 28, borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated, justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackOn: { backgroundColor: olyPalette.primary },
  toggleThumb: {
    width: 24, height: 24, borderRadius: olyRadius.full,
    backgroundColor: olyColors.text.secondary,
  },
  toggleThumbOn: { alignSelf: "flex-end", backgroundColor: olyPalette.white },

  /* ── Post Settings Card ── */
  settingsCard: {
    backgroundColor: olyPalette.card, borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
  },
  settingsSection: { gap: olySpacing[8] },
  settingsLabel: {
    ...olyTypography.label, color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase",
  },
  settingsDivider: {
    height: 1, backgroundColor: olyColors.border.default,
    marginVertical: olySpacing[16],
  },

  /* ── Caption ── */
  captionInput: {
    backgroundColor: olyPalette.cardElevated, borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[12], paddingVertical: olySpacing[12],
    minHeight: olyLayout.gymTouchTarget, ...olyTypography.body, color: olyColors.text.primary,
  },

  /* ── Show on Post ── */
  sessionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tapToggle: { ...olyTypography.caption, color: olyColors.text.disabled },
  sessionList: {},
  sessionRow: {
    flexDirection: "row", alignItems: "center", gap: olySpacing[12],
    paddingVertical: olySpacing[12],
  },
  sessionCheck: {
    width: CHECK_SIZE, height: CHECK_SIZE, borderRadius: olyRadius.full,
    borderWidth: 1, borderColor: olyColors.border.default,
    alignItems: "center", justifyContent: "center",
  },
  sessionCheckOn: { backgroundColor: olyPalette.primary, borderColor: olyPalette.primary },
  sessionLabel: { ...olyTypography.body, color: olyColors.text.disabled, flex: 1 },
  sessionLabelOn: { color: olyColors.text.secondary },
  sessionValue: { ...olyTypography.body, color: olyColors.text.disabled },
  sessionValueOn: { color: olyColors.text.primary, fontFamily: olyFonts.medium },
  sessionDivider: { height: 1, backgroundColor: olyColors.border.default },

  /* ── Visibility ── */
  visRow: {
    flexDirection: "row", backgroundColor: olyPalette.cardElevated, borderRadius: olyRadius.full,
    padding: olySpacing[4],
  },
  visOpt: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: olySpacing[8], height: olyLayout.minTouchTarget, borderRadius: olyRadius.full,
    borderWidth: 1, borderColor: "transparent",
  },
  visActive: { borderColor: olyPalette.primary, backgroundColor: olyColors.bg.activeHighlight },
  visText: { ...olyTypography.label, color: olyColors.text.secondary, letterSpacing: olyLetterSpacing.uppercase },
  visTextOn: { color: olyColors.text.primary },

  /* ── Sticky POST ── */
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: olyLayout.screenPadding, paddingBottom: olySpacing[32],
    paddingTop: olySpacing[12], backgroundColor: olyPalette.background,
  },
  postBtn: {
    backgroundColor: olyPalette.primary, borderRadius: olyRadius.full,
    height: olyLayout.gymTouchTarget, alignItems: "center", justifyContent: "center",
  },
  postBtnOff: { opacity: 0.6 },
  postBtnText: { ...olyTypography.button, color: olyPalette.white, letterSpacing: olyLetterSpacing.uppercase },

  /* ── Bottom Sheet ── */
  sheetBody: { flex: 1, padding: olyLayout.screenPadding },
  sheetTitle: {
    ...olyTypography.label, color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase",
    marginBottom: olySpacing[4],
  },
  sheetSub: { ...olyTypography.bodySmall, color: olyColors.text.secondary, marginBottom: olySpacing[24] },
  sheetEmpty: { alignItems: "center", paddingVertical: olySpacing[40] },
  sheetEmptyText: { ...olyTypography.body, color: olyColors.text.disabled },
  sheetList: { gap: olySpacing[4] },
  dayRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: olyPalette.cardElevated, borderRadius: olyRadius.lg,
    paddingHorizontal: olyLayout.cardPadding, minHeight: olyLayout.gymTouchTarget,
  },
  dayLabel: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
  dayCount: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  exRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: olyLayout.cardPadding, paddingLeft: olySpacing[32],
    minHeight: olyLayout.minTouchTarget, borderBottomWidth: 1, borderBottomColor: olyColors.border.default,
  },
  exInfo: { flex: 1 },
  exName: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.primary, textTransform: "capitalize" },
  exMeta: { ...olyTypography.caption, color: olyColors.text.secondary },
  exSelect: {
    ...olyTypography.caption, fontFamily: olyFonts.medium, color: olyPalette.primary,
    letterSpacing: olyLetterSpacing.uppercase, textTransform: "uppercase",
  },
});
