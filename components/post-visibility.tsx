import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";

interface PostVisibilityProps {
  title: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  icon: ImageSourcePropType;
}

export default function PostVisibility({
  title,
  description,
  checked,
  onToggle,
  icon,
}: PostVisibilityProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: scale(15),
      backgroundColor: colors.surface,
      borderRadius: scale(15),
      borderWidth: 1,
      borderColor: checked ? colors.primary : colors.textSecondary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale(12),
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      flex: 1,
    },
    icon: {
      width: scale(20),
      height: scale(20),
      tintColor: colors.text,
      resizeMode: "contain",
    },
    content: {
      flex: 1,
      gap: scale(4),
    },
    title: {
      color: colors.text,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
    },
    description: {
      color: checked ? colors.text : colors.textSecondary,
      fontSize: Typography.fontSize.sm,
    },
    checkbox: {
      width: scale(22),
      height: scale(22),
      borderRadius: scale(11),
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    checked: {
      backgroundColor: colors.primary,
    },
    tick: {
      color: colors.text,
      fontSize: scale(14),
      fontWeight: "bold",
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onToggle}
    >
      <View style={styles.left}>
        <Image source={icon} style={styles.icon} />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {!!description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </View>

      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}
