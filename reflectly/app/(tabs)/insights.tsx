import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getApiUrl } from "../../utils/api";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPTY_MOODS: Record<string, string> = { Mon: "—", Tue: "—", Wed: "—", Thu: "—", Fri: "—", Sat: "—", Sun: "—" };
const EMPTY_STRESS: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

const WEEKS = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
const EMPTY_WEEK_MOODS: Record<string, string> = { "Wk 1": "—", "Wk 2": "—", "Wk 3": "—", "Wk 4": "—" };
const EMPTY_WEEK_STRESS: Record<string, number> = { "Wk 1": 0, "Wk 2": 0, "Wk 3": 0, "Wk 4": 0 };

export default function InsightsScreen() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"7days" | "30days">("7days");
  const [moodData, setMoodData] = useState<Record<string, string>>(EMPTY_MOODS);
  const [stressData, setStressData] = useState<Record<string, number>>(EMPTY_STRESS);
  const [topicsData, setTopicsData] = useState<{ label: string; emoji: string; count: number; color: string; pct: number }[]>([]);
  const [weeklyMoodData, setWeeklyMoodData] = useState<Record<string, string>>(EMPTY_WEEK_MOODS);
  const [weeklyStressData, setWeeklyStressData] = useState<Record<string, number>>(EMPTY_WEEK_STRESS);
  const [weeklyTopicsData, setWeeklyTopicsData] = useState<{ label: string; emoji: string; count: number; color: string; pct: number }[]>([]);

  React.useEffect(() => {
    if (!token) return;

    async function fetchEntries() {
      try {
        const res = await fetch(`${getApiUrl()}/diary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        const nextMoods = { ...EMPTY_MOODS };
        const nextStress = { ...EMPTY_STRESS };
        const topicCounts7: Record<string, number> = {};

        const nextWeekMoods = { ...EMPTY_WEEK_MOODS };
        const nextWeekStress = { ...EMPTY_WEEK_STRESS };
        const topicCounts30: Record<string, number> = {};

        const topicEmoji: Record<string, string> = {};
        const topicColor: Record<string, string> = {};
        
        const weekStressCounts: Record<string, { sum: number; count: number }> = {
            "Wk 1": { sum: 0, count: 0 },
            "Wk 2": { sum: 0, count: 0 },
            "Wk 3": { sum: 0, count: 0 },
            "Wk 4": { sum: 0, count: 0 },
        };
        const weekMoodCounts: Record<string, { good: number, bad: number, neutral: number }> = {
            "Wk 1": { good: 0, bad: 0, neutral: 0 },
            "Wk 2": { good: 0, bad: 0, neutral: 0 },
            "Wk 3": { good: 0, bad: 0, neutral: 0 },
            "Wk 4": { good: 0, bad: 0, neutral: 0 },
        };

        const now = new Date();
        now.setHours(23, 59, 59, 999);

        (data.entries || []).forEach((entry: any) => {
          const entryDate = new Date(entry.date);
          const diffDiff = now.getTime() - entryDate.getTime();
          const diffDays = Math.floor(diffDiff / (1000 * 60 * 60 * 24));
          
          const content = `${entry.content || ""} ${entry.summary || ""}`.toLowerCase();
          
          let moodVal = "—";
          let moodType = "neutral";
          if (content.includes("happy") || content.includes("great") || content.includes("hopeful")) { moodVal = "😄"; moodType = "good"; }
          else if (content.includes("anxious") || content.includes("stress")) { moodVal = "😟"; moodType = "bad"; }
          else if (content.includes("calm")) { moodVal = "😌"; moodType = "good"; }
          else if (content.includes("tired")) { moodVal = "😴"; moodType = "bad"; }
          else if (entry.content) { moodVal = "🙂"; moodType = "neutral"; }

          let stressVal = 0;
          if (content.includes("anxious") || content.includes("stress")) stressVal = 75;
          else if (content.includes("tired")) stressVal = 45;
          else if (entry.content) stressVal = 25;

          if (diffDays < 7) {
            const day = entryDate.toLocaleDateString("en-US", { weekday: "short" });
            if (DAYS.includes(day)) {
                nextMoods[day] = moodVal;
                nextStress[day] = stressVal;
            }
            
            (entry.tags || []).forEach((tag: any) => {
                topicCounts7[tag.name] = (topicCounts7[tag.name] || 0) + 1;
                topicEmoji[tag.name] = tag.icon || "🏷️";
                topicColor[tag.name] = tag.color || "#3B82F6";
            });
          }

          if (diffDays < 28) {
             let weekKey = "";
             if (diffDays < 7) weekKey = "Wk 4";
             else if (diffDays < 14) weekKey = "Wk 3";
             else if (diffDays < 21) weekKey = "Wk 2";
             else if (diffDays < 28) weekKey = "Wk 1";

             if (weekKey) {
                 weekStressCounts[weekKey].sum += stressVal;
                 weekStressCounts[weekKey].count += 1;

                 if (moodType === "good") weekMoodCounts[weekKey].good++;
                 else if (moodType === "bad") weekMoodCounts[weekKey].bad++;
                 else weekMoodCounts[weekKey].neutral++;
             }

            (entry.tags || []).forEach((tag: any) => {
                topicCounts30[tag.name] = (topicCounts30[tag.name] || 0) + 1;
                topicEmoji[tag.name] = tag.icon || "🏷️";
                topicColor[tag.name] = tag.color || "#3B82F6";
            });
          }
        });

        WEEKS.forEach(wk => {
            if (weekStressCounts[wk].count > 0) {
                nextWeekStress[wk] = Math.round(weekStressCounts[wk].sum / weekStressCounts[wk].count);
            }
            
            const mc = weekMoodCounts[wk];
            if (mc.good === 0 && mc.bad === 0 && mc.neutral === 0) {
                nextWeekMoods[wk] = "—";
            } else if (mc.good >= mc.bad && mc.good >= mc.neutral) {
                nextWeekMoods[wk] = "😄";
            } else if (mc.bad >= mc.good && mc.bad >= mc.neutral) {
                nextWeekMoods[wk] = "😟";
            } else {
                nextWeekMoods[wk] = "🙂"; // neutral
            }
        });

        const sortTopics = (counts: Record<string, number>) => {
            const sorted = Object.keys(counts)
                .map((name) => ({
                    label: name,
                    emoji: topicEmoji[name] || "🏷️",
                    count: counts[name],
                    color: topicColor[name] || "#3B82F6",
                    pct: 0,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);
            const maxCount = sorted[0]?.count || 1;
            sorted.forEach(item => { item.pct = Math.round((item.count / maxCount) * 100); });
            return sorted;
        };

        setMoodData(nextMoods);
        setStressData(nextStress);
        setTopicsData(sortTopics(topicCounts7));

        setWeeklyMoodData(nextWeekMoods);
        setWeeklyStressData(nextWeekStress);
        setWeeklyTopicsData(sortTopics(topicCounts30));
      } catch (err) {
        console.error("Fetch insights entries error:", err);
      }
    }

    fetchEntries();
  }, [token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={theme.gradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="bar-chart" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Insights</Text>
              <Text style={styles.headerSubtitle}>Understanding your patterns 📊</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={[styles.toggleContainer, { backgroundColor: theme.primarySoft }]}>
          <TouchableOpacity style={[styles.toggleButton, activeTab === "7days" && { backgroundColor: theme.primary }]} onPress={() => setActiveTab("7days")}>
            <Ionicons name="calendar-outline" size={16} color={activeTab === "7days" ? "#FFFFFF" : "#6B7280"} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, activeTab === "7days" && styles.toggleTextActive]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, activeTab === "30days" && { backgroundColor: theme.primary }]} onPress={() => setActiveTab("30days")}>
            <Ionicons name="calendar" size={16} color={activeTab === "30days" ? "#FFFFFF" : "#6B7280"} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, activeTab === "30days" && styles.toggleTextActive]}>30 Days</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconWrap}>
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.summaryTitle}>Weekly Summary ✨</Text>
              <Text style={styles.summaryLabel}>Built from your real diary entries</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>
            Your week shows a healthy mix of effort, reflection, and recovery. Keep writing consistently and those patterns will become even clearer. 🌟
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 16 }}>😊</Text>
            <Text style={styles.cardTitle}>Mood Trend</Text>
          </View>
          <View style={styles.moodRow}>
            {(activeTab === "7days" ? DAYS : WEEKS).map((key) => (
              <View key={key} style={styles.moodItem}>
                <Text style={styles.moodEmoji}>{activeTab === "7days" ? moodData[key] : weeklyMoodData[key]}</Text>
                <Text style={styles.moodDay}>{key}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 16 }}>😰</Text>
            <Text style={styles.cardTitle}>Stress Levels</Text>
          </View>
          <View style={styles.stressChart}>
            {(activeTab === "7days" ? DAYS : WEEKS).map((key) => {
              const val = (activeTab === "7days" ? stressData[key] : weeklyStressData[key]) || 0;
              const height = (val / 100) * 80;
              const isHigh = val >= 65;
              return (
                <View key={key} style={styles.stressBarWrap}>
                  <View style={styles.stressBarBg}>
                    <View style={[styles.stressBar, { height, backgroundColor: isHigh ? theme.warning : theme.primary }]} />
                  </View>
                  <Text style={styles.stressDay}>{key}</Text>
                </View>
              );
            })}
          </View>
          <View style={[styles.stressTip, { backgroundColor: theme.surface }]}>
            <Text style={[styles.stressTipText, { color: theme.textAccent }]}>
              {activeTab === "7days" 
                ? "Tip: Higher-stress days are a great time for a quick reset \uD83C\uDFAE"
                : "Tip: Notice how your stress fluctuates week over week \uD83D\uDCC5"}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 16 }}>✍️</Text>
            <Text style={styles.cardTitle}>What You Wrote About</Text>
          </View>
          {(activeTab === "7days" ? topicsData : weeklyTopicsData).length === 0 ? (
            <Text style={{ textAlign: "center", color: "#9CA3AF", marginTop: 10 }}>No tagged topics yet.</Text>
          ) : (
            (activeTab === "7days" ? topicsData : weeklyTopicsData).map((topic, index) => (
              <View key={index} style={styles.topicRow}>
                <View style={styles.topicLabel}>
                  <Text style={{ fontSize: 16 }}>{topic.emoji}</Text>
                  <Text style={styles.topicName}>{topic.label}</Text>
                </View>
                <View style={styles.topicBarWrap}>
                  <View style={[styles.topicBar, { width: `${topic.pct}%`, backgroundColor: topic.color }]} />
                </View>
                <Text style={styles.topicCount}>{topic.count}x</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.twoColRow}>
          <View style={[styles.highlightCard, { backgroundColor: "#FFFBEB" }]}>
            <Text style={{ fontSize: 22, marginBottom: 8 }}>🏆</Text>
            <Text style={styles.highlightTitle}>Resilience Master!</Text>
            <Text style={styles.highlightSub}>
              You bounced back! Stress was high on Tue, but improved by Thu.
            </Text>
          </View>
          <View style={[styles.highlightCard, { backgroundColor: "#F0F5FF" }]}>
            <Text style={{ fontSize: 22, marginBottom: 8 }}>🎯</Text>
            <Text style={styles.highlightTitle}>Exam Anxiety Peak</Text>
            <Text style={styles.highlightSub}>
              Stress levels consistently spike 2 days before a deadline.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={{ fontSize: 14 }}>✨</Text>
          <Text style={styles.sectionTitle}>Tips for You</Text>
        </View>
        <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
            <Ionicons name="moon" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Keep Going</Text>
            <Text style={styles.tipSub}>Consistent entries make your mood and topic trends much more useful.</Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={[styles.tipIconWrap, { backgroundColor: theme.primarySoft }]}>
            <Text style={{ fontSize: 18 }}>🍅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Try the Pomodoro Technique</Text>
            <Text style={styles.tipSub}>
              Break your study sessions into 25-minute chunks to maintain focus.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={[styles.tipIconWrap, { backgroundColor: theme.surface }]}>
            <Text style={{ fontSize: 18 }}>🧘</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Box Breathing Reset</Text>
            <Text style={styles.tipSub}>
              Feeling overwhelmed? Breathe in for 4s, hold for 4s, out for 4s.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F0F5FF",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: "#3B82F6",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  summaryCard: {
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
  summaryText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  moodItem: {
    alignItems: "center",
    gap: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodDay: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  stressChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    paddingHorizontal: 4,
  },
  stressBarWrap: {
    alignItems: "center",
    flex: 1,
  },
  stressBarBg: {
    width: 20,
    height: 80,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  stressBar: {
    width: "100%",
    borderRadius: 10,
  },
  stressDay: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 8,
  },
  stressTip: {
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
    alignItems: "center",
  },
  stressTipText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
    textAlign: "center",
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  topicLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 130,
    gap: 8,
  },
  topicName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  topicBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  topicBar: {
    height: "100%",
    borderRadius: 4,
  },
  topicCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    width: 28,
    textAlign: "right",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  highlightSub: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    marginBottom: 12,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  tipSub: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 2,
    lineHeight: 16,
  },

});
