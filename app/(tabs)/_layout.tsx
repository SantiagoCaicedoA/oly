import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router, Tabs } from "expo-router";
import React, { createContext, useState } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const TabBarContext = createContext({
  hideTabBar: () => {},
  showTabBar: () => {},
});

const ICON_SIZE = 24;
const FAB_SIZE = 48;
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MARGIN_BOTTOM = 20;
const TAB_BAR_MARGIN_H = 16;

export default function TabLayout() {
  const { colors } = useTheme();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: olyPalette.primary,
            tabBarInactiveTintColor: olyColors.text.disabled,
            tabBarStyle: isTabBarVisible
              ? {
                  borderTopWidth: 0,
                  height: TAB_BAR_HEIGHT,
                  position: "absolute",
                  paddingBottom: Platform.OS === "ios" ? 12 : 8,
                  paddingTop: 8,
                  elevation: 0,
                  marginHorizontal: TAB_BAR_MARGIN_H,
                  marginBottom: TAB_BAR_MARGIN_BOTTOM,
                  borderRadius: olyRadius.lg,
                  overflow: "visible",
                  backgroundColor: olyElevation.level1.backgroundColor,
                  borderColor: olyElevation.level1.borderColor,
                  borderWidth: olyElevation.level1.borderWidth,
                }
              : { display: "none" },
            tabBarLabelStyle: {
              ...olyTypography.caption,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            },
            tabBarShowLabel: true,
            animation: "none",
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "HOME",
              tabBarIcon: ({ color }) => (
                <Image
                  source={Images.home}
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    tintColor: color,
                  }}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="workout"
            options={{
              title: "WORKOUT",
              tabBarIcon: ({ color }) => (
                <Image
                  source={Images.workout}
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    tintColor: color,
                  }}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="upload"
            options={{
              title: "UPLOAD",
              tabBarButton: (props) => (
                <View style={styles.fabWrapper}>
                  <TouchableOpacity
                    onPress={() => router.push("/athlete/create-new-post")}
                    style={styles.fabTouchable}
                    accessibilityRole="button"
                    accessibilityLabel="Upload new post"
                  >
                    <View style={styles.fab}>
                      <Ionicons name="add" size={28} color={olyColors.text.onBrand} />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.fabLabel}>UPLOAD</Text>
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="rank"
            options={{
              title: "RANK",
              tabBarIcon: ({ color }) => (
                <Image
                  source={Images.rank}
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    tintColor: color,
                  }}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="analytics"
            options={{
              title: "ANALYTICS",
              tabBarIcon: ({ color }) => (
                <Image
                  source={Images.analytics}
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    tintColor: color,
                  }}
                />
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
    alignItems: "center",
    top: -24,
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
    // No shadow — Design Bible: elevation via surface brightness only
  },
  fabLabel: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
