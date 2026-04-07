import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import SecurityService from "../../utils/SecurityService";

const { width } = Dimensions.get("window");

interface LockScreenProps {
  onUnlock: () => void;
}

const PIN_LENGTH = 4;

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const shakeAnimation = new Animated.Value(0);

  useEffect(() => {
    // Trigger biometric prompt immediately on mount
    handleBiometricAuth();
  }, []);

  const handleBiometricAuth = async () => {
    const result = await SecurityService.authenticate();
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlock();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (newPin.length === PIN_LENGTH) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const verifyPin = async (inputPin: string) => {
    const isValid = await SecurityService.verifyPIN(inputPin);
    if (isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlock();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      shake();
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 500);
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const renderDot = (index: number) => {
    const isActive = pin.length > index;
    return (
      <View
        key={index}
        style={[
          styles.dot,
          isActive && styles.activeDot,
          error && styles.errorDot,
        ]}
      />
    );
  };

  const renderKey = (val: string | number) => {
    if (val === "del") {
      return (
        <TouchableOpacity key="del" style={styles.key} onPress={handleDelete}>
          <Ionicons name="backspace-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      );
    }
    if (val === "bio") {
      return (
        <TouchableOpacity key="bio" style={styles.key} onPress={handleBiometricAuth}>
          <Ionicons name="finger-print" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key={val}
        style={styles.key}
        onPress={() => handleKeyPress(val.toString())}
      >
        <Text style={styles.keyText}>{val}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter PIN to unlock Reflectly</Text>
      </View>

      <Animated.View
        style={[styles.dotContainer, { transform: [{ translateX: shakeAnimation }] }]}
      >
        {[...Array(PIN_LENGTH)].map((_, i) => renderDot(i))}
      </Animated.View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          {[1, 2, 3].map(renderKey)}
        </View>
        <View style={styles.row}>
          {[4, 5, 6].map(renderKey)}
        </View>
        <View style={styles.row}>
          {[7, 8, 9].map(renderKey)}
        </View>
        <View style={styles.row}>
          {[ "bio", 0, "del"].map(renderKey)}
        </View>
      </View>
      
      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot PIN?</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  dotContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 50,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  errorDot: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  keypad: {
    width: width * 0.8,
    gap: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  forgotBtn: {
    marginTop: 40,
  },
  forgotText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default LockScreen;
