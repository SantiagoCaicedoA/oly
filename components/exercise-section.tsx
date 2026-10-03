import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ExerciseSectionProps {
  count?: number;
  activeIndex?: number;
  onTabChange?: (index: number) => void;
}

export default function ExerciseSection({
  count,
  activeIndex,
  onTabChange,
}: ExerciseSectionProps) {
  const validCount = count && count > 0 ? count : 3;
  const OPTIONS: string[] = useMemo(
    () =>
      Array.from({ length: validCount }, (_, i) =>
        String.fromCharCode(65 + i),
      ),
    [validCount],
  );
  const [active, setActive] = useState<string>("A");

  React.useEffect(() => {
    if (activeIndex !== undefined) {
      setActive(OPTIONS[activeIndex] || "A");
    }
  }, [activeIndex, OPTIONS]);

  return (
    <View>
      <View style={styles.tabsRow}>
        {OPTIONS.map((option) => {
          const isActive = active === option;

          return (
            <TouchableOpacity
              key={option}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => {
                setActive(option);
                onTabChange?.(OPTIONS.indexOf(option));
              }}
            >
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                ]}
              >
                {option}
              </Text>
              {/* Active indicator — sits flush with the divider */}
              <View
                style={[
                  styles.indicator,
                  isActive && styles.indicatorActive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Full-width divider line */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
  },
  label: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.disabled,
  },
  labelActive: {
    color: olyColors.text.primary,
    fontFamily: olyFonts.medium,
  },

  /* Indicator bar — appears under active tab */
  indicator: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    height: olySpacing[4],
    borderRadius: olySpacing[4],
    backgroundColor: "transparent",
    zIndex: 1,
  },
  indicatorActive: {
    backgroundColor: olyPalette.primary,
  },

  /* Full-width hairline divider */
  divider: {
    height: 1,
    backgroundColor: olyColors.border.default,
    marginTop: -1,
  },
});
