import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
type SetDetailProps = {
  onPress?: () => void;
};

export default function SetDetail({ onPress }: SetDetailProps) {
  const { colors } = useTheme();
  const [isChecked, setIsChecked] = useState(false);

  const styles = StyleSheet.create({
    container: {
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(15),
      padding: scale(12),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: isChecked ? colors.lightBlue : "transparent",
    },
    setContainer: {
      flexDirection: "row",
      gap: scale(5),
    },
    weightContainer: {
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(8),
      paddingVertical: scale(3),
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
    },
    rpeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    checkbox: {
      width: scale(20),
      height: scale(20),
      borderRadius: scale(10),
      borderWidth: scale(2),
      borderColor: colors.primary,
      backgroundColor: isChecked ? colors.primary : "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    checkmark: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    setText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: isChecked ? colors.text : colors.textSecondary,
    },
    weightText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: isChecked ? colors.text : colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View
        style={{ height: 20, backgroundColor: colors.primary, width: 3 }}
      ></View>
      <View style={styles.setContainer}>
        <Text style={styles.setText}>SET 2</Text>
        <Text style={styles.setText}>3 REPS</Text>
      </View>
      <View style={styles.weightContainer}>
        <Text style={styles.weightText}>115 kg</Text>
      </View>

      <View style={styles.weightContainer}>
        <Text style={styles.weightText}>80 %</Text>
      </View>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setIsChecked(!isChecked)}
        activeOpacity={0.7}
      >
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
