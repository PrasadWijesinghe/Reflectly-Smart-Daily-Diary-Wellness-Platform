import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GAME_DURATION = 30;
const TARGET_LIFETIME = 1200;
const STORAGE_KEY = "quick_tap_best";

type Target = {
  id: number;
  x: number;
  y: number;
  scale: Animated.Value;
};

export default function QuickTapScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const targetId = useRef(0);

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
      const spawner = setInterval(() => {
        const newTarget: Target = {
          id: targetId.current++,
          x: Math.random() * (SCREEN_WIDTH - 120),
          y: Math.random() * (SCREEN_HEIGHT - 400) + 150,
          scale: new Animated.Value(0),
        };
        
        Animated.spring(newTarget.scale, { toValue: 1, useNativeDriver: true }).start();
        setTargets((prev) => [...prev, newTarget]);

        setTimeout(() => {
          setTargets((prev) => prev.filter((t) => t.id !== newTarget.id));
        }, TARGET_LIFETIME);
      }, 600);
      
      return () => clearInterval(spawner);
    }
  }, [gameStarted, gameOver]);

  const hitTarget = (target: Target) => {
    if (gameOver || !gameStarted) return;
    setScore((s) => s + 15);
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
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
      <LinearGradient colors={["#EF4444", "#DC2626", "#B91C1C"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Quick Tap</Text>
          <Text style={styles.headerSubtitle}>Tap fast!</Text>
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

      {!gameStarted ? (
        <View style={styles.startScreen}>
          <Ionicons name="flash" size={64} color="#EF4444" />
          <Text style={styles.startTitle}>Quick Tap</Text>
          <Text style={styles.startSubtitle}>Tap targets before they vanish!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          {targets.map((target) => (
            <Animated.View
              key={target.id}
              style={[
                styles.target,
                {
                  left: target.x,
                  top: target.y,
                  transform: [{ scale: target.scale }],
                },
              ]}
            >
              <TouchableOpacity style={styles.targetTouch} onPress={() => hitTarget(target)} activeOpacity={1}>
                <Text style={styles.targetText}>⚡</Text>
              </TouchableOpacity>
            </Animated.View>
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
  container: { flex: 1, backgroundColor: "#FEF2F2" },
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
  gameArea: { flex: 1, position: "relative" },
  target: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  targetTouch: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  targetText: { fontSize: 28 },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginTop: 16, marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#6B7280", marginBottom: 32 },
  startBtn: { backgroundColor: "#EF4444", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  gameOverModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  gameOverTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 16 },
  finalScore: { fontSize: 24, color: "#EF4444", fontWeight: "700" },
  bestScore: { fontSize: 18, color: "#6B7280", marginBottom: 32 },
  replayBtn: { backgroundColor: "#EF4444", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginBottom: 20 },
  replayBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  exitText: { color: "#6B7280", fontSize: 16 },
});