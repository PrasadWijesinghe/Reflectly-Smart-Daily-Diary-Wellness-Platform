import React, { useEffect, useState, useRef } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "math-quick";
const GAME_DURATION = 60;

type Problem = {
  num1: number;
  num2: number;
  operator: "+" | "-" | "*" | "/";
  answer: number;
};

export default function MathQuickScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [problemsSolved, setProblemsSolved] = useState(0);

  useEffect(() => {
    loadBestScore();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isPlaying]);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function generateProblem(): Problem {
    const operators: Array<"+" | "-" | "*" | "/"> = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * 4)];
    
    let num1: number, num2: number, answer: number;
    
    if (operator === "+") {
      num1 = Math.floor(Math.random() * 99) + 1;
      num2 = Math.floor(Math.random() * 99) + 1;
      answer = num1 + num2;
    } else if (operator === "-") {
      num1 = Math.floor(Math.random() * 99) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
    } else if (operator === "*") {
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = num1 * num2;
    } else {
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 9) + 1;
      num1 = num2 * answer;
    }
    
    return { num1, num2, operator, answer };
  }

  function startGame() {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setProblemsSolved(0);
    setUserAnswer("");
    setIsPlaying(true);
    setCurrentProblem(generateProblem());
  }

  function checkAnswer() {
    if (!currentProblem || userAnswer === "") return;
    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - currentProblem.answer) < 0.01;
    if (isCorrect) {
      const newStreak = streak + 1;
      const points = 100 + newStreak * 10;
      setScore(score + points);
      setStreak(newStreak);
      setProblemsSolved(problemsSolved + 1);
    } else {
      setStreak(0);
    }
    setUserAnswer("");
    setCurrentProblem(generateProblem());
  }

  function skipQuestion() {
    if (!isPlaying) return;
    setStreak(0);
    setUserAnswer("");
    setTimeLeft((prev) => Math.max(0, prev - 2));
    setCurrentProblem(generateProblem());
  }

  function endGame() {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (score > bestScore) {
      setBestScore(score);
      saveGameBestScore(GAME_ID, score);
    }
  }

  function handleBack() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/games");
  }

  function handleNumberPress(num: string) {
    if (!isPlaying) return;
    if (userAnswer.length < 5) setUserAnswer(userAnswer + num);
  }

  function handleBackspace() {
    setUserAnswer(userAnswer.slice(0, -1));
  }

  function handleDecimal() {
    if (!userAnswer.includes(".") && userAnswer.length > 0) {
      setUserAnswer(userAnswer + ".");
    }
  }

  function getOperatorSymbol(op: string) {
    if (op === "*") return "×";
    if (op === "/") return "÷";
    return op;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#F59E0B", "#F97316", "#EA580C"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Math Quick</Text>
          <Text style={styles.headerSubtitle}>Solve in 60 seconds!</Text>
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
          <Text style={styles.scoreLabel}>Solved</Text>
          <Text style={styles.scoreValue}>{problemsSolved}</Text>
        </View>
      </View>

      {!isPlaying && problemsSolved === 0 ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 80 }}>🧮</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Solve math problems in 60 seconds!{"\n"}
              + and - use 2 digits. × uses 1 digit.
            </Text>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : !isPlaying && problemsSolved > 0 ? (
        <View style={styles.startScreen}>
          <Text style={{ fontSize: 60 }}>🏆</Text>
          <View style={styles.winCard}>
            <Text style={styles.winTitle}>Time's Up!</Text>
            <Text style={styles.winScore}>{problemsSolved} Solved</Text>
            <Text style={styles.finalScore}>Score: {score}</Text>
            {score >= bestScore && score > 0 && <Text style={styles.newBest}>New Best!</Text>}
          </View>
          <TouchableOpacity style={styles.startButton} onPress={startGame} activeOpacity={0.85}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Time:</Text>
            <Text style={[styles.timerValue, timeLeft <= 10 && styles.timerWarning]}>{timeLeft}s</Text>
          </View>
          
          <Text style={styles.streakText}>🔥 {streak}</Text>

          {currentProblem && (
            <View style={styles.problemCard}>
              <Text style={styles.problemText}>
                {currentProblem.num1} {getOperatorSymbol(currentProblem.operator)} {currentProblem.num2} = ?
              </Text>
            </View>
          )}

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Answer:</Text>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{userAnswer || "0"}</Text>
            </View>
          </View>

          <View style={styles.keypadGrid}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <TouchableOpacity key={n} style={styles.keypadButton} onPress={() => handleNumberPress(n.toString())}>
                <Text style={styles.keypadText}>{n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.keypadButton} onPress={handleDecimal}>
              <Text style={styles.keypadText}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("0")}>
              <Text style={styles.keypadText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadButton} onPress={handleBackspace}>
              <Ionicons name="backspace" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={skipQuestion} activeOpacity={0.85}>
              <Text style={styles.skipButtonText}>Skip (-2s)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={checkAnswer} activeOpacity={0.85}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEF3C7" },
  header: { paddingTop: 54, paddingBottom: 18, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#EA580C", marginTop: 2 },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#B45309", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  winCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", width: "100%", marginBottom: 10 },
  winTitle: { fontSize: 22, fontWeight: "700", color: "#B45309" },
  winScore: { fontSize: 28, fontWeight: "800", color: "#F59E0B" },
  finalScore: { fontSize: 16, fontWeight: "600", color: "#EA580C", marginTop: 4 },
  newBest: { fontSize: 14, fontWeight: "600", color: "#10B981", marginTop: 6 },
  startButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F59E0B", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 10, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 12 },
  timerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 },
  timerLabel: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  timerValue: { fontSize: 28, fontWeight: "800", color: "#F59E0B" },
  timerWarning: { color: "#DC2626" },
  streakText: { fontSize: 16, fontWeight: "700", color: "#EA580C", textAlign: "center", marginBottom: 10 },
  problemCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 12 },
  problemText: { fontSize: 32, fontWeight: "800", color: "#F59E0B" },
  inputSection: { marginBottom: 10 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  answerBox: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, alignItems: "center" },
  answerText: { fontSize: 24, fontWeight: "700", color: "#F59E0B" },
  keypadGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  keypadButton: { width: "31%", aspectRatio: 1, backgroundColor: "#EA580C", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  keypadText: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  buttonRow: { flexDirection: "row", gap: 10 },
  skipButton: { flex: 1, backgroundColor: "#6B7280", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  skipButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  submitButton: { flex: 1, backgroundColor: "#F59E0B", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});