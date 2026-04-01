import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Props = {
  visible: boolean;
  selectedMonth: number; // 0-indexed
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
  onClose: () => void;
};

export default function MonthPicker({
  visible,
  selectedMonth,
  selectedYear,
  onSelect,
  onClose,
}: Props) {
  const [year, setYear] = useState(selectedYear);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handleMonthPress = (monthIndex: number) => {
    onSelect(monthIndex, year);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Pick a Month</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Year Navigation */}
          <View style={styles.yearRow}>
            <TouchableOpacity
              onPress={() => setYear((y) => y - 1)}
              style={styles.yearArrow}
            >
              <Ionicons name="chevron-back" size={22} color="#3B82F6" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{year}</Text>
            <TouchableOpacity
              onPress={() => setYear((y) => y + 1)}
              style={styles.yearArrow}
            >
              <Ionicons name="chevron-forward" size={22} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Month Grid */}
          <View style={styles.monthGrid}>
            {monthNames.map((name, index) => {
              const isSelected =
                index === selectedMonth && year === selectedYear;
              const isCurrent =
                index === currentMonth && year === currentYear;

              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.monthBtn,
                    isSelected && styles.monthBtnSelected,
                  ]}
                  onPress={() => handleMonthPress(index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.monthText,
                      isSelected && styles.monthTextSelected,
                      !isSelected && isCurrent && styles.monthTextCurrent,
                    ]}
                  >
                    {name}
                  </Text>
                  {isCurrent && !isSelected && (
                    <View style={styles.currentDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 24,
  },
  yearArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  yearText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    minWidth: 60,
    textAlign: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  monthBtn: {
    width: "22%",
    aspectRatio: 1.6,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  monthBtnSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  monthText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  monthTextSelected: {
    color: "#FFFFFF",
  },
  monthTextCurrent: {
    color: "#3B82F6",
  },
  currentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginTop: 3,
  },
});
