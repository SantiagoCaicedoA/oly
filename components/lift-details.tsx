import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export type LiftItem = {
  label: string;
  value: number;
};

type LiftDetailsCardProps = {
  title: string;
  items: LiftItem[];
  checkedValues: boolean[];
  onToggle: (index: number) => void;
};

export default function LiftDetailsCard({
  title,
  items,
  checkedValues,
  onToggle,
}: LiftDetailsCardProps) {
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
    name: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    value: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    kg: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.textSecondary,
      opacity: 0.3,
    },
    icon: {
      width: scale(18),
      height: scale(18),
      //tintColor: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{title.toUpperCase()}</Text>

      <View style={styles.card}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isChecked = checkedValues[index];
          return (
            <View key={`${item.label}-${index}`}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <TouchableOpacity onPress={() => onToggle(index)}>
                    <Image
                      source={isChecked ? Images.checkMark : Images.plus}
                      style={styles.icon}
                    />
                  </TouchableOpacity>

                  <Text style={styles.name}>{item.label}</Text>
                </View>

                <Text style={styles.value}>
                  {item.value} <Text style={styles.kg}>kg</Text>
                </Text>
              </View>

              {!isLast && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
