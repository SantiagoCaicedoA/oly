/**
 * OlyAvatar — Avatar circle atom
 * Source: Design Bible v3.0, Section 8.1 Avatar
 *
 * Sizes: small (32px), medium (48px), large (80px)
 * Shape: Circle (oly-radius/full)
 *
 * Figma: oly/avatar/medium
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import { Text } from "react-native";

// ─── Types ───────────────────────────────────────────────────────
type AvatarSize = "small" | "medium" | "large";

interface OlyAvatarProps {
  /** Image URI — if not provided, shows initials */
  source?: string;
  /** User name for initials fallback */
  name?: string;
  size?: AvatarSize;
  /** Show border around avatar */
  showBorder?: boolean;
}

const SIZES: Record<AvatarSize, number> = {
  small: 32,
  medium: 48,
  large: 80,
};

// ─── Component ───────────────────────────────────────────────────
export const OlyAvatar: React.FC<OlyAvatarProps> = ({
  source,
  name,
  size = "medium",
  showBorder = false,
}) => {
  const dimension = SIZES[size];

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const containerStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: olyRadius.full,
    },
    showBorder && styles.border,
  ];

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={containerStyle}
        contentFit="cover"
        accessibilityLabel={name ? `${name}'s avatar` : "User avatar"}
      />
    );
  }

  return (
    <View
      style={[containerStyle, styles.fallback]}
      accessibilityLabel={name ? `${name}'s avatar` : "User avatar"}
    >
      <Text
        style={[
          size === "large"
            ? olyTypography.title2
            : size === "medium"
              ? olyTypography.body
              : olyTypography.caption,
          { color: olyColors.text.primary },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  border: {
    borderWidth: 1,
    borderColor: olyColors.border.default,
  },
  fallback: {
    backgroundColor: olyColors.bg.cardUnselected,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OlyAvatar;
