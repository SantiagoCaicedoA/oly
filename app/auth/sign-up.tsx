/**
 * Sign Up Screen — Redesigned
 *
 * Uses the Welcome screen's gradient background for visual continuity.
 * Split first/last name, confirm password, back navigation via OlyNavBar.
 * Abdul's SignUpPayload (name, email, password) is unchanged —
 * firstName + lastName are concatenated before the API call.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { OlyNavBar } from "@/src/oly-components/organisms/OlyNavBar";
import { useToast } from "@/context/toast-context";
import { useSignupMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { SignUpPayload, SignUpFormValues } from "@/types/api/auth";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { signUpFormSchema } from "@/utils/validation-schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

/* ── Welcome-screen gradient (Figma node 3591-1116) ──── */

const BG_GRADIENT = {
  colors: ['#1A2533', '#0F1A24', '#1E3348', '#0C1620'],
  locations: [0, 0.3, 0.6, 1] as [number, number, number, number],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

export default function SignUp() {
  const { showSuccess, showError } = useToast();
  const dispatch = useDispatch();
  const [submitProfile, { isLoading }] = useSignupMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: yupResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    // Concatenate into single `name` for Abdul's backend contract
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    const payload: SignUpPayload = {
      name: fullName,
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

      showSuccess("Success", "Welcome! Let's get started");
      router.push({
        pathname: "/auth/onboarding/main-onboarding",
        params: {
          name: fullName,
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

  return (
    <LinearGradient
      colors={BG_GRADIENT.colors}
      locations={BG_GRADIENT.locations}
      start={BG_GRADIENT.start}
      end={BG_GRADIENT.end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* ── Back navigation ── */}
        <OlyNavBar onBack={() => router.back()} />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={styles.title}
                maxFontSizeMultiplier={1.2}
              >
                CREATE ACCOUNT
              </Text>

              <View style={styles.fieldContainer}>
                {/* ── Name row: first + last side by side ── */}
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field: { onChange, value } }) => (
                        <OlyFormField
                          label="FIRST NAME"
                          placeholder="Santiago"
                          autoCapitalize="words"
                          value={value}
                          onChangeText={onChange}
                          error={errors.firstName?.message}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.nameField}>
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field: { onChange, value } }) => (
                        <OlyFormField
                          label="LAST NAME"
                          placeholder="Caicedo"
                          autoCapitalize="words"
                          value={value}
                          onChangeText={onChange}
                          error={errors.lastName?.message}
                        />
                      )}
                    />
                  </View>
                </View>

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
                      placeholder="Min 7 characters"
                      autoCapitalize="none"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      error={errors.password?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <OlyFormField
                      label="CONFIRM PASSWORD"
                      placeholder="Re-enter your password"
                      autoCapitalize="none"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
              </View>

              <OlyButton
                label={isLoading ? "CREATING ACCOUNT" : "SIGN UP"}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
              />

              <View style={styles.rowContainer}>
                <Text style={styles.text}>Already have an account?</Text>
                <TouchableOpacity onPress={handleLoginPress}>
                  <Text style={styles.link}>LOG IN</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ── styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: olySpacing[16],
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
  nameRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  nameField: {
    flex: 1,
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
