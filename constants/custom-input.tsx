import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/theme-context";
import { Typography } from "../utils/custom-styles";

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
}

const CustomInput = forwardRef<TextInput, CustomInputProps>(
  (
    {
      label,
      error,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      ...props
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const styles = StyleSheet.create({
      container: {
        marginBottom: verticalScale(12),
        ...containerStyle,
      },
      label: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
        color: colors.textSecondary,
        marginBottom: verticalScale(6),
        ...labelStyle,
      },
      inputContainer: {
        borderWidth: isFocused ? 0.5 : 0.3,
        borderColor: isFocused ? colors.primary : colors.text,
        borderRadius: scale(10),
        paddingHorizontal: scale(12),
        minHeight: verticalScale(35),
        justifyContent: "center",
        backgroundColor: colors.surface,
      },
      input: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        color: colors.text,
        paddingVertical: verticalScale(10),
        ...inputStyle,
      },
      errorText: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.regular,
        color: "#EF4444",
        marginTop: verticalScale(4),
        ...errorStyle,
      },
    });

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
