/**
 * CompetitionLiftCards — the verified bests duo (Snatch / Clean & Jerk).
 *
 * Data comes from the athlete card endpoint: each side shows the best
 * verified lift with its proof video, a VERIFIED check (or PENDING), and
 * date · bodyweight. Tapping a card opens the proof video.
 */

import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import type { AthleteCardLift } from "@/types/api/leaderboard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

function LiftCard({
  label,
  lift,
}: {
  label: string;
  lift: AthleteCardLift | null;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && lift && { opacity: 0.8 }]}
      onPress={() => lift?.videoUrl && Linking.openURL(lift.videoUrl)}
      disabled={!lift?.videoUrl}
    >
      <View style={styles.video}>
        {lift ? (
          <View style={styles.playBtn}>
            <Ionicons
              name="play"
              size={16}
              color={olyColors.text.primary}
              style={{ marginLeft: 2 }}
            />
          </View>
        ) : (
          <Text style={styles.noLift}>No lift yet</Text>
        )}
      </View>
      <View style={styles.meta}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.kgRow}>
          <Text style={styles.kg}>
            {lift ? lift.weightKg : "—"}
            {lift && <Text style={styles.kgUnit}> kg</Text>}
          </Text>
          {lift &&
            (lift.pendingReview ? (
              <Text style={styles.pending}>PENDING</Text>
            ) : (
              <View style={styles.verified}>
                <View style={styles.verifiedDot}>
                  <Ionicons
                    name="checkmark"
                    size={9}
                    color={olyColors.text.onBrand}
                  />
                </View>
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            ))}
        </View>
        {lift && (
          <Text style={styles.date}>
            {fmtDate(lift.liftDate)} · {lift.bodyweightKg} kg bw
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export const CompetitionLiftCards: React.FC<{
  snatch: AthleteCardLift | null;
  cleanjerk: AthleteCardLift | null;
}> = ({ snatch, cleanjerk }) => (
  <View style={styles.row}>
    <LiftCard label="SNATCH" lift={snatch} />
    <LiftCard label="CLEAN & JERK" lift={cleanjerk} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  card: {
    flex: 1,
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  video: {
    height: 120,
    backgroundColor: olyPalette.cardElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: olyRadius.full,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  noLift: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  meta: {
    padding: olySpacing[12],
  },
  label: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  kgRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: olySpacing[4],
  },
  kg: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  kgUnit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  verified: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
  },
  verifiedDot: {
    width: 14,
    height: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    ...olyTypography.caption,
    fontSize: 12,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  pending: {
    ...olyTypography.caption,
    fontSize: 12,
    color: olyColors.text.warning,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  date: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: olySpacing[4],
  },
});
