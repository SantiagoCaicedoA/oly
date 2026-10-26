/**
 * LiftGrid, the profile's Lifts tab.
 *
 * LiftTile is one 4:5 frame: the video thumbnail (or a dark gradient), a
 * bottom scrim, the weight stamp and the lift name, and a glowing PR chip.
 * The Progress tab's competition lifts use the same tile.
 *
 * LiftsGrid lays the athlete's posts out three across, newest first, with
 * filter pills (All, PRs, then each lift type posted) once there are
 * enough lifts to need them. Tapping a tile opens the post.
 */

import type { Post } from "@/types/api/dashboard";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

const GRID_GAP = 6;
/** Tiles are 4:5 portrait. Height is set explicitly: aspectRatio collapses inside the wrapping grid. */
const TILE_RATIO = 5 / 4;
/** Below this many lifts the filter row is noise. */
const FILTER_MIN = 9;

/** The feed's post plus the two fields the grid reads that Post leaves out. */
type GridPost = Post & { thumbnail_url?: string; isPR?: boolean };

/** Short name for the tile stamp: "Clean & Jerk" fits as "C&J". */
const tileName = (name: string) =>
  /clean\s*(&|and)\s*jerk/i.test(name) ? "C&J" : name;

/** Filter group: every squat sits under one pill. */
const groupOf = (name: string) =>
  /squat/i.test(name) ? "Squats" : tileName(name);

export function LiftTile({
  kg,
  name,
  pr = false,
  thumbUrl,
  videoUrl,
  onPress,
  style,
}: {
  kg: number | null;
  name: string;
  pr?: boolean;
  thumbUrl?: string | null;
  /** Paused first frame when there is no thumbnail. */
  videoUrl?: string | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}${kg ? `, ${kg} kilos` : ""}${pr ? ", PR" : ""}`}
      style={({ pressed }) => [st.tile, style, pressed && st.pressed]}
    >
      <LinearGradient
        colors={[olyPalette.cardElevated, olyPalette.card]}
        style={StyleSheet.absoluteFill}
      />
      {thumbUrl ? (
        <Image source={{ uri: thumbUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : videoUrl ? (
        <Video
          source={{ uri: videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isMuted
        />
      ) : null}
      <LinearGradient colors={olyColors.media.fade} style={st.scrim} pointerEvents="none" />
      {pr && (
        <View style={st.pr}>
          <Text style={st.prText}>PR</Text>
        </View>
      )}
      <View style={st.stamp}>
        {kg ? (
          <Text style={st.kg} numberOfLines={1}>
            {kg}
            <Text style={st.kgUnit}>kg</Text>
          </Text>
        ) : null}
        <Text style={st.lift} numberOfLines={1}>
          {tileName(name).toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

export function LiftsGrid({
  posts,
  onOpenPost,
}: {
  posts: Post[];
  onOpenPost: (postId: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const [gridW, setGridW] = useState(0);
  const items = posts as GridPost[];

  const filters = useMemo(() => {
    const groups: string[] = [];
    for (const p of items) {
      const g = groupOf(p.lift_name || "");
      if (g && !groups.includes(g)) groups.push(g);
    }
    return ["All", "PRs", ...groups];
  }, [items]);

  if (items.length === 0) {
    return (
      <Text style={st.empty}>
        Your lifts collect here. Post a lift and it shows up in the grid.
      </Text>
    );
  }

  const showFilters = items.length >= FILTER_MIN;
  const active = showFilters && filters.includes(filter) ? filter : "All";
  const shown = items.filter((p) =>
    active === "All"
      ? true
      : active === "PRs"
        ? p.isPR === true
        : groupOf(p.lift_name || "") === active,
  );
  const tileW = gridW > 0 ? (gridW - GRID_GAP * 2) / 3 : 0;

  return (
    <View>
      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={st.filterScroll}
          contentContainerStyle={st.filters}
        >
          {filters.map((f) => {
            const on = f === active;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                hitSlop={{ top: 6, bottom: 6 }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[st.pill, on && st.pillOn]}
              >
                <Text style={[st.pillText, on && st.pillTextOn]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <View style={st.grid} onLayout={(e) => setGridW(e.nativeEvent.layout.width)}>
        {shown.map((p) => (
          <LiftTile
            key={p._id}
            kg={p.session_detail?.lifted_kg ?? null}
            name={p.lift_name || "Lift"}
            pr={p.isPR === true}
            thumbUrl={p.thumbnail_url}
            onPress={() => onOpenPost(p._id)}
            style={{ width: tileW, height: tileW * TILE_RATIO }}
          />
        ))}
      </View>
      {shown.length === 0 && <Text style={st.empty}>Nothing here yet.</Text>}
    </View>
  );
}

const st = StyleSheet.create({
  tile: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: olyColors.glass.rule,
    overflow: "hidden",
  },
  pressed: { opacity: 0.75 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" },
  pr: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: olySpacing[8],
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    ...olyGlow.md,
  },
  prText: { fontFamily: olyFonts.bold, fontSize: 10, lineHeight: 12, color: olyColors.text.onAccent },
  stamp: { position: "absolute", left: 10, right: 8, bottom: 9 },
  kg: {
    fontFamily: olyFonts.bold,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.8,
    color: olyColors.media.ink,
  },
  kgUnit: { fontSize: 10, letterSpacing: 0, color: olyColors.media.ink },
  lift: {
    marginTop: 3,
    fontFamily: olyFonts.medium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: olyColors.media.inkSoft,
  },
  filterScroll: { marginHorizontal: -olyLayout.screenPadding },
  filters: { gap: 6, paddingHorizontal: olyLayout.screenPadding, paddingBottom: olySpacing[12] },
  pill: {
    height: 32,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  pillOn: { backgroundColor: olyColors.glass.accentFill, borderColor: olyColors.glass.accentBorder },
  pillText: { fontFamily: olyFonts.medium, fontSize: 13, color: olyColors.text.secondary },
  pillTextOn: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  empty: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
    paddingHorizontal: olySpacing[4],
  },
});
