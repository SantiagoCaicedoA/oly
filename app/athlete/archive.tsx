import SegmentedSelector from "@/components/segmented-selector";
import { Glows } from "@/src/oly-components/shop/ShopKit";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OlyFloatingHeader, useFloatingHeader } from "@/src/oly-components/organisms/OlyFloatingHeader";
const archiveOptions = [
  { label: "All", value: "all" },
  { label: "Private", value: "private" },
  { label: "Public", value: "public" },
];
const liftTypeOptions = [
  { label: "All", value: "all" },
  { label: "Classic", value: "classic" },
  { label: "Squat", value: "squat" },
  { label: "Press", value: "press" },
  { label: "Variation", value: "variation" },
];

export default function Archive() {
  const [selectedValue, setSelectedValue] = useState<string | string[]>("all");
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const { headerH, onLayout: onHeaderLayout } = useFloatingHeader(140);
  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.root}>
      <Glows variant="shop" />
      <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
        <OlyFloatingHeader onLayout={onHeaderLayout}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={olySpacing[8]}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={olyColors.text.primary as string}
            />
          </TouchableOpacity>

          <Text style={styles.headerText}>Archive</Text>
        </View>
        </OlyFloatingHeader>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerH + olySpacing[8] }]}
          scrollIndicatorInsets={{ top: headerH }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedSelector
            options={archiveOptions}
            selectedValue={selectedValue}
            onChange={setSelectedValue}
            segments={3}
          />
          <View style={styles.chipsContainer}>
            {liftTypeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  selectedOpt === opt.value && styles.chipSelected,
                ]}
                onPress={() => setSelectedOpt(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedOpt === opt.value && styles.chipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: olyColors.bg.page,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[40],
    gap: olySpacing[12],
  },
  header: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
    paddingBottom: olySpacing[12],
    gap: olySpacing[12],
  },
  /* 40pt glass circle; hitSlop 8 takes the target to 56. */
  backButton: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    ...olyTypography.title1,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  chip: {
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[16],
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    backgroundColor: olyColors.glass.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: olyColors.glass.accentFill,
    borderColor: olyColors.glass.accentBorder,
  },
  chipText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },
  chipTextSelected: {
    color: olyColors.text.primary,
  },
});
