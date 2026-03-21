import { useAppSelector } from "@/store/store";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
  const router = useRouter();

  const token = useAppSelector((state) => state.auth.token);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/auth/welcome");
    }
    setChecked(true);
  }, [isLoggedIn, token, router]);

  if (!checked) return null;

  return <Redirect href="/auth/welcome" />;
}
