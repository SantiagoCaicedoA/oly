import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main-onboarding" />
      <Stack.Screen name="onboarding-screen1" />
      <Stack.Screen name="onboarding-screen2" />
      <Stack.Screen name="onboarding-screen3" />
      <Stack.Screen name="onboarding-screen4" />
      <Stack.Screen name="onboarding-screen5" />
      <Stack.Screen name="onboarding-screen6" />
      <Stack.Screen name="onboarding-screen7" />
      <Stack.Screen name="onboarding-screen8" />
    </Stack>
  );
}
