import { OlyIcon } from "@/components/icons/OlyIcon";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { Glass } from "@/src/oly-components/shop/ShopKit";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import { useLikePostMutation, useUnLikePostMutation } from "@/store/api";
import { getRelativeTime } from "@/utils/time";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import CommentBottomSheet from "./comment-bottom-sheet";
import { getInitials } from "./comment-card";

/**
 * Feed card, Feed A on the canvas ("Glass cards, PR glow").
 *
 * A floating glass card per post. The video sits inside with rounded
 * corners, chips on the frame top left (rank, verified, PR, top set, only
 * the ones the post actually has), the weight stamped bottom left and the
 * lift bottom right.
 *
 * Reads only what the post payload carries. Rank chips use
 * `athlete_rank` and `athlete_board`, which the backend does not send yet,
 * so until it does those chips simply do not render.
 */


/** Blue glowing chip for the headline fact, glass chip for the rest. */
function FrameChip({ label, hot }: { label: string; hot?: boolean }) {
  if (hot) {
    return (
      <View style={[s.chip, s.chipHot]}>
        <Text style={s.chipHotText}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={[s.chip, s.chipGlass]}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}

/** A post's frame chips, top left of the video. Renders nothing without chips. */
export function FrameChipRow({ post }: { post: any }) {
  const chips = frameChips(post);
  if (chips.length === 0) return null;
  return (
    <View style={s.chips} pointerEvents="none">
      {chips.map((c) => (
        <FrameChip key={c.label} label={c.label} hot={c.hot} />
      ))}
    </View>
  );
}

/** The chips a post earns, in order of importance. Never padded. */
function frameChips(post: any): { label: string; hot?: boolean }[] {
  const d = post?.session_detail ?? {};
  const out: { label: string; hot?: boolean }[] = [];
  const rank = Number(post?.athlete_rank);
  const kg = Number(d.lifted_kg);
  const best = Number(post?.athlete_best_kg);
  if (post?.isPR === true || (kg > 0 && best > 0 && kg > best)) {
    const gain = best > 0 && kg > best ? ` +${Math.round((kg - best) * 10) / 10} kg` : "";
    out.push({ label: `PR${gain}`, hot: true });
  }
  if (Number.isFinite(rank) && rank > 0) {
    out.push({
      label: `#${rank}${post?.athlete_board ? ` ${post.athlete_board}` : ""}`,
      hot: out.length === 0,
    });
    out.push({ label: "Verified" });
  }
  if (d.top_set === true) out.push({ label: "Top set" });
  return out.slice(0, 3);
}

interface Props {
  post: any;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
  isVisible?: boolean;
}

export default function FeedCard({ post, onPress, onLongPress, isVisible }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef<Video>(null);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => setIsLiked(post.isLiked ?? false), [post.isLiked]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible) videoRef.current.playAsync().catch(() => {});
    else videoRef.current.pauseAsync().catch(() => {});
  }, [isVisible]);

  useFocusEffect(
    React.useCallback(() => () => {
      videoRef.current?.pauseAsync().catch(() => {});
    }, []),
  );

  const handleLike = async () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((n: number) => n + (next ? 1 : -1));
    try {
      await (next ? likePost(post._id) : unlikePost(post._id)).unwrap();
    } catch {
      setIsLiked(!next);
      setLikeCount((n: number) => n + (next ? -1 : 1));
    }
  };

  const share = () =>
    Share.share({ message: `https://olytraining.com/post/${post._id}` }).catch(() => {});

  const open = () => onPress?.(post._id);
  const author = post.name || post.username || "Athlete";
  const subtitle = [post.country, post.athlete_board].filter(Boolean).join(" · ");
  const kg = post.session_detail?.lifted_kg;
  const note = (post.opinion || "").trim();
  const comments = post.commentCount ?? 0;

  return (
    <Glass radius={olyRadius.sheet} style={s.card}>
      <View style={s.author}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{getInitials(author)}</Text>
        </View>
        <View style={s.flex}>
          <Text style={s.name} numberOfLines={1}>{author}</Text>
          {!!subtitle && <Text style={s.sub} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <Text style={s.time}>{getRelativeTime(post.createdAt)}</Text>
      </View>

      <Pressable
        onPress={open}
        onLongPress={() => onLongPress?.(post._id)}
        delayLongPress={300}
        style={s.media}
        accessibilityRole="button"
        accessibilityLabel={`${author}, ${kg ?? ""} kilos, ${post.lift_name}`}
      >
        <Video
          ref={videoRef}
          source={{ uri: post.video_url }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isMuted
          isLooping
        />
        <LinearGradient
          colors={olyColors.media.fade}
          style={s.scrim}
          pointerEvents="none"
        />
        <FrameChipRow post={post} />
        <View style={s.stamp} pointerEvents="none">
          {kg != null && (
            <View style={s.kgRow}>
              <Text style={s.kg}>{kg}</Text>
              <Text style={s.kgUnit}>kg</Text>
            </View>
          )}
          <Text style={s.lift} numberOfLines={1}>
            {String(post.lift_name || "").toUpperCase()}
          </Text>
        </View>
      </Pressable>

      <View style={s.actions}>
        <Pressable
          onPress={handleLike}
          hitSlop={12}
          style={s.action}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? "Unlike" : "Like"}
        >
          <OlyIcon name="heart" size={22} filled={isLiked} color={isLiked ? olyColors.accent : olyColors.text.primary} />
          {likeCount > 0 && <Text style={s.count}>{likeCount}</Text>}
        </Pressable>
        <Pressable
          onPress={() => sheetRef.current?.present()}
          hitSlop={12}
          style={s.action}
          accessibilityRole="button"
          accessibilityLabel="Comments"
        >
          <OlyIcon name="messages" size={22} color={olyColors.text.primary} />
          {comments > 0 && <Text style={s.count}>{comments}</Text>}
        </Pressable>
        <Pressable onPress={share} hitSlop={12} accessibilityRole="button" accessibilityLabel="Share">
          <Ionicons name="paper-plane-outline" size={21} color={olyColors.text.primary} />
        </Pressable>
      </View>

      {!!note && (
        <Pressable onPress={() => setNoteOpen(true)} disabled={noteOpen}>
          <Text style={s.note} numberOfLines={noteOpen ? undefined : 2}>
            <Text style={s.noteName}>{author.split(" ")[0]} </Text>
            {note}
          </Text>
        </Pressable>
      )}

      <CommentBottomSheet ref={sheetRef} postId={post._id} />
    </Glass>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { marginHorizontal: olySpacing[12], marginTop: 14, padding: olySpacing[8] },
  author: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 6, paddingTop: 6, paddingBottom: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.selected,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: olyFonts.medium, fontSize: 13, color: olyColors.text.primary },
  name: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.text.primary },
  sub: { marginTop: 1, fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },
  time: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.hint },

  media: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: olyRadius.tile,
    overflow: "hidden",
    backgroundColor: olyColors.glass.media,
  },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "45%" },
  chips: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { height: 28, paddingHorizontal: 10, borderRadius: olyRadius.full, justifyContent: "center", overflow: "hidden" },
  chipHot: { backgroundColor: olyColors.accent, ...olyGlow.md },
  chipHotText: { fontFamily: olyFonts.bold, fontSize: 12, color: olyColors.media.ink },
  chipGlass: { backgroundColor: olyColors.glass.onMedia, borderWidth: 1, borderColor: olyColors.glass.border },
  chipText: { fontFamily: olyFonts.medium, fontSize: 12, color: olyColors.text.primary },
  stamp: { position: "absolute", left: 16, right: 16, bottom: 14, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  kgRow: { flexDirection: "row", alignItems: "baseline", gap: olySpacing[4] },
  kg: { fontFamily: olyFonts.bold, fontSize: 56, lineHeight: 56, letterSpacing: -2, color: olyColors.media.ink },
  kgUnit: { fontFamily: olyFonts.bold, fontSize: 15, color: olyColors.media.ink },
  lift: { marginBottom: 6, fontFamily: olyFonts.medium, fontSize: 12, letterSpacing: 1.5, color: olyColors.media.inkSoft },

  actions: { flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: olySpacing[8], paddingTop: olySpacing[12], paddingBottom: 6 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  count: { fontFamily: olyFonts.medium, fontSize: 14, color: olyColors.text.primary },
  note: { paddingHorizontal: olySpacing[8], paddingBottom: olySpacing[8], fontFamily: olyFonts.regular, fontSize: 14, lineHeight: 20, color: olyColors.text.primary },
  noteName: { fontFamily: olyFonts.bold },
});
