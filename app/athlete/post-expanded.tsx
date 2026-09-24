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
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import {
  useGetPostByIdQuery,
  useLikePostMutation,
  useUnLikePostMutation,
} from "@/store/api";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
const AVATAR = 32;

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

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const hasInteractedLike = useRef(false);

  const videoRef = useRef<Video>(null);
  const [slowMo, setSlowMo] = useState(false);
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

  /* Half speed, pitch uncorrected. Coaches watch the turnover frame by frame
     and this is the one thing a general-purpose feed cannot give them. */
  const toggleSlowMo = useCallback(async () => {
    const next = !slowMo;
    setSlowMo(next);
    try {
      await videoRef.current?.setRateAsync(next ? 0.5 : 1, false);
    } catch {
      setSlowMo(!next);
    }
  }, [slowMo]);

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
  const bw = Number(session?.bodyweight_kg);
  const multiple =
    Number.isFinite(kg) && Number.isFinite(bw) && bw > 0
      ? `${(kg / bw).toFixed(2)}× BW`
      : null;
  /* One line, because a shared link arrives here with no card above it. */
  const liftLine = [
    post.lift_name?.toUpperCase(),
    multiple,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.screen} edges={["top"]}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
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
                useNativeControls
                shouldPlay
              />

              <Pressable
                onPress={toggleSlowMo}
                hitSlop={olySpacing[8]}
                accessibilityRole="button"
                accessibilityState={{ selected: slowMo }}
                accessibilityLabel={
                  slowMo ? "Play at full speed" : "Play at half speed"
                }
                style={[styles.rate, slowMo && styles.rateOn]}
              >
                <Text style={[styles.rateText, slowMo && styles.rateTextOn]}>
                  0.5&#215;
                </Text>
              </Pressable>

              {!!kg && (
                <View style={styles.liftLine} pointerEvents="none">
                  <Text style={styles.liftKg}>
                    {kg}
                    <Text style={styles.liftUnit}> KG</Text>
                  </Text>
                  {!!liftLine && (
                    <Text style={styles.liftMeta} numberOfLines={1}>
                      {liftLine}
                    </Text>
                  )}
                </View>
              )}
            </View>

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
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={26}
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
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={olyColors.text.primary}
                />
                <Text style={styles.actionCount}>{post.commentCount ?? 0}</Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                hitSlop={olySpacing[12]}
                accessibilityRole="button"
                accessibilityLabel="Share"
                style={styles.share}
              >
                <Ionicons
                  name="share-outline"
                  size={24}
                  color={olyColors.text.primary}
                />
              </Pressable>
            </View>

            {!!post.opinion && (
              <Text style={styles.note}>
                <Text style={styles.noteName}>{post.username} </Text>
                {post.opinion}
              </Text>
            )}
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
  screen: { flex: 1, backgroundColor: olyColors.bg.card },
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
    backgroundColor: olyColors.bg.activeHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.caption,
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },
  navText: { flex: 1, minWidth: 0 },
  navName: { ...olyTypography.body, fontFamily: olyFonts.medium },
  navMeta: { ...olyTypography.caption, color: olyColors.text.secondary },

  player: {
    width: "100%",
    height: PLAYER_HEIGHT,
    backgroundColor: "#000000",
    justifyContent: "flex-end",
  },
  /* Native controls own the bottom of the frame, so the rate toggle sits top
     right where nothing else is drawn. */
  rate: {
    position: "absolute",
    top: olySpacing[12],
    right: olySpacing[12],
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  rateOn: { backgroundColor: olyColors.accent, borderColor: olyColors.accent },
  rateText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: "#FFFFFF",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  rateTextOn: { color: "#FFFFFF" },

  /* Sits above the native control bar, not behind it. */
  liftLine: {
    position: "absolute",
    left: olySpacing[16],
    right: olySpacing[16],
    bottom: olySpacing[40] + olySpacing[16],
  },
  liftKg: {
    ...olyTypography.display,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
  },
  liftUnit: { ...olyTypography.caption, color: "rgba(255,255,255,0.75)" },
  liftMeta: {
    ...olyTypography.caption,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: olyLetterSpacing.uppercase,
    marginTop: olySpacing[4],
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[24],
    paddingHorizontal: olySpacing[16],
    paddingTop: olySpacing[16],
  },
  action: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  actionCount: { ...olyTypography.body, color: olyColors.text.primary },
  share: { marginLeft: "auto" },

  note: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    paddingHorizontal: olySpacing[16],
    paddingTop: olySpacing[16],
  },
  noteName: { fontFamily: olyFonts.medium },
});
