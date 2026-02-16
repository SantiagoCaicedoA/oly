import { Stack } from "expo-router";
import React from "react";
export default function AthleteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="post-expanded" />
      <Stack.Screen name="daily-check-in" />
      <Stack.Screen name="training-exercise" />
      <Stack.Screen name="create-new-post" />
      <Stack.Screen name="my-profile" />
      <Stack.Screen name="add-exercise" />
      <Stack.Screen name="archive" />
    </Stack>
  );
}
