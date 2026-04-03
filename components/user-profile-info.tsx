import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UserProfileInfoProps {
  isOwnProfile?: boolean;
}

export default function UserProfileInfo({ isOwnProfile = false }: UserProfileInfoProps) {
  return (
    <View style={styles.wrapper}>
      {/* ── Avatar + Info Row ── */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>OF</Text>
        </View>

        {/* Name, username, stats */}
        <View style={styles.infoCol}>
          {/* Name + badge */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>Oscar Figueroa</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ATHLETE</Text>
            </View>
          </View>

          <Text style={styles.username}>@oscar.figueroa</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statNumber}>142</Text>
              <Text style={styles.statLabel}>FOLLOWERS</Text>
            </View>
            <View>
              <Text style={styles.statNumber}>112</Text>
              <Text style={styles.statLabel}>FOLLOWING</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Action Buttons ── */}
      {isOwnProfile ? (
        <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
          <Text style={styles.editButtonText}>EDIT PROFILE</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.followButton} activeOpacity={0.8}>
            <Text style={styles.followButtonText}>FOLLOW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} activeOpacity={0.8}>
            <Text style={styles.messageButtonText}>MESSAGE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bio ── */}
      <Text style={styles.bio}>
        Olympic gold medalist in weightlifting. Passionate about fitness and
        inspiring others.
      </Text>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  wrapper: {
    gap: olySpacing[16],
  },

  /* Top row: avatar + info */
  topRow: {
    flexDirection: "row",
    gap: olySpacing[16],
    alignItems: "flex-start",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: olyPalette.cardElevated,
    borderWidth: 2,
    borderColor: olyColors.text.disabled,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.title2,
    color: olyColors.text.secondary,
  },

  /* Info column */
  infoCol: {
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
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  badge: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[8],
    paddingVertical: 2,
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
  statsRow: {
    flexDirection: "row",
    gap: olySpacing[24],
    marginTop: olySpacing[4],
  },
  statNumber: {
    ...olyTypography.title2,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  statLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: "row",
    gap: olySpacing[8],
  },
  followButton: {
    flex: 1,
    height: olyLayout.inputHeight,
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  followButtonText: {
    ...olyTypography.button,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  messageButton: {
    flex: 1,
    height: olyLayout.inputHeight,
    backgroundColor: "transparent",
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButtonText: {
    ...olyTypography.button,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  editButton: {
    height: olyLayout.inputHeight,
    backgroundColor: "transparent",
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    ...olyTypography.button,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Bio */
  bio: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    lineHeight: 22,
  },
});
