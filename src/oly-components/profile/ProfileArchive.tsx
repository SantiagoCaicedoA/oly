/**
 * ProfileArchive — the complete record, in two tabs.
 *
 * LIFTS: one horizontal shelf per lift (Snatch, Clean & Jerk), newest first,
 * each tile the proof video with its weight on it. Verified lifts carry the
 * blue hex check; pending and held say so; removed ones are dimmed. Tapping
 * a tile opens the proof video.
 * POSTS: the athlete's feed posts grouped by month, 3-column grid of 4:5
 * video tiles showing only the weight (and a blue dot on a PR); tapping
 * opens the post.
 */

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyFonts,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import type { Post } from "@/types/api/dashboard";
import type { MyLift } from "@/types/api/profile";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Polygon, Polyline } from "react-native-svg";

const SHELF_TILE_W = 104;
const SHELF_TILE_H = 130;
const SHELF_ORDER: MyLift["liftType"][] = ["snatch", "cleanjerk"];

/** The verified mark, same geometry as CompetitionLiftCards. */
function HexCheck({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Polygon
        points="100,10 178,55 178,145 100,190 22,145 22,55"
        fill={olyColors.accent}
        stroke={olyColors.accent}
        strokeWidth={20}
        strokeLinejoin="round"
      />
      <Polyline
        points="62,102 90,130 140,72"
        fill="none"
        stroke={olyColors.text.onAccent}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const GRID_GAP = 6;

/** Posts grouped by calendar month, newest first, in the order received. */
function groupByMonth(posts: Post[]) {
  const thisYear = new Date().getFullYear();
  const groups: { key: string; title: string; posts: Post[] }[] = [];
  for (const p of posts) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      const month = d.toLocaleDateString("en-US", { month: "long" });
      g = {
        key,
        title: d.getFullYear() === thisYear ? month : `${month} ${d.getFullYear()}`,
        posts: [],
      };
      groups.push(g);
    }
    g.posts.push(p);
  }
  return groups;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const LIFT_NAME: Record<MyLift["liftType"], string> = {
  snatch: "Snatch",
  cleanjerk: "Clean & Jerk",
};

function statusChip(l: MyLift): { text: string; color: string } {
  if (l.status === "live" && l.pendingReview)
    return { text: "PENDING", color: olyColors.text.warning };
  if (l.status === "live") return { text: "LIVE", color: olyColors.text.success };
  if (l.status === "held") return { text: "HELD", color: olyColors.text.warning };
  if (l.status === "removed")
    return { text: "REMOVED", color: olyColors.text.error };
  return { text: l.status.toUpperCase(), color: olyColors.text.secondary };
}

interface ProfileArchiveProps {
  lifts: MyLift[];
  posts: Post[];
  onOpenPost: (postId: string) => void;
}

export const ProfileArchive: React.FC<ProfileArchiveProps> = ({
  lifts,
  posts,
  onOpenPost,
}) => {
  const [tab, setTab] = useState<"lifts" | "posts">("lifts");
  const [gridW, setGridW] = useState(0);
  const months = useMemo(() => groupByMonth(posts), [posts]);
  const shelves = useMemo(
    () =>
      SHELF_ORDER.map((type) => {
        const items = lifts
          .filter((l) => l.liftType === type)
          .sort((a, b) => +new Date(b.liftDate) - +new Date(a.liftDate));
        const counted = items.filter((l) => l.status !== "removed");
        const best = counted.length
          ? Math.max(...counted.map((l) => l.weightKg))
          : null;
        return { type, items, best };
      }).filter((s) => s.items.length > 0),
    [lifts],
  );
  const tileW = gridW > 0 ? (gridW - GRID_GAP * 2) / 3 : 0;

  return (
    <View>
      {/* tabs */}
      <View style={styles.tabs}>
        {(["lifts", "posts"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabOn]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === "lifts" ? "Lifts" : "Posts"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "lifts" ? (
        lifts.length === 0 ? (
          <Text style={styles.emptyText}>
            Verified lifts land here — post a single snatch or clean & jerk
            with video to start your record.
          </Text>
        ) : (
          <View>
            {shelves.map((shelf) => (
              <View key={shelf.type} style={styles.shelf}>
                <View style={styles.shelfHead}>
                  <Text style={styles.shelfTitle}>{LIFT_NAME[shelf.type]}</Text>
                  {shelf.best != null && (
                    <Text style={styles.shelfBest}>
                      Best <Text style={styles.shelfBestKg}>{shelf.best} kg</Text>
                    </Text>
                  )}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shelfRow}
                >
                  {shelf.items.map((l) => {
                    const chip = statusChip(l);
                    const verified = chip.text === "LIVE";
                    const removed = l.status === "removed";
                    return (
                      <Pressable
                        key={l.id}
                        onPress={() => l.videoUrl && Linking.openURL(l.videoUrl)}
                        accessibilityRole="button"
                        accessibilityLabel={`${LIFT_NAME[l.liftType]}, ${l.weightKg} kilos, ${fmtDate(l.liftDate)}, ${chip.text.toLowerCase()}`}
                        style={({ pressed }) => [
                          styles.shelfItem,
                          removed && { opacity: 0.45 },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <View style={styles.shelfTile}>
                          {l.videoUrl ? (
                            <Video
                              source={{ uri: l.videoUrl }}
                              style={StyleSheet.absoluteFill}
                              resizeMode={ResizeMode.COVER}
                              shouldPlay={false}
                              isMuted
                            />
                          ) : null}
                          <LinearGradient
                            colors={olyColors.media.fade}
                            style={styles.shelfScrim}
                            pointerEvents="none"
                          />
                          {verified && (
                            <View style={styles.shelfCheck}>
                              <HexCheck />
                            </View>
                          )}
                          <Text style={styles.tileKg} numberOfLines={1}>
                            {l.weightKg}
                            <Text style={styles.tileKgUnit}> kg</Text>
                          </Text>
                        </View>
                        <Text style={styles.shelfDate} numberOfLines={1}>
                          {fmtDate(l.liftDate)}
                          {!verified && (
                            <Text style={{ color: chip.color }}>
                              {" · "}
                              {chip.text.charAt(0) + chip.text.slice(1).toLowerCase()}
                            </Text>
                          )}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </View>
        )
      ) : posts.length === 0 ? (
        <Text style={styles.emptyText}>
          Your shared posts collect here. Post a lift to the feed and it shows
          up in the grid.
        </Text>
      ) : (
        <View onLayout={(e) => setGridW(e.nativeEvent.layout.width)}>
          {months.map((m) => (
            <View key={m.key} style={styles.month}>
              <View style={styles.monthHead}>
                <Text style={styles.monthTitle}>{m.title}</Text>
                <Text style={styles.monthCount}>
                  {m.posts.length} {m.posts.length === 1 ? "lift" : "lifts"}
                </Text>
              </View>
              <View style={styles.grid}>
                {m.posts.map((p) => {
                  const kg = p.session_detail?.lifted_kg;
                  const thumb = (p as any).thumbnail_url as string | undefined;
                  const isPR = (p as any).isPR === true;
                  return (
                    <Pressable
                      key={p._id}
                      onPress={() => onOpenPost(p._id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${kg ? `${kg} kilos, ` : ""}${p.lift_name || "Post"}`}
                      style={({ pressed }) => [
                        styles.tile,
                        { width: tileW },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      {thumb ? (
                        <Image
                          source={{ uri: thumb }}
                          style={StyleSheet.absoluteFill}
                          resizeMode="cover"
                        />
                      ) : null}
                      <LinearGradient
                        colors={olyColors.media.fade}
                        style={styles.tileScrim}
                        pointerEvents="none"
                      />
                      {isPR && <View style={styles.prDot} />}
                      {kg ? (
                        <Text style={styles.tileKg} numberOfLines={1}>
                          {kg}
                          <Text style={styles.tileKgUnit}> kg</Text>
                        </Text>
                      ) : (
                        <Text style={styles.tileLift} numberOfLines={1}>
                          {p.lift_name || "Post"}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    padding: olySpacing[4],
    marginBottom: olySpacing[12],
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: {
    backgroundColor: olyPalette.primary,
  },
  tabText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
  },
  tabTextOn: {
    color: olyColors.text.onBrand,
  },
  shelf: {
    marginTop: olySpacing[8],
    marginBottom: olySpacing[16],
  },
  shelfHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: olySpacing[8] + 2,
  },
  shelfTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  shelfBest: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  shelfBestKg: {
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  shelfRow: {
    gap: olySpacing[8],
  },
  shelfItem: {
    width: SHELF_TILE_W,
  },
  shelfTile: {
    width: SHELF_TILE_W,
    height: SHELF_TILE_H,
    borderRadius: olyRadius.sm + 4,
    backgroundColor: olyPalette.cardElevated,
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: olySpacing[8],
    paddingBottom: olySpacing[4] + 2,
  },
  shelfScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  shelfCheck: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  shelfDate: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: 6,
  },
  month: {
    marginTop: olySpacing[8],
    marginBottom: olySpacing[16],
  },
  monthHead: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[8],
    marginBottom: olySpacing[8] + 2,
  },
  monthTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  monthCount: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  tile: {
    aspectRatio: 4 / 5,
    borderRadius: olyRadius.sm + 6,
    backgroundColor: olyPalette.cardElevated,
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: olySpacing[8],
    paddingBottom: olySpacing[4] + 2,
  },
  tileScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  prDot: {
    position: "absolute",
    top: olySpacing[8],
    right: olySpacing[8],
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
  },
  tileKg: {
    fontFamily: olyFonts.bold,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
  },
  tileKgUnit: {
    ...olyTypography.caption,
    color: olyColors.media.inkMuted,
  },
  tileLift: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  emptyText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
    paddingHorizontal: olySpacing[4],
  },
});
