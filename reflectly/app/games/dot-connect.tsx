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

const GAME_ID = "dot-connect";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SIZE = 6;
const DOT_SIZE = 32;

type Dot = {
  id: number;
  row: number;
  col: number;
  color: string;
  connected: boolean;
};

const DOT_COLORS = [
  "#EF4444", "#3B82F6", "#22C55E", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#EAB308",
  "#14B8A6", "#F97316", "#6366F1", "#A855F7"
];

export default function DotConnectScreen() {
  const router = useRouter();
  const [dots, setDots] = useState<Dot[]>([]);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [connections, setConnections] = useState<{from: number; to: number; color: string}[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const containerRef = useRef<View>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const cellSize = containerSize.width / GRID_SIZE;

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function initializeDots() {
    const positions: number[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      positions.push(i);
    }
    
    const shuffled = positions.sort(() => Math.random() - 0.5);
    const numPairs = Math.floor((GRID_SIZE * GRID_SIZE) / 2);
    
    const newDots: Dot[] = [];
    for (let i = 0; i < numPairs; i++) {
      const pos1 = shuffled[i * 2];
      const pos2 = shuffled[i * 2 + 1];
      const color = DOT_COLORS[i % DOT_COLORS.length];
      
      const row1 = Math.floor(pos1 / GRID_SIZE);
      const col1 = pos1 % GRID_SIZE;
      const row2 = Math.floor(pos2 / GRID_SIZE);
      const col2 = pos2 % GRID_SIZE;
      
      newDots.push({ id: pos1, row: row1, col: col1, color: color, connected: false });
      newDots.push({ id: pos2, row: row2, col: col2, color: color, connected: false });
    }
    
    return newDots;
  }

  function startGame() {
    setDots(initializeDots());
    setSelectedDot(null);
    setConnections([]);
    setScore(0);
    setMatchedPairs(0);
    setLevel(1);
    setIsPlaying(true);
  }

  function handleDotPress(dot: Dot) {
    if (!isPlaying || dot.connected) return;

    if (!selectedDot) {
      setSelectedDot(dot);
      return;
    }

    if (selectedDot.id === dot.id) {
      setSelectedDot(null);
      return;
    }

    if (selectedDot.color === dot.color) {
      const newConnections = [...connections, { from: selectedDot.id, to: dot.id, color: selectedDot.color }];
      setConnections(newConnections);
      
      setDots((prev) =>
        prev.map((d) =>
          d.id === selectedDot.id || d.id === dot.id
            ? { ...d, connected: true }
            : d
        )
      );

      const totalPairs = dots.length / 2;
      const newMatched = matchedPairs + 1;
      setMatchedPairs(newMatched);
      
      const currentScore = (newMatched) * 100 * level;
      setScore(currentScore);
      
      if (newMatched === totalPairs) {
        setIsPlaying(false);
        if (currentScore > bestScore) {
          setBestScore(currentScore);
          saveGameBestScore(GAME_ID, currentScore);
        }
      }
      
      setSelectedDot(null);
    } else {
      setSelectedDot(dot);
    }
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/games");
  }

  const getDotStyle = (dot: Dot) => {
    const centerOffset = cellSize / 2 - DOT_SIZE / 2;
    return {
      position: "absolute" as const,
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      left: dot.col * cellSize + centerOffset,
      top: dot.row * cellSize + centerOffset,
    };
  };

  const getLineStyle = (from: Dot, to: Dot, color: string) => {
    const center = cellSize / 2;
    const x1 = from.col * cellSize + center;
    const y1 = from.row * cellSize + center;
    const x2 = to.col * cellSize + center;
    const y2 = to.row * cellSize + center;
    
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    
    return {
      position: "absolute" as const,
      width: length,
      height: 5,
      borderRadius: 3,
      left: x1,
      top: y1 - 2,
      transform: [{ rotate: `${angle}deg` }],
      transformOrigin: "left center",
      backgroundColor: color,
      opacity: 0.7,
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#F472B6", "#EC4899", "#DB2777"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Dot Connect</Text>
          <Text style={styles.headerSubtitle}>Match dots of the same color!</Text>
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
          <Text style={styles.scoreLabel}>Pairs</Text>
          <Text style={styles.scoreValue}>{matchedPairs}/{dots.length / 2}</Text>
        </View>
      </View>

      {!isPlaying && matchedPairs === 0 ? (
        <View style={styles.startScreen}>
          <View style={styles.dotIcon}>
            <Text style={{ fontSize: 70 }}>🔗</Text>
          </View>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Connect dots of the same color!{'\n'}
              Tap two matching dots to connect.{'\n'}
              Match all pairs to win!
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
      ) : !isPlaying && matchedPairs > 0 ? (
        <View style={styles.startScreen}>
          <View style={styles.winIcon}>
            <Text style={{ fontSize: 60 }}>🎊</Text>
          </View>
          <View style={styles.winCard}>
            <Text style={styles.winTitle}>Level Complete!</Text>
            <Text style={styles.winScore}>Score: {score}</Text>
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
          <View 
            ref={containerRef}
            style={styles.gridContainer}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setContainerSize({ width, height });
            }}
          >
            {connections.map((conn, index) => {
              const fromDot = dots.find((d) => d.id === conn.from);
              const toDot = dots.find((d) => d.id === conn.to);
              if (!fromDot || !toDot || cellSize === 0) return null;
              return (
                <View
                  key={`line-${index}`}
                  style={getLineStyle(fromDot, toDot, conn.color)}
                />
              );
            })}

            {dots.map((dot) => {
              const isSelected = selectedDot?.id === dot.id;
              const opacity = dot.connected ? 0.25 : 1;
              if (cellSize === 0) return null;
              
              return (
                <TouchableOpacity
                  key={dot.id}
                  style={[
                    styles.dot,
                    getDotStyle(dot),
                    { backgroundColor: dot.color, opacity },
                    isSelected && styles.dotSelected,
                  ]}
                  onPress={() => handleDotPress(dot)}
                  disabled={dot.connected}
                  activeOpacity={0.8}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF2F8" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#DB2777", marginTop: 4 },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  dotIcon: { marginBottom: 20 },
  winIcon: { marginBottom: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 28, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 22, fontWeight: "700", color: "#BE185D", marginBottom: 12 },
  instructionsText: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 26 },
  winCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 28, alignItems: "center", width: "100%", marginBottom: 10 },
  winTitle: { fontSize: 24, fontWeight: "700", color: "#BE185D", marginBottom: 8 },
  winScore: { fontSize: 36, fontWeight: "800", color: "#EC4899" },
  newBest: { fontSize: 16, fontWeight: "600", color: "#F59E0B", marginTop: 8 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EC4899", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32, marginTop: 24, gap: 10 },
  startButtonText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16 },
  gridContainer: { 
    flex: 1, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 20, 
    elevation: 3, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  dot: { 
    alignItems: "center", 
    justifyContent: "center", 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3,
  },
  dotSelected: { transform: [{ scale: 1.2 }], borderWidth: 3, borderColor: "#FFFFFF" },
});
