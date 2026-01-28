import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          borderTopWidth: 0,
          height: scale(70),
          position: "absolute",
          paddingBottom: Platform.OS === "ios" ? scale(20) : scale(10),
          paddingTop: scale(10),
          elevation: 0,
          marginHorizontal: scale(15),
          marginBottom: scale(20),
          borderRadius: scale(25),
          overflow: "visible",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={50}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,

              borderRadius: scale(25),
              overflow: "hidden",
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: scale(10),
          fontWeight: "600",
          textTransform: "uppercase",
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "HOME",
          tabBarIcon: ({ color }) => (
            <Image
              source={Images.home}
              style={{ width: scale(24), height: scale(24), tintColor: color }}
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
              style={{ width: scale(24), height: scale(24), tintColor: color }}
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
                onPress={props.onPress}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: scale(50),
                    height: scale(50),
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
                  fontSize: scale(10),
                  fontWeight: "600",
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
              style={{ width: scale(24), height: scale(24), tintColor: color }}
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
              style={{ width: scale(24), height: scale(24), tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
