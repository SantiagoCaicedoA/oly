import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  onValueChange: (index: number, value: number) => void;
};

export default function LiftDetailsCard({
  title,
  items,
  checkedValues,
  onToggle,
  onValueChange,
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
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      minWidth: scale(50),
      textAlign: "right",
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
    },
    kg: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      marginLeft: scale(4),
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.textSecondary,
      opacity: 0.3,
    },
    icon: {
      width: scale(14),
      height: scale(14),
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
                  <TouchableOpacity onPress={() => onToggle(index)}>
                    <Image
                      source={isChecked ? Images.checkMark : Images.plus}
                      style={styles.icon}
                    />
                  </TouchableOpacity>

                  <Text style={[styles.name, { color: textColor }]}>
                    {item.label}
                  </Text>
                </View>

                <View style={styles.valueContainer}>
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={item.value.toString()}
                    onChangeText={(text) => {
                      const numValue = parseInt(text) || 0;
                      onValueChange(index, numValue);
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Text style={[styles.kg, { color: textColor }]}>kg</Text>
                </View>
              </View>

              {!isLast && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
