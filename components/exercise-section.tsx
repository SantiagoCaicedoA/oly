import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

interface ExerciseSectionProps {
  count?: number;
}
export default function ExerciseSection({ count }: ExerciseSectionProps) {
  const { colors } = useTheme();
  const validCount = count && count > 0 ? count : 3;
  const OPTIONS: string[] = useMemo(
    () =>
      Array.from({ length: validCount }, (_, i) => String.fromCharCode(65 + i)),
    [validCount],
  );
  const [active, setActive] = useState<string>(OPTIONS[0] || "A");

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(15),
      padding: scale(4),
    },
    segment: {
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
    <View style={styles.container}>
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
            onPress={() => setActive(option)}
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
    </View>
  );
}
