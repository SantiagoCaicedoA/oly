import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const INITIALS = ["LM", "JR", "AC"];

export default function MutualFriends() {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.avatarStack}>
        {INITIALS.map((initials, index) => (
          <View
            key={initials}
            style={[
              styles.avatar,
              index !== 0 && { marginLeft: -10 },
            ]}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.text}>
        Followed by Luis Mosquers and 12 others you know
      </Text>
    </TouchableOpacity>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const AVATAR_SIZE = 36;

const styles = StyleSheet.create({
  card: {
    backgroundColor: olyPalette.card,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: olyPalette.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: olyPalette.card,
  },
  avatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  text: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});
