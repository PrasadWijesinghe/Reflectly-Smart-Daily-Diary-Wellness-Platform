import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import FloatingChatButton from "../../components/FloatingChatButton";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
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
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#DBEAFE" : "transparent",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: "Diary",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#DBEAFE" : "transparent",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
            >
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="games"
        options={{
          title: "Games",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#DBEAFE" : "transparent",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
            >
              <Ionicons
                name={focused ? "game-controller" : "game-controller-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#DBEAFE" : "transparent",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
            >
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#DBEAFE" : "transparent",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
              }}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
    <FloatingChatButton />
    </View>
  );
}
