import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/* ── Constants ──────────────────────────────────────── */
const STEPPER_SIZE = 32;

interface WeightAndRepProps {
  weight: number;
  onWeightChange: (value: number) => void;
  reps: number;
  onRepsChange: (value: number) => void;
  prescribedWeight?: number;
  prescribedRpm?: number;
  prescribedReps?: string;
}

export default function WeightAndRep({
  weight,
  onWeightChange,
  reps,
  onRepsChange,
  prescribedWeight,
  prescribedRpm,
  prescribedReps,
}: WeightAndRepProps) {
  const handleIncrement = (type: "weight" | "reps") => {
    if (type === "weight") onWeightChange(weight + 1);
    else onRepsChange(reps + 1);
  };

  const handleDecrement = (type: "weight" | "reps") => {
    if (type === "weight" && weight > 0) onWeightChange(weight - 1);
    else if (type === "reps" && reps > 0) onRepsChange(reps - 1);
  };

  /* Deviation check */
  const weightDeviates =
    prescribedWeight != null && weight !== prescribedWeight;
  const repsDeviates =
    prescribedReps != null && String(reps) !== prescribedReps;

  return (
    <View style={styles.container}>
      {/* Weight */}
      <View style={styles.half}>
        <Text style={styles.label}>WEIGHT</Text>
        <View style={styles.stepperCard}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => handleDecrement("weight")}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperIcon}>−</Text>
          </TouchableOpacity>
          <View style={styles.valueCol}>
            <TextInput
              style={[
                styles.heroValue,
                weightDeviates && styles.heroDeviated,
              ]}
              value={String(weight)}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                if (!isNaN(n)) onWeightChange(n);
                else if (t === "") onWeightChange(0);
              }}
              keyboardType="number-pad"
              selectTextOnFocus
            />
            <Text style={styles.unit}>KG</Text>
          </View>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => handleIncrement("weight")}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperIcon}>+</Text>
          </TouchableOpacity>
        </View>
        {prescribedWeight != null && (
          <Text style={[styles.prescribed, weightDeviates && styles.prescribedWarn]}>
            Rx: {prescribedWeight} kg
            {prescribedRpm != null ? ` · ${prescribedRpm}%` : ""}
          </Text>
        )}
      </View>

      {/* Reps */}
      <View style={styles.half}>
        <Text style={styles.label}>REPS</Text>
        <View style={styles.stepperCard}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => handleDecrement("reps")}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperIcon}>−</Text>
          </TouchableOpacity>
          <View style={styles.valueCol}>
            <TextInput
              style={[
                styles.heroValue,
                repsDeviates && styles.heroDeviated,
              ]}
              value={String(reps)}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                if (!isNaN(n)) onRepsChange(n);
                else if (t === "") onRepsChange(0);
              }}
              keyboardType="number-pad"
              selectTextOnFocus
            />
            <Text style={styles.unit}>REPS</Text>
          </View>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => handleIncrement("reps")}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperIcon}>+</Text>
          </TouchableOpacity>
        </View>
        {prescribedReps != null && (
          <Text style={[styles.prescribed, repsDeviates && styles.prescribedWarn]}>
            Rx: {prescribedReps}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  half: {
    flex: 1,
    gap: olySpacing[4],
  },

  /* Label */
  label: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Stepper card */
  stepperCard: {
    ...olyElevation.level1,
    borderRadius: olyRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: olySpacing[12],
    paddingHorizontal: olySpacing[12],
  },
  stepperButton: {
    width: STEPPER_SIZE,
    height: STEPPER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperIcon: {
    ...olyTypography.title2,
    color: olyColors.text.secondary,
    lineHeight: 28,
  },
  valueCol: {
    alignItems: "center",
    gap: olySpacing[4],
  },
  heroValue: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
    textAlign: "center",
    minWidth: 40,
    padding: 0,
  },
  heroDeviated: {
    color: olyColors.text.primary,
  },
  unit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* Prescription */
  prescribed: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    textAlign: "center",
  },
  prescribedWarn: {
    color: olyColors.text.secondary,
  },
});
