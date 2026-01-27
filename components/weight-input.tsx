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
  unit: "KG" | "LB";
  onUnitChange: (unit: "KG" | "LB") => void;
  error?: string;
}

export default function WeightInput({
  label,
  value,
  onChangeText,
  unit,
  onUnitChange,
  error,
}: WeightInputProps) {
  const { colors } = useTheme();

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
      borderWidth: 0.3,
      borderColor: colors.text,
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
    unitButtons: {
      flexDirection: "row",
      gap: scale(4),
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: scale(7),
    },
    unitButton: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(6),
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
        />
        <View style={styles.unitButtons}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "KG"
                ? styles.unitButtonActive
                : styles.unitButtonInactive,
            ]}
            onPress={() => onUnitChange("KG")}
          >
            <Text style={styles.unitText}>KG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "LB"
                ? styles.unitButtonActive
                : styles.unitButtonInactive,
            ]}
            onPress={() => onUnitChange("LB")}
          >
            <Text style={styles.unitText}>LB</Text>
          </TouchableOpacity>
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
