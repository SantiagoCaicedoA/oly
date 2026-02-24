import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export type LiftItem = {
  label: string;
  icon: any;
};

type ResetPresetTimerProps = {
  title: string;
  items: LiftItem[];
  checkedValues: boolean[];
  onToggle: (index: number) => void;
};

export default function ResetPresetTimer({
  title,
  items,
  checkedValues,
  onToggle,
}: ResetPresetTimerProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      gap: scale(6),
    },
    heading: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
    card: {
      borderColor: colors.text,
      borderWidth: 0.3,
      borderRadius: scale(8),
      backgroundColor: colors.surface,
      paddingHorizontal: scale(12),
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: scale(12),
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    image: {
      width: scale(20),
      height: scale(20),
      resizeMode: "contain",
    },
    name: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.textSecondary,
      opacity: 0.3,
    },
    checkbox: {
      width: scale(22),
      height: scale(22),
      borderRadius: scale(11),
      borderWidth: scale(2),
      alignItems: "center",
      justifyContent: "center",
    },
    checkmark: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{title.toUpperCase()}</Text>

      <View style={styles.card}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isChecked = checkedValues[index];
          const textColor = isChecked ? colors.text : colors.textSecondary;

          return (
            <View key={`${item.label}-${index}`}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Image source={item.icon} style={styles.image} />

                  <Text style={[styles.name, { color: textColor }]}>
                    {item.label}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => onToggle(index)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: colors.primary,
                        backgroundColor: isChecked
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                  >
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              </View>

              {!isLast && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
