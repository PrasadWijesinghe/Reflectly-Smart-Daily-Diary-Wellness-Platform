import { View, ActivityIndicator } from "react-native";

export default function Index() {
  // AuthProvider handles redirect to (auth)/login or (tabs) based on auth state
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
