import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../utils/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
type ForgotStep = "email" | "otp" | "reset";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [sendingForgotOtp, setSendingForgotOtp] = useState(false);
  const [verifyingForgotOtp, setVerifyingForgotOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [forgotOtpCooldown, setForgotOtpCooldown] = useState(0);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");

  useEffect(() => {
    if (forgotOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [forgotOtpCooldown]);

  async function handleSendForgotOtp() {
    setForgotError("");
    setForgotMessage("");
    setSuccessMessage("");
    const normalizedEmail = forgotEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setSendingForgotOtp(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setForgotMessage(data.message || "OTP sent. Check your inbox.");
      setForgotStep("otp");
      setForgotOtpCooldown(60);
    } catch (err: any) {
      setForgotError(err.message || "Failed to send OTP.");
    } finally {
      setSendingForgotOtp(false);
    }
  }

  async function handleVerifyForgotOtp() {
    setForgotError("");
    setForgotMessage("");
    setSuccessMessage("");
    const normalizedEmail = forgotEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(forgotOtp.trim())) {
      setForgotError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifyingForgotOtp(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp: forgotOtp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP.");
      }

      setForgotStep("reset");
      setForgotMessage("OTP verified. Set your new password.");
    } catch (err: any) {
      setForgotError(err.message || "Failed to verify OTP.");
    } finally {
      setVerifyingForgotOtp(false);
    }
  }

  async function handleResetPassword() {
    setForgotError("");
    setForgotMessage("");
    setSuccessMessage("");
    const normalizedEmail = forgotEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(forgotNewPassword)) {
      setForgotError("Password must be at least 8 characters with uppercase, lowercase, and a symbol.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords don't match.");
      return;
    }

    setResettingPassword(true);
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setShowForgotModal(false);
      setEmail(normalizedEmail);
      setSuccessMessage("Password changed successfully. Please sign in.");
      setForgotStep("email");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setForgotError("");
      setForgotMessage("");
      setForgotOtpCooldown(0);
    } catch (err: any) {
      setForgotError(err.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleLogin() {
    setError("");
    setSuccessMessage("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and a symbol.");
      return;
    }

    setLoading(true);
    try {
      await login(normalizedEmail, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4F46E5", "#3B82F6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Reflectly</Text>
          <Text style={styles.tagline}>Your Smart Daily Diary</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color="#1D4ED8" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotLinkWrap}
            onPress={() => {
              setShowForgotModal(true);
              setForgotStep("email");
              setSuccessMessage("");
              setForgotError("");
              setForgotMessage("");
              setForgotOtp("");
              setForgotNewPassword("");
              setForgotConfirmPassword("");
              setForgotOtpCooldown(0);
            }}
          >
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4F46E5", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showForgotModal} animationType="slide" transparent onRequestClose={() => setShowForgotModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {forgotError ? <Text style={styles.modalErrorText}>{forgotError}</Text> : null}
            {forgotMessage ? <Text style={styles.modalSuccessText}>{forgotMessage}</Text> : null}

            {forgotStep === "email" ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalOtpBtn, sendingForgotOtp && styles.loginBtnDisabled]}
                  onPress={handleSendForgotOtp}
                  disabled={sendingForgotOtp}
                >
                  <LinearGradient
                    colors={["#2563EB", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalOtpBtnGradient}
                  >
                    {sendingForgotOtp ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.modalOtpBtnText}>Send OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : null}

            {forgotStep === "otp" ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>OTP Code</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="key-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      value={forgotOtp}
                      onChangeText={(value) => setForgotOtp(value.replace(/[^0-9]/g, "").slice(0, 6))}
                      maxLength={6}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalOtpBtn, (sendingForgotOtp || forgotOtpCooldown > 0) && styles.loginBtnDisabled]}
                  onPress={handleSendForgotOtp}
                  disabled={sendingForgotOtp || forgotOtpCooldown > 0}
                >
                  <LinearGradient
                    colors={["#2563EB", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalOtpBtnGradient}
                  >
                    {sendingForgotOtp ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : forgotOtpCooldown > 0 ? (
                      <Text style={styles.modalOtpBtnText}>Resend in {forgotOtpCooldown}s</Text>
                    ) : (
                      <Text style={styles.modalOtpBtnText}>Resend OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginBtn, verifyingForgotOtp && styles.loginBtnDisabled]}
                  onPress={handleVerifyForgotOtp}
                  disabled={verifyingForgotOtp}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginGradient}
                  >
                    {verifyingForgotOtp ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginBtnText}>Verify OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : null}

            {forgotStep === "reset" ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Min 8 chars, Aa + symbol"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!forgotShowPassword}
                      value={forgotNewPassword}
                      onChangeText={setForgotNewPassword}
                    />
                    <TouchableOpacity onPress={() => setForgotShowPassword(!forgotShowPassword)} style={styles.eyeBtn}>
                      <Ionicons
                        name={forgotShowPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!forgotShowPassword}
                      value={forgotConfirmPassword}
                      onChangeText={setForgotConfirmPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.loginBtn, resettingPassword && styles.loginBtnDisabled]}
                  onPress={handleResetPassword}
                  disabled={resettingPassword}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginGradient}
                  >
                    {resettingPassword ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginBtnText}>Change Password</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
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
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 28,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: "#1D4ED8",
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#64748B",
    fontSize: 15,
  },
  registerLink: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "700",
  },
  forgotLinkWrap: {
    alignItems: "flex-end",
    marginTop: -8,
    marginBottom: 6,
  },
  forgotLink: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
  },
  modalErrorText: {
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 10,
  },
  modalSuccessText: {
    fontSize: 13,
    color: "#1D4ED8",
    marginBottom: 10,
  },
  modalOtpBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  modalOtpBtnGradient: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOtpBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
