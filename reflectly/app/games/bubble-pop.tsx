import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_DURATION = 30;
const BUBBLE_LIFETIME = 2500;
const STORAGE_KEY = "bubble_pop_best";

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  scale: Animated.Value;
};

const BUBBLE_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#AA96DA", "#FCBAD3", "#A8D8EA"];

export default function BubblePopScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
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
      const spawner = setInterval(() => {
        const idx = Math.floor(Math.random() * BUBBLE_COLORS.length);
        const newBubble: Bubble = {
          id: Date.now(),
          x: Math.random() * (SCREEN_WIDTH - 100),
          y: Math.random() * 350 + 180,
          size: Math.random() * 40 + 40,
          color: BUBBLE_COLORS[idx],
          scale: new Animated.Value(0),
        };
        
        Animated.spring(newBubble.scale, { toValue: 1, useNativeDriver: true }).start();
        
        setBubbles((prev) => {
          const newBubbles = prev.slice(-8);
          newBubbles.push(newBubble);
          return newBubbles;
        });

        setTimeout(() => {
          setBubbles((prev) => {
            const notThis = prev.filter((b) => b.id !== newBubble.id);
            return notThis;
          });
        }, BUBBLE_LIFETIME);
      }, 700);
      return () => clearInterval(spawner);
    }
  }, [gameStarted, gameOver]);

  const popBubble = (bubble: Bubble) => {
    if (gameOver) return;
    Animated.spring(bubble.scale, { toValue: 1.5, useNativeDriver: true }).start(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
      setScore((s) => s + 10);
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBubbles([]);
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
      <LinearGradient colors={["#EC4899", "#DB2777", "#9D174D"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Bubble Pop</Text>
          <Text style={styles.headerSubtitle}>Pop bubbles!</Text>
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
          <Text style={styles.startTitle}>Bubble Pop</Text>
          <Text style={styles.startSubtitle}>Pop bubbles before they vanish!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          {bubbles.map((bubble) => (
            <Animated.View
              key={bubble.id}
              style={[
                styles.bubble,
                {
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: bubble.size / 2,
                  backgroundColor: bubble.color,
                  left: bubble.x,
                  top: bubble.y,
                  transform: [{ scale: bubble.scale }],
                },
              ]}
            >
              <TouchableOpacity style={styles.bubbleTouch} onPress={() => popBubble(bubble)} activeOpacity={1} />
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
  container: { flex: 1, backgroundColor: "#FDF2F8" },
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
  bubble: { position: "absolute", alignItems: "center", justifyContent: "center" },
  bubbleTouch: { width: "100%", height: "100%", borderRadius: 999 },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#6B7280", marginBottom: 32 },
  startBtn: { backgroundColor: "#EC4899", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  gameOverModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  gameOverTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 16 },
  finalScore: { fontSize: 24, color: "#EC4899", fontWeight: "700" },
  bestScore: { fontSize: 18, color: "#6B7280", marginBottom: 32 },
  replayBtn: { backgroundColor: "#EC4899", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginBottom: 20 },
  replayBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  exitText: { color: "#6B7280", fontSize: 16 },
});