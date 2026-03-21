/**
 * Login Screen — Redesigned (v2)
 *
 * Left-aligned title, subtitle, bottom-anchored CTA.
 * Uses OlyScreenWrapper (standard app gradient).
 * Password field has eye toggle. "Forgot password?" link.
 * Button uses sentence case per approved prototype.
 *
 * All logic/API calls untouched from Abdul's implementation.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { OlyNavBar } from "@/src/oly-components/organisms/OlyNavBar";
import { useToast } from "@/context/toast-context";
import { useLoginMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { LoginPayload, LoginValues } from "@/types/api/auth";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { loginSchema } from "@/utils/validation-schemas";
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
import { useDispatch } from "react-redux";

export default function Login() {
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
    <OlyScreenWrapper>
      {/* Nav bar: back + centered OLY */}
      <OlyNavBar
        onBack={() => router.replace('/auth/welcome')}
        title="OLY"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <View style={styles.container}>
            {/* ── Title block (left-aligned) ── */}
            <View style={styles.titleBlock}>
              <Text style={styles.title} maxFontSizeMultiplier={1.2}>
                Welcome back
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
                Log in to continue training
              </Text>
            </View>

            {/* ── Fields ── */}
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <OlyFormField
                    label="EMAIL"
                    placeholder=""
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
                    placeholder=""
                    autoCapitalize="none"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* spacer */}
            <View style={styles.flex} />

            {/* ── Bottom CTA ── */}
            <View style={styles.bottomCta}>
              <OlyButton
                label={isLoading ? "Logging in..." : "Log In"}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                preserveCase
              />

              <View style={styles.rowContainer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUpPress}>
                  <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={olyColors.button.primary.bg}
          />
        </View>
      )}
    </OlyScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: olySpacing[32],
  },
  titleBlock: {
    marginTop: olySpacing[4],
    marginBottom: olySpacing[32],
  },
  title: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
  },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  fieldContainer: {
    gap: olySpacing[16],
  },
  forgotContainer: {
    alignSelf: "flex-end",
  },
  forgotText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  bottomCta: {
    paddingTop: olySpacing[24],
  },
  rowContainer: {
    flexDirection: "row",
    gap: olySpacing[8],
    marginTop: olySpacing[16],
    justifyContent: "center",
  },
  footerText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  footerLink: {
    ...olyTypography.bodySmall,
    fontFamily: "Ubuntu-Medium",
    color: olyColors.text.primary,
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
