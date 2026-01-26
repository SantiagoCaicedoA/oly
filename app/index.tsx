import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function index() {
  return <Redirect href={"/auth"} />;
}

const styles = StyleSheet.create({});
