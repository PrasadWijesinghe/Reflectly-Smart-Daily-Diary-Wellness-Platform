import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import AppLockGate from "../components/AppLockGate";
import { ThemeProvider } from "../context/ThemeContext";
import "./global.css";

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
          </Stack>
          <AppLockGate />
        </>
      </AuthProvider>
    </ThemeProvider>
  );
}
