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
import AsyncStorage from "@react-native-async-storage/async-storage";

type Card = {
  id: string;
  emoji: string;
  matched: boolean;
};

const EMOJIS = ["📚", "☕", "🌙", "🎧", "🌿", "⭐"];

const STORAGE_KEY = "memory_match_best";

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
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const matchedCount = useMemo(() => deck.filter((card) => card.matched).length, [deck]);
  const hasWon = matchedCount === deck.length;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setBestScore(parseInt(stored));
    });
  }, []);

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
      const pts = 100 - (moves * 5);
      setCurrentScore((s) => s + Math.max(10, pts));
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
  }, [deck, flippedIds, moves]);

  useEffect(() => {
    if (hasWon) {
      const finalScore = currentScore || 100;
      if (bestScore === null || finalScore > bestScore) {
        setBestScore(finalScore);
        AsyncStorage.setItem(STORAGE_KEY, finalScore.toString());
      }
    }
  }, [hasWon, currentScore, bestScore]);

  const handlePressCard = (cardId: string) => {
    if (isLocked) return;
    if (flippedIds.includes(cardId)) return;

    const target = deck.find((card) => card.id === cardId);
    if (!target || target.matched) return;
    if (flippedIds.length >= 2) return;

    setFlippedIds((prev) => [...prev, cardId]);
  };

  const resetGame = () => {
    setDeck(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setCurrentScore(0);
    setIsLocked(false);
  };

  const startGame = () => {
    setDeck(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setCurrentScore(0);
    setIsLocked(false);
    setGameStarted(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/games");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#2563EB", "#1D4ED8", "#1E3A8A"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Memory Match</Text>
          <Text style={styles.headerSubtitle}>Find all matching pairs</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{currentScore}</Text>
        </View>
      </LinearGradient>

      <View style={styles.scoreBoard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{currentScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Moves</Text>
          <Text style={styles.scoreValue}>{moves}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.scoreValue}>{bestScore ?? "-"}</Text>
        </View>
      </View>

      {!gameStarted ? (
        <View style={styles.startScreen}>
          <Text style={styles.startTitle}>Memory Match</Text>
          <Text style={styles.startSubtitle}>Find all matching pairs of emojis!</Text>
          {bestScore !== null && bestScore > 0 && (
            <Text style={styles.bestScoreText}>Best Score: {bestScore}</Text>
          )}
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.statusBanner}>
            <Ionicons name={hasWon ? "trophy" : "sparkles-outline"} size={18} color="#1D4ED8" />
            <Text style={styles.statusText}>
              {hasWon ? "Nice work! You won! 🎉" : "Flip two cards to find matching pairs"}
            </Text>
          </View>

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
              <Text style={[styles.cardText, isFlipped ? styles.cardTextOpen : styles.cardTextClosed]}>
                {isFlipped ? card.emoji : "?"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.85}>
        <Ionicons name="refresh" size={18} color="#FFFFFF" />
        <Text style={styles.resetButtonText}>{hasWon ? "Play Again" : "Restart"}</Text>
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
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 4 },
  scoreBox: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  scoreBoard: { flexDirection: "row", justifyContent: "center", gap: 32, paddingVertical: 16 },
  scoreItem: { alignItems: "center" },
  scoreLabel: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  scoreValue: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginHorizontal: 20, marginBottom: 16 },
  statusText: { flex: 1, fontSize: 14, color: "#334155" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20, rowGap: 10 },
  card: { width: "31%", aspectRatio: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardClosed: { backgroundColor: "#1D4ED8" },
  cardOpen: { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#BFDBFE" },
  cardText: { fontSize: 32, fontWeight: "700" },
  cardTextOpen: { color: "#1E3A8A" },
  cardTextClosed: { color: "#FFFFFF" },
  resetButton: { marginHorizontal: 20, marginTop: 20, backgroundColor: "#2563EB", borderRadius: 18, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  resetButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1E3A8A", marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#3B82F6", marginBottom: 12 },
  bestScoreText: { fontSize: 16, fontWeight: "600", color: "#0F172A", marginBottom: 24 },
  startBtn: { backgroundColor: "#2563EB", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 16 },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});