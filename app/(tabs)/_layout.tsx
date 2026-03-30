import { useTheme } from "@/context/theme-context";
import { olyTypography, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { Ionicons } from "@expo/vector-icons";
import { OlyHomeIcon } from "@/components/icons/OlyHomeIcon";
import { OlyWorkoutIcon } from "@/components/icons/OlyWorkoutIcon";
import { OlyRankIcon } from "@/components/icons/OlyRankIcon";
import { OlyAnalyticsIcon } from "@/components/icons/OlyAnalyticsIcon";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router, Tabs } from "expo-router";
import React, { createContext, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const TabBarContext = createContext({
  hideTabBar: () => {},
  showTabBar: () => {},
});

const ICON_SIZE = 22;
const FAB_SIZE = 44;
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MARGIN_BOTTOM = 28;
const TAB_BAR_MARGIN_H = 14;

export default function TabLayout() {
  const { colors } = useTheme();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: olyPalette.white,
            tabBarInactiveTintColor: olyColors.text.secondary,
            tabBarStyle: isTabBarVisible
              ? {
                  borderTopWidth: 0,
                  height: TAB_BAR_HEIGHT,
                  position: "absolute",
                  paddingBottom: olySpacing[12],
                  paddingTop: olySpacing[8],
                  justifyContent: "center",
                  elevation: 0,
                  marginHorizontal: TAB_BAR_MARGIN_H,
                  marginBottom: TAB_BAR_MARGIN_BOTTOM,
                  borderRadius: 20,
                  overflow: "visible",
                  backgroundColor: olyElevation.level1.backgroundColor,
                  borderColor: olyColors.border.default,
                  borderWidth: 1,
                }
              : { display: "none" },
            tabBarLabelStyle: {
              fontSize: olyTypography.caption.fontSize,
              fontFamily: olyTypography.caption.fontFamily,
              textTransform: "capitalize",
              letterSpacing: olyLetterSpacing.uppercase,
              marginTop: olySpacing[4],
            },
            tabBarShowLabel: true,
            animation: "none",
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <OlyHomeIcon size={ICON_SIZE} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="workout"
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
            options={{
              title: "Rank",
              tabBarIcon: ({ color }) => (
                <Ionicons name="pulse-outline" size={ICON_SIZE} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="analytics"
            options={{
              title: "Analytics",
              tabBarIcon: ({ color }) => (
                <OlyAnalyticsIcon size={ICON_SIZE} color={color} />
              ),
            }}
          />
        </Tabs>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
    top: 0,
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
