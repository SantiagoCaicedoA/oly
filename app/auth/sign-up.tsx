/**
 * Sign Up Screen — Redesigned (v2)
 *
 * Left-aligned title, subtitle, bottom-anchored CTA.
 * Uses OlyScreenWrapper (standard app gradient).
 * Password fields have eye toggle for visibility.
 * OLY logo asset centered in nav bar.
 *
 * Abdul's SignUpPayload (name, email, password) is unchanged —
 * firstName + lastName are concatenated before the API call.
 */

import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { OlyNavBar } from "@/src/oly-components/organisms/OlyNavBar";
import { useToast } from "@/context/toast-context";
import { useSignupMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { clearOnboardingData } from "@/store/reducer/onboardingSlice";
import { SignUpPayload, SignUpFormValues } from "@/types/api/auth";
import { olyTypography } from "@/src/oly-theme/oly-typography";
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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { useDispatch } from "react-redux";

/* ── Nav bar logo ── */
const NavLogo = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <Animated.Image
    entering={reduceMotion ? undefined : FadeIn.duration(400)}
    source={require('@/assets/images/oly-logo.webp')}
    style={{ width: 40, height: 40 }}
    resizeMode="contain"
  />
);

export default function SignUp() {
  const reduceMotion = useReducedMotion();
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
          token: {
            token: result.token,
            refresh_token: result.refresh_token,
          },
        }),
      );

      // Clear any stale onboarding data from previous accounts
      dispatch(clearOnboardingData());

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
    <OlyScreenWrapper>
      <OlyNavBar
        onBack={() => router.replace("/auth/welcome")}
        centerElement={<NavLogo reduceMotion={!!reduceMotion} />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tap to dismiss keyboard on empty areas */}
          <Pressable onPress={Keyboard.dismiss} style={styles.flex}>
            {/* ── Title block ── */}
            <View style={styles.titleBlock}>
              <Text style={styles.title} maxFontSizeMultiplier={1.2}>
                Create account
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
                Start your training journey
              </Text>
            </View>

            {/* ── Fields ── */}
            <View style={styles.fieldContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <OlyFormField
                        label="FIRST NAME"
                        placeholder=""
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
                        placeholder=""
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
                    label="EMAIL ADDRESS"
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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <OlyFormField
                    label="CONFIRM PASSWORD"
                    placeholder=""
                    autoCapitalize="none"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
            </View>

            {/* spacer */}
            <View style={styles.flex} />
          </Pressable>

          {/* ── Bottom CTA (outside Pressable so it's always tappable) ── */}
          <View style={styles.bottomCta}>
            <OlyButton
              label={isLoading ? "Creating Account" : "Create Account"}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              preserveCase
            />

            <View style={styles.rowContainer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: olySpacing[32],
  },
  titleBlock: {
    marginTop: 24,
    marginBottom: 28,
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
  nameRow: {
    flexDirection: "row",
    gap: olySpacing[12],
  },
  nameField: {
    flex: 1,
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
