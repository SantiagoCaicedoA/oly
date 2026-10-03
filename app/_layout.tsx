import { OlyAlertHost } from "@/src/oly-components/feedback/OlyAlert";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { persistor, store } from "@/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { olyGradient } from "@/src/oly-theme/oly-colors";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

function AppContent() {
  const colorScheme = useColorScheme();

  const [loaded, fontError] = useFonts({
    "Ubuntu-Regular": require("../assets/fonts/Ubuntu-Regular.ttf"),
    "Ubuntu-Medium": require("../assets/fonts/Ubuntu-Medium.ttf"),
    "Ubuntu-Bold": require("../assets/fonts/Ubuntu-Bold.ttf"),
  });

  /* This was commented out, so every screen painted once in the system font
     and then again in Ubuntu. The `|| fontError` matters: without it a font
     that fails to load leaves the app on a blank screen forever, which is a
     worse failure than the wrong typeface. */
  if (!loaded && !fontError) return null;

  return (
    <ToastProvider>
      <NavigationThemeProvider
        value={{
          ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
          colors: {
            ...(colorScheme === "dark" ? DarkTheme : DefaultTheme).colors,
            background: olyGradient.colors[2],
          },
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="athlete" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        <OlyAlertHost />
      </NavigationThemeProvider>
    </ToastProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <AppContent />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
