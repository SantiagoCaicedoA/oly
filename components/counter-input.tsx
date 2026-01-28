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

interface CounterInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  error?: string;
}

export default function CounterInput({
  label,
  value,
  onChangeText,
  suffix = "",
  error,
}: CounterInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const increment = () => {
    const numValue = parseInt(value || "0");
    onChangeText((numValue + 1).toString());
  };

  const decrement = () => {
    const numValue = parseInt(value || "0");
    if (numValue > 0) {
      onChangeText((numValue - 1).toString());
    }
  };

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
      minHeight: verticalScale(35),
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
      paddingVertical: verticalScale(10),
    },
    suffix: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.medium,
      color: colors.textSecondary,
      marginRight: scale(12),
    },
    counterButtons: {
      flexDirection: "row",
      gap: scale(4),
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: scale(7),
    },
    counterButton: {
      width: scale(32),
      height: scale(20),
      borderRadius: scale(6),

      justifyContent: "center",
      alignItems: "center",
    },
    counterText: {
      fontSize: Typography.fontSize.lg,
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
          placeholder="0 Years"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Text style={styles.suffix}>{suffix}</Text>
        <View style={styles.counterButtons}>
          <TouchableOpacity style={styles.counterButton} onPress={decrement}>
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.counterButton} onPress={increment}>
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
