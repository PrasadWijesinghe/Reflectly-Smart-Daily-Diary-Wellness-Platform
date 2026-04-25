import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "bubble-breaker";

const COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function BubbleBreakerScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bubbles, setBubbles] = useState<{id: number; color: string}[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const s = await getGameBestScore(GAME_ID);
    setBestScore(s);
  }

  function startGame() {
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    const newBubbles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setBubbles(newBubbles);
  }

  function getNeighbors(id: number): number[] {
    const cols = 6;
    const row = Math.floor(id / cols);
    const col = id % cols;
    const neighbors: number[] = [];
    if (col > 0) neighbors.push(id - 1);
    if (col < cols - 1) neighbors.push(id + 1);
    if (row > 0) neighbors.push(id - cols);
    if (row < 4) neighbors.push(id + cols);
    return neighbors;
  }

  function findConnected(id: number, color: string): number[] {
    const connected = [id];
    const visited = new Set([id]);
    const queue = [id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current);
      for (const n of neighbors) {
        if (!visited.has(n) && bubbles[n] && bubbles[n].color === color) {
          visited.add(n);
          connected.push(n);
          queue.push(n);
        }
      }
    }
    return connected;
  }

  function handlePress(id: number) {
    if (!isPlaying) return;
    const bubble = bubbles[id];
    if (!bubble) return;

    const connected = findConnected(id, bubble.color);
    
    if (connected.length >= 2) {
      const points = connected.length * connected.length * 5;
      setScore(score + points);

      setBubbles(prev => {
        const updated = [...prev];
        connected.forEach(idx => {
          updated[idx] = { ...updated[idx], color: "" };
        });
        
        setTimeout(() => {
          const remaining = updated.filter(b => b.color !== "");
          if (remaining.length === 0) {
            setIsPlaying(false);
            setGameOver(true);
            if (score + points > bestScore) {
              setBestScore(score + points);
              saveGameBestScore(GAME_ID, score + points);
            }
          }
        }, 100);
        
        return updated;
      });
    }
  }

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/games");
  }

  const remaining = bubbles.filter(b => b.color !== "").length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0EA5E9", "#0284C7", "#0369A1"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Bubble Breaker</Text>
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
          <Text style={styles.scoreLabel}>Left</Text>
          <Text style={styles.scoreValue}>{remaining}</Text>
        </View>
      </View>

      {!isPlaying ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 70 }}>🫧</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Tap groups of 2+ same-colored bubbles!{"\n"}
              Bigger group = more points.
            </Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : gameOver ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 60 }}>🎉</Text>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Cleared!</Text>
            <Text style={styles.gameOverScore}>Score: {score}</Text>
            {score >= bestScore && score > 0 && <Text style={styles.newBest}>New Best!</Text>}
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.bubblesGrid}>
            {bubbles.map((bubble, idx) => (
              bubble.color ? (
                <TouchableOpacity
                  key={idx}
                  style={[styles.bubble, { backgroundColor: bubble.color }]}
                  onPress={() => handlePress(idx)}
                  activeOpacity={0.7}
                />
              ) : null
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F2FE" },
  header: { paddingTop: 54, paddingBottom: 18, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#0284C7" },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#0369A1", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  gameOverCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%", marginBottom: 10 },
  gameOverTitle: { fontSize: 22, fontWeight: "700", color: "#0369A1" },
  gameOverScore: { fontSize: 28, fontWeight: "800", color: "#0284C7" },
  newBest: { fontSize: 14, fontWeight: "600", color: "#F59E0B", marginTop: 6 },
  startButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16, justifyContent: "center" },
  bubblesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  bubble: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
});