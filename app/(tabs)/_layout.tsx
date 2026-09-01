import { TabLoaderProvider, useTabLoader } from "@/components/tab-loader";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { Ionicons } from "@expo/vector-icons";
import { OlyHomeIcon } from "@/components/icons/OlyHomeIcon";
import { OlyAnalyticsIcon } from "@/components/icons/OlyAnalyticsIcon";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router, Tabs } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const TabBarContext = createContext({
  hideTabBar: () => {},
  showTabBar: () => {},
});

const ICON_SIZE = 20;
const FAB_SIZE = 44;
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MARGIN_BOTTOM = 28;
const TAB_BAR_MARGIN_H = 14;

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <TabLoaderProvider>
        <TabsWithLoader />
      </TabLoaderProvider>
    </GestureHandlerRootView>
  );
}

function TabsWithLoader() {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const { show } = useTabLoader();

  // branded loader on the first open of the tabs
  useEffect(() => {
    show();
  }, [show]);

  // shown before opening Home / Workout / Rank / Analytics
  const loaderListeners = { tabPress: () => show() };

  return (
    <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: olyPalette.background },
            tabBarActiveTintColor: olyPalette.white,
            tabBarInactiveTintColor: olyColors.text.disabled,
            tabBarStyle: isTabBarVisible
              ? {
                  height: TAB_BAR_HEIGHT,
                  position: "absolute",
                  elevation: 0,
                  marginHorizontal: TAB_BAR_MARGIN_H,
                  marginBottom: TAB_BAR_MARGIN_BOTTOM,
                  borderRadius: olyRadius.lg,
                  overflow: "visible",
                  backgroundColor: olyElevation.level1.backgroundColor,
                  borderColor: olyColors.border.default,
                  borderWidth: 1,
                  paddingHorizontal: olySpacing[8],
                }
              : { display: "none" },
            tabBarItemStyle: {
              justifyContent: "center",
              height: TAB_BAR_HEIGHT,
              paddingTop: olySpacing[4],
            },
            tabBarIconStyle: {
              marginTop: 0,
              marginBottom: 0,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontFamily: olyTypography.caption.fontFamily,
              textTransform: "uppercase",
              letterSpacing: 0,
              marginTop: olySpacing[4],
            },
            tabBarShowLabel: true,
            animation: "none",
          }}
        >
          <Tabs.Screen
            name="home"
            listeners={loaderListeners}
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <OlyHomeIcon size={ICON_SIZE} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="workout"
            listeners={loaderListeners}
            options={{
              title: "Workout",
              tabBarIcon: ({ color }) => (
                <Ionicons name="calendar-outline" size={ICON_SIZE} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="upload"
            options={{
              title: "POST",
              tabBarButton: () => (
                <View style={styles.fabWrapper}>
                  <TouchableOpacity
                    onPress={() => router.push("/athlete/create-new-post")}
                    style={styles.fabTouchable}
                    accessibilityRole="button"
                    accessibilityLabel="Create new post"
                  >
                    <View style={styles.fab}>
                      <Ionicons
                        name="add"
                        size={24}
                        color={olyColors.text.onBrand}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="rank"
            listeners={loaderListeners}
            options={{
              title: "Rank",
              tabBarIcon: ({ color }) => (
                <Ionicons name="pulse-outline" size={ICON_SIZE} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="analytics"
            listeners={loaderListeners}
            options={{
              title: "Analytics",
              tabBarIcon: ({ color }) => (
                <OlyAnalyticsIcon size={ICON_SIZE} color={color} />
              ),
            }}
          />
        </Tabs>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fabWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: TAB_BAR_HEIGHT,
    paddingBottom: olySpacing[8],
  },
  fabTouchable: {
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
