import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Mock data for the week's mood
const WEEK_MOODS: Record<string, { color: string; filled: boolean }> = {
  Mon: { color: "#FCD34D", filled: true },
  Tue: { color: "#F87171", filled: true },
  Wed: { color: "#34D399", filled: true },
  Thu: { color: "#60A5FA", filled: true },
  Fri: { color: "#C084FC", filled: false },
  Sat: { color: "#9CA3AF", filled: false },
  Sun: { color: "#9CA3AF", filled: false },
};

const STRESS_LEVEL = 65;

const SUGGESTIONS = [
  {
    icon: "game-controller-outline" as const,
    title: "Play a quick game",
    subtitle: "Reduce stress with fun mini-games",
    color: "#3B82F6",
  },
  {
    icon: "time-outline" as const,
    title: "Take a 5-min break",
    subtitle: "Short breaks boost productivity",
    color: "#F59E0B",
  },
  {
    icon: "walk-outline" as const,
    title: "Go for a short walk",
    subtitle: "Fresh air clears your mind",
    color: "#8B5CF6",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* ── Header ── */}
        <View
          style={{
            backgroundColor: "#3B82F6",
            paddingTop: 56,
            paddingBottom: 24,
            paddingHorizontal: 20,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/80 text-sm">
                {getGreeting()} 🌅
              </Text>
              <Text className="text-white text-2xl font-bold mt-1">
                Hi, Alex! 👋
              </Text>
              <Text className="text-white/70 text-sm mt-1">
                How are you feeling today?
              </Text>
            </View>
            <TouchableOpacity className="bg-white/20 rounded-full p-2">
              <Ionicons name="happy-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* ── This Week's Vibe ── */}
          <View className="bg-white/15 rounded-2xl mt-5 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text className="text-white font-semibold text-sm ml-1.5">
                  This Week's Vibe
                </Text>
              </View>
              <View className="bg-white/25 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">
                  Moderate
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              {DAYS.map((day) => {
                const mood = WEEK_MOODS[day];
                return (
                  <View key={day} className="items-center">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: mood.filled
                          ? mood.color
                          : "rgba(255,255,255,0.2)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {mood.filled && (
                        <Text style={{ fontSize: 14 }}>
                          {day === "Mon"
                            ? "😊"
                            : day === "Tue"
                            ? "😔"
                            : day === "Wed"
                            ? "😄"
                            : "😐"}
                        </Text>
                      )}
                    </View>
                    <Text className="text-white/70 text-xs mt-1">{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Content ── */}
        <View className="px-5 -mt-0 pt-5">
          {/* ── Stress Check Card ── */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center">
                <Text className="text-base font-bold text-gray-800">
                  Stress Check
                </Text>
                <Text className="ml-1.5">😊</Text>
              </View>
              <TouchableOpacity className="bg-blue-50 rounded-full p-2">
                <Ionicons name="heart-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-xs mb-4">
              Let's keep an eye on this!
            </Text>

            {/* Stress bar labels */}
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-gray-500">Chill 😎</Text>
              <Text className="text-xs font-bold text-blue-500">
                {STRESS_LEVEL} %
              </Text>
              <Text className="text-xs text-gray-500">Stressed 😰</Text>
            </View>

            {/* Stress bar */}
            <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <View
                style={{
                  height: "100%",
                  width: `${STRESS_LEVEL}%`,
                  borderRadius: 999,
                  backgroundColor: "#3B82F6",
                }}
              />
            </View>

            <View className="bg-blue-50 rounded-xl py-2.5 px-4">
              <Text className="text-blue-600 text-xs text-center font-medium">
                Moderate stress — maybe try a game? 🎮
              </Text>
            </View>
          </View>

          {/* ── Feeling Stressed Banner ── */}
          <TouchableOpacity activeOpacity={0.85} className="mb-4">
            <View
              style={{
                backgroundColor: "#2563EB",
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Ionicons
                    name="game-controller"
                    size={22}
                    color="white"
                  />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">
                    Feeling stressed?
                  </Text>
                  <Text className="text-white/80 text-xs mt-0.5">
                    Play fun games to relax! 🎯
                  </Text>
                </View>
              </View>
              <View className="bg-white/20 rounded-full p-2">
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          {/* ── Weekly Insight ── */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-start">
            <View className="bg-yellow-50 rounded-full p-2 mr-3">
              <Ionicons name="bulb-outline" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-gray-800 text-sm">
                  Weekly Insight
                </Text>
                <Text className="ml-1.5">✨</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1 leading-5">
                This week seems busy with deadlines. Remember to take breaks and
                be kind to yourself! 🧘
              </Text>
            </View>
          </View>

          {/* ── Suggestions for You ── */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Text className="mr-1.5">✨</Text>
              <Text className="font-bold text-gray-800 text-base">
                Suggestions for You
              </Text>
            </View>

            {SUGGESTIONS.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center"
              >
                <View
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderRadius: 12,
                    padding: 10,
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800 text-sm">
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Floating Chatbot Icon ── */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          position: "absolute",
          bottom: 24,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#2563EB",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}
