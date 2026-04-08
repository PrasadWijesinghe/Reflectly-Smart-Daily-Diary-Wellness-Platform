import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

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
      setBestScore((prev) => (prev === null || moves < prev ? moves : prev));
    }
  }, [hasWon, moves]);

  function handlePressCard(cardId: string) {
    if (isLocked) return;
    if (flippedIds.includes(cardId)) return;

    const target = deck.find((card) => card.id === cardId);
    if (!target || target.matched) return;
    if (flippedIds.length >= 2) return;

    setFlippedIds((prev) => [...prev, cardId]);
  }

  function resetGame() {
    setDeck(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setIsLocked(false);
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
      <LinearGradient colors={["#2563EB", "#1D4ED8", "#1E3A8A"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Memory Match</Text>
          <Text style={styles.headerSubtitle}>Light focus training with calm study icons</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{moves}</Text>
              <Text style={styles.metricLabel}>Moves</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{matchedCount / 2}</Text>
              <Text style={styles.metricLabel}>Pairs found</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{bestScore ?? "-"}</Text>
              <Text style={styles.metricLabel}>Best</Text>
            </View>
          </View>

          <View style={styles.statusBanner}>
            <Ionicons name={hasWon ? "trophy" : "sparkles-outline"} size={18} color="#1D4ED8" />
            <Text style={styles.statusText}>
              {hasWon ? "Nice work. You cleared the board." : "Flip two cards at a time and match the pairs."}
            </Text>
          </View>
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
                <Text style={[styles.cardEmoji, isFlipped && styles.cardEmojiOpen]}>
                  {isFlipped ? card.emoji : "?"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.resetButtonText}>{hasWon ? "Play Again" : "Shuffle Again"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F8FF" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 4 },
  content: { padding: 20, paddingBottom: 32 },
  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, marginBottom: 18 },
  summaryRow: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, backgroundColor: "#EFF6FF", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  metricValue: { fontSize: 22, fontWeight: "700", color: "#1D4ED8" },
  metricLabel: { fontSize: 12, color: "#64748B", marginTop: 4 },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F8FAFC", borderRadius: 16, padding: 14, marginTop: 14 },
  statusText: { flex: 1, fontSize: 13, lineHeight: 20, color: "#334155" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  card: { width: "31%", aspectRatio: 1, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardClosed: { backgroundColor: "#1D4ED8" },
  cardOpen: { backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#BFDBFE" },
  cardEmoji: { fontSize: 32, fontWeight: "700", color: "#FFFFFF" },
  cardEmojiOpen: { color: "#1E3A8A" },
  resetButton: { marginTop: 20, backgroundColor: "#2563EB", borderRadius: 18, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  resetButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
