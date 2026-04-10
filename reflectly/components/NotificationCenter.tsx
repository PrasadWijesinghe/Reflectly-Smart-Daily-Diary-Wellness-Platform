import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { AppNotification } from "../utils/notifications";
import { useTheme } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  onClose: () => void;
  onPressNotification: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
};

export default function NotificationCenter({
  visible,
  notifications,
  unreadCount,
  onClose,
  onPressNotification,
  onMarkAllRead,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <LinearGradient colors={theme.gradient} style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="notifications" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.title}>Notifications</Text>
                  <Text style={styles.subtitle}>
                    {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.markAllButton, unreadCount === 0 && styles.markAllDisabled]}
              onPress={onMarkAllRead}
              activeOpacity={0.8}
              disabled={unreadCount === 0}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            contentContainerStyle={notifications.length === 0 ? styles.emptyContent : styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="checkmark-circle-outline" size={28} color="#3B82F6" />
                </View>
                <Text style={styles.emptyTitle}>All clear</Text>
                <Text style={styles.emptyBody}>
                  You are up to date for now. Diary reminders and stress alerts will show up here.
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.card, notification.read && styles.cardRead]}
                  activeOpacity={0.82}
                  onPress={() => onPressNotification(notification)}
                >
                  <View style={[styles.iconWrap, { backgroundColor: `${notification.color}18` }]}>
                    <Ionicons name={notification.icon as any} size={18} color={notification.color} />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{notification.title}</Text>
                      {!notification.read ? <View style={styles.unreadDot} /> : null}
                    </View>
                    <Text style={styles.cardText}>{notification.body}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardAction}>{notification.actionLabel}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.42)",
    justifyContent: "flex-end",
  },
  sheet: {
    minHeight: "68%",
    maxHeight: "88%",
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  markAllButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  markAllDisabled: {
    opacity: 0.55,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardRead: {
    opacity: 0.82,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
  cardText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardAction: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
});
