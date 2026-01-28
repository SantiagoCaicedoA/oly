import React from "react";
import { StyleSheet, View } from "react-native";

export default function Workout() {
  return (
    <View
      style={{
        height: "100%",

        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "blue",
          height: "100%",
          width: 20,
        }}
      ></View>
    </View>
  );
}

const styles = StyleSheet.create({});
