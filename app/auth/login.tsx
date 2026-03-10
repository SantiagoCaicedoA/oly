import CustomButton from "@/constants/custom-button";
import CustomInput from "@/constants/custom-input";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useLoginMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { LoginPayload, LoginValues } from "@/types/api/auth";
import { Typography } from "@/utils/custom-styles";
import { loginSchema } from "@/utils/validation-schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router, Stack } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";
export default function Login() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
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

      showSuccess("Login Successfull", "Welcome back!");
      dispatch(
        loginSuccess({
          user: result.data,
          token: result.token,
        }),
      );
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
    loaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    },
  });

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                    value={value}
                    onChangeText={onChange}
                    isPassword
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            <CustomButton
              title={isLoading ? "LOGGING IN" : "LOGIN"}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            />

            <View style={styles.rowContainer}>
              <Text style={styles.text}>Don’t have an account?</Text>
              <TouchableOpacity onPress={handleSignUpPress}>
                <Text style={styles.login}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
