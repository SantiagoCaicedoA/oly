import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { useSignupMutation } from "@/store/api";
import { loginSuccess } from "@/store/reducer/authSlice";
import { SignUpPayload, SignUpValues } from "@/types/api/auth";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
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
import { useDispatch } from "react-redux";

export default function SignUp() {
  const { colors } = useTheme();
  const { showSuccess, showError } = useToast();
  const dispatch = useDispatch();
  const [submitProfile, { isLoading, error }] = useSignupMutation();
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

      showSuccess("Success", "Welcome! Let's get started");
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

  return (
    <OlyScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Text
              style={styles.title}
              maxFontSizeMultiplier={1.2}
            >
              SIGN UP
            </Text>

            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <OlyFormField
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
              label={isLoading ? "SIGNING UP" : "SIGN UP"}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />

            <View style={styles.rowContainer}>
              <Text style={styles.text}>Already have an account?</Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.link}>LOGIN</Text>
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
