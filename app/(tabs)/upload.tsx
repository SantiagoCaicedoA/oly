import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function Upload() {
  return <Redirect href={"/athlete/create-new-post"} />;
}

const styles = StyleSheet.create({});
