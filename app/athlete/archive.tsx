import { Images } from "@/assets";
import SegmentedSelector from "@/components/segmented-selector";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
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
  const { colors } = useTheme();
  const [selectedValue, setSelectedValue] = useState<string | string[]>("all");
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const handleBackPress = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
      gap: scale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(10),
      position: "relative",
      backgroundColor: colors.headerBackground,
    },
    backButton: {
      position: "absolute",
      left: scale(15),
      width: scale(12),
      height: scale(12),
    },
    headerText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
      letterSpacing: Typography.letterSpacing.normal,
      textAlign: "center",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(5),
    },
    chip: {
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
      borderRadius: scale(24),
      borderWidth: scale(1),
      borderColor: colors.primary,
      backgroundColor: colors.lightBlue,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: Typography.fontSize.base,
      fontWeight: "500",
      color: colors.text,
    },
    chipTextSelected: {
      color: colors.text,
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={Images.arrowBack}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>

        <Text style={styles.headerText}>Archive</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedSelector
          options={archiveOptions}
          selectedValue={selectedValue}
          onChange={setSelectedValue}
          segments={3}
        />
        <View style={{ gap: scale(5) }}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
