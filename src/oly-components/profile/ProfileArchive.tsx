/**
 * ProfileArchive — the complete record, in two tabs.
 *
 * LIFTS: every leaderboard submission with its status chip (LIVE / PENDING /
 * HELD / REMOVED); tapping a row opens the proof video.
 * POSTS: 3-column grid of the athlete's feed posts; tapping opens the post.
 */

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import type { Post } from "@/types/api/dashboard";
import type { MyLift } from "@/types/api/profile";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

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
          <View style={styles.rows}>
            {lifts.map((l, i) => {
              const chip = statusChip(l);
              return (
                <Pressable
                  key={l.id}
                  onPress={() => l.videoUrl && Linking.openURL(l.videoUrl)}
                  style={({ pressed }) => [
                    styles.row,
                    i > 0 && styles.rowBorder,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.rowDate}>{fmtDate(l.liftDate)}</Text>
                  <Text style={styles.rowLift} numberOfLines={1}>
                    {LIFT_NAME[l.liftType]}
                  </Text>
                  <Text style={[styles.rowChip, { color: chip.color }]}>
                    {chip.text}
                  </Text>
                  <Text style={styles.rowKg}>
                    {l.weightKg}
                    <Text style={styles.rowKgUnit}> kg</Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )
      ) : posts.length === 0 ? (
        <Text style={styles.emptyText}>
          Your shared posts collect here. Post a lift to the feed and it shows
          up in the grid.
        </Text>
      ) : (
        <View style={styles.grid}>
          {posts.map((p) => (
            <Pressable
              key={p._id}
              onPress={() => onOpenPost(p._id)}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
            >
              <Ionicons
                name="play"
                size={14}
                color={olyColors.text.disabled}
                style={styles.tilePlay}
              />
              <Text style={styles.tileKg} numberOfLines={1}>
                {p.session_detail?.lifted_kg
                  ? `${p.session_detail.lifted_kg} kg`
                  : p.lift_name || "Post"}
              </Text>
            </Pressable>
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
  rows: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingHorizontal: olySpacing[16],
    minHeight: 52,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: olyColors.border.default,
  },
  rowDate: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    width: 48,
  },
  rowLift: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
    flex: 1,
  },
  rowChip: {
    ...olyTypography.caption,
    fontSize: 12,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  rowKg: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  rowKgUnit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[4],
  },
  tile: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: olyRadius.sm + 4,
    backgroundColor: olyPalette.cardElevated,
    justifyContent: "flex-end",
    padding: olySpacing[8],
  },
  tilePlay: {
    position: "absolute",
    top: olySpacing[8],
    right: olySpacing[8],
  },
  tileKg: {
    ...olyTypography.caption,
    fontSize: 12,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  emptyText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
    paddingHorizontal: olySpacing[4],
  },
});
