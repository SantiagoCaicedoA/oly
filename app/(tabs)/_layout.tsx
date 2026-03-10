import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { router, Tabs } from "expo-router";
import React, { createContext, useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { scale } from "react-native-size-matters";
export const TabBarContext = createContext({
  hideTabBar: () => {},
  showTabBar: () => {},
});

export default function TabLayout() {
  const { colors } = useTheme();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: "#8e8e93",
            tabBarStyle: isTabBarVisible
              ? {
                  borderTopWidth: 0,
                  height: scale(70),
                  position: "absolute",
                  paddingBottom: Platform.OS === "ios" ? scale(20) : scale(10),
                  paddingTop: scale(10),
                  elevation: 0,
                  marginHorizontal: scale(15),
                  marginBottom: scale(20),
                  borderRadius: scale(45),
                  overflow: "visible",
                }
              : { display: "none" },
            tabBarBackground: () => (
              <BlurView
                intensity={Platform.OS === "android" ? 70 : 40}
                experimentalBlurMethod="dimezisBlurView"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  //backgroundColor: colors.background,
                  borderRadius: scale(45),
                  overflow: "hidden",
                }}
              />
            ),
            tabBarLabelStyle: {
              fontSize: Typography.fontSize.xs,
              fontWeight: Typography.fontWeight.bold,
              textTransform: "uppercase",
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
                    width: scale(24),
                    height: scale(24),
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
                    width: scale(24),
                    height: scale(24),
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
                <View style={{ alignItems: "center", top: scale(-25) }}>
                  <TouchableOpacity
                    onPress={() => router.push("/athlete/create-new-post")}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: scale(45),
                        height: scale(45),
                        borderRadius: scale(30),
                        backgroundColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      }}
                    >
                      <Ionicons name="add" size={scale(32)} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: Typography.fontSize.xs,
                      fontWeight: Typography.fontWeight.bold,
                      color: "#8e8e93",
                      marginTop: scale(4),
                      textTransform: "uppercase",
                    }}
                  >
                    UPLOAD
                  </Text>
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
                    width: scale(24),
                    height: scale(24),
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
                    width: scale(24),
                    height: scale(24),
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
