import React from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Game = {
  id: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  cardBg: string;
  difficulty: string;
  duration: string;
};

const GAMES: Game[] = [
  {
    id: 1,
    title: "Pop Bubbles",
    subtitle: "Tap colorful bubbles to relax",
    icon: "color-palette-outline",
    iconBg: "#3B82F6",
    cardBg: "#EFF6FF",
    difficulty: "Easy",
    duration: "2 min",
  },
  {
    id: 2,
    title: "Calm Breathing",
    subtitle: "Follow the circle to breathe",
    icon: "heart-outline",
    iconBg: "#8B5CF6",
    cardBg: "#F5F3FF",
    difficulty: "Relaxing",
    duration: "3 min",
  },
  {
    id: 3,
    title: "Memory Match",
    subtitle: "Find matching pairs",
    icon: "grid-outline",
    iconBg: "#3B82F6",
    cardBg: "#EFF6FF",
    difficulty: "Medium",
    duration: "5 min",
  },
  {
    id: 4,
    title: "Color Tap",
    subtitle: "Tap the right colors fast",
    icon: "finger-print-outline",
    iconBg: "#8B5CF6",
    cardBg: "#F5F3FF",
    difficulty: "Fun",
    duration: "2 min",
  },
];

const BENEFITS = [
  { icon: "happy-outline" as const, text: "Reduces anxiety & stress" },
  { icon: "eye-outline" as const, text: "Improves focus & attention" },
  { icon: "moon-outline" as const, text: "Better sleep quality" },
];

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="game-controller" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Stress Relief Games</Text>
              <Text style={styles.headerSubtitle}>
                Take a break & have fun! 🎮
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Stress Banner */}
        <LinearGradient
          colors={["#3B82F6", "#6366F1", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.bannerIconWrap}>
            <Ionicons
              name="game-controller-outline"
              size={22}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Feeling stressed?</Text>
            <Text style={styles.bannerSubtitle}>
              Playing games can reduce stress by 68%! Pick one below 👇
            </Text>
          </View>
        </LinearGradient>

        {/* Choose Your Game */}
        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 14 }}>🎮</Text>
          <Text style={styles.sectionTitle}>Choose Your Game</Text>
        </View>

        {/* Game Grid */}
        <View style={styles.gameGrid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { backgroundColor: game.cardBg }]}
              activeOpacity={0.8}
            >
              <View
                style={[styles.gameIconWrap, { backgroundColor: game.iconBg }]}
              >
                <Ionicons name={game.icon} size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
              <View style={styles.gameMeta}>
                <Text style={styles.gameMetaText}>{game.difficulty}</Text>
                <Text style={styles.gameMetaDot}>·</Text>
                <Text style={styles.gameMetaText}>{game.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Why Play Section */}
        <View style={styles.whyPlayCard}>
          <View style={styles.whyPlayHeader}>
            <Ionicons name="heart" size={16} color="#8B5CF6" />
            <Text style={styles.whyPlayTitle}>Why Play?</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#F0F5FF",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  bannerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  gameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gameCard: {
    width: "48.5%",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  gameIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  gameSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 10,
  },
  gameMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gameMetaText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  gameMetaDot: {
    fontSize: 11,
    color: "#D1D5DB",
  },
  whyPlayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 22,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  whyPlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  whyPlayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  benefitText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
});
