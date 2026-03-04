import React, { useState, useRef } from "react";
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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Message = {
  id: number;
  text: string;
  isBot: boolean;
  time: string;
};

const QUICK_QUESTIONS = [
  { label: "Summarize my week", emoji: "\ud83d\udcca" },
  { label: "Why am I stressed?", emoji: "\ud83e\udd14" },
  { label: "Suggest a game", emoji: "\ud83c\udfae" },
  { label: "Quick reflection", emoji: "\u2728" },
];

const BOT_RESPONSES: Record<string, string> = {
  "Summarize my week":
    "Based on your entries this week, you've been mostly feeling positive! \ud83c\udf1f You wrote about studying, some exam stress, and a great win. Your mood has been trending upward \u2014 keep it going!",
  "Why am I stressed?":
    "Looking at your recent entries, it seems like exams and deadlines are the main stressors. \ud83d\udcda Try taking short breaks between study sessions and maybe play a quick stress-relief game! \ud83c\udfae",
  "Suggest a game":
    "How about trying Pop Bubbles? \ud83e\udee7 It\u2019s a simple, satisfying game that can help you de-stress in just a few minutes. Head over to the Games tab to give it a try!",
  "Quick reflection":
    "Take a moment to think: What\u2019s one thing that made you smile today? \ud83d\ude0a Writing it down, even if it\u2019s small, can boost your mood and help you appreciate the little things.",
};

function getTimeString() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! I\u2019m Diary Buddy \ud83c\udf1f Your friendly companion for reflection and support. How can I help you today?",
      isBot: true,
      time: getTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function openChat() {
    setIsOpen(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeChat() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }

  function addBotReply(userText: string) {
    setTimeout(() => {
      const matched = BOT_RESPONSES[userText];
      const reply =
        matched ||
        `That\u2019s a great thought! \ud83d\udcad I\u2019d encourage you to write about it in your diary. Reflecting on "${userText}" can bring clarity and peace. \ud83d\ude0a`;

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: reply,
          isBot: true,
          time: getTimeString(),
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text, isBot: false, time: getTimeString() },
    ]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    addBotReply(text);
  }

  function handleQuickQuestion(label: string) {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: label, isBot: false, time: getTimeString() },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    addBotReply(label);
  }

  if (!isOpen) {
    return (
      <TouchableOpacity
        style={styles.fab}
        onPress={openChat}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent
      onRequestClose={closeChat}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>{"\ud83e\uddd1\u200d\ud83d\udcbb"}</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Diary Buddy</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.headerSubtitle}>Always here for you</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeChat}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleRow,
                  msg.isBot ? styles.botRow : styles.userRow,
                ]}
              >
                {msg.isBot && (
                  <View style={styles.botAvatarSmall}>
                    <Text style={{ fontSize: 14 }}>{"\ud83e\uddd1\u200d\ud83d\udcbb"}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.isBot ? styles.botBubble : styles.userBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.isBot ? styles.botText : styles.userText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      msg.isBot ? styles.botTime : styles.userTime,
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <View style={styles.quickContainer}>
              <Text style={styles.quickLabel}>Quick questions:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickScroll}
              >
                {QUICK_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q.label}
                    style={styles.quickChip}
                    onPress={() => handleQuickQuestion(q.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickChipText}>
                      {q.label} {q.emoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your message..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendBtn,
                  !inputText.trim() && styles.sendBtnDisabled,
                ]}
                activeOpacity={0.7}
                disabled={!inputText.trim()}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={inputText.trim() ? "#fff" : "#94A3B8"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 85,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 999,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  /* Header */
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
  avatarEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  /* Messages */
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  userBubble: {
    backgroundColor: "#3B82F6",
    borderBottomRightRadius: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: "#334155",
  },
  userText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  botTime: {
    color: "#94A3B8",
  },
  userTime: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  /* Quick Questions */
  quickContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  quickLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 8,
    fontWeight: "500",
  },
  quickScroll: {
    gap: 8,
  },
  quickChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
  /* Input */
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    paddingVertical: 0,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#E2E8F0",
  },
});
