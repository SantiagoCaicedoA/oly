import CustomButton from "@/constants/custom-button";
import CustomInput from "@/constants/custom-input";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useSignupMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { SignUpPayload, SignUpValues } from "@/types/api/auth";
import { Typography } from "@/utils/custom-styles";
import { signUpSchema } from "@/utils/validation-schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
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
export default function SignUp() {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const dispatch = useDispatch();
  const [submitProfile, { isLoading }] = useSignupMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    const payload: SignUpPayload = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
    };

    try {
      const result = await submitProfile(payload).unwrap();

      dispatch(
        loginSuccess({
          user: result.data,
          token: result.token,
        }),
      );

      showSuccess("Success", "Signup success");
      router.push({
        pathname: "/auth/onboarding/main-onboarding",
        params: {
          name: data.name,
          email: data.email,
        },
      });
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        "Something went wrong. Please try again.";

      showError(errorMessage, "Error");
    }
  };

  const handleLoginPress = () => {
    router.push("/auth/login");
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.signUp}>SIGN UP</Text>

          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  label="NAME"
                  placeholder="Enter your name"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />

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
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <CustomButton
            title={isLoading ? "SIGNING UP" : "SIGN UP"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          />

          <View style={styles.rowContainer}>
            <Text style={styles.text}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.login}>LOGIN</Text>
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
  );
}
