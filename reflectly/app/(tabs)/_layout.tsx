import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import FloatingChatButton from "../../components/FloatingChatButton";
import FloatingReminderButton from "../../components/FloatingReminderButton";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: "#9CA3AF",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopWidth: 1,
            borderTopColor: theme.primarySoft,
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="diary"
          options={{
            title: "Diary",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="games"
          options={{
            href: null,
            title: "Games",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "game-controller" : "game-controller-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <FloatingReminderButton />
      <FloatingChatButton />
    </View>
  );
}
