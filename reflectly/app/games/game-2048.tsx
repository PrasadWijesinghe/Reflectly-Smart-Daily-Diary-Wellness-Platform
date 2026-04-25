import React, { useMemo, useState, useEffect } from "react";
import {
  PanResponder,
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

const STORAGE_KEY = "game_2048_best";

type Board = number[][];
type Direction = "up" | "down" | "left" | "right";

const BOARD_SIZE = 4;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function rotateBoard(board: Board): Board {
  return board[0].map((_, columnIndex) => board.map((row) => row[columnIndex]).reverse());
}

function boardsEqual(a: Board, b: Board): boolean {
  return a.every((row, rowIndex) => row.every((cell, columnIndex) => cell === b[rowIndex][columnIndex]));
}

function slideRowLeft(row: number[]): { row: number[]; scoreGain: number } {
  const compact = row.filter((cell) => cell !== 0);
  const merged: number[] = [];
  let scoreGain = 0;

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index];
    const next = compact[index + 1];

    if (current !== 0 && current === next) {
      const combined = current * 2;
      merged.push(combined);
      scoreGain += combined;
      index += 1;
    } else {
      merged.push(current);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }

  return { row: merged, scoreGain };
}

function moveLeft(board: Board): { board: Board; scoreGain: number } {
  let scoreGain = 0;
  const nextBoard = board.map((row) => {
    const result = slideRowLeft(row);
    scoreGain += result.scoreGain;
    return result.row;
  });

  return { board: nextBoard, scoreGain };
}

function transformBoard(board: Board, direction: Direction): Board {
  if (direction === "left") return cloneBoard(board);
  if (direction === "up") return rotateBoard(cloneBoard(board));
  if (direction === "right") return cloneBoard(board).map((row) => [...row].reverse());
  return rotateBoard(cloneBoard(board).map((row) => [...row].reverse()));
}

function restoreBoard(board: Board, direction: Direction): Board {
  if (direction === "left") return board;
  if (direction === "up") return rotateBoard(rotateBoard(rotateBoard(board)));
  if (direction === "right") return board.map((row) => [...row].reverse());
  return rotateBoard(board).map((row) => [...row].reverse());
}

function getEmptyCells(board: Board): Array<{ row: number; col: number }> {
  const emptyCells: Array<{ row: number; col: number }> = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0) {
        emptyCells.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  return emptyCells;
}

function addRandomTile(board: Board): Board {
  const emptyCells = getEmptyCells(board);
  if (!emptyCells.length) return board;

  const nextBoard = cloneBoard(board);
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  nextBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
}

function createInitialBoard(): Board {
  return addRandomTile(addRandomTile(createEmptyBoard()));
}

function canMove(board: Board): boolean {
  if (getEmptyCells(board).length > 0) return true;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = board[row][col];
      if (row < BOARD_SIZE - 1 && board[row + 1][col] === cell) return true;
      if (col < BOARD_SIZE - 1 && board[row][col + 1] === cell) return true;
    }
  }

  return false;
}

function getTileStyle(value: number) {
  const palette: Record<number, { bg: string; color: string }> = {
    0: { bg: "#E2E8F0", color: "#94A3B8" },
    2: { bg: "#DBEAFE", color: "#1E3A8A" },
    4: { bg: "#BFDBFE", color: "#1E3A8A" },
    8: { bg: "#93C5FD", color: "#172554" },
    16: { bg: "#60A5FA", color: "#FFFFFF" },
    32: { bg: "#3B82F6", color: "#FFFFFF" },
    64: { bg: "#2563EB", color: "#FFFFFF" },
    128: { bg: "#1D4ED8", color: "#FFFFFF" },
    256: { bg: "#1E40AF", color: "#FFFFFF" },
    512: { bg: "#1E3A8A", color: "#FFFFFF" },
    1024: { bg: "#172554", color: "#FFFFFF" },
    2048: { bg: "#0F172A", color: "#FFFFFF" },
  };

  return palette[value] || { bg: "#0F172A", color: "#FFFFFF" };
}

export default function Game2048Screen() {
  const router = useRouter();
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
const [wonGame, setWonGame] = useState(false);

  const hasWon = useMemo(() => board.some((row) => row.some((cell) => cell >= 2048)), [board]);
  const gameOver = useMemo(() => !canMove(board), [board]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setBestScore(parseInt(stored));
    });
  }, []);

  useEffect(() => {
    if (gameOver && score > bestScore) {
      setBestScore(score);
      AsyncStorage.setItem(STORAGE_KEY, score.toString());
    }
}, [gameOver, score, bestScore]);

  useEffect(() => {
    return () => {};
  }, [board, score, gameOver, hasWon]);

  function handleMove(direction: Direction) {
    if (gameOver && !hasWon) return;

    const oriented = transformBoard(board, direction);
    const result = moveLeft(oriented);
    const restored = restoreBoard(result.board, direction);

    if (boardsEqual(board, restored)) return;

    const nextBoard = addRandomTile(restored);
    const nextScore = score + result.scoreGain;

    setBoard(nextBoard);
    setScore(nextScore);
  }

  function resetGame() {
    setBoard(createInitialBoard());
    setScore(0);
    setGameStarted(true);
    setWonGame(false);
  }

  function startGame() {
    setBoard(createInitialBoard());
    setScore(0);
    setGameStarted(true);
    setWonGame(false);
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/games");
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 12 || Math.abs(gestureState.dy) > 12,
        onPanResponderRelease: (_, gestureState) => {
          const { dx, dy } = gestureState;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (Math.max(absDx, absDy) < 30) return;

          if (absDx > absDy) {
            handleMove(dx > 0 ? "right" : "left");
            return;
          }

          handleMove(dy > 0 ? "down" : "up");
        },
      }),
    [board, score, bestScore, gameOver]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0F172A", "#1E3A8A", "#2563EB"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>2048 Focus</Text>
          <Text style={styles.headerSubtitle}>Merge tiles!</Text>
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
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.scoreValue}>{bestScore}</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Ionicons
          name={hasWon ? "trophy" : gameOver ? "alert-circle" : "flash-outline"}
          size={18}
          color="#1D4ED8"
        />
        <Text style={styles.statusText}>
          {hasWon
            ? "You reached 2048! 🎉"
            : gameOver
              ? "No more moves. Reset!"
              : "Swipe to move tiles"}
        </Text>
      </View>

      {!gameStarted ? (
        <View style={styles.startScreen}>
          <Text style={styles.startTitle}>2048 Focus</Text>
          <Text style={styles.startSubtitle}>Swipe to merge tiles and reach 2048!</Text>
          {bestScore > 0 && (
            <Text style={styles.bestScoreText}>Best Score: {bestScore}</Text>
          )}
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.board} {...panResponder.panHandlers}>
            {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.boardRow}>
            {row.map((value, columnIndex) => {
              const tile = getTileStyle(value);
              return (
                <View
                  key={`${rowIndex}-${columnIndex}`}
                  style={[styles.tile, { backgroundColor: tile.bg }]}
                >
                  <Text style={[styles.tileText, value >= 128 && styles.tileTextSmall]}>
                    {value || ""}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.85}>
        <Ionicons name="refresh" size={18} color="#1D4ED8" />
        <Text style={styles.resetButtonText}>New Game</Text>
      </TouchableOpacity>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF2FF" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 4 },
  scoreBox: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scoreText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  scoreBoard: { flexDirection: "row", justifyContent: "center", gap: 48, paddingVertical: 16 },
  scoreItem: { alignItems: "center" },
  scoreLabel: { fontSize: 12, color: "#64748B", fontWeight: "700", textTransform: "uppercase" },
  scoreValue: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  statusCard: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, marginHorizontal: 20, marginBottom: 16 },
  statusText: { flex: 1, fontSize: 14, color: "#334155" },
  board: { backgroundColor: "#CBD5E1", borderRadius: 22, padding: 12, marginHorizontal: 20, gap: 10 },
  boardRow: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, aspectRatio: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  tileText: { fontSize: 24, fontWeight: "800" },
  tileTextSmall: { fontSize: 18 },
  resetButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 18, paddingVertical: 16, marginTop: 20, marginHorizontal: 20 },
  resetButtonText: { fontSize: 15, fontWeight: "700", color: "#1D4ED8" },
  startScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  startTitle: { fontSize: 32, fontWeight: "800", color: "#1E3A8A", marginBottom: 8 },
  startSubtitle: { fontSize: 16, color: "#3B82F6", marginBottom: 12 },
  bestScoreText: { fontSize: 16, fontWeight: "600", color: "#0F172A", marginBottom: 24 },
  startBtn: { backgroundColor: "#1D4ED8", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 16 },
  startBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});