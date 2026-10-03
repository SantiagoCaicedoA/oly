/**
 * PostExpanded — the lift, full size, and the conversation about it.
 *
 * This screen used to be built for the training pillar: a Details/Notes tab
 * switcher, a list of working sets, and a coach's insight. All of it was
 * invented. The sets were derived arithmetically from lifted_kg and the
 * insight was one hardcoded paragraph about RPE 8.5, identical on every post
 * in the app.
 *
 * A single is three seconds with no sensor behind it, so there is no second
 * screen's worth of data to show and no honest way to manufacture one. What a
 * tap is actually for is watching the lift properly and saying something. So
 * that is the whole screen: the player, and the conversation.
 *
 * Everything the card already showed stays on the card. The one exception is
 * the line burned onto the frame, which is here because a shared link lands
 * on this screen cold and has to make sense without the card above it.
 */

import CommentBottomSheet from "@/components/comment-bottom-sheet";
import CommentCard, { CommentData } from "@/components/comment-card";
import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import {
  useGetProfileQuery,
  useGetCommentsQuery,
  useGetPostByIdQuery,
  useLikePostMutation,
  useUnLikePostMutation,
} from "@/store/api";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { LinearGradient } from "expo-linear-gradient";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

/* The player takes most of the screen. Lifts are filmed vertically and the
   point of opening a post is to see the rep, not the chrome around it. */
const PLAYER_HEIGHT = Math.round(Dimensions.get("window").height * 0.58);
const CONTROLS_H = 32;

/* Tap to cycle: normal, then straight to the slowest and climb back.
   One tap lands on the rate you actually opened the post for, because
   nobody taps a speed control hoping for a small change. From there each
   tap speeds up until you are back at normal.

   0.25 is the turnover and the catch — a snatch spends about two tenths of
   a second there, which is the whole argument for this button existing.
   0.5 is the bar path.

   (2x was here briefly and cut: on a four second clip, double speed is a
   two second clip.) */
const RATES = [1, 0.25, 0.5] as const;
const AVATAR = 32;

type Cell = { value: string; label: string };

/* Mirrors buildCells in post-card.tsx, with one difference: the card slices
   to three because three is what fits across one row. This screen lays them
   out two by two, so TOP SET survives. Order is fixed, not data-driven, so
   BAR SPEED is always the second cell whether or not BODYWEIGHT is there. */
function buildCells(d: any): Cell[] {
  const kg = Number(d?.lifted_kg);
  const bw = Number(d?.bodyweight_kg);
  const out: Cell[] = [];
  if (Number.isFinite(kg) && Number.isFinite(bw) && bw > 0) {
    out.push({ value: `${(kg / bw).toFixed(2)}`, label: "bodyweight" });
  }
  if (d?.bar_speed) out.push({ value: String(d.bar_speed), label: "bar speed" });
  if (d?.effort) out.push({ value: String(d.effort), label: "effort" });
  if (d?.top_set === true) out.push({ value: "Yes", label: "top set" });
  return out;
}

function fmt(ms: number): string {
  const t = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export default function PostExpanded() {
  const { post_id } = useLocalSearchParams();
  const { data, isLoading } = useGetPostByIdQuery(post_id as string);
  const post = data?.data;
  const session = post?.session_detail;

  /* The sheet is still there for writing one, but the thread itself belongs
     on the page. Tapping twice to read three comments is the tab switcher
     problem in a different shape. */
  const { data: commentsData } = useGetCommentsQuery(
    { postId: post_id as string },
    { skip: !post_id },
  );
  const comments: CommentData[] = commentsData?.data ?? [];

  /* The compose row shows who is about to speak. Same source the profile
     screen reads, so the face here and the face there cannot disagree. */
  const meQ = useGetProfileQuery();
  const myName =
    meQ.data?.data?.name || meQ.data?.data?.profile?.display_name || undefined;
  const myAvatar =
    meQ.data?.data?.profile?.profile_image_url ||
    meQ.data?.data?.photo_url ||
    undefined;

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const hasInteractedLike = useRef(false);

  const videoRef = useRef<Video>(null);
  const [rateIdx, setRateIdx] = useState(0);
  /* expo-av's own controls auto-hide, which is wrong for a three second
     clip: by the time you decide to scrub back to the turnover they are
     gone and you have to tap to summon them. This screen draws its own bar
     and leaves it up. */
  const [isPlaying, setIsPlaying] = useState(true);
  const [posMs, setPosMs] = useState(0);
  const [durMs, setDurMs] = useState(0);
  const [scrubMs, setScrubMs] = useState<number | null>(null);
  const barW = useRef(0);

  const onStatus = useCallback((st: AVPlaybackStatus) => {
    if (!st.isLoaded) return;
    setIsPlaying(st.isPlaying);
    setPosMs(st.positionMillis ?? 0);
    if (st.durationMillis) setDurMs(st.durationMillis);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.pauseAsync().catch(() => {});
    else v.playAsync().catch(() => {});
  }, [isPlaying]);

  /* locationX is relative to the bar itself, so no measuring is needed.
     Clamped because a drag can travel past either end. */
  const seekPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          if (!durMs || !barW.current) return;
          const r = Math.min(Math.max(e.nativeEvent.locationX, 0), barW.current);
          setScrubMs((r / barW.current) * durMs);
        },
        onPanResponderMove: (e) => {
          if (!durMs || !barW.current) return;
          const r = Math.min(Math.max(e.nativeEvent.locationX, 0), barW.current);
          setScrubMs((r / barW.current) * durMs);
        },
        onPanResponderRelease: () => {
          setScrubMs((ms) => {
            if (ms != null) videoRef.current?.setPositionAsync(ms).catch(() => {});
            return null;
          });
        },
        onPanResponderTerminate: () => setScrubMs(null),
      }),
    [durMs],
  );

  const shownMs = scrubMs ?? posMs;
  const pct = durMs > 0 ? Math.min(shownMs / durMs, 1) : 0;
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (post && !hasInteractedLike.current) {
      setIsLiked(post.isLiked ?? false);
      setLikeCount(post.likeCount ?? 0);
    }
  }, [post]);

  const handleLike = useCallback(async () => {
    if (!post_id) return;
    hasInteractedLike.current = true;
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((n) => (wasLiked ? n - 1 : n + 1));
    try {
      const call = wasLiked ? unlikePost : likePost;
      await call(post_id as string).unwrap();
    } catch {
      setIsLiked(wasLiked);
      setLikeCount((n) => (wasLiked ? n + 1 : n - 1));
    }
  }, [post_id, isLiked, likePost, unlikePost]);

  /* Pitch uncorrected, which is what an editor does: a bar landing at
     quarter speed should sound like it. Correction makes percussive audio
     warble. */
  const cycleRate = useCallback(async () => {
    const next = (rateIdx + 1) % RATES.length;
    setRateIdx(next);
    try {
      await videoRef.current?.setRateAsync(RATES[next], false);
    } catch {
      setRateIdx(rateIdx);
    }
  }, [rateIdx]);

  const handleShare = useCallback(() => {
    if (!post?._id) return;
    Share.share({ message: `https://olytraining.com/post/${post._id}` }).catch(
      () => {},
    );
  }, [post?._id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={olyColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centre}>
          <Text style={styles.missing}>This post is no longer available.</Text>
          <Pressable onPress={() => router.back()} hitSlop={olySpacing[12]}>
            <Text style={styles.missingBack}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const author = post.name || post.username || "Athlete";
  const kg = Number(session?.lifted_kg);
  const cells = buildCells(session);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.screen} edges={["top"]}>
          {/* ── who, and a way back ───────────────────────── */}
          <View style={styles.nav}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={olySpacing[12]}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={olyColors.text.primary}
              />
            </Pressable>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(post.name || post.username)}
              </Text>
            </View>

            <View style={styles.navText}>
              <Text style={styles.navName} numberOfLines={1}>
                {author}
              </Text>
              <Text style={styles.navMeta} numberOfLines={1}>
                {[post.user?.profile?.country, getRelativeTime(post.createdAt)]
                  .filter(Boolean)
                  .join("  ·  ")}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* ── the lift ──────────────────────────────────── */}
            <View style={styles.player}>
              <Video
                ref={videoRef}
                style={StyleSheet.absoluteFill}
                source={{ uri: post.video_url }}
                posterSource={
                  post.thumbnail_url ? { uri: post.thumbnail_url } : undefined
                }
                usePoster={!!post.thumbnail_url}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay
                onPlaybackStatusUpdate={onStatus}
              />

              {/* Tapping the frame plays and pauses. */}
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={togglePlay}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? "Pause" : "Play"}
              />

              {/* The same scrim the feed card uses. Without it the weight is
                  white type straight onto whatever the lift was filmed on,
                  which for a platform shot is a near-white floor. */}
              <LinearGradient
                colors={olyColors.media.scrim}
                locations={[0, 0.45, 1]}
                style={styles.scrim}
                pointerEvents="none"
              />

              {!!kg && (
                <View style={styles.stamp} pointerEvents="none">
                  <Text style={styles.kg}>
                    {kg}
                    <Text style={styles.kgUnit}> KG</Text>
                  </Text>
                  {!!post.lift_name && (
                    <Text style={styles.liftName} numberOfLines={1}>
                      {post.lift_name}
                    </Text>
                  )}
                </View>
              )}

              {/* Always up. Play, elapsed, a bar you can drag, half speed,
                  full screen. */}
              <View style={styles.controls}>
                <Pressable
                  onPress={togglePlay}
                  hitSlop={olySpacing[12]}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? "Pause" : "Play"}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color={olyColors.media.ink}
                  />
                </Pressable>

                <Text style={styles.time}>{fmt(shownMs)}</Text>

                <View
                  style={styles.track}
                  onLayout={(e) => (barW.current = e.nativeEvent.layout.width)}
                  {...seekPan.panHandlers}
                >
                  <View style={styles.trackFill} pointerEvents="none">
                    <View style={[styles.trackPlayed, { width: `${pct * 100}%` }]} />
                    <View style={[styles.thumb, { left: `${pct * 100}%` }]} />
                  </View>
                </View>

                <Pressable
                  onPress={cycleRate}
                  hitSlop={olySpacing[8]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: rateIdx !== 0 }}
                  accessibilityLabel={`Playback speed, ${RATES[rateIdx]} times. Tap for ${
                    RATES[(rateIdx + 1) % RATES.length]
                  } times.`}
                  style={[styles.rate, rateIdx !== 0 && styles.rateOn]}
                >
                  <Text
                    style={[styles.rateText, rateIdx !== 0 && styles.rateTextOn]}
                  >
                    {RATES[rateIdx]}&#215;
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    videoRef.current?.presentFullscreenPlayer().catch(() => {})
                  }
                  hitSlop={olySpacing[8]}
                  accessibilityRole="button"
                  accessibilityLabel="Full screen"
                >
                  <Ionicons name="scan-outline" size={20} color={olyColors.media.ink} />
                </Pressable>
              </View>
            </View>

            {/* ── the facts, two by two ─────────────────────── */}
            {cells.length > 0 && (
              <View style={styles.grid}>
                {cells.map((c, i) => {
                  /* An odd last tile takes the row rather than sitting in
                     half of it with a gap beside it. */
                  const alone = i === cells.length - 1 && i % 2 === 0;
                  return (
                    <View
                      key={c.label}
                      style={[styles.gridCell, alone && styles.gridCellAlone]}
                    >
                      <Text style={styles.gridLabel} numberOfLines={1}>
                        {c.label}
                      </Text>
                      <Text style={styles.gridValue} numberOfLines={1}>
                        {c.value}
                        {c.label === "bodyweight" && (
                          <Text style={styles.gridTimes}>&#215;</Text>
                        )}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {!!post.opinion && (
              <Text style={styles.note}>
                <Text style={styles.noteName}>{post.username} </Text>
                {post.opinion}
              </Text>
            )}
            {/* ── what people do with it ────────────────────── */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleLike}
                hitSlop={olySpacing[12]}
                accessibilityRole="button"
                accessibilityState={{ selected: isLiked }}
                accessibilityLabel={isLiked ? "Unlike" : "Like"}
                style={styles.action}
              >
                <OlyIcon
                  name="heart"
                  size={26}
                  filled={isLiked}
                  color={isLiked ? olyColors.accent : olyColors.text.primary}
                />
                <Text style={styles.actionCount}>{likeCount}</Text>
              </Pressable>

              <Pressable
                onPress={() => bottomSheetRef.current?.present()}
                hitSlop={olySpacing[12]}
                accessibilityRole="button"
                accessibilityLabel="Comments"
                style={styles.action}
              >
                <OlyIcon name="messages" size={24} color={olyColors.text.primary} />
                <Text style={styles.actionCount}>{post.commentCount ?? 0}</Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={styles.share}
                hitSlop={olySpacing[12]}
                accessibilityRole="button"
                accessibilityLabel="Share"
              >
                <Ionicons
                  name="share-outline"
                  size={24}
                  color={olyColors.text.primary}
                />
              </Pressable>
            </View>

            {/* ── the conversation ──────────────────────────── */}
            {comments.length > 0 && (
              <View style={styles.thread}>
                <Text style={styles.threadHead}>
                  {comments.length === 1 ? "1 COMMENT" : `${comments.length} COMMENTS`}
                </Text>
                {comments.map((c) => (
                  <CommentCard
                    key={c._id}
                    comment={c}
                    postId={post_id as string}
                  />
                ))}
              </View>
            )}

            <Pressable
              style={styles.addRow}
              onPress={() => bottomSheetRef.current?.present()}
              accessibilityRole="button"
              accessibilityLabel="Add a comment"
            >
              <OlyAvatar source={myAvatar} name={myName} size="small" />
              <Text style={styles.addText}>Add a comment</Text>
            </Pressable>
          </ScrollView>

          <CommentBottomSheet
            ref={bottomSheetRef}
            postId={post_id as string}
          />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  /* The ground, not bg.card. On a card surface the chrome above and below
     the video is only 1.2:1 away from the footage, so the whole screen reads
     as one grey slab. On the ground the video is the only thing with any
     luminance on it, which is the point of opening the post. */
  screen: { flex: 1, backgroundColor: olyColors.bg.page },
  scroll: { paddingBottom: olySpacing[32] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", gap: olySpacing[12] },
  missing: { ...olyTypography.body, color: olyColors.text.secondary },
  missingBack: { ...olyTypography.body, color: olyColors.accent },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.bg.avatar,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.caption,
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },
  navText: { flex: 1, minWidth: 0 },
  navName: {
    ...olyTypography.body,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  navMeta: { ...olyTypography.caption, color: olyColors.text.secondary },

  player: {
    width: "100%",
    height: PLAYER_HEIGHT,
    backgroundColor: olyColors.media.black,
    justifyContent: "flex-end",
  },
  share: { marginLeft: "auto" },
  controls: {
    position: "absolute",
    left: olyLayout.screenPadding,
    right: olyLayout.screenPadding,
    bottom: olySpacing[12],
    height: CONTROLS_H,
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
  },
  time: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.media.inkSoft,
    minWidth: 34,
  },
  /* The touch target is the full height of the bar; the line inside it is
     3px. Dragging a 3px target is the single most annoying thing a video
     player can do. */
  track: { flex: 1, height: CONTROLS_H, justifyContent: "center" },
  trackFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: olyColors.media.track,
    justifyContent: "center",
  },
  trackPlayed: {
    height: 3,
    borderRadius: 2,
    backgroundColor: olyColors.media.ink,
  },
  thumb: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.media.ink,
    marginLeft: -5.5,
  },
  rate: {
    paddingHorizontal: olySpacing[8] + 2,
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.media.outline,
    /* Fixed width. "1x" and "0.25x" are different lengths, and without this
       the scrub bar beside it would resize on every tap. */
    minWidth: 52,
    alignItems: "center",
  },
  rateOn: { backgroundColor: olyColors.accent, borderColor: olyColors.accent },
  rateText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.bold,
    color: olyColors.media.ink,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  rateTextOn: { color: olyColors.text.onAccent },

  /* Everything from here down to `liftName` is the feed card's stamp, value
     for value, `bottom` included. It is the same lift on the same footage,
     so someone arriving from the card should not be able to tell the type
     moved.

     `bottom` is the one value that differs. This screen keeps a control bar
     permanently on the frame, so the stamp sits above it rather than at the
     card's 12. */
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "52%" },
  stamp: {
    position: "absolute",
    left: olyLayout.screenPadding,
    right: olyLayout.screenPadding,
    bottom: CONTROLS_H + olySpacing[8],
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[8],
  },
  kg: {
    ...olyTypography.hero,
    fontFamily: olyFonts.bold,
    fontSize: 44,
    lineHeight: 46,
    color: olyColors.text.primary,
    letterSpacing: -1.4,
  },
  kgUnit: {
    ...olyTypography.caption,
    fontFamily: olyFonts.bold,
    color: olyColors.media.inkSoft,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  liftName: {
    /* Hard right, opposite the weight. Same as the card. */
    marginLeft: "auto",
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.media.inkSoft,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    flexShrink: 1,
  },

  /* It sits between the stat grid's bottom rule and the thread's top rule,
     so it had a rule hard against it on both sides with only top padding of
     its own. Equal padding above and below, and the same 16 the rest of the
     screen uses. */
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[24],
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[16],
  },
  action: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  actionCount: { ...olyTypography.body, color: olyColors.text.primary },

  /* The feed card's tile, wrapping. Two across, because four labels of
     BODYWEIGHT's length will not fit one row at this width. */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
  },
  gridCell: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 0,
    backgroundColor: olyColors.bg.card,
    borderRadius: olyRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: olyColors.border.hairline,
    paddingVertical: olySpacing[12],
    paddingHorizontal: olySpacing[12],
  },
  gridCellAlone: { flexBasis: "100%" },
  gridValue: {
    ...olyTypography.number,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
    letterSpacing: -0.3,
  },
  gridTimes: { ...olyTypography.caption, color: olyColors.text.disabled },
  gridLabel: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  note: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
  },
  /* fontWeight and fontFamily both, deliberately. The parent sets
     fontWeight "400" from the type scale, and on a nested Text that beats a
     bold family on its own — the name came out the same weight as the
     caption, so there was nothing marking where the caption starts. */
  noteName: { fontFamily: olyFonts.bold, fontWeight: "700" },

  thread: {
    paddingTop: olySpacing[16],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.border.hairline,
  },
  threadHead: {
    ...olyTypography.caption,
    fontFamily: olyFonts.bold,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    paddingHorizontal: olyLayout.screenPadding,
    marginBottom: olySpacing[12],
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[16],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.border.hairline,
  },
  addText: { ...olyTypography.body, color: olyColors.text.disabled },
});
