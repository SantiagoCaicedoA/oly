import CustomButton from "@/constants/custom-button";
import CustomInput from "@/constants/custom-input";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useLoginMutation } from "@/store/api";
import { LoginPayload, LoginValues } from "@/types/api/auth";
import { Typography } from "@/utils/custom-styles";
import { loginSchema } from "@/utils/validation-schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";
export default function Login() {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: LoginValues) => {
    const payload: LoginPayload = {
      email: data.email.trim(),
      password: data.password,
    };

    try {
      const result = await login(payload).unwrap();

      showSuccess("Success", "Login success");
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Something went wrong. Please try again.";

      showError(errorMessage, "Error");
    }
  };
  const handleSignUpPress = () => {
    router.push("/auth/sign-up");
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: scale(60),
      paddingHorizontal: scale(20),
      paddingBottom: scale(30),
      justifyContent: "center",
    },
    signUp: {
      fontSize: Typography.fontSize["2xl"],
      fontWeight: Typography.fontWeight.extrabold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
      textAlign: "center",
    },
    rowContainer: {
      flexDirection: "row",
      gap: scale(5),
      marginTop: scale(20),
      justifyContent: "center",
    },
    fieldContainer: {
      marginTop: scale(20),
      gap: scale(15),
      marginBottom: scale(20),
    },
    text: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    login: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.signUp}>LOGIN</Text>

      <View style={styles.fieldContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="EMAIL"
              placeholder="alex@gmail.com"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label="PASSWORD"
              placeholder="Enter your password"
              autoCapitalize="none"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      <CustomButton title="LOGIN" onPress={handleSubmit(onSubmit)} />

      <View style={styles.rowContainer}>
        <Text style={styles.text}>Don’t have an account?</Text>
        <TouchableOpacity onPress={handleSignUpPress}>
          <Text style={styles.login}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
