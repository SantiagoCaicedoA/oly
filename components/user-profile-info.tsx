import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UserProfileInfoProps {
  isOwnProfile?: boolean;
  name?: string;
  username?: string;
  bio?: string;
  followers?: number;
  following?: number;
}

export default function UserProfileInfo({
  isOwnProfile = false,
  name = "",
  username = "",
  bio = "",
  followers = 0,
  following = 0,
}: UserProfileInfoProps) {
  const initials =
    (name || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <View style={styles.wrapper}>
      {/* ── Identity block ── */}
      <View style={styles.identityBlock}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.nameCol}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name || "Athlete"}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ATHLETE</Text>
              </View>
            </View>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
          </View>
        </View>

        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
      </View>

      {/* ── Stats + Rank ── */}
      <View style={styles.dataRow}>
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <Text style={styles.statNumber}>{followers}</Text>
          <Text style={styles.statLabel}> followers</Text>
        </TouchableOpacity>
        <Text style={styles.statDot}>·</Text>
        <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
          <Text style={styles.statNumber}>{following}</Text>
          <Text style={styles.statLabel}> following</Text>
        </TouchableOpacity>
        {/* Rank pill hidden until the leaderboard backend exists */}
      </View>

      {/* ── Action Buttons ── */}
      {isOwnProfile ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>EDIT PROFILE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => {
              Share.share({
                message: "Check out my profile on OLY!",
              });
            }}
          >
            <Text style={styles.secondaryButtonText}>SHARE PROFILE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>FOLLOW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>MESSAGE</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  wrapper: {
    gap: olySpacing[12],
  },

  /* Identity — avatar, name, bio grouped tight */
  identityBlock: {
    gap: olySpacing[12],
  },
  topRow: {
    flexDirection: "row",
    gap: olySpacing[12],
    alignItems: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: olyPalette.cardElevated,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  /* Name column */
  nameCol: {
    flex: 1,
    gap: olySpacing[4],
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    flexWrap: "wrap",
  },
  name: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  badge: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[8],
    paddingVertical: olySpacing[4],
  },
  badgeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  username: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Bio */
  bio: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },

  /* Stats */
  dataRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  /* Rank */
  rankPill: {
    marginLeft: "auto",
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  rankPillText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  rankPillNumber: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statNumber: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  statLabel: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  statDot: {
    ...olyTypography.bodySmall,
    color: olyColors.text.disabled,
    marginHorizontal: olySpacing[8],
  },

  /* Buttons */
  buttonRow: {
    flexDirection: "row",
    gap: olySpacing[8],
  },
  primaryButton: {
    flex: 1,
    height: olyLayout.minTouchTarget,
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  secondaryButton: {
    flex: 1,
    height: olyLayout.minTouchTarget,
    backgroundColor: "transparent",
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
