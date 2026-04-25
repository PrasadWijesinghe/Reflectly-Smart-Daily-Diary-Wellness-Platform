import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OPERATORS = ["+", "-", "*"];
const GAME_DURATION = 60;
const STORAGE_KEY = "math_sprint_best";

type Question = {
  id: number;
  num1: number;
  num2: number;
  operator: string;
  answer: number;
};

function generateQuestion(): Question {
  const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
  let num1 = Math.floor(Math.random() * 20) + 1;
  let num2 = Math.floor(Math.random() * 10) + 1;
  let answer: number;

  if (operator === "+") {
    answer = num1 + num2;
  } else if (operator === "-") {
    if (num2 > num1) [num1, num2] = [num2, num1];
    answer = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    answer = num1 * num2;
  }

  return { id: Date.now(), num1, num2, operator, answer };
}

export default function MathSprintScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

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
    if (timeLeft === 0) {
      if (score > bestScore) {
        setBestScore(score);
        AsyncStorage.setItem(STORAGE_KEY, score.toString());
      }
      setGameOver(true);
    }
  }, [gameStarted, timeLeft, gameOver, score, bestScore]);

  useEffect(() => {
    if (!currentQ && gameStarted && !gameOver) {
      setCurrentQ(generateQuestion());
    }
  }, [currentQ, gameStarted, gameOver]);

  const handleSubmit = () => {
    if (!currentQ || !userAnswer) return;
    
    const numAnswer = parseInt(userAnswer);
    if (numAnswer === currentQ.answer) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      setCurrentQ(generateQuestion());
      setUserAnswer("");
    } else {
      setUserAnswer("");
    }
  };

useEffect(() => {
    return () => {};
  }, [userAnswer, currentQ]);

  const startGame = () => {
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(GAME_DURATION);
    setCurrentQ(generateQuestion());
    setGameStarted(true);
    setGameOver(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/games");
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#6366F1", "#4F46E5", "#3730A3"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Math Sprint</Text>
          <Text style={styles.headerSubtitle}>Solve math problems!</Text>
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
          <Ionicons name="calculator" size={64} color="#6366F1" />
          <Text style={styles.startTitle}>Math Sprint</Text>
          <Text style={styles.startSubtitle}>Solve quick math problems!</Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : currentQ && (
        <View style={styles.gameArea}>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {currentQ.num1} {currentQ.operator} {currentQ.num2} = ?
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="?"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={userAnswer}
            onChangeText={setUserAnswer}
            onSubmitEditing={handleSubmit}
            autoFocus
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={!userAnswer}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverModal}>
          <Text style={styles.gameOverTitle}>Time's Up!</Text>
          <Text style={styles.finalScore}>Score: {score}</Text>
          <Text style={styles.bestScore}>Best: {bestScore}</Text>
          <Text style={styles.correctText}>Correct: {correctCount}</Text>
          <TouchableOpacity style={styles.replayBtn} onPress={startGame}>
            <Text style={styles.replayBtnText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF" },
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
  questionCard: { backgroundColor: "#FFF", padding: 32, borderRadius: 20, marginBottom: 24 },
  questionText: { fontSize: 48, fontWeight: "700", color: "#1F2937" },
  input: { backgroundColor: "#FFF", width: 120, height: 60, borderRadius: 16, textAlign: "center", fontSize: 32, color: "#1F2937", marginBottom: 20 },
  submitBtn: { backgroundColor: "#6366F1", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30 },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginTop: 16, marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#6B7280", marginBottom: 32 },
  startBtn: { backgroundColor: "#6366F1", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 30 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  gameOverModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  gameOverTitle: { fontSize: 32, fontWeight: "800", color: "#1F2937", marginBottom: 16 },
  finalScore: { fontSize: 24, color: "#6366F1", fontWeight: "700" },
  bestScore: { fontSize: 18, color: "#6B7280", marginBottom: 8 },
  correctText: { fontSize: 16, color: "#22C55E", marginBottom: 32 },
  replayBtn: { backgroundColor: "#6366F1", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, marginBottom: 20 },
  replayBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  exitText: { color: "#6B7280", fontSize: 16 },
});