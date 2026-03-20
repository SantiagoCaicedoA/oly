/**
 * OlyStepper — Increment/decrement number input
 * Source: Design Bible v3.0, Section 8.1 Stepper Input
 *
 * Height: 44px standard, 56px in-gym
 * Touch targets: 44px standard, 56px in-gym
 * Number tappable to open direct keyboard entry
 *
 * Figma: oly/stepper/default
 */

import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import {
  olyTypography,
  olyLetterSpacing,
  olyMaxFontScale,
} from "@/src/oly-theme/oly-typography";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout } from "@/src/oly-theme/oly-spacing";

// ─── Types ───────────────────────────────────────────────────────
interface OlyStepperProps {
  value: number;
  onValueChange: (value: number) => void;
  /** Step increment per tap (default: 1 for reps, 2.5 for weight) */
  step?: number;
  min?: number;
  max?: number;
  /** Unit label shown below the number (ALL-CAPS) */
  unit?: string;
  /** Use 56px gym-sized touch targets */
  gymMode?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────
export const OlyStepper: React.FC<OlyStepperProps> = ({
  value,
  onValueChange,
  step = 1,
  min = 0,
  max = 999,
  unit,
  gymMode = false,
  style,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const touchTarget = gymMode
    ? olyLayout.gymTouchTarget
    : olyLayout.minTouchTarget;
  const height = gymMode ? 56 : 44;

  const handleDecrement = () => {
    if (value - step >= min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(value + step);
    }
  };

  const handleNumberPress = () => {
    setEditText(String(value));
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    const parsed = parseFloat(editText);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onValueChange(parsed);
    }
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Minus button */}
      <Pressable
        onPress={handleDecrement}
        style={[styles.button, { width: touchTarget, height: touchTarget }]}
        accessibilityLabel={`Decrease by ${step}`}
        accessibilityRole="button"
        hitSlop={gymMode ? 0 : 6}
      >
        <Text
          style={styles.buttonText}
          maxFontSizeMultiplier={olyMaxFontScale.number}
        >
          −
        </Text>
      </Pressable>

      {/* Value display / edit */}
      <Pressable
        onPress={handleNumberPress}
        style={styles.valueContainer}
        accessibilityLabel={`${value}${unit ? ` ${unit}` : ""}, tap to edit`}
      >
        {isEditing ? (
          <TextInput
            value={editText}
            onChangeText={setEditText}
            onBlur={handleEditSubmit}
            onSubmitEditing={handleEditSubmit}
            keyboardType="decimal-pad"
            autoFocus
            selectTextOnFocus
            style={styles.valueInput}
            maxFontSizeMultiplier={olyMaxFontScale.number}
          />
        ) : (
          <>
            <Text
              style={styles.valueText}
              maxFontSizeMultiplier={olyMaxFontScale.number}
            >
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </Text>
            {unit ? (
              <Text
                style={styles.unitText}
                maxFontSizeMultiplier={olyMaxFontScale.caption}
              >
                {unit.toUpperCase()}
              </Text>
            ) : null}
          </>
        )}
      </Pressable>

      {/* Plus button */}
      <Pressable
        onPress={handleIncrement}
        style={[styles.button, { width: touchTarget, height: touchTarget }]}
        accessibilityLabel={`Increase by ${step}`}
        accessibilityRole="button"
        hitSlop={gymMode ? 0 : 6}
      >
        <Text
          style={styles.buttonText}
          maxFontSizeMultiplier={olyMaxFontScale.number}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: olyElevation.level1.backgroundColor,
    borderWidth: olyElevation.level1.borderWidth,
    borderColor: olyElevation.level1.borderColor,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  valueContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  valueInput: {
    ...olyTypography.number,
    color: olyColors.text.primary,
    textAlign: "center",
    minWidth: 60,
    padding: 0,
  },
  unitText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginTop: 2,
  },
});

export default OlyStepper;
