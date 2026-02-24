import CustomButton from "@/constants/custom-button";
import { useTheme } from "@/context/theme-context";
import { api } from "@/store/api";
import { logout } from "@/store/reducer/authSlice";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "react-native-size-matters";
import { useDispatch } from "react-redux";

export default function Rank() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
    router.push("/auth/login");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      paddingHorizontal: scale(15),
    },
  });
  return (
    <View style={styles.container}>
      <CustomButton title="Log out" onPress={handleLogout} />
    </View>
  );
}
