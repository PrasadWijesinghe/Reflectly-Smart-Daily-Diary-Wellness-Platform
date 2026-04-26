import React, { useRef, useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Message = {
  id: number;
  text: string;
  isBot: boolean;
  time: string;
  isTyping?: boolean;
};

type UserMemory = {
  name?: string;
  interests?: string[];
  goals?: string[];
  worries?: string[];
  mood?: string;
  lastUpdated?: string;
};

const MEMORY_KEY = "@diary_buddy_memory";
const CHAT_HISTORY_KEY = "@diary_buddy_history";

const INITIAL_GREETING = {
  id: 1,
  text: "Hey there! I'm Diary Buddy 🤖\n\nI'm your personal reflection companion. I can:\n\n💭 Help you reflect on your day\n📊 Summarize your week\n🎮 Suggest games for stress relief\n✨ Give personalized tips\n\nI remember things you tell me! Ask me anything 💪",
  isBot: true,
  time: "",
};

const QUICK_REPLIES = [
  { label: "How's my week going?", icon: "bar-chart", color: "#6366F1" },
  { label: "What games help stress?", icon: "game-controller", color: "#10B981" },
  { label: "Give me a tip", icon: "bulb", color: "#F59E0B" },
  { label: "How are you?", icon: "heart", color: "#EC4899" },
];

function getTimeString() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function extractMemory(text: string, currentMemory: UserMemory): Partial<UserMemory> {
  const lowerText = text.toLowerCase();
  const updates: Partial<UserMemory> = { lastUpdated: new Date().toISOString() };
  
  const nameMatch = text.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i);
  if (nameMatch && !currentMemory.name) {
    updates.name = nameMatch[1];
  }
  
  if (lowerText.includes("i like") || lowerText.includes("i love")) {
    const interestMatch = text.match(/i (?:like|love)\s+([a-zA-Z\s]+?)(?:\.|,|!|$)/gi);
    if (interestMatch) {
      const interests = [...(currentMemory.interests || [])];
      interestMatch.forEach((match: string) => {
        const thing = match.replace(/i (?:like|love)\s+/i, "").trim();
        if (thing && !interests.includes(thing)) {
          interests.push(thing);
        }
      });
      if (interests.length > 0) {
        updates.interests = interests.slice(0, 10);
      }
    }
  }
  
  if (lowerText.includes("i want") || lowerText.includes("my goal")) {
    const goalMatch = text.match(/i want (?:to )?([a-zA-Z\s]+?)(?:\.|,|!|$)/gi);
    if (goalMatch) {
      const goals = [...(currentMemory.goals || [])];
      goalMatch.forEach((match: string) => {
        const goal = match.replace(/i want (?:to )?/i, "").trim();
        if (goal && !goals.includes(goal)) {
          goals.push(goal);
        }
      });
      if (goals.length > 0) {
        updates.goals = goals.slice(0, 5);
      }
    }
  }
  
  if (lowerText.includes("worried") || lowerText.includes("stressed") || lowerText.includes("anxious")) {
    if (!currentMemory.worries) updates.worries = [];
    const worryMatch = text.match(/(?:worried about|stressed about|anxious about)\s+([a-zA-Z\s]+?)(?:\.|,|!|$)/gi);
    if (worryMatch) {
      worryMatch.forEach((match: string) => {
        const worry = match.replace(/(?:worried about|stressed about|anxious about)\s+/i, "").trim();
        if (worry && worry.length < 50 && !updates.worries?.includes(worry)) {
          updates.worries?.push(worry);
        }
      });
    }
  }
  
  return updates;
}

export default function FloatingChatButton() {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [memory, setMemory] = useState<UserMemory>({});
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMemory();
    loadChatHistory();
  }, []);

  async function loadMemory() {
    try {
      const stored = await AsyncStorage.getItem(MEMORY_KEY);
      if (stored) {
        setMemory(JSON.parse(stored));
      }
    } catch (e) {
      console.log("Error loading memory:", e);
    }
  }

  async function loadChatHistory() {
    try {
      const stored = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (stored && token) {
        const history = JSON.parse(stored);
        if (history.length > 1) {
          setMessages(history);
        }
      }
    } catch (e) {
      console.log("Error loading chat history:", e);
    }
  }

  async function saveMemory(newMemory: UserMemory) {
    try {
      await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(newMemory));
    } catch (e) {
      console.log("Error saving memory:", e);
    }
  }

  async function saveChatHistory(msgs: Message[]) {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs.slice(-20)));
    } catch (e) {
      console.log("Error saving chat history:", e);
    }
  }

  function openChat() {
    setIsOpen(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeChat() {
    saveChatHistory(messages);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  }

  function appendBotMessage(text: string) {
    const newMsg = {
      id: messages.length + 1,
      text,
      isBot: true,
      time: getTimeString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  async function addBotReply(userText: string, allMessages: Message[]) {
    setIsTyping(true);
    
    const memoryContext = memory.name ? `\nUser info I remember:\n- Name: ${memory.name}` : "";
    
    const quickReply = allMessages.find(m => m.isTyping);
    if (quickReply) {
      setMessages(prev => prev.filter(m => m.id !== quickReply.id));
    }

    try {
      let res;
      
      if (token) {
        res = await fetch(`${getApiUrl()}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userText,
            history: allMessages.slice(-8).map((msg) => ({
              text: msg.text,
              isBot: msg.isBot,
            })),
            memory: memoryContext,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Diary Buddy could not respond.");
        }

        appendBotMessage(data.reply);
        
        const updatedMemory = { ...memory, ...extractMemory(userText, memory) };
        if (Object.keys(updatedMemory).length > Object.keys(memory).length) {
          setMemory(updatedMemory);
          saveMemory(updatedMemory);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        appendBotMessage(`I'd love to help more personally! Please log in so I can:\n\n📖 Read your diary entries\n💭 Give better reflections\n✨ Remember things about you\n\nYour name is ${user?.name || "there"} by the way!`);
      }
    } catch (error: any) {
      appendBotMessage(
        error?.message || "I'm having trouble connecting right now. But I'm still here for you! 💪"
      );
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isSending) return;

    const userMsg = { id: messages.length + 1, text, isBot: false, time: getTimeString() };
    const nextMessages = [...messages, userMsg];
    
    setMessages(nextMessages);
    setInputText("");
    setIsSending(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    await addBotReply(text, nextMessages);
  }

  function handleQuickReply(label: string) {
    setInputText(label);
    setTimeout(() => handleSend(), 300);
  }

  function clearMemory() {
    AsyncStorage.removeItem(MEMORY_KEY);
    setMemory({});
    appendBotMessage("Okay, I've forgotten everything. Fresh start! 🌟");
  }

  const greetingTime = INITIAL_GREETING.time || getTimeString();

  return (
    <>
      <TouchableOpacity
        style={styles.fabButton}
        onPress={openChat}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#8B5CF6", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeChat}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={styles.chatContainer}>
              <View style={styles.chatHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.botAvatar}>
                    <Ionicons name="chatbubble-ellipses" size={20} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Diary Buddy</Text>
                    <Text style={styles.headerSubtitle}>Your reflection companion</Text>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  <TouchableOpacity onPress={clearMemory} style={styles.headerButton}>
                    <Ionicons name="refresh" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeChat} style={styles.headerButton}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.messagesList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}
              >
                <View style={styles.welcomeCard}>
                  <Text style={styles.welcomeTitle}>Hey {memory.name || "there"}! 👋</Text>
                  <Text style={styles.welcomeText}>
                    I'm Diary Buddy, here to help you reflect and feel better.
                  </Text>
                </View>

                {messages.map((msg) => {
                  if (msg.isTyping) {
                    return (
                      <View key={msg.id} style={styles.typingRow}>
                        <View style={styles.botAvatarSmall}>
                          <Ionicons name="chatbubble" size={14} color="#8B5CF6" />
                        </View>
                        <View style={styles.typingBubble}>
                          <ActivityIndicator size="small" color="#8B5CF6" />
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View
                      key={msg.id}
                      style={msg.isBot ? styles.botRow : styles.userRow}
                    >
                      {msg.isBot && (
                        <View style={styles.botAvatarSmall}>
                          <Ionicons name="chatbubble" size={14} color="#8B5CF6" />
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
                          {msg.time || greetingTime}
                        </Text>
                      </View>
                      {!msg.isBot && (
                        <View style={styles.userAvatarSmall}>
                          <Ionicons name="person" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  );
                })}

                {isTyping && (
                  <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>Diary Buddy is typing...</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.quickRepliesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {QUICK_REPLIES.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.quickReplyButton, { backgroundColor: item.color + "20" }]}
                      onPress={() => handleQuickReply(item.label)}
                    >
                      <Ionicons name={item.icon as any} size={14} color={item.color} />
                      <Text style={[styles.quickReplyText, { color: item.color }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type a message..."
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || isSending) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    position: "absolute",
    bottom: 85,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8B5CF6",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 6,
  },
  memoryBadgeText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeCard: {
    backgroundColor: "#F3E8FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  welcomeText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  botRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  userAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: "#F3E8FF",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#8B5CF6",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: "#1F2937",
  },
  userText: {
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  botTime: {
    color: "#9CA3AF",
  },
  userTime: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingIndicator: {
    marginBottom: 12,
  },
  typingText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  quickReplyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
});