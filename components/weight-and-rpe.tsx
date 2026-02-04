import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

interface WeightAndRpeProps {
  weight: number;
  onWeightChange: (value: number) => void;
  reps: number;
  onRepsChange: (value: number) => void;
}

export default function WeightAndRpe({
  weight,
  onWeightChange,
  reps,
  onRepsChange,
}: WeightAndRpeProps) {
  const { colors } = useTheme();

  const handleIncrement = (type: "weight" | "reps") => {
    if (type === "weight") {
      onWeightChange(weight + 1);
    } else {
      onRepsChange(reps + 1);
    }
  };

  const handleDecrement = (type: "weight" | "reps") => {
    if (type === "weight" && weight > 0) {
      onWeightChange(weight - 1);
    } else if (type === "reps" && reps > 0) {
      onRepsChange(reps - 1);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: scale(16),
    },
    section: {
      flex: 1,
    },
    label: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.textSecondary,
      marginBottom: scale(8),
      textTransform: "uppercase",
    },
    controlContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: scale(12),
      borderWidth: scale(0.3),
      borderColor: colors.text,
      paddingVertical: scale(4),
      paddingHorizontal: scale(12),
    },
    button: {
      width: scale(15),
      height: scale(15),
      borderRadius: scale(20),
      backgroundColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      color: colors.background,
    },
    valueContainer: {
      alignItems: "center",
    },
    value: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      color: colors.text,
    },
    unit: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.light,
      color: colors.textSecondary,
      textTransform: "uppercase",
      marginTop: scale(2),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Weight Lifted</Text>
        <View style={styles.controlContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleDecrement("weight")}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.valueContainer}>
            <Text style={styles.value}>{weight}</Text>
            <Text style={styles.unit}>kg</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleIncrement("weight")}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reps</Text>
        <View style={styles.controlContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleDecrement("reps")}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.valueContainer}>
            <Text style={styles.value}>{reps}</Text>
            <Text style={styles.unit}>reps</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleIncrement("reps")}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
