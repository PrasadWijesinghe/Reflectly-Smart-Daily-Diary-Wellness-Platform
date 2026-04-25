import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#A855F7", "#EC4899"];
const GAME_DURATION = 30;
const TARGET_DURATION = 2000;
const STORAGE_KEY = "color_tap_best";

type Target = {
  id: number;
  color: string;
  x: number;
  y: number;
  isTarget: boolean;
};

export default function ColorTapScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setBestScore(parseInt(stored));
    });
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && gameStarted) {
      if (score > bestScore) {
        setBestScore(score);
        AsyncStorage.setItem(STORAGE_KEY, score.toString());
      }
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, gameOver, score, bestScore]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
const spawnTarget = () => {
        if (gameOver) return;
        
        const newTargets: Target[] = [];
        const targetIdx = Math.floor(Math.random() * 5);
        const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        for (let i = 0; i < 5; i++) {
          newTargets.push({
            id: Date.now() + i,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            x: Math.random() * (SCREEN_WIDTH - 200) + 20,
            y: Math.random() * 350 + 180,
            isTarget: i === targetIdx,
          });
        }
        
        setTargets(newTargets);
        setTargetColor(targetColor);

        setTimeout(() => {
          if (!gameOver) {
            setTargets([]);
          }
        }, TARGET_DURATION);
      };

      spawnTarget();
      const interval = setInterval(spawnTarget, TARGET_DURATION + 100);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver]);

  const handleTap = (target: Target) => {
    if (gameOver || !gameStarted) return;
    
    if (target.isTarget) {
      setScore((s) => s + 10);
      setTargets([]);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setGameStarted(true);
    setGameOver(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/games");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#F59E0B", "#D97706", "#B45309"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Color Tap</Text>
          <Text style={styles.headerSubtitle}>Match colors!</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      <View style={styles.scoreBoard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Time</Text>
          <Text style={styles.scoreValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.scoreValue}>{bestScore}</Text>
        </View>
      </View>

      <View style={styles.targetBar}>
        <Text style={styles.targetLabel}>Tap:</Text>
        <View style={[styles.targetColor, { backgroundColor: targetColor }]} />
      </View>

      {!gameStarted ? (
        <View style={styles.startScreen}>
          <Text style={styles.startTitle}>Color Tap</Text>
          <Text style={styles.startSubtitle}>Tap the matching color!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          {targets.map((target) => (
            <TouchableOpacity
              key={target.id}
              style={[
                styles.target,
                { backgroundColor: target.color, left: target.x, top: target.y },
              ]}
              onPress={() => handleTap(target)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverModal}>
          <Text style={styles.gameOverTitle}>Time's Up!</Text>
          <Text style={styles.finalScore}>Score: {score}</Text>
          <Text style={styles.bestScore}>Best: {bestScore}</Text>
          <TouchableOpacity style={styles.replayBtn} onPress={startGame}>
            <Text style={styles.replayBtnText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBEB" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 4 },
  scoreBox: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  scoreBoard: { flexDirection: "row", justifyContent: "center", gap: 32, paddingVertical: 16 },
  scoreItem: { alignItems: "center" },
  scoreLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  scoreValue: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  targetBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginVertical: 16 },
  targetLabel: { color: "#1F2937", fontSize: 18, fontWeight: "600" },
  targetColor: { width: 40, height: 40, borderRadius: 20 },
  gameArea: { flex: 1, position: "relative" },
  target: { position: "absolute", width: 60, height: 60, borderRadius: 30 },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#6B7280", marginBottom: 32 },
  startBtn: { backgroundColor: "#F59E0B", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  gameOverModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  gameOverTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 16 },
  finalScore: { fontSize: 24, color: "#F59E0B", fontWeight: "700" },
  bestScore: { fontSize: 18, color: "#6B7280", marginBottom: 32 },
  replayBtn: { backgroundColor: "#F59E0B", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginBottom: 20 },
  replayBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  exitText: { color: "#6B7280", fontSize: 16 },
});