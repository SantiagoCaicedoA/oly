import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const activeIndex = options.indexOf(value);

  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.valueLabel}>{valueTextMap[value] ?? value}</Text>
      </View>

      {/* Segmented bar */}
      <View style={styles.barRow}>
        {options.map((opt, i) => {
          const isFilled = i === activeIndex;
          const isFirst = i === 0;
          const isLast = i === options.length - 1;

          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.segment,
                isFilled ? styles.segmentFilled : styles.segmentEmpty,
                isFirst && styles.segmentFirst,
                isLast && styles.segmentLast,
              ]}
              onPress={() => onChange(opt)}
              activeOpacity={0.7}
            />
          );
        })}
      </View>

    </View>
  );
}

const BAR_HEIGHT = 6;

const styles = StyleSheet.create({
  container: {
    gap: olySpacing[8],
    marginBottom: olySpacing[20],
  },

  /* Title row */
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  valueLabel: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },

  /* Bar */
  barRow: {
    flexDirection: "row",
    gap: olySpacing[4],
  },
  segment: {
    flex: 1,
    height: BAR_HEIGHT,
  },
  segmentFilled: {
    backgroundColor: olyColors.text.primary,
  },
  segmentEmpty: {
    backgroundColor: olyColors.border.default,
  },
  segmentFirst: {
    borderTopLeftRadius: olyRadius.sm,
    borderBottomLeftRadius: olyRadius.sm,
  },
  segmentLast: {
    borderTopRightRadius: olyRadius.sm,
    borderBottomRightRadius: olyRadius.sm,
  },

});
