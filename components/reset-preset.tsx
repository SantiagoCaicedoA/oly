import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

const FAIL_OPTIONS = ["Pull", "Turnover", "Catch / overhead"];
const MISSED_OPTIONS = ["In front", "Behind", "Left", "Right"];

interface ResetPresetsProps {
  wasMiss: boolean;
  onWasMissChange: (value: boolean) => void;
  failLocation: string;
  onFailLocationChange: (value: string) => void;
  missedWhere: string;
  onMissedWhereChange: (value: string) => void;
}

export default function ResetPresets({
  wasMiss,
  onWasMissChange,
  failLocation,
  onFailLocationChange,
  missedWhere,
  onMissedWhereChange,
}: ResetPresetsProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {
      //marginBottom: scale(12),
    },
    title: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,

      textTransform: "uppercase",
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      borderWidth: scale(0.3),
      borderColor: colors.text,
      paddingHorizontal: scale(20),
      paddingVertical: scale(20),
    },
    switchRow: {
      marginBottom: wasMiss ? scale(12) : 0,
    },
    switchQuestion: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,

      textTransform: "uppercase",
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    switchAnswer: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,

      textTransform: "uppercase",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(5),
      marginVertical: scale(12),
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
    <>
      <View style={styles.header}>
        <Text style={styles.title}>RESET PRESETS</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.switchRow}>
          <Text style={styles.switchQuestion}>WAS IT A MISS?</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchAnswer}>{wasMiss ? "Yes" : "No"}</Text>
            <Switch
              value={wasMiss}
              onValueChange={onWasMissChange}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {wasMiss && (
          <>
            <Text style={styles.sectionTitle}>WHERE DID IT FAIL?</Text>
            <View style={styles.chipsContainer}>
              {FAIL_OPTIONS.map((opt) => {
                const isSelected = failLocation === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onFailLocationChange(opt)}
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

            <Text style={styles.sectionTitle}>MISSED WHERE?</Text>
            <View style={styles.chipsContainer}>
              {MISSED_OPTIONS.map((opt) => {
                const isSelected = missedWhere === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onMissedWhereChange(opt)}
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
    </>
  );
}
