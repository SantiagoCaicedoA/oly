import { useAppSelector } from "@/store/store";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const token = useAppSelector((state) => state.auth.token);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  if (isLoggedIn && token) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/welcome" />;
}
