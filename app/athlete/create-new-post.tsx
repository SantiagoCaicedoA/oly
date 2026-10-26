/**
 * Post Lift — the compose screen (redesigned Sep 2026, prototype-approved).
 *
 * Principles (locked with the founder):
 * - There is NO empty state: standalone mode opens the system video picker
 *   immediately on mount; canceling it leaves the screen. You always arrive
 *   with a video.
 * - Video is the hero. Lift/weight/reps are three stat cards on one grid.
 * - The golden ticket (leaderboard claim) is the ONLY glowing element —
 *   it appears only for a single Snatch / Clean & Jerk with weight set.
 * - One selection grammar: solid brand blue = chosen; tinted outline =
 *   available; neutral dim = off.
 * - ✕ confirms before discarding entered work. Post explains what's missing.
 */
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyAlert } from "@/src/oly-components/feedback/OlyAlert";
import { useToast } from "@/context/toast-context";
import {
  useCreateNewPostMutation,
  useGetCurrentSeasonQuery,
  useGetProfileQuery,
  useSubmitLiftMutation,
} from "@/store/api";
import { RootState } from "@/store/store";
import { olyFonts, olyLetterSpacing, olyTypography } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import {
  Glows,
  SHEET_SIDE,
  SheetBackdrop,
  SheetGrabber,
  SheetSurface,
} from "@/src/oly-components/shop/ShopKit";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { MediaPickerSheet } from "@/src/oly-components/media/MediaPickerSheet";
import { LinearGradient } from "expo-linear-gradient";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
import { router, useLocalSearchParams } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";

/* ── Types ─────────────────────────── */

interface SetVideo {
  setNumber: number;
  videoUri: string;
  thumbnailUri?: string;
  weight?: number;
  rpmPercent?: number;
  barSpeed?: string;
  positionQuality?: string;
}

/* ── Constants ─────────────────────── */

/** Only single snatches and clean & jerks can rank (design doc §5). */
const RANKABLE_LIFTS: Record<string, "snatch" | "cleanjerk"> = {
  "snatch": "snatch",
  "clean & jerk": "cleanjerk",
};

/* Grouped so thirteen chips read as a menu, not a pile. A "Complex" chip
   belongs to its family; its stored value names the family. Complexes are
   never ranked. */
const LIFT_GROUPS: {
  label: string;
  lifts: { value: string; chip: string; ranked?: boolean }[];
  hint?: string;
}[] = [
  {
    label: "SNATCH",
    hint: "Snatch Pull + Snatch",
    lifts: [
      { value: "Snatch", chip: "Snatch", ranked: true },
      { value: "Power Snatch", chip: "Power Snatch" },
      { value: "Overhead Squat", chip: "Overhead Squat" },
      { value: "Snatch Complex", chip: "Complex" },
    ],
  },
  {
    label: "CLEAN & JERK",
    hint: "Clean + Front Squat + Jerk",
    lifts: [
      { value: "Clean & Jerk", chip: "Clean & Jerk", ranked: true },
      { value: "Clean", chip: "Clean" },
      { value: "Power Clean", chip: "Power Clean" },
      { value: "Jerk", chip: "Jerk" },
      { value: "Power Jerk", chip: "Power Jerk" },
      { value: "Clean & Jerk Complex", chip: "Complex" },
    ],
  },
  {
    label: "STRENGTH",
    lifts: [
      { value: "Back Squat", chip: "Back Squat" },
      { value: "Front Squat", chip: "Front Squat" },
      { value: "Strict Press", chip: "Strict Press" },
      { value: "Push Press", chip: "Push Press" },
    ],
  },
];
const isComplex = (l: string | null) => !!l && l.endsWith("Complex");

const SPEED_OPTIONS = ["Slow", "Medium", "Fast"];
const EFFORT_OPTIONS = ["Easy", "Moderate", "Hard", "Max"];

/** IWF 2025-06 class labels from bodyweight — mirrors backend classTable. */
const MEN_BOUNDS: [number, string][] = [
  [60, "60"], [65, "65"], [71, "71"], [79, "79"], [88, "88"], [94, "94"], [110, "110"],
];
const WOMEN_BOUNDS: [number, string][] = [
  [48, "48"], [53, "53"], [58, "58"], [63, "63"], [69, "69"], [77, "77"], [86, "86"],
];
function classFor(sex: "M" | "F", bw: number): string {
  const bounds = sex === "M" ? MEN_BOUNDS : WOMEN_BOUNDS;
  for (const [limit, label] of bounds) if (bw <= limit) return label;
  return sex === "M" ? "+110" : "+86";
}

/* ── Golden ticket sheen (the Willy Wonka pass) ── */

function TicketSheen() {
  const x = useSharedValue(-140);
  useEffect(() => {
    x.value = withRepeat(
      withTiming(460, { duration: 3800, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { skewX: "-18deg" }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[st.sheen, style]}>
      <LinearGradient
        colors={["transparent", olyColors.chart.area, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/* ── Component ─────────────────────── */

export default function CreateNewPost() {
  const params = useLocalSearchParams();
  const { showSuccess, showError } = useToast();
  const insets = useSafeAreaInsets();
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(84);
  const [createPost, { isLoading }] = useCreateNewPostMutation();
  const [submitLift] = useSubmitLiftMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const onboarding = useSelector(selectOnboardingData);

  /* ── Route params (from the record book) ──
     The number the athlete typed comes along, and only lands in their
     record book once the post goes up. Discard leaves it untouched. */
  const recordCategory = params.recordCategory as string | undefined;
  const recordIndex = Number(params.recordIndex);
  const recordLift = params.recordLift as string | undefined;
  const recordKg = Number(params.recordKg) || null;
  const fromRecord = !!recordCategory && Number.isInteger(recordIndex);
  const saveRecord = (kg: number) => {
    const all = (onboarding?.liftValues ?? {}) as Record<string, number[]>;
    const list = all[recordCategory!];
    if (!list) return;
    dispatch(
      saveOnboardingData({
        liftValues: {
          ...all,
          [recordCategory!]: list.map((v, i) => (i === recordIndex ? Math.max(v, kg) : v)),
        },
      }),
    );
  };

  /* ── Route params (training mode, from training-exercise) ── */
  const exerciseName = params.exerciseName as string | undefined;
  const setsWithVideoParam = params.setsWithVideo as string | undefined;
  const setsWithVideo: SetVideo[] = useMemo(() => {
    if (!setsWithVideoParam) return [];
    try { return JSON.parse(setsWithVideoParam); }
    catch { return []; }
  }, [setsWithVideoParam]);
  const isStandalone = !exerciseName && setsWithVideo.length === 0;

  /* ── Core state ── */
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const selectedVideo = setsWithVideo[selectedSetIndex] ?? null;

  const [lift, setLift] = useState<string | null>(exerciseName ?? recordLift ?? null);
  /* Optional name for a complex, e.g. "Clean + Front Squat + Jerk". */
  const [complexName, setComplexName] = useState("");
  const liftLabel = isComplex(lift) && complexName.trim() ? complexName.trim() : lift;
  const [weight, setWeight] = useState<number | null>(recordKg);
  const [reps, setReps] = useState(1);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"private" | "community">("community");

  /* Show-on-post toggles. They are persisted and the feed card prints them
     as things the athlete reported, so top set, speed and effort start OFF
     and the athlete opts in: picking a value in the chooser sets its flag
     true. */
  const [showWeightPill, setShowWeightPill] = useState(true);
  const [showTopSet, setShowTopSet] = useState(false);
  const [speedOn, setSpeedOn] = useState(false);
  const [speedVal, setSpeedVal] = useState("Fast");
  const [effortOn, setEffortOn] = useState(false);
  const [effortVal, setEffortVal] = useState("Hard");

  /* Sheets & modals */
  const [liftSheet, setLiftSheet] = useState(false);
  const [chooser, setChooser] = useState<null | "speed" | "effort">(null);
  const [weightModal, setWeightModal] = useState(false);
  const [weightDraft, setWeightDraft] = useState("");

  /* ── Training-mode prefill ── */
  useEffect(() => {
    if (selectedVideo?.weight && selectedVideo.weight > 0) setWeight(selectedVideo.weight);
    if (selectedVideo?.barSpeed) setSpeedVal(selectedVideo.barSpeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSetIndex]);

  /* ── Standalone: the picker IS the empty state ── */
  const pickedOnce = useRef(false);
  const [videoSheet, setVideoSheet] = useState(false);
  const sheetFirstOpen = useRef(false);

  /* Oly's own video grid first; the system picker stays as the fallback for
     older videos, no access, and trimming anything over 30 seconds. */
  const pickVideo = useCallback((firstOpen: boolean) => {
    sheetFirstOpen.current = firstOpen;
    setVideoSheet(true);
  }, []);

  const pickFromSystem = useCallback(async (firstOpen: boolean) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Please allow access to your media library");
      if (firstOpen) router.back();
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 30,
      quality: 1,
    });
    if (result.canceled) {
      if (firstOpen) router.back(); // never show a hollow screen
      return;
    }
    const asset = result.assets[0];
    setVideoUri(asset.uri);
    setDurationSec(asset.duration ? Math.round(asset.duration / 1000) : null);
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 1000 });
      setThumbnailUri(uri);
    } catch { /* thumbnail is decorative */ }
  }, [showError]);

  const onSheetPick = useCallback(async (v: { uri: string; durationSec: number }) => {
    setVideoSheet(false);
    setVideoUri(v.uri);
    setDurationSec(v.durationSec || null);
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(v.uri, { time: 1000 });
      setThumbnailUri(uri);
    } catch { /* thumbnail is decorative */ }
  }, []);

  useEffect(() => {
    if (isStandalone && !pickedOnce.current) {
      pickedOnce.current = true;
      pickVideo(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Training-mode thumbnails ── */
  const [thumbMap, setThumbMap] = useState<Record<number, string>>({});
  useEffect(() => {
    setsWithVideo.forEach((sv) => {
      if (!thumbMap[sv.setNumber] && sv.videoUri) {
        VideoThumbnails.getThumbnailAsync(sv.videoUri, { time: 1000 })
          .then(({ uri }) => setThumbMap((prev) => ({ ...prev, [sv.setNumber]: uri })))
          .catch(() => {});
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setsWithVideo]);

  /* ── Derived ── */
  const activeVideoUri = selectedVideo?.videoUri ?? videoUri;
  const activeThumbUri = (selectedVideo ? thumbMap[selectedVideo.setNumber] : null) ?? thumbnailUri;
  const rankLiftType = lift ? RANKABLE_LIFTS[lift.trim().toLowerCase()] ?? null : null;
  const isRankable = !!rankLiftType && !!weight && weight > 0 && !!activeVideoUri && reps === 1;
  const canPost = !!activeVideoUri && !!lift && !!weight && weight > 0;

  /* ── Golden ticket ── */
  const [ticketOn, setTicketOn] = useState(false);
  useEffect(() => { if (!isRankable && ticketOn) setTicketOn(false); }, [isRankable, ticketOn]);

  // Smooth color transition when the ticket toggles (brand tokens only)
  const ticketAnim = useSharedValue(0);
  useEffect(() => {
    ticketAnim.value = withTiming(ticketOn ? 1 : 0, { duration: 320, easing: Easing.out(Easing.quad) });
  }, [ticketOn, ticketAnim]);
  const ticketCardAnim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(ticketAnim.value, [0, 1], [TINT, olyColors.bg.activeHighlight]),
    borderColor: interpolateColor(ticketAnim.value, [0, 1], [TINT_BORDER, olyPalette.primary]),
  }));

  const seasonQ = useGetCurrentSeasonQuery(undefined, { skip: !isRankable });
  const seasonLabel = seasonQ.data?.season?.label ?? null;

  const profileQ = useGetProfileQuery(undefined, { skip: !isRankable });
  const profile = profileQ.data?.data?.profile;
  const sexLetter: "M" | "F" = profile?.sex === "Female" ? "F" : "M";
  const [bodyweightStr, setBodyweightStr] = useState("");
  useEffect(() => {
    if (!ticketOn || bodyweightStr) return;
    const v = profile?.bodyweight_value;
    if (typeof v === "number" && v > 0) {
      const kg = profile?.bodyweight_unit === "lbs" ? v * 0.453592 : v;
      setBodyweightStr(String(Math.round(kg * 10) / 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketOn, profileQ.data]);

  const bwNum = parseFloat(bodyweightStr);
  const boardClass = Number.isFinite(bwNum) && bwNum > 0 ? classFor(sexLetter, bwNum) : null;

  // One idempotency key per screen visit — retries can't duplicate a lift.
  const idemKeyRef = useRef(`app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  /* ── Discard confirm ── */
  const dirty = !!(lift || weight || caption.trim() || (isStandalone && videoUri));
  const tryClose = () => {
    if (!dirty) { router.back(); return; }
    olyAlert("Discard this post?", "Your video and details won’t be saved.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  };

  /* ── Submit ── */
  const onSubmit = async () => {
    if (!canPost) {
      const missing = !activeVideoUri ? "Add a video first"
        : !lift && !weight ? "Choose the lift and add the weight first"
        : !lift ? "Choose the lift first" : "Add the weight first";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showError(missing);
      return;
    }
    const wantRank = ticketOn && isRankable && !!rankLiftType;
    const bwKg = Math.round(parseFloat(bodyweightStr) * 10) / 10;
    if (wantRank && (!Number.isFinite(bwKg) || bwKg < 30 || bwKg > 250)) {
      showError("Enter your bodyweight (kg) to rank this lift");
      return;
    }

    const formData = new FormData();
    formData.append("video", {
      uri: activeVideoUri,
      type: "video/mp4",
      name: "post-video.mp4",
    } as any);
    formData.append("data", JSON.stringify({
      lift_name: liftLabel,
      opinion: caption,
      /* Bar speed, effort, top set and bodyweight were all being
         collected by the pills above and then dropped here: the payload
         only ever carried lifted_kg. Every one of them is what the feed's
         stat strip reads, so a post made before this fix will show no
         strip at all. Send only what the athlete actually set. */
      session_detail: {
        lifted_kg: weight,
        ...(Number.isFinite(bwKg) && bwKg > 0 ? { bodyweight_kg: bwKg } : {}),
        ...(speedOn && speedVal ? { bar_speed: speedVal } : {}),
        ...(effortOn && effortVal ? { effort: effortVal } : {}),
        ...(showTopSet ? { top_set: true } : {}),
      },
      is_public: visibility === "community",
      is_private: visibility === "private",
      username: user?.username,
      name: user?.name,
    }));

    let videoUrl: string | undefined;
    try {
      const res = await createPost({ formData }).unwrap();
      videoUrl = res?.data?.video_url || undefined;
    } catch (error: any) {
      console.error("Create post error:", error);
      showError("Failed to create post");
      return;
    }
    if (fromRecord) saveRecord(weight!);
    /* From the record book, go back to it so the new number is right there. */
    const done = (to: "/(tabs)/home" | "/(tabs)/rank") =>
      fromRecord ? router.back() : router.push(to);

    if (!wantRank) {
      showSuccess("Post created!", "");
      done("/(tabs)/home");
      return;
    }

    // Feed post is up — claim the rank with the same uploaded video.
    try {
      if (!videoUrl) throw new Error("no video url on post response");
      const r = await submitLift({
        liftType: rankLiftType!,
        weightKg: weight!,
        bodyweightKg: bwKg,
        liftDate: new Date().toISOString(),
        videoUrl,
        idemKey: idemKeyRef.current,
      }).unwrap();

      if (r.held) {
        showSuccess("Posted! Your lift is being reviewed", "It will appear on the leaderboard once approved");
      } else if (r.ranks) {
        showSuccess(`You're #${r.ranks.lift} in ${r.ranks.weightClass} kg!`,
          seasonLabel ? `${lift} · ${seasonLabel}` : lift ?? "");
      } else {
        showSuccess("Posted and submitted to the leaderboard!", "");
      }
      done("/(tabs)/rank");
    } catch (error: any) {
      console.error("Submit lift error:", error);
      const msg = error?.data?.error || error?.data?.message;
      showError("Posted to your feed, but the leaderboard submission failed",
        typeof msg === "string" ? msg : "You can try again with your next lift");
      done("/(tabs)/home");
    }
  };

  const fmtDuration = (s: number | null) =>
    s == null ? null : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ── Render ── */
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <Glows variant="shop" />
      <View style={st.kav}>
      <KeyboardAvoidingView
        style={st.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[st.scroll, { paddingTop: headerH + olySpacing[12] }]}
          scrollIndicatorInsets={{ top: headerH }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1 · VIDEO HERO */}
          <View style={st.hero}>
            {activeThumbUri ? (
              <Image source={{ uri: activeThumbUri }} style={st.heroImg} />
            ) : (
              <View style={[st.heroImg, st.heroLoading]}>
                <ActivityIndicator color={olyColors.text.secondary} />
              </View>
            )}
            <LinearGradient
              colors={olyColors.media.fade}
              style={st.heroFade}
            />
            <View style={st.playBtn}>
              <Ionicons name="play" size={18} color={olyPalette.white} style={{ marginLeft: 2 }} />
            </View>
            {isStandalone && (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Replace video" style={st.replaceBtn} onPress={() => pickVideo(false)} hitSlop={10}>
                <Ionicons name="sync" size={15} color={olyColors.text.primary} />
              </TouchableOpacity>
            )}
            {!!lift && !!weight && (
              <View style={st.stamp}>
                <Text style={st.stampLift}>{liftLabel}</Text>
                <Text style={st.stampKg}>
                  {weight} <Text style={st.stampUnit}>kg</Text>
                </Text>
              </View>
            )}
            {durationSec != null && (
              <Text style={st.timecode}>{fmtDuration(durationSec)}</Text>
            )}
          </View>

          {/* Training mode: set selector */}
          {setsWithVideo.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.setRow}>
              {setsWithVideo.map((sv, i) => (
                <TouchableOpacity hitSlop={2}
                  key={sv.setNumber}
                  style={[st.setChip, i === selectedSetIndex && st.setChipOn]}
                  onPress={() => setSelectedSetIndex(i)}
                >
                  <Text style={[st.setChipText, i === selectedSetIndex && st.setChipTextOn]}>
                    S{sv.setNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* 2 · THE LIFT — three stat cards on one grid */}
          <Text style={st.secLabel}>THE LIFT</Text>
          <View style={st.liftRow}>
            <TouchableOpacity
              style={[st.statCard, { flex: 1.3 }]}
              onPress={() => setLiftSheet(true)}
              activeOpacity={0.7}
            >
              <Text style={st.statK}>LIFT</Text>
              <View style={st.statVRow}>
                <Text style={[st.statVal, !lift && st.statPlaceholder]} numberOfLines={1}>
                  {liftLabel ?? "Select"}
                </Text>
                <Ionicons name="chevron-down" size={13} color={olyColors.text.disabled} style={st.chev} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[st.statCard, { flex: 1 }]}
              onPress={() => { setWeightDraft(weight ? String(weight) : ""); setWeightModal(true); }}
              activeOpacity={0.7}
            >
              <Text style={st.statK}>WEIGHT</Text>
              <View style={st.statVRow}>
                <Text style={[st.statVal, !weight && st.statPlaceholder]}>
                  {weight ?? "Add"}
                </Text>
                {!!weight && <Text style={st.statUnit}>kg</Text>}
              </View>
            </TouchableOpacity>

            <View style={[st.statCard, { flex: 1.1 }]}>
              <Text style={st.statK}>REPS</Text>
              <View style={[st.statVRow, st.repsRow]}>
                <TouchableOpacity
                  style={[st.stepBtn, reps <= 1 && st.stepBtnOff]}
                  onPress={() => { if (reps > 1) { setReps(reps - 1); Haptics.selectionAsync(); } }}
                  hitSlop={12}
                >
                  <Text style={st.stepTxt}>–</Text>
                </TouchableOpacity>
                <Text style={st.statVal}>{reps}</Text>
                <TouchableOpacity
                  style={[st.stepBtn, reps >= 20 && st.stepBtnOff]}
                  onPress={() => { if (reps < 20) { setReps(reps + 1); Haptics.selectionAsync(); } }}
                  hitSlop={12}
                >
                  <Text style={st.stepTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 3 · GOLDEN TICKET */}
          {isRankable && (
            <Animated.View entering={FadeIn.duration(320)} exiting={FadeOut.duration(180)}>
              <Animated.View style={[st.ticketCard, ticketCardAnim]}>
                  <TicketSheen />
                  <View style={st.ticketRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.ticketTitle}>Claim your spot on the leaderboard</Text>
                      <Text style={st.ticketSub}>
                        <Text style={st.ticketGlow}>{seasonLabel ?? "The season"}</Text>
                        {" is live. This single counts as your ranked "}
                        {lift?.toLowerCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[st.tgl, ticketOn && st.tglOn]}
                      onPress={() => { setTicketOn(!ticketOn); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                      hitSlop={10}
                    >
                      <View style={[st.tglKnob, ticketOn && st.tglKnobOn]} />
                    </TouchableOpacity>
                  </View>
                  {ticketOn && (
                    <Animated.View entering={FadeIn.duration(250)} style={st.stamped}>
                      <View style={st.tRow}>
                        <Text style={st.miniLabel}>BODYWEIGHT</Text>
                        <View style={st.bwField}>
                          <TextInput
                            style={st.bwInput}
                            value={bodyweightStr}
                            onChangeText={setBodyweightStr}
                            keyboardType="decimal-pad"
                            maxLength={5}
                            placeholder="0.0"
                            placeholderTextColor={olyColors.text.disabled}
                          />
                          <Text style={st.bwUnit}>kg</Text>
                        </View>
                      </View>
                      {!!boardClass && (
                        <View style={st.tRow}>
                          <Text style={st.miniLabel}>BOARD</Text>
                          <Text style={st.miniValue}>
                            {sexLetter === "M" ? "Men" : "Women"} {boardClass} kg
                          </Text>
                        </View>
                      )}
                      <Text style={st.proof}>
                        {visibility === "private"
                          ? "Feed post stays private. The leaderboard shows this video as public proof."
                          : "This video becomes public proof on the leaderboard."}
                      </Text>
                    </Animated.View>
                  )}
              </Animated.View>
            </Animated.View>
          )}

          {/* 4 · CAPTION */}
          <Text style={st.secLabel}>CAPTION</Text>
          <TextInput
            style={st.caption}
            value={caption}
            onChangeText={setCaption}
            placeholder="Say something about this lift…"
            placeholderTextColor={olyColors.text.disabled}
            multiline
            textAlignVertical="top"
          />

          {/* 5 · SHOW ON POST */}
          <Text style={st.secLabel}>SHOW ON POST</Text>
          <View style={st.pills}>
            {!!weight && (
              <Pill on={showWeightPill} onPress={() => setShowWeightPill(!showWeightPill)}>
                <Text style={st.pillBold(showWeightPill)}>{weight} kg</Text>
              </Pill>
            )}
            {!isStandalone && (
              <Pill on={showTopSet} onPress={() => setShowTopSet(!showTopSet)}>
                <Text style={st.pillText(showTopSet)}>Top set</Text>
              </Pill>
            )}
            <Pill on={speedOn} onPress={() => setChooser("speed")}>
              <Text style={st.pillText(speedOn)}>Bar speed: <Text style={st.pillBold(speedOn)}>{speedVal}</Text></Text>
            </Pill>
            <Pill on={effortOn} onPress={() => setChooser("effort")}>
              <Text style={st.pillText(effortOn)}>Effort: <Text style={st.pillBold(effortOn)}>{effortVal}</Text></Text>
            </Pill>
          </View>

          {/* 6 · VISIBILITY */}
          <Text style={st.secLabel}>VISIBILITY</Text>
          <View style={st.visRow}>
            <TouchableOpacity hitSlop={2}
              style={[st.visOpt, visibility === "private" && st.visOn]}
              onPress={() => setVisibility("private")}
            >
              <Ionicons name="lock-closed-outline" size={15}
                color={visibility === "private" ? olyPalette.white : olyColors.text.secondary} />
              <Text style={[st.visText, visibility === "private" && st.visTextOn]}>PRIVATE</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={2}
              style={[st.visOpt, visibility === "community" && st.visOn]}
              onPress={() => setVisibility("community")}
            >
              <Ionicons name="people-outline" size={15}
                color={visibility === "community" ? olyPalette.white : olyColors.text.secondary} />
              <Text style={[st.visText, visibility === "community" && st.visTextOn]}>COMMUNITY</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* STICKY POST */}
        <View style={[st.postBar, { paddingBottom: insets.bottom + 10 }]}>
          <LinearGradient
            colors={olyColors.glass.fadeFooter}
            locations={olyColors.glass.fadeFooterLocations}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={[st.postBtn, !canPost && st.postBtnDim, ticketOn && st.postBtnClaim]}
            onPress={onSubmit}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={olyPalette.white} />
            ) : (
              <Text style={[st.postText, !canPost && st.postTextDim]}>
                {ticketOn ? "Post · Claim your spot" : "Post"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Header floats over the form. Content scrolls under it and fades
          out behind a soft gradient instead of being cut by a hard edge. */}
      <OlyFloatingHeader onLayout={onHeaderLayout} safeTop={false} fadeBleed={24} style={st.headerWrap}>
        <View style={st.header}>
          <View>
            <Text style={st.kicker}>SHARE</Text>
            <Text style={st.title}>Post Lift</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" style={st.close} onPress={tryClose} hitSlop={12}>
            <Ionicons name="close" size={18} color={olyColors.text.primary} />
          </TouchableOpacity>
        </View>
      </OlyFloatingHeader>
      </View>

      {/* LIFT PICKER SHEET */}
      <Modal visible={liftSheet} transparent animationType="fade" onRequestClose={() => setLiftSheet(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <SheetBackdrop onPress={() => setLiftSheet(false)} />
        <View style={st.sheetWrap} pointerEvents="box-none">
          <SheetSurface style={st.sheet}>
            <SheetGrabber />
            {/* One pill language. The ranked lift leads its own family, bolder
                and marked with the leaderboard icon; the note explains it. */}
            <Text style={st.sheetTitle}>Choose the lift</Text>
            <View style={st.sheetNote}>
              <OlyIcon name="rank" size={12} filled color={olyColors.text.secondary} />
              <Text style={st.sheetNoteText}>counts on the leaderboard</Text>
            </View>
            {LIFT_GROUPS.map((g) => {
              const complexOn = isComplex(lift) && g.lifts.some((x) => x.value === lift);
              return (
                <View key={g.label}>
                  <Text style={st.sheetLabel}>{g.label}</Text>
                  <View style={st.sheetChips}>
                    {g.lifts.map((l) => {
                      const on = lift === l.value;
                      return (
                        <TouchableOpacity hitSlop={4}
                          key={l.value}
                          style={[st.chip, l.ranked && st.chipRanked, on && st.chipOn]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            if (isComplex(l.value)) {
                              if (lift !== l.value) setComplexName("");
                              setLift(l.value);
                              return; // stay open for the optional name
                            }
                            setLift(l.value);
                            setComplexName("");
                            setLiftSheet(false);
                          }}
                        >
                          {l.ranked && (
                            <OlyIcon
                              name="rank"
                              size={12}
                              filled
                              color={on ? olyPalette.white : olyColors.text.primary}
                            />
                          )}
                          <Text
                            style={[st.chipText, l.ranked && st.chipTextRanked, on && st.chipTextOn]}
                          >
                            {l.chip}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {complexOn && (
                    <View style={st.complexRow}>
                      <TextInput
                        value={complexName}
                        onChangeText={setComplexName}
                        placeholder={`What's the complex? ${g.hint ?? ""}`.trim()}
                        placeholderTextColor={olyColors.text.disabled}
                        style={st.complexInput}
                        returnKeyType="done"
                        autoFocus
                        onSubmitEditing={() => setLiftSheet(false)}
                      />
                      <TouchableOpacity hitSlop={2} style={st.complexDone} onPress={() => setLiftSheet(false)}>
                        <Text style={st.complexDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </SheetSurface>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VALUE CHOOSER SHEET (bar speed / effort) */}
      <Modal visible={chooser !== null} transparent animationType="fade" onRequestClose={() => setChooser(null)}>
        <SheetBackdrop onPress={() => setChooser(null)} />
        <View style={st.sheetWrap} pointerEvents="box-none">
          <SheetSurface style={st.sheet}>
            <SheetGrabber />
            <Text style={st.sheetTitle}>{chooser === "speed" ? "Bar speed" : "Effort"}</Text>
            <Text style={[st.sheetNoteText, st.sheetSub]}>
              {chooser === "speed" ? "How fast the bar moved." : "How hard the lift felt."}
            </Text>
            <View style={st.optGroup}>
            {(chooser === "speed" ? SPEED_OPTIONS : EFFORT_OPTIONS).map((o, i) => (
              <TouchableOpacity key={o} style={[st.sheetOpt, i === 0 && st.sheetOptFirst]}
                onPress={() => {
                  if (chooser === "speed") { setSpeedVal(o); setSpeedOn(true); }
                  else { setEffortVal(o); setEffortOn(true); }
                  setChooser(null);
                }}>
                <Text style={st.sheetOptText}>{o}</Text>
                {((chooser === "speed" && speedOn && speedVal === o) ||
                  (chooser === "effort" && effortOn && effortVal === o)) && (
                  <View style={st.optCheck}>
                    <Ionicons name="checkmark" size={14} color={olyPalette.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            </View>
            <TouchableOpacity style={st.hideOpt}
              onPress={() => {
                if (chooser === "speed") setSpeedOn(false); else setEffortOn(false);
                setChooser(null);
              }}>
              <Text style={st.hideOptText}>Don’t show on post</Text>
            </TouchableOpacity>
          </SheetSurface>
        </View>
      </Modal>

      {/* WEIGHT KEYPAD MODAL */}
      <Modal visible={weightModal} transparent animationType="fade" onRequestClose={() => setWeightModal(false)}>
        <KeyboardAvoidingView style={st.kav} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <SheetBackdrop onPress={() => setWeightModal(false)} />
          <View style={st.sheetWrap} pointerEvents="box-none">
            <SheetSurface style={st.sheet}>
              <SheetGrabber />
              <Text style={st.sheetTitle}>Weight</Text>
              <View style={st.weightEditRow}>
                <TextInput
                  style={st.weightInput}
                  value={weightDraft}
                  onChangeText={setWeightDraft}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  autoFocus
                  placeholder="0"
                  placeholderTextColor={olyColors.text.disabled}
                />
                <Text style={st.weightEditUnit}>kg</Text>
              </View>
              <TouchableOpacity
                style={st.doneBtn}
                onPress={() => {
                  const w = parseFloat(weightDraft);
                  if (Number.isFinite(w) && w > 0 && w <= 400) {
                    setWeight(Math.round(w * 10) / 10);
                    setWeightModal(false);
                  } else {
                    showError("Enter a weight between 1 and 400 kg");
                  }
                }}
              >
                <Text style={st.doneText}>Done</Text>
              </TouchableOpacity>
            </SheetSurface>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <MediaPickerSheet
        visible={videoSheet}
        onCancel={() => {
          setVideoSheet(false);
          if (sheetFirstOpen.current && !videoUri) router.back();
        }}
        onPick={onSheetPick}
        onUseSystemPicker={() => {
          setVideoSheet(false);
          /* Let the sheet finish closing before iOS presents its picker. */
          setTimeout(() => pickFromSystem(sheetFirstOpen.current && !videoUri), 450);
        }}
      />
    </SafeAreaView>
  );
}

/* ── Show-on-post pill (quiet grammar: on = tint+border, off = neutral dim) ── */
function Pill({ on, onPress, children }: { on: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity hitSlop={3}
      style={[st.pill, on ? st.pillOn : st.pillOff]}
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}

/* ── Styles ─────────────────────────── */

/* Selected-state tints. */
const TINT = olyColors.glass.accentFill;
const TINT_BORDER = olyColors.glass.accentBorder;

const st = {
  ...StyleSheet.create({
    safe: { flex: 1, backgroundColor: olyPalette.background },
    kav: { flex: 1 },
    headerWrap: { zIndex: 3, paddingBottom: olySpacing[8] },

    header: {
      flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
      paddingHorizontal: olyLayout.screenPadding, paddingTop: olySpacing[8],
    },
    kicker: {
      ...olyTypography.caption, color: olyColors.text.disabled,
      letterSpacing: olyLetterSpacing.uppercase, marginBottom: 2,
    },
    title: { ...olyTypography.title1, fontFamily: olyFonts.bold, color: olyColors.text.primary },
    close: {
      width: 38, height: 38, borderRadius: olyRadius.full,
      backgroundColor: olyColors.glass.card, borderWidth: 1, borderColor: olyColors.glass.border,
      alignItems: "center", justifyContent: "center",
      marginTop: olySpacing[4],
    },

    scroll: {
      paddingHorizontal: olyLayout.screenPadding,
      paddingBottom: 140,
    },

    /* video hero */
    hero: {
      borderRadius: olyRadius.xl, overflow: "hidden",
      aspectRatio: 4 / 4.2, backgroundColor: olyColors.glass.card,
      borderWidth: 1, borderColor: olyColors.glass.border,
    },
    heroImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
    heroLoading: { alignItems: "center", justifyContent: "center" },
    heroFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "46%" },
    playBtn: {
      position: "absolute", top: "50%", left: "50%", marginLeft: -29, marginTop: -32,
      width: 58, height: 58, borderRadius: olyRadius.full,
      backgroundColor: olyColors.media.chip,
      alignItems: "center", justifyContent: "center",
    },
    replaceBtn: {
      position: "absolute", right: 14, top: 14,
      width: 36, height: 36, borderRadius: olyRadius.full,
      backgroundColor: olyColors.media.chip,
      alignItems: "center", justifyContent: "center",
    },
    stamp: { position: "absolute", left: 20, bottom: 18 },
    stampLift: { ...olyTypography.bodySmall, color: olyColors.text.secondary, marginBottom: 2 },
    stampKg: { ...olyTypography.display, fontSize: 34, color: olyColors.text.primary },
    stampUnit: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
    timecode: {
      position: "absolute", right: 20, bottom: 20,
      ...olyTypography.caption, color: olyColors.text.secondary,
    },

    setRow: { flexDirection: "row", gap: olySpacing[8], marginTop: olySpacing[12] },
    setChip: {
      width: 40, height: 40, borderRadius: olyRadius.inner,
      backgroundColor: olyColors.glass.card, borderWidth: 1, borderColor: olyColors.glass.border, alignItems: "center", justifyContent: "center",
      opacity: 0.5,
    },
    setChipOn: { opacity: 1, borderWidth: 1, borderColor: olyPalette.primary },
    setChipText: { ...olyTypography.caption, color: olyColors.text.secondary },
    setChipTextOn: { color: olyColors.text.primary },

    secLabel: {
      ...olyTypography.caption, color: olyColors.text.disabled,
      letterSpacing: olyLetterSpacing.uppercase,
      marginTop: olySpacing[24], marginBottom: olySpacing[8], marginLeft: 2,
    },

    /* the lift stat cards */
    liftRow: { flexDirection: "row", gap: olySpacing[8] },
    statCard: {
      backgroundColor: olyColors.glass.card, borderWidth: 1, borderColor: olyColors.glass.border, borderRadius: olyRadius.tile,
      paddingHorizontal: olySpacing[16], paddingVertical: olySpacing[12],
      gap: olySpacing[8],
    },
    statK: {
      ...olyTypography.caption, color: olyColors.text.secondary,
      letterSpacing: olyLetterSpacing.uppercase, fontSize: 11,
    },
    statVRow: { height: 26, flexDirection: "row", alignItems: "center" },
    statVal: {
      fontSize: 18, fontFamily: olyFonts.medium, color: olyColors.text.primary,
      flexShrink: 1,
    },
    statPlaceholder: { color: olyColors.text.disabled, fontFamily: olyFonts.regular },
    statUnit: { ...olyTypography.caption, color: olyColors.text.disabled, marginLeft: olySpacing[4] },
    chev: { marginLeft: 7 },
    repsRow: { justifyContent: "space-between" },
    stepBtn: {
      width: 26, height: 26, borderRadius: olyRadius.full,
      backgroundColor: olyColors.glass.raised,
      alignItems: "center", justifyContent: "center",
    },
    stepBtnOff: { opacity: 0.28 },
    stepTxt: { fontSize: 14, color: olyColors.text.secondary, lineHeight: 16 },

    /* golden ticket — same surface grammar as the pills (tint + border) */
    ticketCard: {
      borderRadius: olyRadius.xl, borderWidth: 1,
      borderColor: TINT_BORDER, backgroundColor: TINT,
      paddingHorizontal: olySpacing[16], paddingVertical: olySpacing[16],
      marginTop: olySpacing[16], overflow: "hidden",
    },
    sheen: {
      position: "absolute", top: -60, bottom: -60, width: 90, left: 0,
    },
    ticketRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[12] },
    ticketTitle: {
      ...olyTypography.body, fontFamily: olyFonts.medium,
      color: olyColors.text.primary, marginBottom: 3,
    },
    ticketSub: { ...olyTypography.caption, color: olyColors.text.secondary, lineHeight: 17 },
    ticketGlow: { color: olyColors.text.primary, fontFamily: olyFonts.medium },
    tgl: {
      width: 50, height: 30, borderRadius: olyRadius.full,
      backgroundColor: olyColors.glass.selected, padding: 3,
    },
    tglOn: { backgroundColor: olyPalette.primary },
    tglKnob: {
      width: 24, height: 24, borderRadius: olyRadius.full,
      backgroundColor: olyColors.text.disabled,
    },
    tglKnobOn: {
      transform: [{ translateX: 20 }], backgroundColor: olyPalette.white,
      ...olyGlow.sm,
    },
    stamped: {
      marginTop: olySpacing[12], paddingTop: olySpacing[12],
      borderTopWidth: 1, borderStyle: "dashed", borderTopColor: olyColors.border.brandUnselected,
    },
    tRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingVertical: olySpacing[8],
    },
    bwField: {
      flexDirection: "row", alignItems: "baseline", gap: olySpacing[4],
      // brand white at the Design Bible's "subtle" opacity — a light well on the blue card
      backgroundColor: olyColors.bg.avatar, borderRadius: olyRadius.sm,
      paddingHorizontal: olySpacing[12], paddingVertical: olySpacing[8],
    },
    bwInput: {
      minWidth: 40, padding: 0, textAlign: "right",
      fontSize: 16, fontFamily: olyFonts.medium, color: olyColors.text.primary,
    },
    bwUnit: { fontSize: 11, color: olyColors.text.secondary },
    miniLabel: {
      fontSize: 11, color: olyColors.text.disabled,
      letterSpacing: olyLetterSpacing.uppercase, fontFamily: olyFonts.medium,
    },
    miniValue: {
      ...olyTypography.body, fontFamily: olyFonts.medium,
      color: olyColors.text.primary,
    },
    proof: { ...olyTypography.caption, color: olyColors.text.disabled, marginTop: olySpacing[8], lineHeight: 16 },

    /* caption */
    caption: {
      backgroundColor: olyColors.glass.inset, borderWidth: 1, borderColor: olyColors.glass.border, borderRadius: olyRadius.tile,
      paddingHorizontal: olySpacing[16], paddingVertical: olySpacing[12],
      minHeight: 76, ...olyTypography.body, color: olyColors.text.primary,
    },

    /* pills */
    pills: { flexDirection: "row", flexWrap: "wrap", gap: olySpacing[8] },
    pill: {
      borderRadius: olyRadius.full, borderWidth: 1,
      paddingHorizontal: olySpacing[16], paddingVertical: 10,
    },
    pillOn: { backgroundColor: TINT, borderColor: TINT_BORDER },
    pillOff: { backgroundColor: olyColors.glass.card, borderColor: olyColors.glass.border, opacity: 0.6 },

    /* visibility */
    visRow: {
      flexDirection: "row", backgroundColor: olyColors.glass.card, borderWidth: 1, borderColor: olyColors.glass.border,
      borderRadius: olyRadius.full, padding: 3,
    },
    visOpt: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: olySpacing[8], paddingVertical: olySpacing[12], borderRadius: olyRadius.full,
    },
    visOn: { backgroundColor: olyColors.glass.border },
    visText: {
      ...olyTypography.caption, fontFamily: olyFonts.medium,
      color: olyColors.text.secondary, letterSpacing: olyLetterSpacing.uppercase,
    },
    visTextOn: { color: olyPalette.white },

    /* sticky post */
    postBar: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      paddingHorizontal: olyLayout.screenPadding,
      paddingBottom: olySpacing[32], paddingTop: olySpacing[32],
    },
    postBtn: {
      height: olyLayout.gymTouchTarget, borderRadius: olyRadius.full,
      backgroundColor: olyPalette.primary, ...olyGlow.md,
      alignItems: "center", justifyContent: "center",
    },
    postBtnDim: {
      backgroundColor: olyColors.glass.control, borderWidth: 1,
      borderColor: olyColors.glass.border, shadowOpacity: 0,
    },
    postBtnClaim: {
      ...olyGlow.md,
      shadowOffset: { width: 0, height: 4 }, elevation: 8,
    },
    postText: { ...olyTypography.button, fontFamily: olyFonts.bold, color: olyPalette.white },
    postTextDim: { color: olyColors.text.secondary },

    /* sheets */
    sheetWrap: {
      flex: 1, justifyContent: "flex-end", paddingHorizontal: SHEET_SIDE,
    },
    sheet: {
      paddingHorizontal: olyLayout.cardPadding, paddingTop: olySpacing[12],
      paddingBottom: olySpacing[40],
    },
    sheetLabel: {
      ...olyTypography.caption, color: olyColors.text.disabled,
      letterSpacing: olyLetterSpacing.uppercase,
      marginTop: olySpacing[16], marginBottom: olySpacing[4],
    },
    sheetTitle: { fontFamily: olyFonts.bold, fontSize: 20, lineHeight: 26, color: olyColors.text.primary },
    sheetNote: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: olySpacing[4] },
    sheetNoteText: { ...olyTypography.caption, color: olyColors.text.secondary },
    chipRanked: {
      flexDirection: "row", alignItems: "center", gap: 6,
      borderColor: olyColors.glass.accentBorder, backgroundColor: olyColors.glass.accentFill,
    },
    chipTextRanked: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
    sheetOpt: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingVertical: olySpacing[16],
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: olyColors.glass.rule,
    },
    sheetOptText: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.primary },
    sheetOptFirst: { borderTopWidth: 0 },
    sheetSub: { marginTop: olySpacing[4], marginBottom: olySpacing[16] },
    optGroup: {
      borderRadius: olyRadius.tile, overflow: "hidden", paddingHorizontal: olySpacing[16],
      backgroundColor: olyColors.glass.card,
      borderWidth: 1, borderColor: olyColors.glass.border,
    },
    optCheck: {
      width: 24, height: 24, borderRadius: olyRadius.lg, backgroundColor: olyPalette.primary,
      alignItems: "center", justifyContent: "center",
      ...olyGlow.sm,
    },
    hideOpt: {
      marginTop: olySpacing[12], minHeight: 50, borderRadius: olyRadius.full,
      alignItems: "center", justifyContent: "center",
      backgroundColor: olyColors.glass.control,
      borderWidth: 1, borderColor: olyColors.glass.border,
    },
    hideOptText: { ...olyTypography.body, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
    sheetChips: { flexDirection: "row", flexWrap: "wrap", gap: olySpacing[8], paddingTop: olySpacing[8] },
    /* Quiet until picked: no tint, a thin outline. Blue means selected. */
    chip: {
      minHeight: 36, justifyContent: "center",
      borderRadius: olyRadius.full,
      borderWidth: 1, borderColor: olyColors.glass.border, backgroundColor: olyColors.glass.card,
      paddingHorizontal: 14,
    },
    complexRow: {
      flexDirection: "row", alignItems: "center", gap: olySpacing[8], marginTop: olySpacing[12],
    },
    complexInput: {
      flex: 1, ...olyTypography.bodySmall, color: olyColors.text.primary,
      minHeight: 40, paddingHorizontal: olySpacing[16],
      borderRadius: olyRadius.full, borderWidth: 1, borderColor: olyColors.glass.border,
      backgroundColor: olyColors.glass.inset,
    },
    complexDone: {
      minHeight: 40, paddingHorizontal: olySpacing[16], borderRadius: olyRadius.full,
      backgroundColor: olyPalette.primary, alignItems: "center", justifyContent: "center",
    },
    complexDoneText: { ...olyTypography.label, color: olyPalette.white },
    chipOn: { backgroundColor: olyPalette.primary, borderColor: olyPalette.primary, ...olyGlow.md, },
    chipText: { ...olyTypography.bodySmall, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
    chipTextOn: { color: olyPalette.white },

    /* weight modal */
    weightEditRow: {
      flexDirection: "row", alignItems: "baseline", justifyContent: "center",
      gap: olySpacing[8], paddingVertical: olySpacing[16],
    },
    weightInput: {
      minWidth: 110, textAlign: "center", padding: 0,
      fontSize: 44, fontFamily: olyFonts.medium, color: olyColors.text.primary,
    },
    weightEditUnit: { ...olyTypography.body, color: olyColors.text.disabled },
    doneBtn: {
      height: olyLayout.minTouchTarget + 8, borderRadius: olyRadius.full,
      backgroundColor: olyPalette.primary, alignItems: "center", justifyContent: "center",
      marginTop: olySpacing[8], ...olyGlow.md,
    },
    doneText: { ...olyTypography.button, color: olyPalette.white },
  }),
  /* dynamic text styles for pills */
  pillText: (on: boolean) => ({
    fontSize: 13.5,
    color: on ? olyColors.text.secondary : olyColors.text.disabled,
  }),
  pillBold: (on: boolean) => ({
    fontSize: 13.5,
    fontFamily: olyFonts.medium,
    color: on ? olyColors.text.primary : olyColors.text.disabled,
  }),
};
