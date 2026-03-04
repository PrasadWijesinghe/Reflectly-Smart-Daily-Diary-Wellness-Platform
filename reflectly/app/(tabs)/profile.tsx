import React from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type SettingRow = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  valueColor?: string;
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

const STATS = [
  { value: "47", label: "Entries", emoji: "📝" },
  { value: "12", label: "Streak", emoji: "🔥" },
  { value: "8", label: "This Week", emoji: "🌟" },
];

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
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>
                Your account & settings ⚙️
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
        {/* Profile Card */}
        <LinearGradient
          colors={["#3B82F6", "#6366F1", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.profileCard}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AJ</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Alex Johnson</Text>
              <Text style={styles.profileEmail}>alex.johnson@university.edu</Text>
              <Text style={styles.profileSince}>Member since January 2025 📅</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {STATS.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>
                  {stat.label} {stat.emoji}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Diary Preferences */}
        <Text style={styles.sectionLabel}>DIARY PREFERENCES</Text>
        <View style={styles.sectionCard}>
          {DIARY_PREFS.map((item, i) => (
            <View key={i}>
              <SettingItem item={item} />
              {i < DIARY_PREFS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Privacy & Security */}
        <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>
        <View style={styles.sectionCard}>
          {PRIVACY.map((item, i) => (
            <View key={i}>
              <SettingItem item={item} />
              {i < PRIVACY.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.sectionCard}>
          {SUPPORT.map((item, i) => (
            <View key={i}>
              <SettingItem item={item} />
              {i < SUPPORT.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* About This App */}
        <View style={styles.aboutCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
            <Text style={styles.aboutTitle}>About This App</Text>
          </View>
          <Text style={styles.aboutText}>
            Student Life Diary helps you reflect on daily experiences and track
            your wellbeing in a fun, friendly way!
          </Text>
          <View style={styles.aboutNote}>
            <Text style={styles.aboutNoteText}>
              <Text style={{ fontWeight: "700", color: "#1F2937" }}>Note: </Text>
              This app provides general wellness insights and is not a substitute
              for professional advice. If you need support, please reach out to a
              qualified healthcare provider. 💙
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Student Life Diary v1.0.0</Text>
          <Text style={styles.footerMade}>Made with 💙 for students</Text>
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
  footer: {
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 10,
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
});
