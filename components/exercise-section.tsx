import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

const OPTIONS = ["A", "B", "C", "D"];

export default function ExerciseSection() {
  const { colors } = useTheme();
  const [active, setActive] = useState<string>("A");

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
