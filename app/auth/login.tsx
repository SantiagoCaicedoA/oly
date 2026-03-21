import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useLoginMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { LoginPayload, LoginValues } from "@/types/api/auth";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
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

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <OlyScreenWrapper>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={styles.container}>
              <Text
                style={styles.title}
                maxFontSizeMultiplier={1.2}
              >
                LOGIN
              </Text>

              <View style={styles.fieldContainer}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <OlyFormField
                      label="EMAIL"
                      placeholder="alex@gmail.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
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
                    <OlyFormField
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

              <OlyButton
                label={isLoading ? "LOGGING IN" : "LOGIN"}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
              />

              <View style={styles.rowContainer}>
                <Text style={styles.text}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUpPress}>
                  <Text style={styles.link}>SIGN UP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>

          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator
                size="large"
                color={olyColors.button.primary.bg}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </OlyScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: olySpacing[32],
  },
  title: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
    textAlign: "center",
    letterSpacing: olyLetterSpacing.uppercase,
  },
  fieldContainer: {
    marginTop: olySpacing[24],
    gap: olySpacing[16],
    marginBottom: olySpacing[24],
  },
  rowContainer: {
    flexDirection: "row",
    gap: olySpacing[8],
    marginTop: olySpacing[20],
    justifyContent: "center",
  },
  text: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },
  link: {
    ...olyTypography.body,
    fontFamily: "Ubuntu-Medium",
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
