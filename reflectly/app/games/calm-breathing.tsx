import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
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

type Phase = "Inhale" | "Hold" | "Exhale";

const PHASES: { label: Phase; durationMs: number; scale: number }[] = [
  { label: "Inhale", durationMs: 4000, scale: 1.32 },
  { label: "Hold", durationMs: 2000, scale: 1.32 },
  { label: "Exhale", durationMs: 4500, scale: 0.9 },
];

export default function CalmBreathingScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.9)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(PHASES[0].durationMs / 1000));

  const currentPhase = PHASES[phaseIndex];

  useEffect(() => {
    if (!isRunning) {
      stopTimers();
      return;
    }

    runPhase(phaseIndex);

    return () => {
      stopTimers();
      scale.stopAnimation();
    };
  }, [isRunning, phaseIndex, scale]);

  useEffect(() => {
    return () => stopTimers();
  }, []);

  function stopTimers() {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  }

  function schedule(fn: () => void, delay: number) {
    const timer = setTimeout(fn, delay);
    timers.current.push(timer);
  }

  function runPhase(index: number) {
    stopTimers();

    const phase = PHASES[index];
    setSecondsLeft(Math.ceil(phase.durationMs / 1000));

    Animated.timing(scale, {
      toValue: phase.scale,
      duration: phase.durationMs,
      easing: phase.label === "Hold" ? Easing.linear : Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    for (let elapsed = 1000; elapsed < phase.durationMs; elapsed += 1000) {
      schedule(() => {
        const remaining = Math.max(1, Math.ceil((phase.durationMs - elapsed) / 1000));
        setSecondsLeft(remaining);
      }, elapsed);
    }

    schedule(() => {
      const nextIndex = (index + 1) % PHASES.length;
      if (nextIndex === 0) {
        setCycleCount((prev) => prev + 1);
      }
      setPhaseIndex(nextIndex);
    }, phase.durationMs);
  }

  function handleStartPause() {
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    stopTimers();
    scale.stopAnimation();
    scale.setValue(0.9);
    setIsRunning(false);
    setPhaseIndex(0);
    setCycleCount(0);
    setSecondsLeft(Math.ceil(PHASES[0].durationMs / 1000));
  }

  const encouragement = useMemo(() => {
    if (cycleCount >= 4) return "Your breathing is steady now. Let your shoulders drop.";
    if (cycleCount >= 2) return "Nice rhythm. Stay with the breath and keep it gentle.";
    return "Start slow. One calm breath at a time is enough.";
  }, [cycleCount]);

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
          <Text style={styles.headerTitle}>Calm Breathing</Text>
          <Text style={styles.headerSubtitle}>A quick reset between study sessions</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Current phase</Text>
          <Text style={styles.phaseText}>{currentPhase.label}</Text>
          <Text style={styles.timerText}>{secondsLeft}s</Text>

          <View style={styles.orbit}>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]}>
              <LinearGradient
                colors={["#DDD6FE", "#C4B5FD", "#8B5CF6"]}
                style={styles.innerCircle}
              >
                <Ionicons name="leaf-outline" size={34} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.tipText}>{encouragement}</Text>

          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartPause} activeOpacity={0.85}>
              <Ionicons name={isRunning ? "pause" : "play"} size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{isRunning ? "Pause" : "Start"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset} activeOpacity={0.85}>
              <Ionicons name="refresh" size={18} color="#6D28D9" />
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cycleCount}</Text>
            <Text style={styles.statLabel}>Completed cycles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4-2-4.5</Text>
            <Text style={styles.statLabel}>Breath timing</Text>
          </View>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to use it</Text>
          <Text style={styles.instructionsText}>Inhale as the circle grows, hold gently, then exhale as it shrinks.</Text>
          <Text style={styles.instructionsText}>Try 3 to 5 cycles before going back to your work.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F3FF" },
  header: { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  heroCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22, alignItems: "center", shadowColor: "#6D28D9", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  heroLabel: { fontSize: 12, fontWeight: "700", color: "#8B5CF6", textTransform: "uppercase", letterSpacing: 1 },
  phaseText: { fontSize: 30, fontWeight: "700", color: "#312E81", marginTop: 8 },
  timerText: { fontSize: 16, fontWeight: "600", color: "#7C3AED", marginTop: 4 },
  orbit: { width: 230, height: 230, borderRadius: 115, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center", marginVertical: 24 },
  breathCircle: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center" },
  innerCircle: { width: "100%", height: "100%", borderRadius: 999, alignItems: "center", justifyContent: "center" },
  tipText: { fontSize: 14, lineHeight: 22, color: "#5B587A", textAlign: "center" },
  controlRow: { flexDirection: "row", gap: 12, marginTop: 22 },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#7C3AED", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16, gap: 8, minWidth: 124 },
  primaryButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  secondaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F3FF", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16, gap: 8, minWidth: 124 },
  secondaryButtonText: { fontSize: 15, fontWeight: "700", color: "#6D28D9" },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18 },
  statValue: { fontSize: 22, fontWeight: "700", color: "#312E81" },
  statLabel: { fontSize: 12, color: "#7C7A92", marginTop: 4 },
  instructionsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18, marginTop: 18 },
  instructionsTitle: { fontSize: 16, fontWeight: "700", color: "#312E81", marginBottom: 10 },
  instructionsText: { fontSize: 14, lineHeight: 22, color: "#5B587A", marginBottom: 6 },
});
