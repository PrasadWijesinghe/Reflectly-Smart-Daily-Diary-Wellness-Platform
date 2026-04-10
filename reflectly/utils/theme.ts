export type ThemeId = "blue" | "green" | "purple" | "yellow" | "red";

export type AppTheme = {
  id: ThemeId;
  name: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  gradient: [string, string, string];
  surface: string;
  surfaceTint: string;
  badge: string;
  badgeText: string;
  textAccent: string;
  success: string;
  warning: string;
  danger: string;
};

export const THEMES: AppTheme[] = [
  {
    id: "blue",
    name: "Blue",
    primary: "#3B82F6",
    primaryDark: "#1D4ED8",
    primarySoft: "#DBEAFE",
    gradient: ["#3B82F6", "#2563EB", "#1D4ED8"],
    surface: "#EFF6FF",
    surfaceTint: "rgba(59,130,246,0.16)",
    badge: "#F59E0B",
    badgeText: "#FFFFFF",
    textAccent: "#2563EB",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  {
    id: "green",
    name: "Green",
    primary: "#10B981",
    primaryDark: "#059669",
    primarySoft: "#D1FAE5",
    gradient: ["#10B981", "#059669", "#047857"],
    surface: "#ECFDF5",
    surfaceTint: "rgba(16,185,129,0.16)",
    badge: "#F59E0B",
    badgeText: "#FFFFFF",
    textAccent: "#059669",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  {
    id: "purple",
    name: "Purple",
    primary: "#8B5CF6",
    primaryDark: "#6D28D9",
    primarySoft: "#EDE9FE",
    gradient: ["#8B5CF6", "#7C3AED", "#6D28D9"],
    surface: "#F5F3FF",
    surfaceTint: "rgba(139,92,246,0.16)",
    badge: "#F59E0B",
    badgeText: "#FFFFFF",
    textAccent: "#7C3AED",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  {
    id: "yellow",
    name: "Yellow",
    primary: "#F59E0B",
    primaryDark: "#D97706",
    primarySoft: "#FEF3C7",
    gradient: ["#F59E0B", "#EA580C", "#D97706"],
    surface: "#FFFBEB",
    surfaceTint: "rgba(245,158,11,0.16)",
    badge: "#1D4ED8",
    badgeText: "#FFFFFF",
    textAccent: "#B45309",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  {
    id: "red",
    name: "Red",
    primary: "#EF4444",
    primaryDark: "#DC2626",
    primarySoft: "#FEE2E2",
    gradient: ["#EF4444", "#DC2626", "#B91C1C"],
    surface: "#FEF2F2",
    surfaceTint: "rgba(239,68,68,0.16)",
    badge: "#3B82F6",
    badgeText: "#FFFFFF",
    textAccent: "#DC2626",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
];

export const DEFAULT_THEME_ID: ThemeId = "blue";

export function getThemeById(themeId?: string | null): AppTheme {
  return THEMES.find((theme) => theme.id === themeId) || THEMES[0];
}
