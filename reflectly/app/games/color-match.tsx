import React, { useEffect, useState, useCallback } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "color-match";

type ColorItem = {
  id: number;
  color: string;
  name: string;
};

const COLORS: ColorItem[] = [
  { id: 1, color: "#EF4444", name: "Red" },
  { id: 2, color: "#3B82F6", name: "Blue" },
  { id: 3, color: "#22C55E", name: "Green" },
  { id: 4, color: "#F59E0B", name: "Orange" },
  { id: 5, color: "#8B5CF6", name: "Purple" },
  { id: 6, color: "#EC4899", name: "Pink" },
  { id: 7, color: "#06B6D4", name: "Cyan" },
  { id: 8, color: "#EAB308", name: "Yellow" },
];

const LEVEL_COLORS = [
  ["#EF4444", "#3B82F6", "#22C55E"],
  ["#F59E0B", "#8B5CF6", "#EC4899"],
  ["#06B6D4", "#EAB308", "#EF4444"],
  ["#3B82F6", "#22C55E", "#F59E0B"],
  ["#8B5CF6", "#EC4899", "#06B6D4"],
];

const TARGET_COLOR_NAMES = ["Red", "Blue", "Green", "Orange", "Purple", "Pink", "Cyan", "Yellow"];

export default function ColorMatchScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [targetColor, setTargetColor] = useState<ColorItem | null>(null);
  const [options, setOptions] = useState<ColorItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const score = await getGameBestScore(GAME_ID);
    setBestScore(score);
  }

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function generateRound() {
    const levelIndex = (level - 1) % LEVEL_COLORS.length;
    const availableColors = COLORS.filter((c) => LEVEL_COLORS[levelIndex].includes(c.color));
    
    const shuffled = shuffleArray(availableColors);
    const target = shuffled[0];
    const wrongOptions = shuffled.slice(1, 4);

    const allOptions = shuffleArray([target, ...wrongOptions]);
    
    setTargetColor(target);
    setOptions(allOptions);
    setTimeLeft(5);
  }

  function startGame() {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setIsPlaying(true);
    generateRound();
  }

  function handleColorSelect(selected: ColorItem) {
    if (feedback || !targetColor) return;

    if (selected.id === targetColor.id) {
      setFeedback("correct");
      const points = 10 + streak * 2;
      const newScore = score + points;
      setScore(newScore);
      setStreak((prev) => prev + 1);
      if (newScore > bestScore) {
        setBestScore(newScore);
        saveGameBestScore(GAME_ID, newScore);
      }
      setTimeout(() => {
        if (level < 20) {
          setLevel((prev) => prev + 1);
        } else {
          setLevel(1);
        }
        generateRound();
        setFeedback(null);
      }, 600);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setTimeout(() => {
        setIsPlaying(false);
        setFeedback(null);
      }, 1000);
    }
  }

  useEffect(() => {
    if (!isPlaying || !targetColor) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFeedback("wrong");
          setStreak(0);
          setTimeout(() => {
            setIsPlaying(false);
            setFeedback(null);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, targetColor]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/games");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#EC4899", "#DB2777", "#BE185D"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Color Match</Text>
          <Text style={styles.headerSubtitle}>Tap the color that matches the word</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Best</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Level</Text>
            <Text style={styles.scoreValue}>{level}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Streak</Text>
            <Text style={styles.scoreValue}>🔥 {streak}</Text>
          </View>
        </View>

        {!isPlaying ? (
          <View style={styles.startScreen}>
            <View style={styles.instructionsCard}>
              <Ionicons name="color-palette-outline" size={40} color="#EC4899" />
              <Text style={styles.instructionsTitle}>How to Play</Text>
              <Text style={styles.instructionsText}>
                Look at the color name shown, then tap the matching color circle. 
                Be quick before time runs out!
              </Text>
              <Text style={styles.instructionsText}>
                Build streaks for bonus points!
              </Text>
            </View>
            <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>TAP THIS COLOR</Text>
              <Text style={styles.targetName}>{targetColor?.name}</Text>
              <View style={styles.timerBar}>
                <View style={[styles.timerFill, { width: `${(timeLeft / 5) * 100}%`, backgroundColor: timeLeft <= 2 ? "#EF4444" : "#EC4899" }]} />
              </View>
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>

            <View style={styles.optionsGrid}>
              {options.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    feedback === "correct" && color.id === targetColor?.id && styles.optionCorrect,
                    feedback === "wrong" && color.id === targetColor?.id && styles.optionWrong,
                  ]}
                  onPress={() => handleColorSelect(color)}
                  disabled={!!feedback}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </>
        )}

        {isPlaying && (
          <TouchableOpacity style={styles.quitButton} onPress={() => setIsPlaying(false)} activeOpacity={0.85}>
            <Text style={styles.quitText}>Quit Game</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF2F8" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { padding: 20, flex: 1 },
  scoreRow: { flexDirection: "row", gap: 10 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#EC4899", marginTop: 4 },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 32, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 22, fontWeight: "700", color: "#BE185D", marginTop: 16, marginBottom: 12 },
  instructionsText: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 24, marginBottom: 8 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EC4899", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32, marginTop: 24, gap: 10 },
  startButtonText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  targetCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 28, alignItems: "center", marginTop: 20 },
  targetLabel: { fontSize: 12, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1 },
  targetName: { fontSize: 40, fontWeight: "800", color: "#1F2937", marginTop: 12 },
  timerBar: { width: "100%", height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, marginTop: 20, overflow: "hidden" },
  timerFill: { height: "100%", borderRadius: 4 },
  timerText: { fontSize: 16, fontWeight: "600", color: "#9CA3AF", marginTop: 8 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 24, justifyContent: "center" },
  colorOption: { width: 80, height: 80, borderRadius: 40, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  optionCorrect: { borderWidth: 4, borderColor: "#22C55E" },
  optionWrong: { borderWidth: 4, borderColor: "#EF4444" },
  quitButton: { backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: "auto" },
  quitText: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
});
