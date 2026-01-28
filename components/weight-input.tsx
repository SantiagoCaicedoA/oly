import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/theme-context";
import { Typography } from "../utils/custom-styles";

interface WeightInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
  error?: string;
  units?: string[];
}

export default function WeightInput({
  label,
  value,
  onChangeText,
  unit,
  onUnitChange,
  error,
  units = ["KG", "LB"],
}: WeightInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = StyleSheet.create({
    container: {
      marginBottom: verticalScale(12),
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.medium,
      color: colors.textSecondary,
      marginBottom: verticalScale(6),
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: isFocused ? 0.5 : 0.3,
      borderColor: isFocused ? colors.primary : colors.text,
      borderRadius: scale(10),
      paddingHorizontal: scale(12),
      minHeight: verticalScale(45),
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
      paddingVertical: verticalScale(10),
    },
    unitButtons: {
      flexDirection: "row",
      gap: scale(4),
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: scale(7),
    },
    unitButton: {
      paddingHorizontal: scale(6),
      paddingVertical: scale(5),
      margin: 3,
      borderRadius: scale(3),
    },
    unitButtonActive: {
      backgroundColor: colors.primary,
    },
    unitButtonInactive: {
      backgroundColor: "transparent",
    },
    unitText: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.medium,
      color: colors.text,
    },
    errorText: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamily.regular,
      color: "#EF4444",
      marginTop: verticalScale(4),
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="97"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <View style={styles.unitButtons}>
          {units.map((unitOption) => (
            <TouchableOpacity
              key={unitOption}
              style={[
                styles.unitButton,
                unit === unitOption
                  ? styles.unitButtonActive
                  : styles.unitButtonInactive,
              ]}
              onPress={() => onUnitChange(unitOption)}
            >
              <Text style={styles.unitText}>{unitOption}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
