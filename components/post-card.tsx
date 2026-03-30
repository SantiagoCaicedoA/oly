import { Images } from "@/assets";
import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { useLikePostMutation, useUnLikePostMutation } from "@/store/api";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CommentBottomSheet from "./comment-bottom-sheet";

interface PostCardProps {
  post: {
    _id: string;
    video_url: string;
    opinion: string;
    lift_name: string;
    session_detail: any;
    createdAt: string;
    username: string;
    name: string;
    isLiked: boolean;
    commentCount: number;
    likeCount: number;
    country: string;
    thumbnail_url: string;
  };
  onPress?: (post_id: string) => void;
  isVisible?: boolean;
}

/* ── Constants ──────────────────────────────────────── */

const AVATAR_SIZE = 44;
const MENU_ICON_SIZE = 20;
const ACTION_ICON_SIZE = 24;
const VIDEO_HEIGHT = 420;

/* ── Helpers ────────────────────────────────────────── */

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/* ── Component ──────────────────────────────────────── */

export default function PostCard({ post, onPress, isVisible }: PostCardProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [videoDuration, setVideoDuration] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setIsLiked(post.isLiked ?? false);
  }, [post.isLiked]);

  const handlePress = () => {
    if (onPress) onPress(post._id);
  };

  /* ── Autoplay on scroll (Instagram-style) ── */
  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible) {
      videoRef.current.playAsync();
      setIsPlaying(true);
    } else {
      videoRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, [isVisible]);

  /* Pause on screen blur */
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.pauseAsync();
          setIsPlaying(false);
        }
      };
    }, []),
  );

  /* Long-press to pause, release to resume */
  const isLongPressing = useRef(false);

  const handleVideoPause = async () => {
    if (!videoRef.current) return;
    isLongPressing.current = true;
    try {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } catch {}
  };

  const handleVideoResume = async () => {
    if (!isLongPressing.current) return;
    isLongPressing.current = false;
    if (!videoRef.current || !isVisible) return;
    try {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    } catch {}
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (status.durationMillis && !videoDuration) {
        setVideoDuration(formatDuration(status.durationMillis));
      }
      if (!videoReady) setVideoReady(true);
    }
    if (status.didJustFinish) {
      videoRef.current?.setPositionAsync(0);
      setIsPlaying(false);
    }
  };

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
      try {
        await unlikePost(post._id).unwrap();
      } catch (error) {
        console.error("Unlike error:", error);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      try {
        await likePost(post._id).unwrap();
      } catch (error) {
        console.error("Like error:", error);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
  };

  const handleCommentPress = () => {
    bottomSheetRef.current?.present();
  };

  const initials = getInitials(post.name || post.username);
  const liftedKg = post.session_detail?.lifted_kg;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      {/* ── Video ── */}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleVideoPause}
        onPressOut={handleVideoResume}
        delayLongPress={300}
        activeOpacity={0.95}
        style={styles.videoWrapper}
      >
        {/* Thumbnail — shown until video is ready */}
        {!videoReady && post.thumbnail_url && (
          <Image
            source={{ uri: post.thumbnail_url }}
            style={[styles.video, styles.thumbnailImage]}
            resizeMode="cover"
          />
        )}

        <Video
          ref={videoRef}
          source={{ uri: post.video_url }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isMuted={true}
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {/* Header overlay — top */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.7)", "transparent"]}
          locations={[0, 1]}
          style={styles.headerOverlay}
        >
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {post.name || post.username}
              </Text>
              <Text style={styles.time}>
                {getRelativeTime(post.createdAt)}
              </Text>
            </View>
            <TouchableOpacity hitSlop={olySpacing[12]} activeOpacity={0.6}>
              <Ionicons
                name="ellipsis-vertical"
                size={MENU_ICON_SIZE}
                color={olyPalette.white}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Lift info overlay — bottom */}
        {(post.lift_name || liftedKg) && (
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
            locations={[0, 1]}
            style={styles.liftInfoOverlay}
          >
            <View style={styles.liftInfoLeft}>
              {post.lift_name ? (
                <Text style={styles.liftName}>{post.lift_name}</Text>
              ) : null}
              {liftedKg ? (
                <View style={styles.weightRow}>
                  <Text style={styles.weightValue}>{liftedKg}</Text>
                  <Text style={styles.weightUnit}> kg</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.liftInfoRight}>
              {(post as any).isPR && (
                <View style={styles.prBadge}>
                  <Text style={styles.prBadgeText}>PR</Text>
                </View>
              )}
              {videoDuration && (
                <Text style={styles.durationText}>{videoDuration}</Text>
              )}
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* ── Bottom content ── */}
      <View style={styles.bottomContent}>
        {/* Caption */}
        {post.opinion ? (
          <Text style={styles.caption} numberOfLines={3}>
            <Text style={styles.captionUsername}>@{post.username} </Text>
            {post.opinion}
          </Text>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={ACTION_ICON_SIZE}
              color={isLiked ? olyPalette.primary : olyColors.text.secondary}
            />
            <Text style={styles.actionCount}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCommentPress}
            style={styles.actionButton}
          >
            <Ionicons
              name="chatbubble-outline"
              size={ACTION_ICON_SIZE - 2}
              color={olyColors.text.secondary}
            />
            <Text style={styles.actionCount}>{post.commentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CommentBottomSheet ref={bottomSheetRef} postId={post._id} />
    </TouchableOpacity>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    marginBottom: olySpacing[20],
    overflow: "hidden",
  },

  /* Video — full bleed */
  videoWrapper: {
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: VIDEO_HEIGHT,
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  /* Header overlay — top of video */
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olySpacing[16],
    paddingTop: olySpacing[12],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.text.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: olySpacing[12],
  },
  avatarText: {
    ...olyTypography.label,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
  },
  time: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },

  /* Lift info overlay — bottom of video */
  liftInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: olySpacing[16],
    paddingBottom: olySpacing[12],
    paddingTop: 80,
  },
  liftInfoLeft: {
    flex: 1,
  },
  liftInfoRight: {
    alignItems: "flex-end",
    gap: olySpacing[4],
  },
  liftName: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  weightValue: {
    ...olyTypography.number,
    color: olyPalette.white,
  },
  weightUnit: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  prBadge: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[8],
    paddingVertical: olySpacing[4],
  },
  prBadgeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  durationText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Bottom content */
  bottomContent: {
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
    gap: olySpacing[12],
  },

  /* Caption */
  caption: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  captionUsername: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  /* Actions */
  actionsRow: {
    flexDirection: "row",
    gap: olySpacing[16],
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  actionCount: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
});
