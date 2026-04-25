import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithTimeout, getApiUrl } from "../utils/api";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendRegistrationOtp: (email: string) => Promise<void>;
  register: (name: string, email: string, password: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for stored token
  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        const res = await fetchWithTimeout(`${getApiUrl()}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
        }
      }
    } catch (err) {
      console.error("Failed to load stored auth:", err);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
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
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, sendRegistrationOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
