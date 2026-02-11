import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";

interface SessionDetailProps {
  loadLifted: string;
  onLoadLiftedChange: (value: string) => void;
  rpe: string;
  onRpeChange: (value: string) => void;
  contextEnabled: boolean;
  onContextEnabledChange: (value: boolean) => void;
  contextValue: string;
  onContextValueChange: (value: string) => void;
  intentEnabled: boolean;
  onIntentEnabledChange: (value: boolean) => void;
  intentValue: string;
  onIntentValueChange: (value: string) => void;
  effortEnabled: boolean;
  onEffortEnabledChange: (value: boolean) => void;
  effortRating: number;
  onEffortRatingChange: (value: number) => void;
}
const INTENT_OPTIONS = [
  "Technical Consistency",
  "Speed & Power",
  "Strength Under Load",
  "Confidence & Exposure",
] as const;

export default function SessionDetail({
  loadLifted,
  onLoadLiftedChange,
  rpe,
  onRpeChange,
  contextEnabled,
  onContextEnabledChange,
  contextValue,
  onContextValueChange,
  intentEnabled,
  onIntentEnabledChange,
  intentValue,
  onIntentValueChange,
  effortEnabled,
  onEffortEnabledChange,
  effortRating,
  onEffortRatingChange,
}: SessionDetailProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {},
    sessionText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      textTransform: "uppercase",
    },
    container: {
      borderRadius: scale(15),
      borderColor: colors.text,
      borderWidth: scale(0.3),
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: scale(18),
      paddingHorizontal: scale(20),
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(16),
    },
    icon: {
      width: scale(18),
      height: scale(18),
      tintColor: colors.text,
      resizeMode: "contain",
    },
    label: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
    },
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    input: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      textAlign: "right",
      minWidth: scale(50),
      paddingVertical: 0,
    },
    kgText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
    },
    expandedContent: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(18),
    },
    inputField: {
      backgroundColor: colors.background,
      borderRadius: scale(8),
      borderWidth: scale(1),
      borderColor: colors.textSecondary,
      paddingVertical: scale(12),
      paddingHorizontal: scale(16),
      marginTop: scale(12),
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
    },
    effortContainer: {
      flexDirection: "row",
      gap: scale(12),
      marginTop: scale(12),
      justifyContent: "space-between",
    },
    effortBlock: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: scale(12),
      borderWidth: scale(1),
      borderColor: colors.primary,
      backgroundColor: colors.lightBlue,
      justifyContent: "center",
      alignItems: "center",
    },
    effortBlockActive: {
      backgroundColor: colors.primary,
    },
    effortText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.textSecondary,
    },
    effortTextActive: {
      color: colors.text,
    },
    divider: {
      height: scale(0.5),
      backgroundColor: colors.text,
    },
    speedText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
      marginTop: scale(12),
    },
    chip: {
      paddingHorizontal: scale(7),
      paddingVertical: scale(3),
      borderRadius: scale(24),
      borderWidth: 1,
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
    <>
      <View style={styles.header}>
        <Text style={styles.sessionText}>SESSION DETAILS</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.leftSection}>
            <Image source={Images.loadicon} style={styles.icon} />
            <Text style={styles.label}>Load lifted</Text>
          </View>
          <View style={styles.rightSection}>
            <TextInput
              style={styles.input}
              value={loadLifted}
              onChangeText={onLoadLiftedChange}
              keyboardType="numeric"
            />
            <Text style={styles.kgText}>kg</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={[styles.row]}>
          <View style={styles.leftSection}>
            <Image source={Images.contexticon} style={styles.icon} />
            <Text style={styles.label}>Context</Text>
          </View>
          <Switch
            value={contextEnabled}
            onValueChange={onContextEnabledChange}
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        <View style={styles.divider} />
        <View style={[styles.row]}>
          <View style={styles.leftSection}>
            <Image source={Images.intenticon} style={styles.icon} />
            <Text style={styles.label}>Intent</Text>
          </View>
          <Switch
            value={intentEnabled}
            onValueChange={(value) => {
              onIntentEnabledChange(value);
              if (!value) onIntentValueChange("");
            }}
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
        {intentEnabled && (
          <View style={styles.expandedContent}>
            <View style={styles.chipsContainer}>
              {INTENT_OPTIONS.map((opt) => {
                const isSelected = intentValue === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onIntentValueChange(opt)}
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
          </View>
        )}

        <View style={styles.divider} />
        <View style={[styles.row]}>
          <View style={styles.leftSection}>
            <Image source={Images.efforticon} style={styles.icon} />
            <Text style={styles.label}>Effort</Text>
          </View>
          <Switch
            value={effortEnabled}
            onValueChange={(value) => {
              onEffortEnabledChange(value);
              if (!value) onEffortRatingChange(0);
            }}
            trackColor={{ false: colors.textSecondary, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        {effortEnabled && (
          <View style={styles.expandedContent}>
            <Text style={styles.speedText}>Rate bar speed</Text>
            <View style={styles.effortContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.effortBlock,
                    effortRating === rating && styles.effortBlockActive,
                  ]}
                  onPress={() => onEffortRatingChange(rating)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.effortText,
                      effortRating === rating && styles.effortTextActive,
                    ]}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </>
  );
}
