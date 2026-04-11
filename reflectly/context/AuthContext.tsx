import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { fetchWithTimeout, getApiUrl } from "../utils/api";

type User = {
  id: number;
  name: string;
  email: string;
  appLockEnabled?: boolean;
  appLockType?: "pin" | "password" | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAppUnlocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendRegistrationOtp: (email: string) => Promise<void>;
  register: (name: string, email: string, password: string, otp: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setupAppLock: (type: "pin" | "password", secret: string) => Promise<void>;
  disableAppLock: () => Promise<void>;
  verifyAppLock: (secret: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppUnlocked, setIsAppUnlocked] = useState(true);

  // On mount, check for stored token
  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" && user?.appLockEnabled) {
        setIsAppUnlocked(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user?.appLockEnabled]);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAppUnlocked(!parsedUser?.appLockEnabled);
      }
    } catch (err) {
      console.error("Failed to load stored auth:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetchWithTimeout(`${getApiUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAppUnlocked(!data.user?.appLockEnabled);
  }

  async function sendRegistrationOtp(email: string) {
    const res = await fetchWithTimeout(`${getApiUrl()}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send OTP");
    }
  }

  async function register(name: string, email: string, password: string, otp: string) {
    const res = await fetchWithTimeout(`${getApiUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAppUnlocked(!data.user?.appLockEnabled);
  }

  async function refreshUser() {
    const currentToken = token || (await AsyncStorage.getItem("token"));
    if (!currentToken) {
      return;
    }

    const res = await fetchWithTimeout(`${getApiUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to refresh profile");
    }

    const nextUser = data.user as User;
    await AsyncStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    setIsAppUnlocked(!nextUser?.appLockEnabled);
  }

  async function setupAppLock(type: "pin" | "password", secret: string) {
    if (!token) {
      throw new Error("You need to be logged in.");
    }

    const res = await fetchWithTimeout(`${getApiUrl()}/auth/app-lock/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, secret }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to set app lock");
    }

    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setIsAppUnlocked(true);
  }

  async function disableAppLock() {
    if (!token) {
      throw new Error("You need to be logged in.");
    }

    const res = await fetchWithTimeout(`${getApiUrl()}/auth/app-lock`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to disable app lock");
    }

    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setIsAppUnlocked(true);
  }

  async function verifyAppLock(secret: string) {
    if (!token) {
      throw new Error("You need to be logged in.");
    }

    const res = await fetchWithTimeout(`${getApiUrl()}/auth/app-lock/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ secret }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Unlock failed");
    }

    setIsAppUnlocked(true);
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAppUnlocked(true);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAppUnlocked,
        login,
        sendRegistrationOtp,
        register,
        refreshUser,
        setupAppLock,
        disableAppLock,
        verifyAppLock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
