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
 *  - The stat strip. Up to three cells in a fixed order, taking the first
 *    three that carry data, plus a disclosure chevron. See STRIP below.
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

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

type Cell = { value: string; label: string };

/**
 * STRIP — one design, whatever the post happens to carry.
 *
 * Fixed order, first three that have data. Cells shift left to fill but
 * never reorder, which is why each one carries a label under its value:
 * a column that moves is only readable if it says what it is.
 *
 * Never padded. A missing fact is absent, not shown as missing. Zero
 * cells means no strip at all.
 *
 * `bodyweight_kg`, `bar_speed`, `effort` and `top_set` are collected by
 * the composer today and dropped before the request is sent. Until the
 * payload and the backend carry them, this returns [] for every post and
 * no strip renders. That is the correct empty state, not a bug.
 */
function buildCells(post: any): Cell[] {
  const d = post?.session_detail ?? {};
  const kg = Number(d.lifted_kg);
  const bw = Number(d.bodyweight_kg);
  const out: Cell[] = [];

  /* The fan stat. 142 kg means nothing to someone outside the sport;
     2.3x their own bodyweight lands for everyone, and it is the number
     weightlifting is uniquely built for. */
  if (Number.isFinite(kg) && Number.isFinite(bw) && bw > 0) {
    out.push({ value: `${(kg / bw).toFixed(1)}×`, label: "bodyweight" });
  }
  if (d.bar_speed) out.push({ value: String(d.bar_speed), label: "bar speed" });
  if (d.effort) out.push({ value: String(d.effort), label: "effort" });
  if (d.top_set === true) out.push({ value: "Yes", label: "top set" });

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
  const cells = buildCells(post);
  const author = post.name || post.username;
  /* Whatever context exists. Today that is the country; weight class and
     club slot in here when the post payload carries them. */
  const subtitle = [post.country].filter(Boolean).join(" · ");
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
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.28)", "rgba(0,0,0,0.72)"]}
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

      {/* Stat strip. The whole row is the tap target. */}
      {cells.length > 0 && (
        <Pressable
          onPress={open}
          style={styles.strip}
          accessibilityRole="button"
          accessibilityLabel={`Open lift. ${cells
            .map((c) => `${c.value} ${c.label}`)
            .join(", ")}`}
        >
          {cells.map((c) => (
            <View key={c.label} style={styles.cell}>
              {/* A short accent rule over each cell. It gives the row a
                  rhythm across the width without putting another line
                  through the card. It carries no meaning yet; colouring
                  it by the value would make it earn its place. */}
              <View style={styles.tick} />
              <Text style={styles.cellValue} numberOfLines={1}>
                {c.value}
              </Text>
              <Text style={styles.cellLabel} numberOfLines={1}>
                {c.label}
              </Text>
            </View>
          ))}
          {/* A disclosure chevron, in text-disabled. Not the accent: a
              bright arrow on media reads as "next", and it would be the
              loudest thing in a row of quiet facts. */}
          <View style={styles.chev}>
            <OlyIcon
              name="chevron"
              size={18}
              color={olyColors.text.disabled}
            />
          </View>
        </Pressable>
      )}

      <View style={styles.body}>
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

        {comments > 0 && (
          <Pressable onPress={() => sheetRef.current?.present()}>
            <Text style={styles.viewAll}>
              View {comments === 1 ? "1 comment" : `all ${comments} comments`}
            </Text>
          </Pressable>
        )}
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
    fontFamily: olyFonts.medium,
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
    fontSize: 44,
    lineHeight: 46,
    color: olyColors.text.primary,
    letterSpacing: -1.4,
  },
  kgUnit: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: "rgba(226, 232, 240, 0.8)",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  liftName: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: "rgba(226, 232, 240, 0.82)",
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
  /* Dark ink on the accent, 5.43:1. Not white, which is 2.2:1 on it. */
  prText: {
    ...olyTypography.caption,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: olyFonts.medium,
    color: "#0B1A2E",
    letterSpacing: olyLetterSpacing.uppercase,
  },

  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
    /* No bottom rule. Boxing this row made it read as a table cell and
       put a third line on a card that only needs one. Space separates it
       from the actions instead. */
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[4],
  },
  /* Each cell takes an equal share of the row rather than packing left.
     With three cells both read the same; with two, packing left leaves a
     void between the last cell and the chevron, which reads as content
     that failed to load. Spread, the same empty space sits BETWEEN two
     labelled columns, where it reads as a table. Same pixels, opposite
     impression. */
  cell: { flex: 1, minWidth: 0 },
  tick: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: olyColors.accent,
    marginBottom: olySpacing[8],
  },
  /* `number`, 20/26, not `bodySmall`. These cells are readouts and that
     is the token the scale defines for readouts. At 14 against an 11
     label there was no contrast and the row read as one grey block. */
  cellValue: {
    ...olyTypography.number,
    color: olyColors.text.primary,
    letterSpacing: -0.3,
  },
  /* 12 is the scale's floor. The mock used 10, which is off the scale. */
  cellLabel: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    textTransform: "uppercase",
    marginTop: 1,
  },
  chev: { marginLeft: "auto" },

  body: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[20],
  },
  actions: { flexDirection: "row", alignItems: "center", gap: olySpacing[20] },
  action: { flexDirection: "row", alignItems: "center", gap: olySpacing[4] + 2 },
  count: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
  note: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
  },
  noteName: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  viewAll: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
    marginTop: olySpacing[4] + 1,
  },
});
