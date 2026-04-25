import { Stack } from "expo-router";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider } from "../context/AuthContext";
import { MusicProvider, useMusic } from "../context/MusicContext";
import { useRouter } from "expo-router";
import AppLockGate from "../components/AppLockGate";
import { ThemeProvider } from "../context/ThemeContext";
import "./global.css";

function GlobalMiniPlayer() {
  const router = useRouter();
  const { currentSong, isPlaying, togglePlayPause, nextSong, stopSong } = useMusic();

  if (!currentSong) {
    return null;
  }

  const handleClose = () => {
    console.log("Closing player, currentSong was:", currentSong?.title);
    stopSong();
  };

  return (
    <View style={styles.miniPlayerWrapper}>
      <TouchableOpacity
        style={styles.miniPlayer}
        onPress={() => router.push("/music")}
        activeOpacity={0.9}
      >
        <Image source={{ uri: currentSong.artwork }} style={styles.miniArtwork} />
        <View style={styles.miniInfo}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.miniArtist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <View style={styles.miniControls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.miniButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextSong} style={styles.miniButton}>
            <Ionicons name="play-skip-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MusicProvider>
          <>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="viewall-diary" />
              <Stack.Screen name="music" />
            </Stack>
            <GlobalMiniPlayer />
            <AppLockGate />
          </>
        </MusicProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  miniPlayerWrapper: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
  },
  miniPlayer: {
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  miniArtwork: { width: 44, height: 44, borderRadius: 8 },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  miniArtist: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  miniControls: { flexDirection: "row", gap: 8 },
  miniButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
});
