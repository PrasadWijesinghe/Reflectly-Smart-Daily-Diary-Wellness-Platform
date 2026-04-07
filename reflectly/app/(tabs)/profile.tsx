import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../utils/api";
import NotificationService from "../../utils/NotificationService";
import SecurityService from "../../utils/SecurityService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal, TextInput, Alert } from "react-native";

type SettingRow = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  valueColor?: string;
};

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type DiaryEntry = {
  id: number;
  date: string;
};

const DIARY_PREFS: SettingRow[] = [
  {
    icon: "calendar",
    iconColor: "#3B82F6",
    label: "Default Mode",
    value: "Daily",
    valueColor: "#3B82F6",
  },
  {
    icon: "notifications",
    iconColor: "#F59E0B",
    label: "Daily Reminders",
    value: "On",
    valueColor: "#10B981",
  },
];

const PRIVACY: SettingRow[] = [
  {
    icon: "lock-closed",
    iconColor: "#F59E0B",
    label: "Privacy Settings",
    value: "Private",
    valueColor: "#3B82F6",
  },
  {
    icon: "shield-checkmark",
    iconColor: "#3B82F6",
    label: "Data Security",
    value: "Encrypted",
    valueColor: "#3B82F6",
  },
];

const SUPPORT: SettingRow[] = [
  {
    icon: "help-circle",
    iconColor: "#EF4444",
    label: "Help Center",
  },
  {
    icon: "chatbubble-outline",
    iconColor: "#6B7280",
    label: "Send Feedback",
  },
];

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return "Member since recently";
  return `Member since ${new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })}`;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "U";
}

function calculateStreak(entries: DiaryEntry[]) {
  const days = new Set(
    entries.map((entry) => new Date(entry.date).toISOString().split("T")[0])
  );

  let streak = 0;
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  while (days.has(current.toISOString().split("T")[0])) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function calculateThisWeek(entries: DiaryEntry[]) {
  const now = new Date();
  const currentDay = now.getDay();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - currentDay);

  return entries.filter((entry) => new Date(entry.date) >= weekStart).length;
}

function SettingItem({ item }: { item: SettingRow }) {
  return (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
      <View style={styles.settingLeft}>
        <View
          style={[styles.settingIconWrap, { backgroundColor: item.iconColor + "18" }]}
        >
          <Ionicons name={item.icon} size={18} color={item.iconColor} />
        </View>
        <Text style={styles.settingLabel}>{item.label}</Text>
      </View>
      <View style={styles.settingRight}>
        {item.value && (
          <Text
            style={[
              styles.settingValue,
              { color: item.valueColor || "#9CA3AF" },
            ]}
          >
            {item.value}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, token, user } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemindersEnabled, setIsRemindersEnabled] = useState(false);
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  
  // PIN Setup State
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter");
  const [tempPin, setTempPin] = useState("");
  const [pinInput, setPinInput] = useState("");

  // Load preferences on mount
  useEffect(() => {
    (async () => {
      // Load Reminders
      const storedReminders = await AsyncStorage.getItem("daily_reminders_enabled");
      if (storedReminders !== null) {
        setIsRemindersEnabled(JSON.parse(storedReminders));
      }

      // Load App Lock
      const lockEnabled = await SecurityService.isLockEnabled();
      setIsAppLockEnabled(lockEnabled);
    })();
  }, []);

  async function handleToggleAppLock() {
    if (isAppLockEnabled) {
      // Authenticate before turning off for security
      const result = await SecurityService.authenticate();
      if (result.success) {
        await SecurityService.setLockEnabled(false);
        setIsAppLockEnabled(false);
      }
    } else {
      // Turning ON - Need to setup PIN first
      setPinInput("");
      setTempPin("");
      setPinStep("enter");
      setShowPinSetup(true);
    }
  }

  async function handlePinSubmit() {
    if (pinInput.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits.");
      return;
    }

    if (pinStep === "enter") {
      setTempPin(pinInput);
      setPinInput("");
      setPinStep("confirm");
    } else {
      if (pinInput === tempPin) {
        // Success
        try {
          await SecurityService.savePIN(pinInput);
          await SecurityService.setLockEnabled(true);
          setIsAppLockEnabled(true);
          setShowPinSetup(false);
          Alert.alert("Success", "App Lock has been enabled.");
        } catch (err) {
          Alert.alert("Error", "Failed to save PIN.");
        }
      } else {
        Alert.alert("Error", "PINs do not match. Try again.");
        setPinInput("");
        setPinStep("enter");
      }
    }
  }

  // Load reminder preference on mount
  useEffect(() => {
    (async () => {
      const storedPref = await AsyncStorage.getItem("daily_reminders_enabled");
      if (storedPref !== null) {
        setIsRemindersEnabled(JSON.parse(storedPref));
      } else {
        // Default to checking system status if no preference stored
        const status = await NotificationService.getNotificationStatus();
        setIsRemindersEnabled(status);
      }
    })();
  }, []);

  async function handleToggleReminders() {
    try {
      if (isRemindersEnabled) {
        // Turn off
        await NotificationService.cancelDailyReminders();
        setIsRemindersEnabled(false);
        await AsyncStorage.setItem("daily_reminders_enabled", JSON.stringify(false));
      } else {
        // Turn on
        const token = await NotificationService.registerForPushNotificationsAsync();
        if (token) {
          await NotificationService.scheduleDailyReminder();
          setIsRemindersEnabled(true);
          await AsyncStorage.setItem("daily_reminders_enabled", JSON.stringify(true));
          // Note: In the next step, we will send this token to the backend
        } else {
          alert("Please enable notification permissions in your device settings to use reminders.");
        }
      }
    } catch (err) {
      console.error("Failed to toggle reminders:", err);
      setError("Failed to update reminder settings.");
    }
  }

  async function loadProfileData(showRefresh = false) {
    if (!token) {
      setProfile(null);
      setEntries([]);
      setIsLoading(false);
      return;
    }

    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError(null);

      const headers = { Authorization: `Bearer ${token}` };

      const [meRes, diaryRes] = await Promise.all([
        fetch(`${getApiUrl()}/auth/me`, { headers }),
        fetch(`${getApiUrl()}/diary`, { headers }),
      ]);

      const meData = await meRes.json();
      const diaryData = await diaryRes.json();

      if (!meRes.ok) {
        throw new Error(meData.error || "Failed to load profile.");
      }

      if (!diaryRes.ok) {
        throw new Error(diaryData.error || "Failed to load diary stats.");
      }

      setProfile(meData.user);
      setEntries(Array.isArray(diaryData.entries) ? diaryData.entries : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadProfileData();
  }, [token]);

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  const stats = useMemo(
    () => [
      { value: String(entries.length), label: "Entries", emoji: "📝" },
      { value: String(calculateStreak(entries)), label: "Streak", emoji: "🔥" },
      { value: String(calculateThisWeek(entries)), label: "This Week", emoji: "🌟" },
    ],
    [entries]
  );

  const displayName = profile?.name || user?.name || "User";
  const displayEmail = profile?.email || user?.email || "No email";
  const displayCreatedAt = profile?.createdAt;
  const initials = getInitials(displayName);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>Your account and settings</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadProfileData(true)}
            tintColor="#3B82F6"
          />
        }
      >
        <LinearGradient
          colors={["#3B82F6", "#6366F1", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.profileCard}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
              <Text style={styles.profileSince}>{formatMemberSince(displayCreatedAt)}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>
                    {stat.label} {stat.emoji}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        <Text style={styles.sectionLabel}>DIARY PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <SettingItem item={DIARY_PREFS[0]} />
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.6}
            onPress={handleToggleReminders}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIconWrap, { backgroundColor: DIARY_PREFS[1].iconColor + "18" }]}
              >
                <Ionicons name={DIARY_PREFS[1].icon} size={18} color={DIARY_PREFS[1].iconColor} />
              </View>
              <Text style={styles.settingLabel}>{DIARY_PREFS[1].label}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text
                style={[
                  styles.settingValue,
                  { color: isRemindersEnabled ? "#10B981" : "#EF4444" },
                ]}
              >
                {isRemindersEnabled ? "On" : "Off"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.6}
            onPress={handleToggleAppLock}
          >
            <View style={styles.settingLeft}>
              <View
                style={[styles.settingIconWrap, { backgroundColor: PRIVACY[0].iconColor + "18" }]}
              >
                <Ionicons name="finger-print" size={18} color={PRIVACY[0].iconColor} />
              </View>
              <Text style={styles.settingLabel}>Biometric App Lock</Text>
            </View>
            <View style={styles.settingRight}>
              <Text
                style={[
                  styles.settingValue,
                  { color: isAppLockEnabled ? "#10B981" : "#EF4444" },
                ]}
              >
                {isAppLockEnabled ? "On" : "Off"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <SettingItem item={PRIVACY[0]} />
          <View style={styles.divider} />
          <SettingItem item={PRIVACY[1]} />
        </View>

        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.sectionCard}>
          {SUPPORT.map((item, i) => (
            <View key={i}>
              <SettingItem item={item} />
              {i < SUPPORT.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutEmoji}>💡</Text>
            <Text style={styles.aboutTitle}>About This App</Text>
          </View>
          <Text style={styles.aboutText}>
            Student Life Diary helps you reflect on daily experiences and track
            your wellbeing in a friendly way.
          </Text>
          <View style={styles.aboutNote}>
            <Text style={styles.aboutNoteText}>
              <Text style={styles.aboutNoteLead}>Note: </Text>
              This app provides general wellness insights and is not a substitute
              for professional advice. If you need support, please reach out to a
              qualified healthcare provider. 💙
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Student Life Diary v1.0.0</Text>
          <Text style={styles.footerMade}>Made with care for students</Text>
        </View>
      </ScrollView>

      {/* PIN Setup Modal */}
      <Modal
        visible={showPinSetup}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed" size={32} color="#3B82F6" />
              <Text style={styles.modalTitle}>
                {pinStep === "enter" ? "Set 4-Digit PIN" : "Confirm PIN"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {pinStep === "enter" 
                  ? "Enter a secure PIN for app access" 
                  : "Enter the PIN once more to confirm"}
              </Text>
            </View>

            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={(text) => setPinInput(text.replace(/[^0-9]/g, "").slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              autoFocus
              maxLength={4}
              placeholder="0 0 0 0"
              placeholderTextColor="#D1D5DB"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowPinSetup(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handlePinSubmit}
              >
                <Text style={styles.confirmBtnText}>
                  {pinStep === "enter" ? "Next" : "Enable Lock"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  profileSince: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 3,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontSize: 13,
  },
  errorWrap: {
    backgroundColor: "rgba(239,68,68,0.18)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 60,
  },
  aboutCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 18,
    marginTop: 22,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aboutEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  aboutText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutNote: {
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    padding: 12,
  },
  aboutNoteText: {
    fontSize: 12,
    color: "#EF4444",
    lineHeight: 18,
  },
  aboutNoteLead: {
    fontWeight: "700",
    color: "#1F2937",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 10,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  footerVersion: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  footerMade: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  pinInput: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    color: "#1F2937",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
  },
  confirmBtn: {
    backgroundColor: "#3B82F6",
  },
  cancelBtnText: {
    color: "#6B7280",
    fontWeight: "700",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
