import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

type GameRoute =
  | "/games/calm-breathing"
  | "/games/memory-match"
  | "/games/game-2048"
  | "/games/word-scramble"
  | "/games/color-match"
  | "/games/pattern-memory"
  | "/games/balloon-pop"
  | "/games/tapping-game"
  | "/games/math-quick"
  | "/games/shadow-match"
  | "/games/number-tap"
  | "/games/dot-connect"
  | "/games/bubble-breaker";

type Game = {
  id: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: GameRoute;
  iconBg: string;
  cardBg: string;
  difficulty: string;
  duration: string;
  accent: string;
};

const GAMES: Game[] = [
  {
    id: 1,
    title: "Calm Breathing",
    subtitle: "Follow the breathing circle to reset before the next task.",
    icon: "leaf-outline",
    route: "/games/calm-breathing",
    iconBg: "#8B5CF6",
    cardBg: "#F5F3FF",
    difficulty: "Gentle",
    duration: "3 min",
    accent: "#6D28D9",
  },
  {
    id: 2,
    title: "Memory Match",
    subtitle: "Flip calm study cards and find all the pairs in as few moves as possible.",
    icon: "grid-outline",
    route: "/games/memory-match",
    iconBg: "#2563EB",
    cardBg: "#EFF6FF",
    difficulty: "Light Focus",
    duration: "4 min",
    accent: "#1D4ED8",
  },
  {
    id: 3,
    title: "2048 Focus",
    subtitle: "Merge tiles and channel restless energy into one small puzzle.",
    icon: "apps-outline",
    route: "/games/game-2048",
    iconBg: "#0F172A",
    cardBg: "#E2E8F0",
    difficulty: "Puzzle",
    duration: "5 min",
    accent: "#0F172A",
  },
  {
    id: 4,
    title: "Word Scramble",
    subtitle: "Unscramble letters to form words!",
    icon: "text-outline",
    route: "/games/word-scramble",
    iconBg: "#059669",
    cardBg: "#DCFCE7",
    difficulty: "Easy",
    duration: "10 min",
    accent: "#047857",
  },
  {
    id: 5,
    title: "Color Match",
    subtitle: "Match colors to their names with time pressure!",
    icon: "color-palette-outline",
    route: "/games/color-match",
    iconBg: "#F59E0B",
    cardBg: "#FFF7ED",
    difficulty: "Focus",
    duration: "2 min",
    accent: "#EA580C",
  },
  {
    id: 6,
    title: "Pattern Memory",
    subtitle: "Repeat the pattern of colors!",
    icon: "sparkles-outline",
    route: "/games/pattern-memory",
    iconBg: "#7C3AED",
    cardBg: "#F3E8FF",
    difficulty: "Memory",
    duration: "3 min",
    accent: "#6D28D9",
  },
  {
    id: 7,
    title: "Balloon Pop",
    subtitle: "Tap falling balloons for points!",
    icon: "balloon-outline",
    route: "/games/balloon-pop",
    iconBg: "#EC4899",
    cardBg: "#FCE7F3",
    difficulty: "Quick Reflex",
    duration: "30s",
    accent: "#BE185D",
  },
  {
    id: 8,
    title: "Tapping Game",
    subtitle: "Tap targets before they disappear!",
    icon: "finger-outline",
    route: "/games/tapping-game",
    iconBg: "#DC2828",
    cardBg: "#FFE5E5",
    difficulty: "Reflex",
    duration: "30s",
    accent: "#991B1B",
  },
  {
    id: 9,
    title: "Math Quick",
    subtitle: "Solve math problems in 60 seconds!",
    icon: "calculator-outline",
    route: "/games/math-quick",
    iconBg: "#F59E0B",
    cardBg: "#FEF3C7",
    difficulty: "Medium",
    duration: "1 min",
    accent: "#EA580C",
  },
  {
    id: 10,
    title: "Shadow Match",
    subtitle: "Find the matching shape from the options!",
    icon: "disc-outline",
    route: "/games/shadow-match",
    iconBg: "#0891B2",
    cardBg: "#CFFAFE",
    difficulty: "Focus",
    duration: "3 min",
    accent: "#0E7490",
  },
  {
    id: 11,
    title: "Number Tap",
    subtitle: "Tap numbers in order! Wrong tap = game over!",
    icon: "keypad-outline",
    route: "/games/number-tap",
    iconBg: "#2563EB",
    cardBg: "#DBEAFE",
    difficulty: "Quick Reflex",
    duration: "1 min",
    accent: "#1D4ED8",
  },
  {
    id: 12,
    title: "Dot Connect",
    subtitle: "Match pairs of dots and draw connections!",
    icon: "git-commit-outline",
    route: "/games/dot-connect",
    iconBg: "#EC4899",
    cardBg: "#FDF2F8",
    difficulty: "Memory",
    duration: "3 min",
    accent: "#EC4899",
  },
];

const BENEFITS = [
  { icon: "happy-outline" as const, text: "Breaks mental overload without leaving the app" },
  { icon: "eye-outline" as const, text: "Gives students one small thing to focus on" },
  { icon: "moon-outline" as const, text: "Works well for short resets between study blocks" },
];

export default function GamesScreen() {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#3B82F6", "#2563EB", "#1D4ED8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="game-controller" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Stress Relief Games</Text>
              <Text style={styles.headerSubtitle}>Take a short break that still feels useful</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={["#3B82F6", "#6366F1", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.bannerIconWrap}>
            <Ionicons name="game-controller-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Feeling stressed?</Text>
            <Text style={styles.bannerSubtitle}>Pick a calm reset: breathe, match, or solve one focused puzzle.</Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionBadge}>Play</Text>
          <Text style={styles.sectionTitle}>Choose Your Reset</Text>
        </View>

        <View style={styles.gameGrid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { backgroundColor: game.cardBg }]}
              activeOpacity={0.85}
              onPress={() => router.push(game.route)}
            >
              <View style={[styles.gameIconWrap, { backgroundColor: game.iconBg }]}>
                <Ionicons name={game.icon} size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
              <View style={styles.gameMeta}>
                <Text style={styles.gameMetaText}>{game.difficulty}</Text>
                <Text style={styles.gameMetaDot}>•</Text>
                <Text style={styles.gameMetaText}>{game.duration}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.launchText, { color: game.accent }]}>Open game</Text>
                <Ionicons name="arrow-forward" size={16} color={game.accent} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.whyPlayCard}>
          <View style={styles.whyPlayHeader}>
            <Ionicons name="heart" size={16} color="#8B5CF6" />
            <Text style={styles.whyPlayTitle}>Why this works</Text>
          </View>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Ionicons name={benefit.icon} size={18} color="#3B82F6" />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F5FF" },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerBackButton: { marginRight: 12, padding: 4 },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  banner: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, marginTop: 16 },
  bannerIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  bannerTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  bannerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 18 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: 22, marginBottom: 14, gap: 8 },
  sectionBadge: { fontSize: 12, fontWeight: "700", color: "#2563EB", backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  gameGrid: { gap: 12 },
  gameCard: { borderRadius: 16, padding: 16, minHeight: 150, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  gameIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  gameTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  gameSubtitle: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 10 },
  gameMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  gameMetaText: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  gameMetaDot: { fontSize: 11, color: "#94A3B8" },
  cardFooter: { marginTop: "auto", paddingTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  launchText: { fontSize: 12, fontWeight: "700" },
  whyPlayCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, marginTop: 22, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  whyPlayHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  whyPlayTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  benefitText: { fontSize: 14, color: "#3B82F6", fontWeight: "500", flex: 1 },
});
