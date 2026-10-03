import { OlyIcon } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { useLikePostMutation, useUnLikePostMutation } from "@/store/api";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import CommentBottomSheet from "./comment-bottom-sheet";

/**
 * Feed post card.
 *
 * Design system: Feed and rank / FeedPostCard.
 *
 * FULL BLEED. The media runs edge to edge with no card, no gutter and no
 * corner radius, and posts are separated by a hairline rather than a gap.
 *
 * Why, measured rather than felt. The card surface is 1.35:1 against the
 * page, which is almost no separation, so boxing the video bought nothing
 * and cost 8.9% of its width, which is 18.5% of its area. Strava's feed
 * runs every band on one identical background and still reads as
 * structured, because the content itself goes to the edges. That is where
 * the structure comes from, not from surfaces.
 *
 * The layout, top to bottom:
 *  - Author. Name, then a quiet second line for whatever context exists.
 *    Not a bright accent label beside the name; that competed with the
 *    name and read like a handle.
 *  - Media, 4:5, with the weight and lift stamped on the frame.
 *  - The stat chips. Up to three, auto stats first, then what the athlete entered.
 *  - Actions, then the note.
 *
 * Deliberately NOT here: a "Details" label. The chevron says it, and the
 * strip it sits in is the tap target. When a post has no stats the strip
 * does not render and neither does the chevron, which is correct — that
 * post has nothing extra behind the tap.
 */

const AVATAR = 32;
const ACTION_ICON = 22;
/** Note length past which it truncates and offers "more". */
const NOTE_CLAMP = 2;
/** Progress ring on the "% of best" chip. */
const RING = 16;
const RING_R = 6.5;
const RING_C = 2 * Math.PI * RING_R;

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

type Chip = {
  value: string;
  label: string;
  /** "best" draws a progress ring, "rank" the leaderboard bars. */
  icon?: "best" | "rank";
  /** 0 to 1, for the ring. */
  pct?: number;
};

/**
 * CHIPS — the stat row under the video.
 *
 * Auto chips first, then what the athlete entered, up to three in all.
 * Never padded: a missing fact is absent, and zero chips means no row.
 *
 * Auto chips read `athlete_best_kg`, `athlete_rank` and `athlete_board`
 * from the post payload. The backend does not send them yet; until it
 * does those chips simply do not render.
 */
function buildChips(post: any): Chip[] {
  const d = post?.session_detail ?? {};
  const kg = Number(d.lifted_kg);
  const bw = Number(d.bodyweight_kg);
  const best = Number(post?.athlete_best_kg);
  const rank = Number(post?.athlete_rank);
  const effort = d.effort ?? post?.effort;
  const out: Chip[] = [];

  if (Number.isFinite(kg) && kg > 0 && Number.isFinite(best) && best > 0) {
    if (kg > best) {
      out.push({ value: `+${Math.round((kg - best) * 10) / 10} kg`, label: "new best", icon: "best", pct: 1 });
    } else {
      const pct = kg / best;
      out.push({ value: `${Math.round(pct * 100)}%`, label: "of best", icon: "best", pct });
    }
  }
  if (Number.isFinite(rank) && rank > 0) {
    out.push({ value: `#${rank}`, label: post?.athlete_board || "rank", icon: "rank" });
  }
  if (Number.isFinite(kg) && Number.isFinite(bw) && bw > 0) {
    out.push({ value: `${(kg / bw).toFixed(1)}×`, label: "bodyweight" });
  }
  if (effort) out.push({ value: String(effort), label: "effort" });
  if (d.bar_speed) out.push({ value: String(d.bar_speed), label: "bar speed" });
  if (d.top_set === true) out.push({ value: "Top", label: "set" });

  return out.slice(0, 3);
}

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
  onLongPress?: (post_id: string) => void;
  isVisible?: boolean;
  /** First post in the feed. Drops the top rule so it does not read as
      an underline on the header. A separator needs something on both
      sides of it. */
  first?: boolean;
}

export default function PostCard({
  post,
  onPress,
  onLongPress,
  isVisible,
  first,
}: PostCardProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const videoRef = useRef<Video>(null);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => setIsLiked(post.isLiked ?? false), [post.isLiked]);

  /* Autoplay while the card is on screen */
  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible) videoRef.current.playAsync();
    else videoRef.current.pauseAsync();
  }, [isVisible]);

  useFocusEffect(
    React.useCallback(() => () => videoRef.current?.pauseAsync(), []),
  );

  const handleStatus = (status: any) => {
    if (status.didJustFinish) videoRef.current?.setPositionAsync(0);
  };

  const handleLike = async () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((n) => n + (next ? 1 : -1));
    try {
      await (next ? likePost(post._id) : unlikePost(post._id)).unwrap();
    } catch {
      setIsLiked(!next);
      setLikeCount((n) => n + (next ? -1 : 1));
    }
  };

  const open = () => onPress?.(post._id);

  const liftedKg = post.session_detail?.lifted_kg;
  const isPR = (post as any).isPR === true;
  const chips = buildChips(post);
  /* Both can be absent on a post. getInitials guards for that; the note
     byline calls .split() on it, which would throw and take the feed down. */
  const author = post.name || post.username || "Athlete";
  /* Whatever context exists. Today that is the country; weight class and
     club slot in here when the post payload carries them. */
  const subtitle = [(post as any).athlete_board, post.country].filter(Boolean).join(" · ");
  const note = (post.opinion || "").trim();
  const comments = post.commentCount ?? 0;

  return (
    <View style={[styles.post, first && styles.postFirst]}>
      {/* Author */}
      <View style={styles.author}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(author)}</Text>
        </View>
        <View style={styles.authorText}>
          <Text style={styles.name} numberOfLines={1}>
            {author}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Text style={styles.time}>{getRelativeTime(post.createdAt)}</Text>
      </View>

      {/* Media. Long press opens the context menu; there is no ellipsis. */}
      <Pressable
        onPress={open}
        onLongPress={() => onLongPress?.(post._id)}
        delayLongPress={300}
        style={styles.media}
        accessibilityRole="button"
        accessibilityLabel={`${author}, ${liftedKg ?? ""} kilos, ${post.lift_name}`}
      >
        <Video
          ref={videoRef}
          source={{ uri: post.video_url }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isMuted
          isLooping
          onPlaybackStatusUpdate={handleStatus}
        />
        {/* Bottom only. A top scrim darkens every frame to fix a problem
            the author row above the video does not have. */}
        <LinearGradient
          colors={olyColors.media.scrim}
          locations={[0, 0.45, 1]}
          style={styles.scrim}
          pointerEvents="none"
        />
        <View style={styles.stamp} pointerEvents="none">
          {liftedKg != null && (
            <Text style={styles.kg}>
              {liftedKg}
              <Text style={styles.kgUnit}> KG</Text>
            </Text>
          )}
          <Text style={styles.liftName} numberOfLines={1}>
            {post.lift_name}
          </Text>
          {isPR && (
            <View style={styles.pr}>
              <Text style={styles.prText}>PR</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Stat chips. The whole row is the tap target. */}
      {chips.length > 0 && (
        <Pressable
          onPress={open}
          style={styles.chips}
          accessibilityRole="button"
          accessibilityLabel={`Open lift. ${chips
            .map((c) => `${c.value} ${c.label}`)
            .join(", ")}`}
        >
          {chips.map((c) => (
            <View
              key={c.label}
              style={[styles.chip, c.icon && styles.chipWithIcon]}
            >
              {c.icon === "best" && (
                <Svg width={RING} height={RING} viewBox="0 0 16 16">
                  <Circle
                    cx={8}
                    cy={8}
                    r={RING_R}
                    fill="none"
                    stroke={olyPalette.cardElevated}
                    strokeWidth={2.5}
                  />
                  <Circle
                    cx={8}
                    cy={8}
                    r={RING_R}
                    fill="none"
                    stroke={olyColors.accent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={`${RING_C * Math.min(1, c.pct ?? 0)} ${RING_C}`}
                    transform="rotate(-90 8 8)"
                  />
                </Svg>
              )}
              {c.icon === "rank" && (
                <OlyIcon
                  name="rank"
                  size={RING}
                  filled
                  color={olyColors.text.secondary}
                />
              )}
              <Text style={styles.chipValue} numberOfLines={1}>
                {c.value}
              </Text>
              <Text style={styles.chipLabel} numberOfLines={1}>
                {c.label}
              </Text>
            </View>
          ))}
        </Pressable>
      )}

      <View style={styles.body}>
        {note ? (
          <Pressable onPress={() => setNoteOpen(true)} disabled={noteOpen}>
            <Text
              style={styles.note}
              numberOfLines={noteOpen ? undefined : NOTE_CLAMP}
            >
              <Text style={styles.noteName}>{author.split(" ")[0]} </Text>
              {note}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={handleLike}
            hitSlop={olySpacing[8]}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? "Unlike" : "Like"}
          >
            {/* A liked heart is text.primary. Brand blue is 1.6:1 here
                and would read as no change at all. */}
            <OlyIcon
              name="heart"
              size={ACTION_ICON}
              filled={isLiked}
              color={
                isLiked ? olyColors.text.primary : olyColors.text.secondary
              }
            />
            {likeCount > 0 && <Text style={styles.count}>{likeCount}</Text>}
          </Pressable>

          <Pressable
            onPress={() => sheetRef.current?.present()}
            hitSlop={olySpacing[8]}
            style={styles.action}
            accessibilityRole="button"
            accessibilityLabel="Comments"
          >
            <OlyIcon
              name="messages"
              size={ACTION_ICON}
              color={olyColors.text.secondary}
            />
            {comments > 0 && <Text style={styles.count}>{comments}</Text>}
          </Pressable>
        </View>

      </View>

      <CommentBottomSheet ref={sheetRef} postId={post._id} />
    </View>
  );
}

const styles = StyleSheet.create({
  /* No card, no radius, no margin. One quiet rule between posts is the
     only separator on the whole card. Everything else is spacing. */
  post: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.border.hairline,
  },
  postFirst: { borderTopWidth: 0 },

  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8] + 1,
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[8] + 2,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  authorText: { flex: 1, minWidth: 0 },
  name: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  subtitle: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: 1,
  },
  time: { ...olyTypography.caption, color: olyColors.text.disabled },

  media: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: olyPalette.cardElevated,
  },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "52%" },
  stamp: {
    position: "absolute",
    left: olyLayout.screenPadding,
    right: olyLayout.screenPadding,
    bottom: olySpacing[12],
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
    /* Opposite end of the frame from the weight. Sitting next to KG it read
       as one run-on label; pushed right it becomes the other half of a pair,
       and the gap between them is what tells you they are different facts. */
    marginLeft: "auto",
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.media.inkSoft,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  pr: {
    marginLeft: "auto",
    alignSelf: "center",
    backgroundColor: olyColors.accent,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[8] + 1,
    paddingVertical: 2,
  },
  /* Was dark ink, measured against the old #4A90EF accent. Against the new
     #107BDB the numbers invert: dark ink is 4.05:1 and white is 4.30:1. */
  prText: {
    ...olyTypography.caption,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: olyFonts.bold,
    color: olyColors.text.onAccent,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Chips, not tiles. Boxed tiles read as an old dashboard; a row of
     pills sits lighter under full-bleed media and wraps when it must. */
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12] + 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: olySpacing[12],
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.bg.card,
  },
  chipWithIcon: { paddingLeft: olySpacing[8] },
  chipValue: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  chipLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  body: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[20],
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[20],
    marginTop: olySpacing[12],
  },
  action: { flexDirection: "row", alignItems: "center", gap: olySpacing[4] + 2 },
  count: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  note: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  noteName: {
    fontFamily: olyFonts.bold,
    fontWeight: "700",
    color: olyColors.text.primary,
  },
});
