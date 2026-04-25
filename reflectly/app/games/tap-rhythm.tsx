import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GAME_DURATION = 30;
const STORAGE_KEY = "tap_rhythm_best";
const BEATS_COUNT = 5;

export default function TapRhythmScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [beats, setBeats] = useState<Animated.Value[]>([]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const beatAnim = useRef<Animated[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setBestScore(parseInt(stored));
    });
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0) {
      if (score > bestScore) {
        setBestScore(score);
        AsyncStorage.setItem(STORAGE_KEY, score.toString());
      }
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, score, bestScore]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const anims = Array(BEATS_COUNT).fill(0).map(() => new Animated.Value(1));
      beatAnim.current = anims;
      setBeats(anims);
      
      const playSequence = () => {
        let delay = 0;
        anims.forEach((anim, i) => {
          setTimeout(() => {
            setCurrentBeat(i);
            Animated.sequence([
              Animated.timing(anim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
          }, delay);
          delay += 500;
        });
      };
      
      const interval = setInterval(playSequence, 2500);
      playSequence();
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver]);

  const handleTap = () => {
    if (gameOver || !gameStarted) return;
    
    if (currentBeat > 0) {
      setScore((s) => s + 10 + streak * 5);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  };

useEffect(() => {
    return () => {};
  }, [currentBeat, streak, gameStarted, gameOver]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_DURATION);
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
      <LinearGradient colors={["#14B8A6", "#0D9488", "#0F766E"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Tap Rhythm</Text>
          <Text style={styles.headerSubtitle}>Follow the beat!</Text>
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
          <Ionicons name="musical-notes" size={64} color="#14B8A6" />
          <Text style={styles.startTitle}>Tap Rhythm</Text>
          <Text style={styles.startSubtitle}>Follow the beat!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.beatsContainer}>
            {beats.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.beat,
                  {
                    transform: [{ scale: anim }],
                    backgroundColor: i === currentBeat ? "#14B8A6" : "#CCFBF1",
                  },
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity style={styles.tapArea} onPress={handleTap} activeOpacity={0.8}>
            <Ionicons name="musical-note" size={48} color="#14B8A6" />
            <Text style={styles.tapText}>TAP</Text>
          </TouchableOpacity>

          <View style={styles.streakBar}>
            <Text style={styles.streakLabel}>Streak: {streak}</Text>
          </View>
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
  container: { flex: 1, backgroundColor: "#F0FDFA" },
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
  gameArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  beatsContainer: { flexDirection: "row", gap: 16, marginBottom: 40 },
  beat: { width: 50, height: 50, borderRadius: 25 },
  tapArea: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#CCFBF1", alignItems: "center", justifyContent: "center" },
  tapText: { color: "#14B8A6", fontSize: 20, fontWeight: "700", marginTop: 8 },
  streakBar: { marginTop: 30 },
  streakLabel: { color: "#14B8A6", fontSize: 18, fontWeight: "600" },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginTop: 16, marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#6B7280", marginBottom: 32 },
  startBtn: { backgroundColor: "#14B8A6", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  gameOverModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  gameOverTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 16 },
  finalScore: { fontSize: 24, color: "#14B8A6", fontWeight: "700" },
  bestScore: { fontSize: 18, color: "#6B7280", marginBottom: 32 },
  replayBtn: { backgroundColor: "#14B8A6", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginBottom: 20 },
  replayBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  exitText: { color: "#6B7280", fontSize: 16 },
});