import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const TAGS = [
  { label: "Study", icon: "📖" },
  { label: "Exams", icon: "📝" },
  { label: "Stress", icon: "😰" },
  { label: "Win!", icon: "🏆" },
  { label: "Personal", icon: "💜" },
];

const TAG_COLORS: Record<string, string> = {
  Study: "#3B82F6",
  Exams: "#8B5CF6",
  Stress: "#F59E0B",
  "Win!": "#EF4444",
  Personal: "#EC4899",
};

type PastEntry = {
  id: number;
  date: string;
  emoji: string;
  text: string;
  tags: string[];
};

const PAST_ENTRIES: PastEntry[] = [
  {
    id: 1,
    date: "Jan 15",
    emoji: "📚",
    text: "Today was productive. Finished my assignment and felt really accomplished!",
    tags: ["Study", "Win!"],
  },
  {
    id: 2,
    date: "Jan 14",
    emoji: "😟",
    text: "Feeling a bit overwhelmed with upcoming exams. Need to plan better...",
    tags: ["Stress", "Exams"],
  },
  {
    id: 3,
    date: "Jan 13",
    emoji: "😊",
    text: "Had a great day with friends. Needed this break so much!",
    tags: ["Personal"],
  },
  {
    id: 4,
    date: "Jan 12",
    emoji: "😄",
    text: "Study session went well. Making solid progress on the project.",
    tags: ["Study"],
  },
];

export default function DiaryScreen() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [diaryText, setDiaryText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const today = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayName = dayNames[today.getDay()];
  const monthName = monthNames[today.getMonth()];
  const dayNum = today.getDate();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="pencil" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>My Diary</Text>
              <Text style={styles.headerSubtitle}>
                Express yourself freely ✨
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Daily / Weekly Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "daily" && styles.toggleButtonActive,
            ]}
            onPress={() => setActiveTab("daily")}
          >
            <Ionicons
              name="today"
              size={16}
              color={activeTab === "daily" ? "#FFFFFF" : "#6B7280"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleText,
                activeTab === "daily" && styles.toggleTextActive,
              ]}
            >
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === "weekly" && styles.toggleButtonActive,
            ]}
            onPress={() => setActiveTab("weekly")}
          >
            <Ionicons
              name="calendar"
              size={16}
              color={activeTab === "weekly" ? "#FFFFFF" : "#6B7280"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleText,
                activeTab === "weekly" && styles.toggleTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Date */}
        <View style={styles.dateCard}>
          <View>
            <Text style={styles.dateLabel}>Today</Text>
            <Text style={styles.dateText}>
              {dayName}, {monthName} {dayNum}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Text Entry */}
        <View style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={{ fontSize: 18 }}>✍️</Text>
            <Text style={styles.entryHeaderText}>What's on your mind?</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Write your thoughts here... How was your day? What made you smile? What challenged you?"
            placeholderTextColor="#9CA3AF"
            multiline
            value={diaryText}
            onChangeText={setDiaryText}
            textAlignVertical="top"
          />
          <View style={styles.entryFooter}>
            <Text style={styles.charCount}>
              📝 {diaryText.length} characters
            </Text>
            <Text style={styles.timeStamp}>🕐 {timeString}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagSection}>
          <View style={styles.tagHeader}>
            <Text style={{ fontSize: 14 }}>✨</Text>
            <Text style={styles.tagHeaderText}>Tag your entry</Text>
          </View>
          <View style={styles.tagRow}>
            {TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <TouchableOpacity
                  key={tag.label}
                  style={[
                    styles.tagChip,
                    isSelected && {
                      backgroundColor: TAG_COLORS[tag.label] + "20",
                      borderColor: TAG_COLORS[tag.label],
                    },
                  ]}
                  onPress={() => toggleTag(tag.label)}
                >
                  <Text style={{ fontSize: 13 }}>{tag.icon}</Text>
                  <Text
                    style={[
                      styles.tagChipText,
                      isSelected && { color: TAG_COLORS[tag.label] },
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={["#3B82F6", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButton}
          >
            <Ionicons
              name="save"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Past Entries */}
        <View style={styles.pastHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🕐</Text>
            <Text style={styles.pastTitle}>Past Entries</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {PAST_ENTRIES.map((entry) => (
          <TouchableOpacity key={entry.id} style={styles.pastEntryCard}>
            <View style={styles.pastEntryTop}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>
                  {entry.emoji}
                </Text>
                <Text style={styles.pastEntryDate}>{entry.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </View>
            <Text style={styles.pastEntryText}>{entry.text}</Text>
            <View style={styles.pastEntryTags}>
              {entry.tags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.pastTag,
                    { backgroundColor: TAG_COLORS[tag] || "#3B82F6" },
                  ]}
                >
                  <Text style={styles.pastTagText}>
                    {tag}{" "}
                    {tag === "Win!"
                      ? "🏆"
                      : ""}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
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
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  entryHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
  },
  textInput: {
    minHeight: 120,
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    padding: 0,
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  timeStamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  tagSection: {
    marginTop: 14,
  },
  tagHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 6,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 18,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pastHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  pastTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
  },
  pastEntryCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  pastEntryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pastEntryDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  pastEntryText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    marginBottom: 10,
  },
  pastEntryTags: {
    flexDirection: "row",
    gap: 6,
  },
  pastTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pastTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
