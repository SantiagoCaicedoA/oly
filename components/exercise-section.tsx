import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-matters";

interface ExerciseSectionProps {
  count?: number;
  initialIndex?: number;
  onTabChange?: (index: number) => void;
}
export default function ExerciseSection({
  count,
  initialIndex,
  onTabChange,
}: ExerciseSectionProps) {
  const { colors } = useTheme();
  const validCount = count && count > 0 ? count : 3;
  const OPTIONS: string[] = useMemo(
    () =>
      Array.from({ length: validCount }, (_, i) => String.fromCharCode(65 + i)),
    [validCount],
  );
  const [active, setActive] = useState<string>(
    OPTIONS[initialIndex ?? 0] || "A",
  );

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(15),
      padding: scale(4),
    },
    segment: {
      minWidth: scale(60),
      flex: 1,
      paddingVertical: scale(5),
      borderRadius: scale(20),
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={{ flexDirection: "row", flexGrow: 1 }}
    >
      {OPTIONS.map((option) => {
        const isActive = active === option;

        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.segment,
              {
                backgroundColor: isActive ? colors.primary : colors.lightBlue,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              setActive(option);
              onTabChange?.(OPTIONS.indexOf(option));
            }}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
