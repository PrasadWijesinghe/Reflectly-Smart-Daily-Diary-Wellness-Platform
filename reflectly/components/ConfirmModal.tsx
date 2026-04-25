import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  visible: boolean;
  type: "delete" | "update";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  type,
  onConfirm,
  onCancel,
}: Props) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = (action: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => action());
  };

  const config = {
    delete: {
      icon: "trash-outline",
      iconBg: "#FEF2F2",
      iconBorder: "#FEE2E2",
      iconColor: "#EF4444",
      title: "Delete Entry?",
      message: "This will permanently remove this diary entry and all its tags. This action cannot be undone.",
      confirmText: "Delete Entry",
      confirmIcon: "trash-outline",
      confirmColor: "#EF4444",
    },
    update: {
      icon: "create-outline",
      iconBg: "#EFF6FF",
      iconBorder: "#DBEAFE",
      iconColor: "#3B82F6",
      title: "Update Entry?",
      message: "Your changes will be saved to this diary entry.",
      confirmText: "Update Entry",
      confirmIcon: "checkmark-outline",
      confirmColor: "#3B82F6",
    },
  };

  const c = config[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => handleClose(onCancel)}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => handleClose(onCancel)}
        />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.handle} />

          <View style={[styles.iconCircle, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}>
            <Ionicons name={c.icon as any} size={28} color={c.iconColor} />
          </View>

          <Text style={styles.title}>{c.title}</Text>
          <Text style={styles.message}>{c.message}</Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: c.confirmColor }]}
            onPress={() => handleClose(onConfirm)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={c.confirmIcon as any}
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.confirmBtnText}>{c.confirmText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleClose(onCancel)}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Keep it</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});