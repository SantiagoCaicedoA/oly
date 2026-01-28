import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export type EquipmentItem = {
  title?: string;
  description?: string;
  checked?: boolean;
};

type EquipmentListProps = {
  heading: string;
  items: EquipmentItem[];
  showCheckbox?: boolean;
  onToggle?: (index: number) => void;
};

export default function EquipmentList({
  heading,
  items,
  showCheckbox = false,
  onToggle,
}: EquipmentListProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    wrapper: {
      gap: scale(6),
    },
    heading: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
    container: {
      padding: scale(15),
      backgroundColor: colors.surface,
      borderRadius: scale(15),
      borderWidth: 1,
      gap: scale(4),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    content: {
      flex: 1,
      gap: scale(4),
      paddingRight: scale(12),
    },
    title: {
      color: colors.text,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
    },
    description: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
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
    <View style={styles.wrapper}>
      {!!heading && <Text style={styles.heading}>{heading.toUpperCase()}</Text>}

      {items.map((item, index) => {
        const isChecked = !!item.checked;

        const borderColor = showCheckbox
          ? isChecked
            ? colors.primary
            : colors.textSecondary
          : colors.primary;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.container, { borderColor }]}
            activeOpacity={showCheckbox ? 0.7 : 1}
            onPress={() => showCheckbox && onToggle?.(index)}
          >
            <View style={styles.content}>
              {item.title && <Text style={styles.title}>{item.title}</Text>}
              {item.description && (
                <Text
                  style={[
                    styles.description,
                    {
                      color:
                        showCheckbox && isChecked
                          ? colors.text
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>

            {showCheckbox && (
              <View style={[styles.checkbox, isChecked && styles.checked]}>
                {isChecked && <Text style={styles.tick}>✓</Text>}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
