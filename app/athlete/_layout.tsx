import { useTheme } from "@/context/theme-context";
import { Stack } from "expo-router";
import React from "react";
export default function AthleteLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="post-expanded" />
      <Stack.Screen name="daily-check-in" />
      <Stack.Screen name="training-exercise" />
      <Stack.Screen name="create-new-post" />
      <Stack.Screen name="my-profile" />
      <Stack.Screen name="add-exercise" />
      <Stack.Screen name="archive" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings-personal-bests" />
      <Stack.Screen name="settings-availability" />
      <Stack.Screen name="settings-training-preference" />
      <Stack.Screen name="settings-equipment" />
      <Stack.Screen name="settings-focus-areas" />
      <Stack.Screen name="settings-injuries" />
      <Stack.Screen name="settings-user-info" />
      <Stack.Screen name="settings-coach-preferences" />
      <Stack.Screen name="settings-notifications" />
      <Stack.Screen name="settings-privacy" />
    </Stack>
  );
}
