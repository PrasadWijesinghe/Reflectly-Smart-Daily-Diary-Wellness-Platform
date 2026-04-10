import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../utils/api";
import DiaryEditor from "../../components/DiaryEditor";
import DiaryCard from "../../components/DiaryCard";
import MonthCalendar from "../../components/MonthCalendar";

type Tag = {
  id: number;
  name: string;
  icon: string;
  color: string;
};

type DiaryEntry = {
  id: number;
  date: string;
  content: string;
  summary: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
};

const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const monthShortNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${monthShortNames[d.getMonth()]} ${d.getDate()}`;
}

export default function DiaryScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const today = toDateString(new Date());

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [editing, setEditing] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [pastEntries, setPastEntries] = useState<DiaryEntry[]>([]);
  const [loadingPast, setLoadingPast] = useState(true);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<
    Record<string, { marked: boolean; dotColor: string }>
  >({});

  useEffect(() => {
    if (token) {
      fetchTags();
      fetchPastEntries();
      fetchEntryDates();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEntryForDate(selectedDate);
    }
  }, [selectedDate, token]);

  const fetchTags = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTags(data.tags);
    } catch (err) {
      console.error("Fetch tags error:", err);
    }
  };

  const fetchEntryDates = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/diary/dates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const marks: Record<string, { marked: boolean; dotColor: string }> = {};
      data.dates.forEach((date: string) => {
        marks[date] = { marked: true, dotColor: "#3B82F6" };
      });
      setMarkedDates(marks);
    } catch (err) {
      console.error("Fetch dates error:", err);
    }
  };

  const fetchEntryForDate = async (dateStr: string) => {
    try {
      setLoadingEntry(true);
      const res = await fetch(`${getApiUrl()}/diary?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCurrentEntry(data.entry);
      setEditing(false);
    } catch (err) {
      console.error("Fetch entry error:", err);
    } finally {
      setLoadingEntry(false);
    }
  };

  const fetchPastEntries = async () => {
    try {
      setLoadingPast(true);
      const res = await fetch(`${getApiUrl()}/diary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPastEntries(data.entries);
    } catch (err) {
      console.error("Fetch past entries error:", err);
    } finally {
      setLoadingPast(false);
    }
  };

  const handleSave = () => {
    fetchEntryForDate(selectedDate);
    fetchPastEntries();
    fetchEntryDates();
  };

  const handleDelete = () => {
    fetchEntryForDate(selectedDate);
    fetchPastEntries();
    fetchEntryDates();
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const dayName = dayNames[selectedDateObj.getDay()];
  const monthName = monthNames[selectedDateObj.getMonth()];
  const dayNum = selectedDateObj.getDate();
  const isToday = selectedDate === today;

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
        {/* Selected Date */}
        <View style={styles.dateCard}>
          <View>
            <Text style={styles.dateLabel}>
              {isToday ? "Today" : formatDate(selectedDate)}
            </Text>
            <Text style={styles.dateText}>
              {dayName}, {monthName} {dayNum}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setCalendarVisible(true)}>
            <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Entry Content */}
        {loadingEntry ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : currentEntry && !editing ? (
          <DiaryCard
            entry={currentEntry}
            token={token}
            onEdit={() => setEditing(true)}
            onDelete={handleDelete}
          />
        ) : (
          <DiaryEditor
            entry={editing ? currentEntry : null}
            date={selectedDate}
            tags={tags}
            token={token}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        )}

        {/* Past Entries */}
        <View style={styles.pastHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🕐</Text>
            <Text style={styles.pastTitle}>Past Entries</Text>
          </View>
            <TouchableOpacity onPress={() => router.push("/viewall-diary")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
        </View>

        {loadingPast ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : pastEntries.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              No entries yet. Write your first diary!
            </Text>
          </View>
        ) : (
          pastEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.pastEntryCard}
              onPress={() => handleDateSelect(toDateString(new Date(entry.date)))}
            >
              <View style={styles.pastEntryTop}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>
                    {entry.tags.length > 0 ? entry.tags[0].icon : "📝"}
                  </Text>
                  <Text style={styles.pastEntryDate}>
                    {formatDate(entry.date)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </View>
              <Text style={styles.pastEntryText}>{entry.summary}</Text>
              <View style={styles.pastEntryTags}>
                {entry.tags.map((tag) => (
                  <View
                    key={tag.id}
                    style={[
                      styles.pastTag,
                      { backgroundColor: tag.color || "#3B82F6" },
                    ]}
                  >
                    <Text style={styles.pastTagText}>
                      {tag.name}{" "}
                      {tag.name === "Win!" ? "🏆" : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <MonthCalendar
        visible={calendarVisible}
        markedDates={markedDates}
        currentDate={selectedDate}
        onSelect={handleDateSelect}
        onClose={() => setCalendarVisible(false)}
      />
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
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
