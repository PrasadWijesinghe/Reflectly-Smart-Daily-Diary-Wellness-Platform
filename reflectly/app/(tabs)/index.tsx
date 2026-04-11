import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../utils/api";

type MoodTrendDay = {
  date: string;
  day: string;
  filled: boolean;
  mood: string | null;
  emoji: string | null;
  color: string;
};

const STRESS_LEVEL = 65;
const SUGGESTIONS = [
  { icon: "game-controller-outline" as const, title: "Play a quick game", subtitle: "Reduce stress with fun mini-games", color: "#3B82F6" },
  { icon: "time-outline" as const, title: "Take a 5-min break", subtitle: "Short breaks boost productivity", color: "#F59E0B" },
  { icon: "walk-outline" as const, title: "Go for a short walk", subtitle: "Fresh air clears your mind", color: "#8B5CF6" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [weekMoods, setWeekMoods] = useState<MoodTrendDay[]>([]);
  const [isLoadingWeekMoods, setIsLoadingWeekMoods] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    async function loadWeekMoods() {
      if (!token) {
        setWeekMoods([]);
        setIsLoadingWeekMoods(false);
        return;
      }

      try {
        const res = await fetch(`${getApiUrl()}/diary/mood-trend?days=7`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load mood trend.");
        setWeekMoods(Array.isArray(data.days) ? data.days : []);
      } catch (error) {
        console.error("Failed to load weekly vibe:", error);
        setWeekMoods([]);
      } finally {
        setIsLoadingWeekMoods(false);
      }
    }

    loadWeekMoods();
  }, [token]);

  const vibeLabel = weekMoods.some((day) => day.filled) ? "Live" : "No data";

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ backgroundColor: "#3B82F6", paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/80 text-sm">{getGreeting()} 🌤️</Text>
              <Text className="text-white text-2xl font-bold mt-1">Hi, {firstName}! 👋</Text>
              <Text className="text-white/70 text-sm mt-1">How are you feeling today?</Text>
            </View>
            <TouchableOpacity className="bg-white/20 rounded-full p-2">
              <Ionicons name="happy-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View className="bg-white/15 rounded-2xl mt-5 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text className="text-white font-semibold text-sm ml-1.5">This Week&apos;s Vibe</Text>
              </View>
              <View className="bg-white/25 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">{vibeLabel}</Text>
              </View>
            </View>

            {isLoadingWeekMoods ? (
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : (
              <View className="flex-row justify-between">
                {weekMoods.map((day) => (
                  <View key={day.date} className="items-center">
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: day.filled ? day.color : "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
                      {day.filled && <Text style={{ fontSize: 14 }}>{day.emoji}</Text>}
                    </View>
                    <Text className="text-white/70 text-xs mt-1">{day.day}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className="px-5 -mt-0 pt-5">
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center">
                <Text className="text-base font-bold text-gray-800">Stress Check</Text>
                <Text className="ml-1.5">😊</Text>
              </View>
              <TouchableOpacity className="bg-blue-50 rounded-full p-2">
                <Ionicons name="heart-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-xs mb-4">Let&apos;s keep an eye on this!</Text>

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-gray-500">Chill 😎</Text>
              <Text className="text-xs font-bold text-blue-500">{STRESS_LEVEL} %</Text>
              <Text className="text-xs text-gray-500">Stressed 😰</Text>
            </View>

            <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <View style={{ height: "100%", width: `${STRESS_LEVEL}%`, borderRadius: 999, backgroundColor: "#3B82F6" }} />
            </View>

            <View className="bg-blue-50 rounded-xl py-2.5 px-4">
              <Text className="text-blue-600 text-xs text-center font-medium">Moderate stress, maybe try a game? 🎮</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85} className="mb-4" onPress={() => router.push("/(tabs)/games")}>
            <View style={{ backgroundColor: "#2563EB", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View className="flex-row items-center flex-1">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Ionicons name="game-controller" size={22} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Feeling stressed?</Text>
                  <Text className="text-white/80 text-xs mt-0.5">Play fun games to relax! 🎯</Text>
                </View>
              </View>
              <View className="bg-white/20 rounded-full p-2">
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} className="mb-4" onPress={() => router.push("/music")}>
            <View style={{ backgroundColor: "#8B5CF6", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View className="flex-row items-center flex-1">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Ionicons name="musical-notes" size={22} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Hear Some Music</Text>
                  <Text className="text-white/80 text-xs mt-0.5">Relax with calming tunes 🎵</Text>
                </View>
              </View>
              <View className="bg-white/20 rounded-full p-2">
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-start">
            <View className="bg-yellow-50 rounded-full p-2 mr-3">
              <Ionicons name="bulb-outline" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-gray-800 text-sm">Weekly Insight</Text>
                <Text className="ml-1.5">✨</Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1 leading-5">
                This week seems busy with deadlines. Remember to take breaks and be kind to yourself! 🧘
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Text className="mr-1.5">✨</Text>
              <Text className="font-bold text-gray-800 text-base">Suggestions for You</Text>
            </View>
            {SUGGESTIONS.map((item, index) => (
              <TouchableOpacity key={index} activeOpacity={0.7} className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center" onPress={item.title === "Play a quick game" ? () => router.push("/(tabs)/games") : undefined}>
                <View style={{ backgroundColor: `${item.color}15`, borderRadius: 12, padding: 10, marginRight: 12 }}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800 text-sm">{item.title}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
