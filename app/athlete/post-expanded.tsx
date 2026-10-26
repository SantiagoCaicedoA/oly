/**
 * PostExpanded. The lift, full size, and the conversation about it: the
 * player, stat tiles for what the post recorded, and the comment thread.
 *
 * The frame chips repeat here because a shared link lands on this screen
 * cold and has to make sense without the feed card above it.
 */

import { olyGlow } from "@/src/oly-theme/oly-elevation";
import CommentCard, { CommentData, getInitials } from "@/components/comment-card";
import { FrameChipRow } from "@/components/feed-card";
import PostMenu from "@/components/post-menu";
import { useSelector } from "react-redux";
import { Glass, Glows, kit } from "@/src/oly-components/shop/ShopKit";
import { BlurView } from "expo-blur";
import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import {
  useGetProfileQuery,
  useCommentOnPostMutation,
  useGetCommentsQuery,
  useGetPostByIdQuery,
  useLikePostMutation,
  useUnLikePostMutation,
} from "@/store/api";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { OlyIcon } from "@/components/icons/OlyIcon";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";

/* The player takes most of the screen. Lifts are filmed vertically and the
   point of opening a post is to see the rep, not the chrome around it. */
const PLAYER_HEIGHT = Math.round(Dimensions.get("window").height * 0.58);
const CONTROLS_H = 32;

/* Tap to cycle: normal, then straight to the slowest and climb back.
   One tap lands on the rate you actually opened the post for, because
   nobody taps a speed control hoping for a small change. From there each
   tap speeds up until you are back at normal.

   0.25 is the turnover and the catch. A snatch spends about two tenths of
   a second there. 0.5 is the bar path. */
const RATES = [1, 0.25, 0.5] as const;

function fmt(ms: number): string {
  const t = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

export default function PostExpanded() {
  const { post_id } = useLocalSearchParams();
  const { data, isLoading } = useGetPostByIdQuery(post_id as string);
  const post = data?.data;
  const session = post?.session_detail;

  /* The thread lives on the page, not in a sheet. */
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
  /* Comments are written inline, right under the thread. No sheet. */
  const scrollRef = useRef<ScrollView>(null);
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(100);
  const [menuOpen, setMenuOpen] = useState(false);
  const myId: string | undefined = useSelector((st: any) => st?.auth?.user?._id);
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [commentOnPost, { isLoading: isSending }] = useCommentOnPostMutation();
  const canSend = draft.trim().length > 0 && !isSending;

  const focusComposer = useCallback(() => {
    inputRef.current?.focus();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  }, []);

  const startReply = useCallback(
    (id: string, name: string) => {
      setReplyTo({ id, name });
      focusComposer();
    },
    [focusComposer],
  );

  const sendComment = useCallback(async () => {
    const text = draft.trim();
    if (!text || !post_id) return;
    try {
      await commentOnPost({
        postId: post_id as string,
        text,
        parentComment: replyTo?.id ?? null,
      }).unwrap();
      setDraft("");
      setReplyTo(null);
      Keyboard.dismiss();
    } catch (e) {
      console.error("Comment error:", e);
    }
  }, [draft, post_id, replyTo, commentOnPost]);

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
  const tiles = buildTiles(post);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={styles.root}>
          <Glows variant="shop" />
          <View style={styles.screen}>
            {/* ── who, and a way back. Floats over the scroll with a fade. */}
            <OlyFloatingHeader onLayout={onHeaderLayout}>
            <View style={styles.nav}>
              <Pressable hitSlop={4}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={({ pressed }) => pressed && kit.pressed}
              >
                <Glass radius={olyRadius.full} style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={20} color={olyColors.text.primary} />
                </Glass>
              </Pressable>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(author)}</Text>
              </View>
              <View style={styles.navText}>
                <Text style={styles.navName} numberOfLines={1}>
                  {author}
                </Text>
                <Text style={styles.navMeta} numberOfLines={1}>
                  {[post.user?.profile?.country, getRelativeTime(post.createdAt)]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
              <Pressable hitSlop={4}
                onPress={() => setMenuOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="More options"
                style={({ pressed }) => pressed && kit.pressed}
              >
                <Glass radius={olyRadius.full} style={styles.navBtn}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={olyColors.text.primary} />
                </Glass>
              </Pressable>
            </View>
            </OlyFloatingHeader>

            <KeyboardAvoidingView
              style={styles.flex}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.scroll, { paddingTop: headerH }]}
              scrollIndicatorInsets={{ top: headerH }}
              showsVerticalScrollIndicator={false}
            >
              {/* ── the lift, in a glass card ─────────────────── */}
              <Glass radius={olyRadius.sheet} style={styles.card}>
                <View style={styles.player}>
                  <Video
                    ref={videoRef}
                    style={StyleSheet.absoluteFill}
                    source={{ uri: post.video_url }}
                    posterSource={post.thumbnail_url ? { uri: post.thumbnail_url } : undefined}
                    usePoster={!!post.thumbnail_url}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay
                    onPlaybackStatusUpdate={onStatus}
                  />
                  <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={togglePlay}
                    accessibilityRole="button"
                    accessibilityLabel={isPlaying ? "Pause" : "Play"}
                  />
                  <FrameChipRow post={post} />

                  {/* Glass control bar, always up. */}
                  <View style={styles.controls}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    <Pressable
                      onPress={togglePlay}
                      hitSlop={14}
                      accessibilityRole="button"
                      accessibilityLabel={isPlaying ? "Pause" : "Play"}
                    >
                      <Ionicons name={isPlaying ? "pause" : "play"} size={16} color={olyColors.media.ink} />
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
                      hitSlop={{ top: 11, bottom: 11, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: rateIdx !== 0 }}
                      accessibilityLabel={`Playback speed, ${RATES[rateIdx]} times. Tap for ${
                        RATES[(rateIdx + 1) % RATES.length]
                      } times.`}
                      style={[styles.rate, rateIdx !== 0 && styles.rateOn]}
                    >
                      <Text style={styles.rateText}>{RATES[rateIdx]}&#215;</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => videoRef.current?.presentFullscreenPlayer().catch(() => {})}
                      hitSlop={14}
                      accessibilityRole="button"
                      accessibilityLabel="Full screen"
                    >
                      <Ionicons name="scan-outline" size={17} color={olyColors.media.ink} />
                    </Pressable>
                  </View>
                </View>

                {/* Weight and lift under the video, then the caption. */}
                <View style={styles.liftBlock}>
                  <View style={styles.stamp}>
                    {!!kg && (
                      <View style={styles.kgRow}>
                        <Text style={styles.kg}>{kg}</Text>
                        <Text style={styles.kgUnit}>kg</Text>
                      </View>
                    )}
                    {!!post.lift_name && (
                      <Text style={styles.liftName} numberOfLines={1}>
                        {String(post.lift_name).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  {!!post.opinion && <Text style={styles.note}>{post.opinion}</Text>}
                </View>

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
                      size={22}
                      filled={isLiked}
                      color={isLiked ? olyColors.glass.glow : olyColors.text.primary}
                    />
                    <Text style={styles.actionCount}>{likeCount}</Text>
                  </Pressable>
                  <Pressable
                    onPress={focusComposer}
                    hitSlop={olySpacing[12]}
                    accessibilityRole="button"
                    accessibilityLabel="Comments"
                    style={styles.action}
                  >
                    <OlyIcon name="messages" size={22} color={olyColors.text.primary} />
                    <Text style={styles.actionCount}>{post.commentCount ?? 0}</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleShare}
                    style={styles.share}
                    hitSlop={olySpacing[12]}
                    accessibilityRole="button"
                    accessibilityLabel="Share"
                  >
                    <Ionicons name="paper-plane-outline" size={21} color={olyColors.text.primary} />
                  </Pressable>
                </View>
              </Glass>

              {/* ── stat tiles, two by two, only what was recorded ── */}
              {tiles.length > 0 && (
                <View style={styles.grid}>
                  {tiles.map((t, i) => {
                    const alone = i === tiles.length - 1 && i % 2 === 0;
                    const tile = (
                      <Glass
                        radius={olyRadius.tile}
                        colors={t.hot ? olyColors.glass.ticket : undefined}
                        borderColor={t.hot ? olyColors.glass.accentBorder : undefined}
                        style={styles.tileInner}
                      >
                        <Text style={styles.tileLabel}>{t.label}</Text>
                        <Text style={styles.tileValue} numberOfLines={1}>
                          {t.value}
                        </Text>
                        <Text style={styles.tileSub} numberOfLines={1}>
                          {t.sub}
                        </Text>
                        {t.meter && (
                          <View style={styles.meter}>
                            {Array.from({ length: t.meter[1] }).map((_, k) => (
                              <View
                                key={k}
                                style={[styles.meterSeg, k < t.meter![0] && styles.meterOn]}
                              />
                            ))}
                          </View>
                        )}
                        {t.link && <Text style={styles.tileLink}>{t.link}</Text>}
                      </Glass>
                    );
                    return t.onPress ? (
                      <Pressable
                        key={t.label}
                        onPress={t.onPress}
                        style={({ pressed }) => [styles.tile, alone && styles.tileAlone, pressed && kit.pressed]}
                      >
                        {tile}
                      </Pressable>
                    ) : (
                      <View key={t.label} style={[styles.tile, alone && styles.tileAlone]}>
                        {tile}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* ── the conversation ──────────────────────────── */}
              <Glass radius={olyRadius.xl} style={styles.thread}>
                <Text style={styles.threadHead}>
                  {comments.length === 1 ? "1 COMMENT" : `${comments.length} COMMENTS`}
                </Text>
                {comments.map((c) => (
                  <CommentCard
                    key={c._id}
                    comment={c}
                    postId={post_id as string}
                    onReply={startReply}
                  />
                ))}
                {replyTo && (
                  <View style={styles.replyStrip}>
                    <Text style={styles.replyText}>
                      Replying to <Text style={styles.replyName}>@{replyTo.name}</Text>
                    </Text>
                    <Pressable
                      onPress={() => setReplyTo(null)}
                      hitSlop={14}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel reply"
                    >
                      <Ionicons name="close" size={16} color={olyColors.text.secondary} />
                    </Pressable>
                  </View>
                )}
                <View style={styles.addRow}>
                  <OlyAvatar source={myAvatar} name={myName} size="small" />
                  <TextInput
                    ref={inputRef}
                    style={styles.addInput}
                    placeholder={replyTo ? `Reply to @${replyTo.name}` : "Add a comment"}
                    placeholderTextColor={olyColors.text.hint}
                    value={draft}
                    onChangeText={setDraft}
                    onFocus={() =>
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250)
                    }
                    multiline
                    maxLength={500}
                  />
                  {draft.trim().length > 0 && (
                    <Pressable
                      onPress={sendComment}
                      disabled={!canSend}
                      hitSlop={5}
                      style={({ pressed }) => [styles.sendBtn, pressed && kit.pressed]}
                      accessibilityRole="button"
                      accessibilityLabel="Send comment"
                    >
                      {isSending ? (
                        <ActivityIndicator size="small" color={olyColors.media.ink} />
                      ) : (
                        <Ionicons name="arrow-up" size={18} color={olyColors.media.ink} />
                      )}
                    </Pressable>
                  )}
                </View>
              </Glass>
            </ScrollView>
            </KeyboardAvoidingView>

          </View>
          <PostMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            postId={post._id}
            authorId={post.user?._id}
            authorName={author}
            isMine={!!myId && post.user?._id === myId}
          />
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

type Tile = {
  label: string;
  value: string;
  sub: string;
  meter?: [number, number];
  link?: string;
  hot?: boolean;
  onPress?: () => void;
};

const SPEEDS = ["slow", "medium", "fast"];
const EFFORTS = ["easy", "moderate", "hard", "max"];

/* Every tile maps to a field the post stores. A missing field is a missing
   tile, never a placeholder. */
function buildTiles(post: any): Tile[] {
  const d = post?.session_detail ?? {};
  const kg = Number(d.lifted_kg);
  const bw = Number(d.bodyweight_kg);
  const out: Tile[] = [];
  if (Number.isFinite(kg) && kg > 0 && Number.isFinite(bw) && bw > 0) {
    out.push({
      label: "BODYWEIGHT",
      value: `${(kg / bw).toFixed(2)}x`,
      sub: `${kg} kg at ${bw} kg`,
    });
  }
  if (d.bar_speed) {
    const i = SPEEDS.indexOf(String(d.bar_speed).toLowerCase());
    out.push({
      label: "BAR SPEED",
      value: String(d.bar_speed),
      sub: "How the bar moved",
      meter: i >= 0 ? [i + 1, 3] : undefined,
    });
  }
  if (d.effort) {
    const i = EFFORTS.indexOf(String(d.effort).toLowerCase());
    out.push({
      label: "EFFORT",
      value: String(d.effort),
      sub: i >= 0 ? `${i + 1} of 4` : "How it felt",
      meter: i >= 0 ? [i + 1, 4] : undefined,
    });
  }
  const rank = Number(post?.athlete_rank);
  if (Number.isFinite(rank) && rank > 0) {
    out.push({
      label: "LEADERBOARD",
      value: `#${rank}`,
      sub: post?.athlete_board || "On the board",
      link: "See the board ›",
      hot: true,
      onPress: () => router.push("/(tabs)/rank"),
    });
  }
  return out;
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: olyColors.bg.page },
  screen: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingBottom: olySpacing[32] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", gap: olySpacing[12] },
  missing: { ...olyTypography.body, color: olyColors.text.secondary },
  missingBack: { ...olyTypography.body, color: olyColors.accent },

  nav: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: olySpacing[16], paddingTop: olySpacing[8], paddingBottom: olySpacing[4] },
  navBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.selected,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: olyFonts.medium, fontSize: 14, color: olyColors.text.primary },
  navText: { flex: 1, minWidth: 0 },
  navName: { fontFamily: olyFonts.bold, fontSize: 16, color: olyColors.text.primary },
  navMeta: { marginTop: 1, fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },

  card: { marginHorizontal: olySpacing[12], marginTop: 14, padding: olySpacing[8] },
  player: { height: PLAYER_HEIGHT, borderRadius: olyRadius.tile, overflow: "hidden", backgroundColor: olyColors.glass.media },

  controls: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    height: 40,
    paddingHorizontal: olySpacing[12],
    borderRadius: olyRadius.full,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: olyColors.glass.onMedia,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  time: { fontFamily: olyFonts.medium, fontSize: 12, color: olyColors.media.ink, fontVariant: ["tabular-nums"], minWidth: 30 },
  track: { flex: 1, height: CONTROLS_H, justifyContent: "center" },
  trackFill: { height: 3, borderRadius: 2, backgroundColor: olyColors.media.track },
  trackPlayed: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 2, backgroundColor: olyColors.glass.glow },
  thumb: { position: "absolute", top: -4, width: 11, height: 11, marginLeft: -5.5, borderRadius: 6, backgroundColor: olyColors.media.ink },
  rate: { paddingHorizontal: olySpacing[8], height: 22, borderRadius: olyRadius.full, borderWidth: 1, borderColor: olyColors.media.outline, justifyContent: "center" },
  rateOn: { backgroundColor: olyColors.glass.glow, borderColor: olyColors.glass.glow },
  rateText: { fontFamily: olyFonts.bold, fontSize: 12, color: olyColors.media.ink },

  liftBlock: { paddingHorizontal: olySpacing[8], paddingTop: 14 },
  stamp: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  kgRow: { flexDirection: "row", alignItems: "baseline", gap: olySpacing[4] },
  kg: { fontFamily: olyFonts.bold, fontSize: 56, lineHeight: 58, letterSpacing: -2, color: olyColors.text.primary },
  kgUnit: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary },
  liftName: { marginBottom: olySpacing[8], fontFamily: olyFonts.medium, fontSize: 12, letterSpacing: 1.5, color: olyColors.text.primary },
  note: { marginTop: olySpacing[8], fontFamily: olyFonts.regular, fontSize: 15, lineHeight: 21, color: olyColors.text.primary },

  actions: { flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: olySpacing[8], paddingTop: 14, paddingBottom: olySpacing[8] },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionCount: { fontFamily: olyFonts.medium, fontSize: 14, color: olyColors.text.primary },
  share: { marginLeft: "auto" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: olySpacing[8], marginHorizontal: olySpacing[12], marginTop: 10 },
  tile: { flexBasis: "48%", flexGrow: 1 },
  tileAlone: { flexBasis: "100%" },
  tileInner: { padding: 14, minHeight: 112 },
  tileLabel: { fontFamily: olyFonts.medium, fontSize: 11, letterSpacing: 1.5, color: olyColors.text.secondary },
  tileValue: { marginTop: 6, fontFamily: olyFonts.bold, fontSize: 22, lineHeight: 26, color: olyColors.text.primary },
  tileSub: { marginTop: 1, fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },
  tileLink: { marginTop: 10, fontFamily: olyFonts.medium, fontSize: 12, color: olyColors.text.primary },
  meter: { flexDirection: "row", gap: 3, marginTop: 10 },
  meterSeg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: olyColors.glass.raised },
  meterOn: { backgroundColor: olyColors.glass.glow, ...olyGlow.sm, },

  thread: { marginHorizontal: olySpacing[12], marginTop: 10, paddingHorizontal: olySpacing[16], paddingTop: 14, paddingBottom: olySpacing[12] },
  threadHead: { fontFamily: olyFonts.medium, fontSize: 11, letterSpacing: 1.5, color: olyColors.text.secondary, marginBottom: olySpacing[4] },
  addRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: olySpacing[8],
    padding: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.raised,
  },
  addInput: {
    flex: 1,
    minHeight: 32,
    maxHeight: 110,
    paddingTop: 7,
    paddingBottom: 7,
    fontFamily: olyFonts.regular,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.glow,
    alignItems: "center",
    justifyContent: "center",
    ...olyGlow.md,
  },
  replyStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: olySpacing[8], paddingHorizontal: olySpacing[4] },
  replyText: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.hint },
  replyName: { fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  flex: { flex: 1 },
});
