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
    subtitle: "Unscramble calming words to give your mind a gentle workout.",
    icon: "text-outline",
    route: "/games/word-scramble",
    iconBg: "#059669",
    cardBg: "#ECFDF5",
    difficulty: "Light Focus",
    duration: "3 min",
    accent: "#059669",
  },
  {
    id: 5,
    title: "Color Match",
    subtitle: "Tap the color that matches the word before time runs out!",
    icon: "color-palette-outline",
    route: "/games/color-match",
    iconBg: "#EC4899",
    cardBg: "#FDF2F8",
    difficulty: "Quick Reflex",
    duration: "2 min",
    accent: "#EC4899",
  },
  {
    id: 6,
    title: "Pattern Memory",
    subtitle: "Watch the sequence, then repeat it. Test your memory!",
    icon: "grid",
    route: "/games/pattern-memory",
    iconBg: "#8B5CF6",
    cardBg: "#F5F3FF",
    difficulty: "Memory",
    duration: "3 min",
    accent: "#8B5CF6",
  },
  {
    id: 7,
    title: "Balloon Pop",
    subtitle: "Pop floating balloons before they escape! Release your stress.",
    icon: "heart",
    route: "/games/balloon-pop",
    iconBg: "#06B6D4",
    cardBg: "#ECFEFF",
    difficulty: "Quick Reflex",
    duration: "1 min",
    accent: "#06B6D4",
  },
  {
    id: 8,
    title: "Tapping Game",
    subtitle: "Tap the targets as fast as possible! Smaller = more points.",
    icon: "hand-left",
    route: "/games/tapping-game",
    iconBg: "#F59E0B",
    cardBg: "#FFFBEB",
    difficulty: "Quick Reflex",
    duration: "1 min",
    accent: "#F59E0B",
  },
  {
    id: 9,
    title: "Math Quick",
    subtitle: "Solve math problems in 60 seconds! Build streaks for bonus points.",
    icon: "calculator",
    route: "/games/math-quick",
    iconBg: "#10B981",
    cardBg: "#ECFDF5",
    difficulty: "Quick Math",
    duration: "1 min",
    accent: "#10B981",
  },
  {
    id: 10,
    title: "Shadow Match",
    subtitle: "Find the matching shape from the options!",
    icon: "disc",
    route: "/games/shadow-match",
    iconBg: "#6366F1",
    cardBg: "#EEF2FF",
    difficulty: "Focus",
    duration: "3 min",
    accent: "#6366F1",
  },
  {
    id: 11,
    title: "Number Tap",
    subtitle: "Tap numbers in order! Wrong tap = game over!",
    icon: "keypad",
    route: "/games/number-tap",
    iconBg: "#0EA5E9",
    cardBg: "#E0F2FE",
    difficulty: "Quick Reflex",
    duration: "1 min",
    accent: "#0EA5E9",
  },
  {
    id: 12,
    title: "Dot Connect",
    subtitle: "Match pairs of dots and draw connections!",
    icon: "git-commit",
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

    router.replace("/games");
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
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconWrap}>
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Game Hub</Text>
              <Text style={styles.summaryLabel}>Choose a quick focus game</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>
            Pick a mini-game to reset your focus and clear your mind. These small exercises are designed for calm, short sessions.
          </Text>
        </LinearGradient>

        <View style={styles.gamesGrid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => router.push(game.route)}
              style={[styles.gameCard, { backgroundColor: game.cardBg }]}
            >
              <View style={[styles.gameIconWrap, { backgroundColor: game.iconBg }]}> 
                <Ionicons name={game.icon} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                <View style={styles.gameMetaRow}>
                  <Text style={styles.gameMeta}>{game.difficulty}</Text>
                  <Text style={styles.gameMeta}>{game.duration}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why play here?</Text>
          {BENEFITS.map((item) => (
            <View key={item.text} style={styles.benefitRow}>
              <Ionicons name={item.icon} size={22} color="#3B82F6" />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F5FF" },
  header: { paddingBottom: 22, paddingTop: 48, paddingHorizontal: 18 },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerBackButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  headerLeft: { flex: 1, marginLeft: 10 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  headerSubtitle: { color: "#E0E7FF", marginTop: 4, fontSize: 14 },
  scrollView: { paddingHorizontal: 18 },
  summaryCard: { borderRadius: 24, padding: 18, marginTop: -10, marginBottom: 16 },
  summaryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  summaryIconWrap: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  summaryTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  summaryLabel: { color: "#DBEAFE", fontSize: 12, marginTop: 2 },
  summaryText: { color: "#E0E7FF", marginTop: 10, lineHeight: 22 },
  gamesGrid: { gap: 14 },
  gameCard: { borderRadius: 20, padding: 18, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  gameIconWrap: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  gameInfo: { flex: 1 },
  gameTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  gameSubtitle: { fontSize: 13, color: "#475569", marginTop: 4 },
  gameMetaRow: { flexDirection: "row", marginTop: 10, gap: 8 },
  gameMeta: { fontSize: 12, color: "#64748B" },
  benefitsSection: { marginTop: 16, paddingBottom: 20 },
  benefitsTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 12 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  benefitText: { color: "#475569", fontSize: 13, flex: 1 },
});
