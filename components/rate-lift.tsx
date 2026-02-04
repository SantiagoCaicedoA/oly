import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";

const LIMITING_OPTIONS = [
  "Legs",
  "Back",
  "Speed",
  "Overhead",
  "Position",
  "Timing",
];

interface RateLiftProps {
  rpeValue: number;
  onRpeChange: (value: number) => void;
  limitingFactor: string;
  onLimitingFactorChange: (value: string) => void;
}

export default function RateLift({
  rpeValue,
  onRpeChange,
  limitingFactor,
  onLimitingFactorChange,
}: RateLiftProps) {
  const { colors } = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (locationX: number): number => {
    const percentage = Math.max(0, Math.min(1, locationX / barWidth));
    return Math.round(percentage * 10);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      const newValue = calculateValue(evt.nativeEvent.locationX);
      onRpeChange(newValue);
    },
    onPanResponderMove: (evt) => {
      const newValue = calculateValue(evt.nativeEvent.locationX);
      onRpeChange(newValue);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
    onPanResponderTerminate: () => {
      setIsDragging(false);
    },
  });

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const fillPercentage = (rpeValue / 10) * 100;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: scale(15),
      borderWidth: scale(0.3),
      borderColor: colors.text,
      paddingHorizontal: scale(18),
      paddingVertical: scale(15),
    },
    header: {},
    title: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,

      textTransform: "uppercase",
    },
    rpeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: scale(8),
    },
    rpeLabel: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      flexDirection: "row",
      alignItems: "center",
    },
    infoIcon: {
      marginLeft: scale(8),
      fontSize: scale(9),
      color: colors.text,
    },
    rpeValue: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    rpeMax: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
    },
    barWrapper: {
      minHeight: scale(20),
      justifyContent: "center",
      position: "relative",
      marginBottom: scale(10),
    },
    barBackground: {
      height: scale(7),
      borderRadius: scale(6),
      overflow: "hidden",
      backgroundColor: colors.background,
      borderWidth: scale(0.3),
      borderColor: colors.textSecondary,
    },
    barFill: {
      height: "100%",
      borderRadius: scale(6),
    },
    thumb: {
      position: "absolute",
      width: scale(16),
      height: scale(16),
      borderRadius: scale(16),
      top: "85%",
      marginTop: scale(-16),
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    limitingTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      marginBottom: scale(8),
      textTransform: "uppercase",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    chip: {
      paddingHorizontal: scale(15),
      paddingVertical: scale(8),
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RATE THE LIFT</Text>

        <View style={styles.rpeContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.rpeLabel}>RPE</Text>
            <Text style={styles.infoIcon}>ⓘ</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={styles.rpeValue}>{rpeValue}</Text>
            <Text style={styles.rpeMax}>/10</Text>
          </View>
        </View>

        <View
          style={styles.barWrapper}
          onLayout={onBarLayout}
          {...panResponder.panHandlers}
        >
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${fillPercentage}%`,
                  backgroundColor: colors.text,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.thumb,
              {
                left: `${fillPercentage}%`,
                backgroundColor: colors.text,
                transform: [
                  { translateX: -16 },
                  { scale: isDragging ? 1.2 : 1 },
                ],
              },
            ]}
          />
        </View>
      </View>

      {rpeValue >= 9 && (
        <>
          <Text style={styles.limitingTitle}>WHAT LIMITED YOU MOST?</Text>
          <View style={styles.chipsContainer}>
            {LIMITING_OPTIONS.map((opt) => {
              const isSelected = limitingFactor === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => onLimitingFactorChange(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
