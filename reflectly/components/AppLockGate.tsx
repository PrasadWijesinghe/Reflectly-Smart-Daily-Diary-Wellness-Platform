import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

export default function AppLockGate() {
  const { user, isLoading, isAppUnlocked, verifyAppLock, logout } = useAuth();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockType = useMemo(() => user?.appLockType || "pin", [user?.appLockType]);

  if (isLoading || !user || !user.appLockEnabled || isAppUnlocked) {
    return null;
  }

  async function handleUnlock() {
    try {
      setIsSubmitting(true);
      setError(null);
      await verifyAppLock(secret.trim());
      setSecret("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.overlay}>
      <LinearGradient colors={["#0F172A", "#1E3A8A", "#2563EB"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.cardWrap}
        >
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={lockType === "pin" ? "keypad-outline" : "lock-closed-outline"}
                size={30}
                color="#2563EB"
              />
            </View>
            <Text style={styles.title}>App Lock</Text>
            <Text style={styles.subtitle}>
              Enter your {lockType === "pin" ? "4-digit PIN" : "app password"} to open Reflectly.
            </Text>

            <TextInput
              value={secret}
              onChangeText={(value) => {
                setSecret(value);
                if (error) setError(null);
              }}
              placeholder={lockType === "pin" ? "Enter PIN" : "Enter app password"}
              placeholderTextColor="#94A3B8"
              keyboardType={lockType === "pin" ? "number-pad" : "default"}
              secureTextEntry
              maxLength={lockType === "pin" ? 4 : 32}
              style={styles.input}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.unlockButton, isSubmitting && styles.disabledButton]}
              onPress={handleUnlock}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.unlockButtonText}>Unlock</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.75}>
              <Text style={styles.logoutText}>Log out instead</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  gradient: {
    flex: 1,
  },
  cardWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    textAlign: "center",
  },
  input: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
  },
  unlockButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  unlockButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
});
