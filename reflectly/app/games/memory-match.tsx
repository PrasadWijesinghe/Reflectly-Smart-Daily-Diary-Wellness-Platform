import React, { useEffect, useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "memory-match";

type Card = {
  id: string;
  emoji: string;
  matched: boolean;
};

const EMOJIS = ["📚", "☕", "🌙", "🎧", "🌿", "⭐"];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildDeck(): Card[] {
  return shuffle(
    EMOJIS.flatMap((emoji, index) => [
      { id: `${emoji}-${index}-a`, emoji, matched: false },
      { id: `${emoji}-${index}-b`, emoji, matched: false },
    ])
  );
}

export default function MemoryMatchScreen() {
  const router = useRouter();
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [showStart, setShowStart] = useState(true);

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function startGame() {
    setShowStart(false);
    setDeck(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setIsLocked(false);
    setScore(0);
  }

  const matchedCount = useMemo(() => deck.filter((card) => card.matched).length, [deck]);
  const hasWon = matchedCount === deck.length;

  useEffect(() => {
    if (flippedIds.length !== 2) return;

    const [firstId, secondId] = flippedIds;
    const firstCard = deck.find((card) => card.id === firstId);
    const secondCard = deck.find((card) => card.id === secondId);

    if (!firstCard || !secondCard) {
      setFlippedIds([]);
      return;
    }

    setMoves((prev) => prev + 1);

    if (firstCard.emoji === secondCard.emoji) {
      setDeck((prev) =>
        prev.map((card) =>
          card.id === firstId || card.id === secondId ? { ...card, matched: true } : card
        )
      );
      setFlippedIds([]);
      return;
    }

    setIsLocked(true);
    const timer = setTimeout(() => {
      setFlippedIds([]);
      setIsLocked(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [deck, flippedIds]);

  useEffect(() => {
    if (hasWon) {
      const newScore = Math.max(0, 1000 - moves * 50);
      setScore(newScore);
      const currentBest = bestScore;
      if (newScore > currentBest) {
        setBestScore(newScore);
        saveGameBestScore(GAME_ID, newScore);
      }
    }
  }, [hasWon, moves, bestScore]);

  function resetGame() {
    setDeck(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setIsLocked(false);
    setScore(0);
  }

  function handlePressCard(cardId: string) {
    if (isLocked) return;
    if (flippedIds.includes(cardId)) return;

    const target = deck.find((card) => card.id === cardId);
    if (!target || target.matched) return;
    if (flippedIds.length >= 2) return;

    setFlippedIds((prev) => [...prev, cardId]);
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
      <LinearGradient colors={["#8B5CF6", "#6D28D9", "#4C1D95"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Memory Match</Text>
        </View>
      </LinearGradient>

      {showStart ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 70 }}>🧠</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Flip two cards and find matching pairs!{"\n"}
              Fewer moves = higher score.
            </Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{moves}</Text>
              <Text style={styles.metricLabel}>Moves</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{matchedCount / 2}</Text>
              <Text style={styles.metricLabel}>Pairs</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{score > 0 ? score : bestScore}</Text>
              <Text style={styles.metricLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.statusBanner}>
            <Ionicons name={hasWon ? "trophy" : "sparkles-outline"} size={18} color="#1D4ED8" />
            <Text style={styles.statusText}>
              {hasWon ? "Nice work. You cleared the board." : "Flip two cards at a time and match the pairs."}
            </Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.grid}>
            {deck.map((card) => {
              const isFlipped = card.matched || flippedIds.includes(card.id);

              return (
                <TouchableOpacity
                  key={card.id}
                  style={[styles.card, isFlipped ? styles.cardOpen : styles.cardClosed]}
                  onPress={() => handlePressCard(card.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.cardEmoji, isFlipped && styles.cardEmojiOpen]}>
                    {isFlipped ? card.emoji : "?"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.resetButtonText}>{hasWon ? "Play Again" : "Shuffle Again"}</Text>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F8FF" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, marginBottom: 12 },
  summaryRow: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, backgroundColor: "#EFF6FF", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  metricValue: { fontSize: 20, fontWeight: "700", color: "#1D4ED8" },
  metricLabel: { fontSize: 11, color: "#64748B", marginTop: 2 },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 12, marginTop: 10 },
  statusText: { flex: 1, fontSize: 12, color: "#334155" },
  gridContainer: { flex: 1, justifyContent: "center", paddingVertical: 8, paddingHorizontal: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 10 },
  card: { width: "29%", aspectRatio: 1, borderRadius: 16, backgroundColor: "#1D4ED8", alignItems: "center", justifyContent: "center" },
  cardOpen: { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#BFDBFE" },
  cardEmoji: { fontSize: 36, fontWeight: "700", color: "#FFFFFF" },
  cardEmojiOpen: { color: "#1E3A8A" },
  resetButton: { marginBottom: 16, backgroundColor: "#2563EB", borderRadius: 16, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  resetButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#6D28D9", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  startButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#8B5CF6", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 16, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
