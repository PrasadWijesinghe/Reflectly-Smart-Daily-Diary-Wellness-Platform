import React, { useEffect, useState } from "react";
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
import { Animated } from "react-native";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "pattern-memory";

type Quadrant = { id: number; color: string };

export default function PatternMemoryScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [animatingQuadrant, setAnimatingQuadrant] = useState<number | null>(null);
  const [canTap, setCanTap] = useState(false);

  const QUADRANTS: Quadrant[] = [
    { id: 1, color: "#EF4444" },
    { id: 2, color: "#3B82F6" },
    { id: 3, color: "#22C55E" },
    { id: 4, color: "#F59E0B" },
  ];

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function startGame() {
    setScore(0);
    setLevel(1);
    setSequence([]);
    setUserSequence([]);
    setGameOver(false);
    setCanTap(false);
    setIsPlaying(true);
    playRound([]);
  }

  async function playRound(currentSequence: number[]) {
    setCanTap(false);
    setUserSequence([]);

    const newSequence = [...currentSequence];
    const nextQuadrant = Math.floor(Math.random() * 4);
    newSequence.push(nextQuadrant);

    setSequence(newSequence);
    setLevel(newSequence.length);

    await new Promise((resolve) => setTimeout(resolve, 500));

    for (let i = 0; i < newSequence.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      flashQuadrant(newSequence[i]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setCanTap(true);
  }

  async function flashQuadrant(quadrantId: number) {
    setAnimatingQuadrant(quadrantId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setAnimatingQuadrant(null);
  }

  function handleQuadrantPress(quadrantId: number) {
    if (!canTap || !isPlaying) return;

    flashQuadrant(quadrantId);

    const newUserSequence = [...userSequence, quadrantId];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      endGame();
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setCanTap(false);
      const newScore = score + 100 * level;
      setScore(newScore);
      setTimeout(() => playRound(sequence), 1000);
    }
  }

  function endGame() {
    setIsPlaying(false);
    setCanTap(false);
    setGameOver(true);

    if (score > bestScore) {
      setBestScore(score);
      saveGameBestScore(GAME_ID, score);
    }
  }

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
      <LinearGradient colors={["#8B5CF6", "#7C3AED", "#6D28D9"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Pattern Memory</Text>
          <Text style={styles.headerSubtitle}>Repeat the pattern!</Text>
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
          <View style={styles.gameIcon}>
            <Text style={{ fontSize: 70 }}>🧠</Text>
          </View>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Watch the pattern of flashing colors{'\n'}
              and repeat it by tapping the quadrants{'\n'}
              in the same order!
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
      ) : gameOver ? (
        <View style={styles.startScreen}>
          <View style={styles.gameOverIcon}>
            <Text style={{ fontSize: 70 }}>💔</Text>
          </View>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.gameOverScore}>Final Score: {score}</Text>
            <Text style={styles.levelReached}>Level Reached: {level}</Text>
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
          <Text style={styles.instructionText}>
            {canTap ? "Your Turn!" : "Watch the Pattern..."}
          </Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              {QUADRANTS.slice(0, 2).map((quadrant) => (
                <TouchableOpacity
                  key={quadrant.id}
                  style={[
                    styles.quadrant,
                    { backgroundColor: quadrant.color },
                    animatingQuadrant === quadrant.id - 1 && styles.quadrantActive,
                  ]}
                  onPress={() => handleQuadrantPress(quadrant.id - 1)}
                  activeOpacity={canTap ? 0.8 : 1}
                  disabled={!canTap}
                />
              ))}
            </View>
            <View style={styles.gridRow}>
              {QUADRANTS.slice(2, 4).map((quadrant) => (
                <TouchableOpacity
                  key={quadrant.id}
                  style={[
                    styles.quadrant,
                    { backgroundColor: quadrant.color },
                    animatingQuadrant === quadrant.id - 1 && styles.quadrantActive,
                  ]}
                  onPress={() => handleQuadrantPress(quadrant.id - 1)}
                  activeOpacity={canTap ? 0.8 : 1}
                  disabled={!canTap}
                />
              ))}
            </View>
          </View>

          <View style={styles.progressBar}>
            <Text style={styles.progressText}>
              {userSequence.length} / {sequence.length}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={startGame} 
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.restartButtonText}>Restart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3E8FF" },
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#7C3AED", marginTop: 2 },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  gameIcon: { marginBottom: 16 },
  gameOverIcon: { marginBottom: 16 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#6D28D9", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  gameOverCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 10 },
  gameOverTitle: { fontSize: 22, fontWeight: "700", color: "#6D28D9", marginBottom: 6 },
  gameOverScore: { fontSize: 28, fontWeight: "800", color: "#8B5CF6" },
  levelReached: { fontSize: 14, fontWeight: "600", color: "#7C3AED", marginTop: 4 },
  newBest: { fontSize: 14, fontWeight: "600", color: "#10B981", marginTop: 6 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#8B5CF6", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 20, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16, justifyContent: "center", alignItems: "center" },
  instructionText: { fontSize: 15, fontWeight: "700", color: "#6D28D9", marginBottom: 16 },
  gridContainer: { gap: 10 },
  gridRow: { flexDirection: "row", gap: 10 },
  quadrant: { width: 110, height: 110, borderRadius: 18 },
  quadrantActive: { opacity: 0.5, transform: [{ scale: 1.05 }] },
  progressBar: { backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", marginTop: 20 },
  progressText: { fontSize: 14, fontWeight: "700", color: "#6D28D9" },
  restartButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#8B5CF6", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16, gap: 6 },
  restartButtonText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
