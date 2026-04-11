import React, { useEffect, useState, useRef } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "tapping-game";
const GAME_DURATION = 30;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Target = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export default function TappingGameScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const timerRef = useRef<number | null>(null);
  const gameAreaWidth = SCREEN_WIDTH - 32;
  const gameAreaHeight = 400;

  useEffect(() => {
    loadBestScore();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = setInterval(() => {
      const newTarget: Target = {
        id: Date.now(),
        x: Math.random() * (gameAreaWidth - 60),
        y: Math.random() * (gameAreaHeight - 60),
        size: 60,
      };
      setTargets((prev) => [...prev, newTarget]);
    }, 500);

    return () => clearInterval(spawnInterval);
  }, [isPlaying]);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function startGame() {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setIsPlaying(true);
  }

  function handleTargetPress(id: number) {
    if (!isPlaying) return;

    setScore((prev) => prev + 10);
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }

  function endGame() {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (score > bestScore) {
      setBestScore(score);
      saveGameBestScore(GAME_ID, score);
    }
  }

  function handleBack() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/games");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#FF6B6B", "#EE5A5A", "#DC2828"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Tapping Game</Text>
          <Text style={styles.headerSubtitle}>Tap as many targets as you can!</Text>
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
          <Text style={styles.scoreLabel}>Time</Text>
          <Text style={[styles.scoreValue, timeLeft <= 5 && styles.scoreWarning]}>
            {timeLeft}s
          </Text>
        </View>
      </View>

      {!isPlaying && score === 0 ? (
        <View style={styles.startScreen}>
          <View style={styles.gameIcon}>
            <Text style={{ fontSize: 70 }}>👆</Text>
          </View>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Tap the targets before they disappear!{'\n'}
              You have 30 seconds!{'\n'}
              Tap as many as you can for points!
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startGame} 
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : !isPlaying && score > 0 ? (
        <View style={styles.startScreen}>
          <View style={styles.winIcon}>
            <Text style={{ fontSize: 60 }}>🎊</Text>
          </View>
          <View style={styles.winCard}>
            <Text style={styles.winTitle}>Time's Up!</Text>
            <Text style={styles.winScore}>Final Score: {score}</Text>
            {score >= bestScore && score > 0 && (
              <Text style={styles.newBest}>New Best Score!</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startGame} 
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <TouchableOpacity
            style={[
              styles.gameContainer,
              { width: gameAreaWidth, height: gameAreaHeight },
            ]}
            activeOpacity={1}
            onPress={() => {
              if (isPlaying) {
                setIsPlaying(false);
                setTimeout(() => endGame(), 100);
              }
            }}
          >
            {targets.map((target) => (
              <TouchableOpacity
                key={target.id}
                style={[
                  styles.target,
                  {
                    width: target.size,
                    height: target.size,
                    left: target.x,
                    top: target.y,
                  },
                ]}
                onPress={() => handleTargetPress(target.id)}
                activeOpacity={0.7}
              />
            ))}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE5E5" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#DC2828", marginTop: 4 },
  scoreWarning: { color: "#7F1D1D" },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  gameIcon: { marginBottom: 20 },
  winIcon: { marginBottom: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 28, alignItems: "center" },
  instructionsTitle: { fontSize: 22, fontWeight: "700", color: "#B91C1C", marginBottom: 12 },
  instructionsText: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 26 },
  winCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 28, alignItems: "center", marginBottom: 10 },
  winTitle: { fontSize: 24, fontWeight: "700", color: "#B91C1C", marginBottom: 8 },
  winScore: { fontSize: 32, fontWeight: "800", color: "#FF6B6B" },
  newBest: { fontSize: 16, fontWeight: "600", color: "#10B981", marginTop: 8 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FF6B6B", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32, marginTop: 10, gap: 10 },
  startButtonText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16, justifyContent: "center", alignItems: "center" },
  gameContainer: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  target: { position: "absolute", backgroundColor: "#FF6B6B", borderRadius: 30, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
});
