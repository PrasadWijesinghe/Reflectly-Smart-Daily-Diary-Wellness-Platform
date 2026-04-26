import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import "./global.css";
import AppLockGate from "../components/AppLockGate";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="viewall-diary" />
            <Stack.Screen name="videos" />
          </Stack>
          <AppLockGate />
        </>
      </AuthProvider>
    </ThemeProvider>
  );
}