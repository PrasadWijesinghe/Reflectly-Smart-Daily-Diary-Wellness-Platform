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
import { SafeAreaView } from "react-native-safe-area-context";
import { getGameBestScore, saveGameBestScore } from "../../utils/gameScores";

const GAME_ID = "word-scramble";

const WORDS = [
  "PUZZLE", "DEVELOPER", "BROWSER", "ALGORITHM", "DATABASE",
  "PROGRAM", "VARIABLE", "FUNCTION", "PATTERN", "INTERNET",
  "SERVER", "NETWORK", "SECURITY", "COMPILER", "SYNTAX",
  "CLOUD", "STORAGE", "MOBILE", "FRAMEWORK", "LIBRARY"
];

export default function WordScrambleScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBestScore();
  }, []);

  async function loadBestScore() {
    const savedScore = await getGameBestScore(GAME_ID);
    setBestScore(savedScore);
  }

  function startGame() {
    setScore(0);
    setRoundNum(1);
    setGameOver(false);
    setIsPlaying(true);
    generateWord();
  }

  function generateWord() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setMessage("");

    const letters = word.split("");
    const shuffle = letters.sort(() => Math.random() - 0.5);
    setScrambled(shuffle.join(""));

    setUserSelection([]);
    setSelectedLetters("");
  }

  function handleLetterPress(index: number) {
    if (userSelection.includes(index)) return;

    const newSelection = [...userSelection, index];
    const newLetters = selectedLetters + scrambled[index];

    setUserSelection(newSelection);
    setSelectedLetters(newLetters);

    if (newLetters === currentWord) {
      const points = 100 + (currentWord.length - 4) * 20;
      setScore(score + points);
      setMessage("✓ Correct!");
      setTimeout(() => {
        if (roundNum < 10) {
          setRoundNum(roundNum + 1);
          generateWord();
        } else {
          endGame(true);
        }
      }, 800);
    }
  }

  function handleClear() {
    setUserSelection([]);
    setSelectedLetters("");
    setMessage("");
  }

  function handleRemoveLetter() {
    if (userSelection.length > 0) {
      const newSelection = userSelection.slice(0, -1);
      const newLetters = selectedLetters.slice(0, -1);
      setUserSelection(newSelection);
      setSelectedLetters(newLetters);

      if (newLetters === "") {
        setMessage("");
      }
    }
  }

  function endGame(won: boolean = false) {
    setIsPlaying(false);
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
      <LinearGradient colors={["#10B981", "#059669", "#047857"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Word Scramble</Text>
          <Text style={styles.headerSubtitle}>Unscramble the words!</Text>
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
          <Text style={styles.scoreLabel}>Round</Text>
          <Text style={styles.scoreValue}>{roundNum}/10</Text>
        </View>
      </View>

      {!isPlaying ? (
        <View style={styles.startScreen}>
          <View style={styles.gameIcon}>
            <Text style={{ fontSize: 70 }}>🔤</Text>
          </View>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to Play</Text>
            <Text style={styles.instructionsText}>
              Unscramble the letters to form words!{'\n'}
              Select letters in order to spell the word.{'\n'}
              10 rounds to test your skills!
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
          <View style={styles.winIcon}>
            <Text style={{ fontSize: 70 }}>🎉</Text>
          </View>
          <View style={styles.winCard}>
            <Text style={styles.winTitle}>Game Over!</Text>
            <Text style={styles.winScore}>Final Score: {score}</Text>
            <Text style={styles.roundsCompleted}>Rounds Completed: {roundNum - 1}/10</Text>
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
          <View style={styles.roundInfo}>
            <Text style={styles.roundLabel}>Round {roundNum}/10</Text>
            <Text style={styles.wordLength}>{currentWord.length} letters</Text>
          </View>

          <View style={styles.scrambledSection}>
            <Text style={styles.scrambledLabel}>Unscramble:</Text>
            <View style={styles.scrambledBox}>
              <Text style={styles.scrambledText}>{scrambled}</Text>
            </View>
          </View>

          <View style={styles.answeredSection}>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>
                {selectedLetters || "_ ".repeat(currentWord.length)}
              </Text>
            </View>
            {message && (
              <Text style={[styles.messageText, message.includes("✓") ? styles.correctMessage : styles.wrongMessage]}>
                {message}
              </Text>
            )}
          </View>

          <View style={styles.lettersGrid}>
            {scrambled.split("").map((letter, index) => {
              const isSelected = userSelection.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.letterButton,
                    isSelected && styles.letterSelected,
                  ]}
                  onPress={() => handleLetterPress(index)}
                  disabled={isSelected}
                  activeOpacity={isSelected ? 1 : 0.7}
                >
                  <Text style={[styles.letterText, isSelected && styles.letterSelectedText]}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRemoveLetter}
              activeOpacity={0.8}
            >
              <Ionicons name="backspace" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DCFCE7" },
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  scoreCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10, alignItems: "center" },
  scoreLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", textTransform: "uppercase" },
  scoreValue: { fontSize: 18, fontWeight: "700", color: "#059669", marginTop: 2 },
  startScreen: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  gameIcon: { marginBottom: 16 },
  winIcon: { marginBottom: 16 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center" },
  instructionsTitle: { fontSize: 20, fontWeight: "700", color: "#047857", marginBottom: 10 },
  instructionsText: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  winCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 10 },
  winTitle: { fontSize: 22, fontWeight: "700", color: "#047857", marginBottom: 6 },
  winScore: { fontSize: 28, fontWeight: "800", color: "#10B981" },
  roundsCompleted: { fontSize: 14, fontWeight: "600", color: "#059669", marginTop: 4 },
  newBest: { fontSize: 14, fontWeight: "600", color: "#F59E0B", marginTop: 6 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#10B981", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 10, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  gameArea: { flex: 1, padding: 16 },
  roundInfo: { alignItems: "center", marginBottom: 12 },
  roundLabel: { fontSize: 13, fontWeight: "600", color: "#047857", textTransform: "uppercase" },
  wordLength: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  scrambledSection: { alignItems: "center", marginBottom: 12 },
  scrambledLabel: { fontSize: 12, fontWeight: "600", color: "#047857", marginBottom: 6 },
  scrambledBox: { backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 2, borderColor: "#10B981" },
  scrambledText: { fontSize: 28, fontWeight: "800", color: "#059669", letterSpacing: 6 },
  answeredSection: { marginBottom: 16 },
  answerBox: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 14, alignItems: "center", marginBottom: 8, borderWidth: 2, borderColor: "#10B981" },
  answerText: { fontSize: 24, fontWeight: "700", color: "#059669", letterSpacing: 6 },
  messageText: { textAlign: "center", fontSize: 14, fontWeight: "600" },
  correctMessage: { color: "#10B981" },
  wrongMessage: { color: "#DC2626" },
  lettersGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 16 },
  letterButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  letterSelected: { backgroundColor: "#D1D5DB", opacity: 0.5 },
  letterText: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  letterSelectedText: { color: "#9CA3AF" },
  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  actionButton: { flex: 1, flexDirection: "row", backgroundColor: "#059669", borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", gap: 6 },
  clearButton: { backgroundColor: "#DC2626" },
  actionButtonText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
});
