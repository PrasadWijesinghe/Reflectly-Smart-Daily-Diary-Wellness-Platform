import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "number-tap";

export default function NumberTapScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextNumber, setNextNumber] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function generateNumbers(count: number): number[] {
    const nums = [];
    for (let i = 1; i <= count; i++) {
      nums.push(i);
    }
    return nums.sort(() => Math.random() - 0.5);
  }

  function startGame() {
    setScore(0);
    setLevel(1);
    setNextNumber(1);
    setGameOver(false);
    setIsPlaying(true);
    setNumbers(generateNumbers(4));
  }

  function handlePress(num: number) {
    if (!isPlaying) return;

    if (num === nextNumber) {
      const points = 100 * level;
      setScore(score + points);
      setNextNumber(nextNumber + 1);

      if (nextNumber >= numbers.length) {
        setTimeout(() => {
          setLevel(level + 1);
          setNextNumber(1);
          const newCount = Math.min(4 + level * 2, 20);
          setNumbers(generateNumbers(newCount));
        }, 300);
      }
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
      <LinearGradient colors={["#3B82F6", "#2563EB", "#1D4ED8"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Number Tap</Text>
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
          <Text style={styles.scoreLabel}>Level</Text>
          <Text style={styles.scoreValue}>{level}</Text>
        </View>
      </View>

      {!isPlaying ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 70 }}>🔢</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Tap numbers in order from 1!{"\n"}
              Wrong tap = game over.
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
            <Text style={styles.levelReached}>Level: {level}</Text>
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
            <Text style={styles.targetLabel}>Tap:</Text>
            <View style={styles.targetBox}>
              <Text style={styles.targetNumber}>{nextNumber}</Text>
            </View>
            <Text style={styles.progressText}>{nextNumber} / {numbers.length}</Text>
          </View>

          <View style={styles.numbersGrid}>
            {numbers.map((num, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.numberButton}
                onPress={() => handlePress(num)}
                activeOpacity={0.7}
              >
                <Text style={styles.numberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DBEAFE" },
  header: { paddingTop: 54, paddingBottom: 18, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#2563EB" },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#1D4ED8", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  gameOverCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%", marginBottom: 10 },
  gameOverTitle: { fontSize: 22, fontWeight: "700", color: "#1D4ED8" },
  gameOverScore: { fontSize: 28, fontWeight: "800", color: "#3B82F6" },
  levelReached: { fontSize: 14, fontWeight: "600", color: "#2563EB", marginTop: 4 },
  newBest: { fontSize: 14, fontWeight: "600", color: "#10B981", marginTop: 6 },
  startButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#3B82F6", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16, justifyContent: "center" },
  targetSection: { alignItems: "center", marginBottom: 20 },
  targetLabel: { fontSize: 14, fontWeight: "700", color: "#1D4ED8", marginBottom: 8 },
  targetBox: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 3, borderColor: "#3B82F6" },
  targetNumber: { fontSize: 48, fontWeight: "800", color: "#3B82F6" },
  progressText: { fontSize: 14, color: "#6B7280", marginTop: 8 },
  numbersGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  numberButton: { width: 70, height: 70, backgroundColor: "#3B82F6", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numberText: { fontSize: 28, fontWeight: "700", color: "#FFFFFF" },
});