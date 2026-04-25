import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, DEFAULT_THEME_ID, getThemeById, ThemeId } from "../utils/theme";

const STORAGE_KEY = "reflectly_theme";

type ThemeContextType = {
  theme: AppTheme;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => Promise<void>;
  isThemeLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTheme) {
        setThemeIdState((getThemeById(storedTheme).id as ThemeId) || DEFAULT_THEME_ID);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    } finally {
      setIsThemeLoading(false);
    }
  }

  async function setThemeId(themeIdValue: ThemeId) {
    setThemeIdState(themeIdValue);
    await AsyncStorage.setItem(STORAGE_KEY, themeIdValue);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: getThemeById(themeId),
        themeId,
        setThemeId,
        isThemeLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
