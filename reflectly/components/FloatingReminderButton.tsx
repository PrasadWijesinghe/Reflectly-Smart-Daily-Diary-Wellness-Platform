import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar, DateData } from "react-native-calendars";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Appointment = {
  id: string;
  date: string;
  title: string;
  description: string;
  completed: boolean;
};

const STORAGE_KEY = "reflectly_appointments";

function getTodayString() {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function FloatingReminderButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  
  // Add Appointment Form State
  const [isAdding, setIsAdding] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAppointments(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load appointments", e);
    }
  }

  async function saveAppointments(newAppts: Appointment[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAppts));
    } catch (e) {
      console.error("Failed to save appointments", e);
    }
  }

  function openModal() {
    setIsOpen(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeModal() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }

  async function handleAdd() {
    if (!titleInput.trim()) return;

    const newAppt: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
      title: titleInput.trim(),
      description: descInput.trim(),
      completed: false,
    };

    const nextAppointments = [...appointments, newAppt];
    setAppointments(nextAppointments);
    await saveAppointments(nextAppointments);
    
    // Reset Form
    setIsAdding(false);
    setTitleInput("");
    setDescInput("");
  }

  async function toggleComplete(id: string) {
    const nextAppointments = appointments.map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    setAppointments(nextAppointments);
    await saveAppointments(nextAppointments);
  }

  async function deleteAppointment(id: string) {
    const nextAppointments = appointments.filter((a) => a.id !== id);
    setAppointments(nextAppointments);
    await saveAppointments(nextAppointments);
  }

  const markedDates = useMemo(() => {
    let marks: any = {};
    appointments.forEach((app) => {
      // Add a dot if there's any task on that date
      marks[app.date] = { marked: true, dotColor: "#8B5CF6" };
    });

    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: "#8B5CF6" };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: "#8B5CF6" };
    }

    return marks;
  }, [appointments, selectedDate]);

  const selectedAppointments = appointments.filter(a => a.date === selectedDate);

  if (!isOpen) {
    return (
      <TouchableOpacity
        style={styles.fab}
        onPress={openModal}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <LinearGradient
            colors={["#8B5CF6", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Ionicons name="calendar-outline" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Appointments</Text>
                <Text style={styles.headerSubtitle}>
                  Plan and organize your days
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Calendar View */}
            <Calendar
              onDayPress={(day: DateData) => {
                setSelectedDate(day.dateString);
                setIsAdding(false);
              }}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: "#8B5CF6",
                todayTextColor: "#8B5CF6",
                arrowColor: "#8B5CF6",
                monthTextColor: "#1E293B",
                textMonthFontWeight: "bold",
                textDayFontSize: 15,
                textMonthFontSize: 16,
              }}
              style={styles.calendar}
            />

            <View style={styles.listContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.dateLabel}>
                  {selectedDate === getTodayString() ? "Today's Appointments" : `Appointments for ${selectedDate}`}
                </Text>
                {!isAdding && (
                  <TouchableOpacity 
                    style={styles.addInitBtn}
                    onPress={() => setIsAdding(true)}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addInitBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Add New Appointment Form */}
              {isAdding ? (
                <View style={styles.addFormContainer}>
                  <Text style={styles.addFormTitle}>New Appointment</Text>
                  
                  <TextInput
                    style={styles.inputTitle}
                    placeholder="Title (e.g. Doctor's Visit, Exam)"
                    placeholderTextColor="#94A3B8"
                    value={titleInput}
                    onChangeText={setTitleInput}
                  />
                  
                  <TextInput
                    style={styles.inputDesc}
                    placeholder="Description (Optional details...)"
                    placeholderTextColor="#94A3B8"
                    value={descInput}
                    onChangeText={setDescInput}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      onPress={() => setIsAdding(false)}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleAdd}
                      style={[styles.saveBtn, !titleInput.trim() && styles.saveBtnDisabled]}
                      disabled={!titleInput.trim()}
                    >
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Appointment List for Date */
                <View>
                  {selectedAppointments.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="calendar-clear-outline" size={40} color="#CBD5E1" />
                      <Text style={styles.emptyText}>No appointments for this date.</Text>
                    </View>
                  ) : (
                    selectedAppointments.map((appt) => (
                      <View key={appt.id} style={styles.apptRow}>
                        <TouchableOpacity
                          style={styles.checkBtn}
                          onPress={() => toggleComplete(appt.id)}
                        >
                          <Ionicons
                            name={appt.completed ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={appt.completed ? "#10B981" : "#94A3B8"}
                          />
                        </TouchableOpacity>
                        
                        <View style={styles.apptDetails}>
                          <Text
                            style={[
                              styles.apptTitle,
                              appt.completed && styles.apptCompletedText,
                            ]}
                          >
                            {appt.title}
                          </Text>
                          {appt.description ? (
                            <Text
                              style={[
                                styles.apptDesc,
                                appt.completed && styles.apptCompletedText,
                              ]}
                            >
                              {appt.description}
                            </Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => deleteAppointment(appt.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 155,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 999,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentScroll: {
    flex: 1,
  },
  calendar: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  addInitBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addInitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: "#94A3B8",
  },
  apptRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  checkBtn: {
    marginRight: 12,
  },
  apptDetails: {
    flex: 1,
    justifyContent: "center",
  },
  apptTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  apptDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  apptCompletedText: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },
  deleteBtn: {
    marginLeft: 10,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
  },
  addFormContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addFormTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  inputTitle: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1E293B",
    marginBottom: 10,
  },
  inputDesc: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
    minHeight: 80,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    backgroundColor: "#C4B5FD",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
