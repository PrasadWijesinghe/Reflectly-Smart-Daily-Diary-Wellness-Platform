import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "balloon-pop";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Balloon = {
  id: number;
  x: number;
  y: Animated.Value;
  size: number;
  color: string;
  popped: boolean;
  points: number;
  duration: number;
};

const BALLOON_COLORS = [
  "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#06B6D4", "#EAB308"
];

const BALLOON_SIZES = [60, 70, 80, 90];

export default function BalloonPopScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idCounter = useRef(0);
  const animationRefs = useRef<Map<number, Animated.CompositeAnimation>>(new Map());

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const score = await getGameBestScore(GAME_ID);
    setBestScore(score);
  }

  function createBalloon(): Balloon {
    const size = BALLOON_SIZES[Math.floor(Math.random() * BALLOON_SIZES.length)];
    const x = Math.random() * (SCREEN_WIDTH - size - 40) + 20;
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const points = size >= 90 ? 20 : size >= 70 ? 15 : 10;
    const duration = 3000 + Math.random() * 2000;
    
    return {
      id: idCounter.current++,
      x,
      y: new Animated.Value(SCREEN_HEIGHT + size),
      size,
      color,
      popped: false,
      points,
      duration,
    };
  }

  function startGame() {
    setScore(0);
    setTimeLeft(30);
    setPoppedCount(0);
    setBalloons([]);
    setIsPlaying(true);
    
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (isPlaying) {
          spawnBalloon();
        }
      }, i * 400);
    }
  }

  function spawnBalloon() {
    if (!isPlaying) return;
    
    const newBalloon = createBalloon();
    setBalloons((prev) => [...prev, newBalloon]);
    
    const animation = Animated.timing(newBalloon.y, {
      toValue: -newBalloon.size - 20,
      duration: newBalloon.duration,
      useNativeDriver: true,
    });
    
    animationRefs.current.set(newBalloon.id, animation);
    animation.start();
  }

  useEffect(() => {
    if (!isPlaying) return;

    gameLoopRef.current = setInterval(() => {
      spawnBalloon();
    }, 1500);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying && score > 0) {
      if (score > bestScore) {
        setBestScore(score);
        saveGameBestScore(GAME_ID, score);
      }
    }
  }, [isPlaying]);

  function popBalloon(balloon: Balloon) {
    if (balloon.popped || !isPlaying) return;

    const animation = animationRefs.current.get(balloon.id);
    if (animation) {
      animation.stop();
      animationRefs.current.delete(balloon.id);
    }

    setBalloons((prev) =>
      prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
    );

    setScore((prev) => prev + balloon.points);
    setPoppedCount((prev) => prev + 1);

    Animated.timing(balloon.y, {
      toValue: (balloon.y as any)._value - 50,
      duration: 150,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
    }, 200);
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
      <LinearGradient colors={["#06B6D4", "#0891B2", "#0E7490"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Balloon Pop</Text>
          <Text style={styles.headerSubtitle}>Pop balloons to release stress!</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Best</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>
          <View style={styles.timerCard}>
            <Text style={styles.scoreLabel}>Time</Text>
            <Text style={[styles.timerValue, timeLeft <= 10 && styles.timerWarning]}>
              {timeLeft}s
            </Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Popped</Text>
            <Text style={styles.scoreValue}>{poppedCount}</Text>
          </View>
        </View>

        {!isPlaying ? (
          <View style={styles.startScreen}>
            <View style={styles.balloonIcon}>
              <Text style={{ fontSize: 80 }}>🎈</Text>
            </View>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How to Play</Text>
              <Text style={styles.instructionsText}>
                Tap balloons before they float away!{'\n'}
                Different colors = different points!{'\n'}
                Tap only the balloons - miss and you're out!{'\n'}
                You have 30 seconds.
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.startButton, score > 0 && !isPlaying && styles.startButtonActive]} 
              onPress={startGame} 
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                {score > 0 ? "Play Again" : "Start Game"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gameArea}>
            <View style={styles.gameAreaInner}>
              {balloons.map((balloon) => (
                <Animated.View
                  key={balloon.id}
                  style={[
                    styles.balloon,
                    { 
                      backgroundColor: balloon.color, 
                      width: balloon.size, 
                      height: balloon.size * 1.2,
                      borderRadius: balloon.size * 0.6,
                      left: balloon.x,
                      transform: [{ translateY: balloon.y }],
                    },
                    balloon.popped && styles.balloonPopped,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.balloonTouchable}
                    onPress={() => popBalloon(balloon)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.balloonPoints, balloon.size < 70 && { fontSize: 11 }]}>+{balloon.points}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECFEFF" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { padding: 20, flex: 1, paddingBottom: 20 },
  scoreRow: { flexDirection: "row", gap: 10 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#0891B2", marginTop: 4 },
  timerCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center", borderWidth: 2, borderColor: "#06B6D4" },
  timerValue: { fontSize: 20, fontWeight: "700", color: "#0891B2", marginTop: 4 },
  timerWarning: { color: "#EF4444" },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  balloonIcon: { marginBottom: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 28, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 22, fontWeight: "700", color: "#0E7490", marginBottom: 12 },
  instructionsText: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 26 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#06B6D4", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32, marginTop: 10, gap: 10 },
  startButtonActive: { backgroundColor: "#0891B2" },
  startButtonText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 2 },
  gameAreaInner: { flex: 1, position: "relative", overflow: "hidden", borderWidth: 3, borderColor: "#06B6D4", borderRadius: 20, backgroundColor: "#E0F7FA" },
  balloon: { position: "absolute", alignItems: "center", justifyContent: "center" },
  balloonPopped: { opacity: 0 },
  balloonTouchable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  balloonPoints: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
});
