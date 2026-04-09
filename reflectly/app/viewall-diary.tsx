import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/api";
import MonthPicker from "../components/MonthPicker";
import ConfirmModal from "../components/ConfirmModal";

type Tag = {
  id: number;
  name: string;
  icon: string;
  color: string;
  count?: number;
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

type WeekData = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  dayCount: number;
  shortSummary: string;
  fullSummary: string;
  topTags: Tag[];
  mood: string;
  entryCount: number;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const monthShort = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getAccentColor(tags: Tag[]): string {
  if (tags.length > 0) return tags[0].color;
  return "#3B82F6";
}

export default function ViewAllDiaryScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [allEntries, setAllEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [updateTargetId, setUpdateTargetId] = useState<number | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editTagIds, setEditTagIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${getApiUrl()}/diary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAllEntries(data.entries);
    } catch (err) {
      console.error("Fetch entries error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTags = useCallback(async () => {
    if (!token) return;
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
  }, [token]);

  useEffect(() => {
    fetchEntries();
    fetchTags();
  }, [fetchEntries, fetchTags]);

  useEffect(() => {
    const filtered = allEntries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredEntries(filtered);
    setExpandedId(null);
    setEditingId(null);
  }, [allEntries, selectedMonth, selectedYear]);

  useEffect(() => {
    if (activeTab === "weekly" && token) {
      fetchWeeklyEntries();
    }
  }, [activeTab, selectedMonth, selectedYear, token]);

  const fetchWeeklyEntries = async () => {
    if (!token) return;
    try {
      setLoadingWeekly(true);
      const res = await fetch(
        `${getApiUrl()}/diary/weekly?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setWeeklyData(data.weeks || []);
    } catch (err) {
      console.error("Fetch weekly error:", err);
    } finally {
      setLoadingWeekly(false);
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null || !token) return;
    try {
      const res = await fetch(`${getApiUrl()}/diary/${deleteTargetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setExpandedId(null);
      setDeleteTargetId(null);
      fetchEntries();
    } catch (err: any) {
      console.error("Delete error:", err);
      setDeleteTargetId(null);
    }
  };

  const startEditing = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditText(entry.content);
    setEditTagIds(entry.tags.map((t) => t.id));
  };

  const handleInlineSave = (entryId: number) => {
    if (!editText.trim()) return;
    setUpdateTargetId(entryId);
  };

  const confirmUpdate = async () => {
    if (updateTargetId === null || !token) return;
    try {
      setSaving(true);
      const res = await fetch(`${getApiUrl()}/diary/${updateTargetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editText,
          tagIds: editTagIds,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setUpdateTargetId(null);
      setEditingId(null);
      fetchEntries();
    } catch (err: any) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineCancel = () => {
    setEditingId(null);
    setEditText("");
    setEditTagIds([]);
  };

  const toggleEditTag = (tagId: number) => {
    setEditTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const entryCount = filteredEntries.length;
  const weekCount = weeklyData.length;

  // Unique tag usage this month
  const tagUsage: Record<string, number> = {};
  if (activeTab === "daily") {
    filteredEntries.forEach((e) =>
      e.tags.forEach((t) => {
        tagUsage[t.name] = (tagUsage[t.name] || 0) + 1;
      })
    );
  } else {
    weeklyData.forEach((w) =>
      w.topTags.forEach((t) => {
        tagUsage[t.name] = (tagUsage[t.name] || 0) + (t.count || 0);
      })
    );
  }
  const topTag = Object.entries(tagUsage).sort((a, b) => b[1] - a[1])[0];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Diary</Text>
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={styles.calendarBtn}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats strip in header */}
        {(activeTab === "daily" ? entryCount > 0 : weeklyData.length > 0) && (
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name={activeTab === "daily" ? "book" : "calendar"} size={12} color="#FFFFFF" />
              <Text style={styles.statText}>
                {activeTab === "daily" 
                  ? `${entryCount} ${entryCount === 1 ? "entry" : "entries"}`
                  : `${weekCount} ${weekCount === 1 ? "week" : "weeks"}`
                }
              </Text>
            </View>
            {topTag && (
              <View style={styles.statPill}>
                <Text style={styles.statText}>Mostly: {topTag[0]}</Text>
              </View>
            )}
            <View style={styles.statPill}>
              <Ionicons name="pricetag" size={12} color="#FFFFFF" />
              <Text style={styles.statText}>
                {Object.keys(tagUsage).length} tags
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Text style={styles.monthLabel}>
            {monthNames[selectedMonth]} {selectedYear}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

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

      {/* Content */}
      {activeTab === "daily" ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={["#EFF6FF", "#DBEAFE"]}
              style={styles.emptyIconBg}
            >
              <Ionicons name="book-outline" size={44} color="#93C5FD" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySub}>
              Your diary entries for {monthNames[selectedMonth]} {selectedYear}{"\n"}
              will appear here once you start writing.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredEntries.map((entry) => {
              const d = new Date(entry.date);
            const accent = getAccentColor(entry.tags);
            const isExpanded = expandedId === entry.id;
            const isEditing = editingId === entry.id;

            return (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={isExpanded ? 1 : 0.85}
                onPress={() => {
                  if (!isExpanded && !editingId) setExpandedId(entry.id);
                }}
                style={styles.cardWrapper}
              >
                {/* Accent strip */}
                <View
                  style={[styles.accentStrip, { backgroundColor: accent }]}
                />

                <View style={styles.cardBody}>
                  {isExpanded ? (
                    /* ──── Expanded or Editing ──── */
                    <View>
                      {/* Top row */}
                      <View style={styles.expandedTopRow}>
                        <View style={styles.expandedDateBlock}>
                          <Text style={[styles.expandedDayLabel, { color: accent }]}>
                            {dayShort[d.getDay()].toUpperCase()}
                          </Text>
                          <Text style={styles.expandedDateFull}>
                            {monthShort[d.getMonth()]} {d.getDate()}, {d.getFullYear()}
                          </Text>
                        </View>
                        <View style={styles.expandedActions}>
                          {isEditing ? (
                            <>
                              <TouchableOpacity
                                onPress={() => handleInlineSave(entry.id)}
                                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                                disabled={saving}
                              >
                                {saving ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <>
                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                    <Text style={styles.saveBtnText}>Save</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={handleInlineCancel}
                                style={styles.cancelEditBtn}
                              >
                                <Ionicons name="close" size={16} color="#6B7280" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                onPress={() => startEditing(entry)}
                                style={[styles.actionBtn, { backgroundColor: "#EFF6FF" }]}
                              >
                                <Ionicons name="pencil" size={17} color="#3B82F6" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => setDeleteTargetId(entry.id)}
                                style={[styles.actionBtn, { backgroundColor: "#FEF2F2" }]}
                              >
                                <Ionicons name="trash-outline" size={17} color="#EF4444" />
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>

                      {isEditing ? (
                        /* ── Inline Editor ── */
                        <View>
                          <Text style={styles.editSummaryLabel}>{entry.summary}</Text>
                          <TextInput
                            style={styles.editTextInput}
                            value={editText}
                            onChangeText={setEditText}
                            multiline
                            textAlignVertical="top"
                            placeholder="Write your thoughts..."
                            placeholderTextColor="#9CA3AF"
                            autoFocus
                          />
                          <Text style={styles.editCharCount}>
                            {editText.length} characters
                          </Text>

                          {/* Tags */}
                          <Text style={styles.editTagHeader}>Tag your entry</Text>
                          <View style={styles.editTagRow}>
                            {tags.map((tag) => {
                              const isSelected = editTagIds.includes(tag.id);
                              return (
                                <TouchableOpacity
                                  key={tag.id}
                                  style={[
                                    styles.editTagChip,
                                    isSelected && {
                                      backgroundColor: tag.color + "20",
                                      borderColor: tag.color,
                                    },
                                  ]}
                                  onPress={() => toggleEditTag(tag.id)}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.editTagIcon}>{tag.icon}</Text>
                                  <Text
                                    style={[
                                      styles.editTagText,
                                      isSelected && { color: tag.color },
                                    ]}
                                  >
                                    {tag.name}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      ) : (
                        /* ── View Content ── */
                        <View>
                          <Text style={styles.expandedSummary}>{entry.summary}</Text>
                          <Text style={styles.expandedContent}>{entry.content}</Text>

                          {entry.tags.length > 0 && (
                            <View style={styles.tagsRow}>
                              {entry.tags.map((tag) => (
                                <View
                                  key={tag.id}
                                  style={[styles.tag, { backgroundColor: tag.color }]}
                                >
                                  <Text style={styles.tagText}>
                                    {tag.icon} {tag.name}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}

                      {/* Collapse / Back to list */}
                      <TouchableOpacity
                        onPress={() => {
                          if (isEditing) handleInlineCancel();
                          setExpandedId(null);
                        }}
                        style={styles.collapseBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="chevron-up" size={15} color="#6B7280" />
                        <Text style={styles.collapseText}>Back to list</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* ──── Collapsed ──── */
                    <View style={styles.collapsedLayout}>
                      <View style={styles.collapsedTextBlock}>
                        <Text style={styles.collapsedSummary} numberOfLines={1}>
                          {entry.summary}
                        </Text>
                        <Text style={styles.collapsedPreview} numberOfLines={2}>
                          {entry.content}
                        </Text>
                        {entry.tags.length > 0 && (
                          <View style={styles.collapsedTags}>
                            {entry.tags.map((tag) => (
                              <View
                                key={tag.id}
                                style={[
                                  styles.collapsedTag,
                                  { backgroundColor: tag.color + "18" },
                                ]}
                              >
                                <Text
                                  style={[styles.collapsedTagText, { color: tag.color }]}
                                >
                                  {tag.icon} {tag.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                      <View style={styles.collapsedDateBlock}>
                        <Text style={[styles.collapsedDayNum, { color: accent }]}>
                          {d.getDate()}
                        </Text>
                        <Text style={styles.collapsedMonth}>
                          {monthShort[d.getMonth()]}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
            <View style={{ height: 40 }} />
          </ScrollView>
        )
      ) : (
        /* ── Weekly View ── */
        loadingWeekly ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : weeklyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={["#EFF6FF", "#DBEAFE"]}
              style={styles.emptyIconBg}
            >
              <Ionicons name="calendar-outline" size={44} color="#93C5FD" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No weeks yet</Text>
            <Text style={styles.emptySub}>
              Your weekly summaries for {monthNames[selectedMonth]} {selectedYear}{"\n"}
              will appear here once you have enough entries.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {weeklyData.map((week) => {
              const isExpanded = expandedWeek === week.weekNumber;
              const weekStartDate = new Date(week.weekStart);
              const weekEndDate = new Date(week.weekEnd);

              return (
                <TouchableOpacity
                  key={week.weekNumber}
                  activeOpacity={0.85}
                  onPress={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                  style={styles.weekCard}
                >
                  <View style={styles.weekHeader}>
                    <View>
                      <Text style={styles.weekLabel}>
                        Week {week.weekNumber}: {monthShort[weekStartDate.getMonth()]} {weekStartDate.getDate()} - {monthShort[weekEndDate.getMonth()]} {weekEndDate.getDate()} ({week.dayCount} days)
                      </Text>
                      {week.mood && (
                        <Text style={styles.weekMood}>{week.mood}</Text>
                      )}
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </View>

                  {isExpanded ? (
                    <View style={styles.weekExpanded}>
                      <Text style={styles.weekFullSummary}>{week.fullSummary}</Text>
                      <TouchableOpacity
                        onPress={() => setExpandedWeek(null)}
                        style={styles.weekCollapseBtn}
                      >
                        <Ionicons name="chevron-up" size={15} color="#6B7280" />
                        <Text style={styles.weekCollapseText}>Collapse</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.weekShortSummary} numberOfLines={3}>
                      {week.shortSummary}
                    </Text>
                  )}

                  {week.topTags.length > 0 && (
                    <View style={styles.weekTags}>
                      {week.topTags.slice(0, 4).map((tag, idx) => (
                        <View
                          key={idx}
                          style={[styles.weekTag, { backgroundColor: tag.color }]}
                        >
                          <Text style={styles.weekTagText}>
                            {tag.icon} {tag.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        )
      )}

      {/* Month Picker Modal */}
      <MonthPicker
        visible={pickerVisible}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(m, y) => {
          setSelectedMonth(m);
          setSelectedYear(y);
        }}
        onClose={() => setPickerVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteTargetId !== null}
        type="delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Update Confirmation Modal */}
      <ConfirmModal
        visible={updateTargetId !== null}
        type="update"
        onConfirm={confirmUpdate}
        onCancel={() => setUpdateTargetId(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  /* ── Header ── */
  header: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  /* ── Month Nav ── */
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 20,
  },
  monthArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    minWidth: 160,
    textAlign: "center",
  },

  /* ── Toggle ── */
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 14,
    marginTop: 10,
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

  /* ── Loading & Empty ── */
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },

  /* ── Scroll ── */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  /* ── Bento Card ── */
  cardWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  accentStrip: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },

  /* ── Collapsed ── */
  collapsedLayout: {
    flexDirection: "row",
    alignItems: "center",
  },
  collapsedTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  collapsedSummary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  collapsedPreview: {
    fontSize: 12.5,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  collapsedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  collapsedTag: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  collapsedTagText: {
    fontSize: 10,
    fontWeight: "600",
  },
  collapsedDateBlock: {
    alignItems: "center",
    minWidth: 42,
  },
  collapsedDayNum: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  collapsedMonth: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 1,
  },

  /* ── Expanded ── */
  expandedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  expandedDateBlock: {},
  expandedDayLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  expandedDateFull: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  expandedActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedSummary: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
    lineHeight: 23,
  },
  expandedContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  collapseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 4,
  },
  collapseText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  /* ── Save / Cancel buttons ── */
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelEditBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Inline Editor ── */
  editSummaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 10,
  },
  editTextInput: {
    minHeight: 140,
    maxHeight: 280,
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    padding: 14,
  },
  editCharCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 14,
  },
  editTagHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  editTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  editTagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    gap: 5,
  },
  editTagIcon: {
    fontSize: 13,
  },
  editTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  /* ── Weekly View ── */
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  weekMood: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  weekShortSummary: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  weekExpanded: {
    marginBottom: 12,
  },
  weekFullSummary: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  weekCollapseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 4,
  },
  weekCollapseText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  weekTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  weekTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
