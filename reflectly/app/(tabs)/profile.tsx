import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../utils/api";

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
  appLockEnabled?: boolean;
  appLockType?: "pin" | "password" | null;
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

function SettingItem({ item, onPress }: { item: SettingRow; onPress?: () => void }) {
  const router = useRouter();

  const handlePress = () => {
    if (item.label === "Send Feedback") {
      router.push("/feedback");
      return;
    }

    onPress?.();
  };

  return (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.6} onPress={handlePress}>
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
  const { logout, token, user, setupAppLock, disableAppLock } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLockModalVisible, setIsLockModalVisible] = useState(false);
  const [lockType, setLockType] = useState<"pin" | "password">("pin");
  const [lockValue, setLockValue] = useState("");
  const [lockConfirmValue, setLockConfirmValue] = useState("");
  const [lockError, setLockError] = useState<string | null>(null);
  const [isSavingLock, setIsSavingLock] = useState(false);

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

  const privacyItems = useMemo<SettingRow[]>(
    () => [
      {
        icon: "lock-closed",
        iconColor: "#F59E0B",
        label: "App Lock",
        value: profile?.appLockEnabled
          ? profile?.appLockType === "pin"
            ? "PIN Enabled"
            : "Password Enabled"
          : "Off",
        valueColor: profile?.appLockEnabled ? "#10B981" : "#9CA3AF",
      },
      {
        icon: "shield-checkmark",
        iconColor: "#3B82F6",
        label: "Data Security",
        value: "Encrypted",
        valueColor: "#3B82F6",
      },
    ],
    [profile?.appLockEnabled, profile?.appLockType]
  );

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  async function handleSaveLock() {
    const normalizedValue = lockType === "pin" ? lockValue.trim() : lockValue;
    const normalizedConfirm = lockType === "pin" ? lockConfirmValue.trim() : lockConfirmValue;

    if (!normalizedValue || !normalizedConfirm) {
      setLockError("Please complete both fields.");
      return;
    }

    if (normalizedValue !== normalizedConfirm) {
      setLockError("The values do not match.");
      return;
    }

    if (lockType === "pin" && !/^\d{4}$/.test(normalizedValue)) {
      setLockError("PIN must be exactly 4 digits.");
      return;
    }

    if (lockType === "password" && normalizedValue.length < 6) {
      setLockError("App password must be at least 6 characters.");
      return;
    }

    try {
      setIsSavingLock(true);
      setLockError(null);
      await setupAppLock(lockType, normalizedValue);
      setProfile((current) =>
        current
          ? {
              ...current,
              appLockEnabled: true,
              appLockType: lockType,
            }
          : current
      );
      setIsLockModalVisible(false);
      setLockValue("");
      setLockConfirmValue("");
    } catch (err) {
      setLockError(err instanceof Error ? err.message : "Failed to save app lock.");
    } finally {
      setIsSavingLock(false);
    }
  }

  async function handleDisableLock() {
    try {
      setIsSavingLock(true);
      setLockError(null);
      await disableAppLock();
      setProfile((current) =>
        current
          ? {
              ...current,
              appLockEnabled: false,
              appLockType: null,
            }
          : current
      );
      setIsLockModalVisible(false);
      setLockValue("");
      setLockConfirmValue("");
    } catch (err) {
      setLockError(err instanceof Error ? err.message : "Failed to disable app lock.");
    } finally {
      setIsSavingLock(false);
    }
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
          {DIARY_PREFS.map((item, i) => (
            <View key={i}>
              <SettingItem item={item} />
              {i < DIARY_PREFS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>
        <View style={styles.sectionCard}>
          {privacyItems.map((item, i) => (
            <View key={i}>
              <SettingItem
                item={item}
                onPress={item.label === "App Lock" ? () => setIsLockModalVisible(true) : undefined}
              />
              {i < privacyItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
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

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isLockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLockModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>App Lock</Text>
              <TouchableOpacity onPress={() => setIsLockModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Set a unique {lockType === "pin" ? "PIN" : "password"} for this user account.
            </Text>

            <View style={styles.toggleRow}>
              {(["pin", "password"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.toggleButton, lockType === type && styles.toggleButtonActive]}
                  onPress={() => {
                    setLockType(type);
                    setLockValue("");
                    setLockConfirmValue("");
                    setLockError(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.toggleLabel, lockType === type && styles.toggleLabelActive]}
                  >
                    {type === "pin" ? "PIN" : "Password"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={lockValue}
              onChangeText={(value) => {
                setLockValue(value);
                if (lockError) setLockError(null);
              }}
              placeholder={lockType === "pin" ? "Enter 4-digit PIN" : "Create app password"}
              placeholderTextColor="#94A3B8"
              secureTextEntry
              keyboardType={lockType === "pin" ? "number-pad" : "default"}
              maxLength={lockType === "pin" ? 4 : 32}
              style={styles.modalInput}
            />

            <TextInput
              value={lockConfirmValue}
              onChangeText={(value) => {
                setLockConfirmValue(value);
                if (lockError) setLockError(null);
              }}
              placeholder={lockType === "pin" ? "Confirm PIN" : "Confirm app password"}
              placeholderTextColor="#94A3B8"
              secureTextEntry
              keyboardType={lockType === "pin" ? "number-pad" : "default"}
              maxLength={lockType === "pin" ? 4 : 32}
              style={styles.modalInput}
            />

            {lockError ? <Text style={styles.lockErrorText}>{lockError}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryButton, isSavingLock && styles.disabledAction]}
              onPress={handleSaveLock}
              disabled={isSavingLock}
              activeOpacity={0.85}
            >
              {isSavingLock ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save App Lock</Text>
              )}
            </TouchableOpacity>

            {profile?.appLockEnabled ? (
              <TouchableOpacity
                style={[styles.secondaryButton, isSavingLock && styles.disabledAction]}
                onPress={handleDisableLock}
                disabled={isSavingLock}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Turn Off App Lock</Text>
              </TouchableOpacity>
            ) : null}
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#DBEAFE",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  toggleLabelActive: {
    color: "#1D4ED8",
  },
  modalInput: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
  },
  lockErrorText: {
    marginTop: 10,
    fontSize: 13,
    color: "#DC2626",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },
  disabledAction: {
    opacity: 0.7,
  },
});
