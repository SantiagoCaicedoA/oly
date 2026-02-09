import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

type AnalysisSegmentProps = {
  title: string;
  value: string;
  options: string[];
  valueTextMap: Record<string, string>;
  onChange: (value: string) => void;
};

export default function AnalysisSegment({
  title,
  value,
  options,
  valueTextMap,
  onChange,
}: AnalysisSegmentProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: scale(6),
    },
    subHeading: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    intensity: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    segmentedContainer: {
      flexDirection: "row",
      borderRadius: scale(10),
      paddingHorizontal: scale(4),
      borderColor: colors.primary,
      borderWidth: scale(1),
      backgroundColor: colors.lightBlue,
      paddingVertical: scale(5),
      marginBottom: scale(10),
    },
    segment: {
      flex: 1,
      paddingVertical: scale(10),
      borderRadius: scale(10),
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
    },
  });

  return (
    <>
      <View style={styles.rowContainer}>
        <Text style={styles.subHeading}>{title}</Text>
        <Text style={styles.intensity}>{valueTextMap[value]}</Text>
      </View>

      <View style={styles.segmentedContainer}>
        {options.map((opt) => {
          const isActive = value === opt;

          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.segment,
                {
                  backgroundColor: isActive ? colors.primary : colors.lightBlue,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => onChange(opt)}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.text : colors.textSecondary,
                  },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
