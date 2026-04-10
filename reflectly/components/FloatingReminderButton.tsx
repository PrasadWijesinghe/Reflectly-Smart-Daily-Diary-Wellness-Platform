import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  DeviceEventEmitter,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MonthCalendar from "./MonthCalendar";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const STORAGE_KEY = "reflectly_reminders";
const REMINDERS_UPDATED_EVENT = "reflectly:reminders-updated";

type Reminder = {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
};

function toDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatReminderDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FloatingReminderButton() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setReminders(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      setReminders([]);
    }
  }

  async function persistReminders(nextReminders: Reminder[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextReminders));
    setReminders(nextReminders);
    DeviceEventEmitter.emit(REMINDERS_UPDATED_EVENT);
  }

  function openReminderModal() {
    setIsOpen(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }

  function closeReminderModal() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }

  async function handleSaveReminder() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please add a title for your reminder.");
      return;
    }

    setIsSaving(true);

    try {
      const nextReminder: Reminder = {
        id: `${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        date: selectedDate,
        createdAt: new Date().toISOString(),
      };

      const nextReminders = [...reminders, nextReminder].sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      await persistReminders(nextReminders);
      setTitle("");
      setDescription("");
      setSelectedDate(toDateString(new Date()));

      Alert.alert("Reminder saved", "Your reminder has been added successfully.");
    } catch (error) {
      console.error("Failed to save reminder:", error);
      Alert.alert("Save failed", "Could not save your reminder. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteReminder(reminderId: string) {
    try {
      const nextReminders = reminders.filter((reminder) => reminder.id !== reminderId);
      await persistReminders(nextReminders);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      Alert.alert("Delete failed", "Could not remove the reminder.");
    }
  }

  const upcomingReminders = useMemo(
    () =>
      reminders
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [reminders]
  );

  if (!isOpen) {
    return (
      <TouchableOpacity style={styles.fab} onPress={openReminderModal} activeOpacity={0.85}>
        <Ionicons name="notifications" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeReminderModal}
        statusBarTranslucent
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            style={styles.sheetWrap}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <View style={styles.sheet}>
              <LinearGradient colors={["#F59E0B", "#EA580C"]} style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <Ionicons name="notifications" size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Reminders</Text>
                    <Text style={styles.headerSubtitle}>Plan something kind for your future self</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeReminderModal} style={styles.closeButton} activeOpacity={0.7}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formCard}>
                  <Text style={styles.sectionTitle}>Create reminder</Text>

                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Study break, call mom, submit assignment..."
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add a few details if you want"
                    placeholderTextColor="#94A3B8"
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setCalendarVisible(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.dateButtonLeft}>
                      <Ionicons name="calendar-outline" size={18} color="#F59E0B" />
                      <Text style={styles.dateButtonText}>{formatReminderDate(selectedDate)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSaveReminder}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save reminder"}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Upcoming reminders</Text>
                    <Text style={styles.listCount}>{reminders.length}</Text>
                  </View>

                  {upcomingReminders.length ? (
                    upcomingReminders.map((reminder) => (
                      <View key={reminder.id} style={styles.reminderRow}>
                        <View style={styles.reminderAccent} />
                        <View style={styles.reminderBody}>
                          <Text style={styles.reminderTitle}>{reminder.title}</Text>
                          <Text style={styles.reminderDate}>{formatReminderDate(reminder.date)}</Text>
                          {reminder.description ? (
                            <Text style={styles.reminderDescription}>{reminder.description}</Text>
                          ) : null}
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteReminder(reminder.id)}
                          style={styles.deleteButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="calendar-clear-outline" size={28} color="#CBD5E1" />
                      <Text style={styles.emptyTitle}>No reminders yet</Text>
                      <Text style={styles.emptyDescription}>Add your first reminder to keep track of important moments.</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      <MonthCalendar
        visible={calendarVisible}
        markedDates={{}}
        currentDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setCalendarVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 154,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 999,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheetWrap: {
    justifyContent: "flex-end",
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.88)",
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 96,
    paddingTop: 14,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9A3412",
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: "#F59E0B",
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 28,
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  reminderAccent: {
    width: 4,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
    alignSelf: "stretch",
    marginRight: 12,
  },
  reminderBody: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  reminderDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EA580C",
    marginTop: 3,
  },
  reminderDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
    marginTop: 6,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  emptyDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#94A3B8",
    textAlign: "center",
    maxWidth: 240,
  },
});
