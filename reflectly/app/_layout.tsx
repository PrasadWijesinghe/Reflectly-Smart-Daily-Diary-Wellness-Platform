import React, { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import SecurityService from "../utils/SecurityService";
import LockScreen from "../components/Security/LockScreen";
import "./global.css";

export default function RootLayout() {
  const [isAppLocked, setIsAppLocked] = useState(false);

  useEffect(() => {
    // 1. Initial check on mount
    checkLockStatus();

    // 2. Listen for AppState changes (Background -> Foreground)
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const checkLockStatus = async () => {
    const isEnabled = await SecurityService.isLockEnabled();
    if (isEnabled) {
      setIsAppLocked(true);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      const isEnabled = await SecurityService.isLockEnabled();
      if (isEnabled) {
        setIsAppLocked(true);
      }
    }
  };

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="viewall-diary" />
      </Stack>
      {isAppLocked && <LockScreen onUnlock={() => setIsAppLocked(false)} />}
    </AuthProvider>
  );
}
