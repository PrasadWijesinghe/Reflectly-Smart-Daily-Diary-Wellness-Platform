import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "shadow-match";

const EMOJIS = [
  "🍎", "🍊", "🍋", "🍇", "🍓", "🍒", "🥝", "🍑", "🥭", "🍍"
];

export default function ShadowMatchScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function startGame() {
    setScore(0);
    setRoundNum(1);
    setStreak(0);
    setGameOver(false);
    setMessage("");
    setIsPlaying(true);
    generateRound();
  }

  function generateRound() {
    const shuffled = [...EMOJIS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    setOptions(selected);
    
    const randomIdx = Math.floor(Math.random() * 4);
    setTarget(selected[randomIdx]);
  }

  function handlePress(emoji: string) {
    if (!isPlaying) return;

    if (emoji === target) {
      const points = 50 + streak * 10;
      setStreak(streak + 1);
      setScore(score + points);
      setMessage("✓");
      
      setTimeout(() => {
        setMessage("");
        setRoundNum(roundNum + 1);
        generateRound();
      }, 300);
    } else {
      endGame();
    }
  }

  function endGame() {
    setIsPlaying(false);
    setGameOver(true);
    if (score > bestScore) {
      setBestScore(score);
      saveGameBestScore(GAME_ID, score);
    }
  }

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/games");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#06B6D4", "#0891B2", "#0E7490"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Shadow Match</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.scoreValue}>{bestScore}</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Round</Text>
          <Text style={styles.scoreValue}>{roundNum}</Text>
        </View>
      </View>

      {!isPlaying ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 70 }}>🎯</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Find the matching emoji!{"\n"}
              Tap the one that matches the target.
            </Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : gameOver ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 70 }}>💔</Text>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverScore}>Score: {score}</Text>
            <Text style={styles.levelReached}>Round: {roundNum}</Text>
            {score >= bestScore && score > 0 && <Text style={styles.newBest}>New Best!</Text>}
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>Find:</Text>
            <View style={styles.targetBox}>
              <Text style={styles.targetShape}>{target}</Text>
            </View>
            {message ? <Text style={styles.correctMsg}>{message}</Text> : null}
          </View>

          <Text style={styles.streakText}>🔥 {streak}</Text>

          <View style={styles.optionsGrid}>
            {options.map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => handlePress(emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CFFAFE" },
  header: { paddingTop: 54, paddingBottom: 18, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#0891B2" },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#0E7490", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  gameOverCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%", marginBottom: 10 },
  gameOverTitle: { fontSize: 22, fontWeight: "700", color: "#0E7490" },
  gameOverScore: { fontSize: 28, fontWeight: "800", color: "#06B6D4" },
  levelReached: { fontSize: 14, fontWeight: "600", color: "#0891B2", marginTop: 4 },
  newBest: { fontSize: 14, fontWeight: "600", color: "#10B981", marginTop: 6 },
  startButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#06B6D4", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16, justifyContent: "center" },
  targetSection: { alignItems: "center", marginBottom: 16 },
  targetLabel: { fontSize: 14, fontWeight: "700", color: "#0E7490", marginBottom: 8 },
  targetBox: { backgroundColor: "#164E63", borderRadius: 16, padding: 20, alignItems: "center" },
  targetShape: { fontSize: 48, color: "#FFFFFF", opacity: 0.6 },
  correctMsg: { fontSize: 32, color: "#10B981", marginTop: 10 },
  streakText: { textAlign: "center", fontSize: 16, fontWeight: "700", color: "#0E7490", marginBottom: 16 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  optionButton: { width: 90, height: 90, backgroundColor: "#FFFFFF", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  optionText: { fontSize: 44 },
});