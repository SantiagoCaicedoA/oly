import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{title}</Text>

      <View style={styles.rowGroup}>
        {items.map((item, index) => {
          const isActive = checkedValues[index];

          return (
            <TouchableOpacity
              key={`${item.label}-${index}`}
              style={[styles.row, isActive && styles.rowActive]}
              onPress={() => onToggle(index)}
              activeOpacity={0.7}
            >
              <Image
                source={item.icon}
                style={[
                  styles.image,
                  {
                    tintColor: isActive
                      ? olyColors.text.primary
                      : olyColors.text.secondary,
                  },
                ]}
              />
              <Text style={[styles.name, isActive && styles.nameActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    gap: olySpacing[8],
  },
  heading: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  rowGroup: {
    gap: olySpacing[8],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    backgroundColor: olyPalette.cardElevated,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olyLayout.cardPadding,
    paddingVertical: olyLayout.listItemPadding,
    minHeight: olyLayout.gymTouchTarget,
  },
  rowActive: {
    backgroundColor: olyColors.bg.activeHighlight,
  },
  image: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  name: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  nameActive: {
    color: olyColors.text.primary,
  },
});
