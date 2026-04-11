import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { Song, SONGS } from "../data/music";

type MusicPlayerProps = {
  visible: boolean;
  onClose: () => void;
};

export function MusicPlayer({ visible, onClose }: MusicPlayerProps) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [playlist, setPlaylist] = useState(SONGS);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSong = async (song: Song) => {
    try {
      setIsLoading(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setCurrentSong(song);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.log("Error playing song:", error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      playNext();
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const playNext = () => {
    if (!currentSong) return;
    const idx = playlist.findIndex(s => s.id === currentSong.id);
    if (idx < playlist.length - 1) {
      playSong(playlist[idx + 1]);
    }
  };

  const playPrevious = () => {
    if (!currentSong) return;
    const idx = playlist.findIndex(s => s.id === currentSong.id);
    if (idx > 0) {
      playSong(playlist[idx - 1]);
    }
  };

  const seekTo = async (positionMs: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(positionMs);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <LinearGradient colors={["#8B5CF6", "#6D28D9", "#4C1D95"]} style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hear Some Music</Text>
          <View style={{ width: 28 }} />
        </LinearGradient>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <View style={{ flex: 1, height: 40 }} />
          </View>
        </View>

        <View style={styles.songList}>
          {playlist.map((song) => (
            <TouchableOpacity
              key={song.id}
              style={[styles.songItem, currentSong?.id === song.id && styles.songItemActive]}
              onPress={() => playSong(song)}
            >
              <Image source={{ uri: song.artwork }} style={styles.artwork} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist}</Text>
              </View>
              {currentSong?.id === song.id && isPlaying && (
                <Ionicons name="volume-high" size={20} color="#8B5CF6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {currentSong && (
          <View style={styles.miniPlayer}>
            <TouchableOpacity 
              style={styles.miniPlayerContent}
              onPress={() => setShowFullPlayer(true)}
            >
              <Image source={{ uri: currentSong.artwork }} style={styles.miniArtwork} />
              <View style={styles.miniInfo}>
                <Text style={styles.miniTitle}>{currentSong.title}</Text>
                <Text style={styles.miniArtist}>{currentSong.artist}</Text>
              </View>
              <View style={styles.miniControls}>
                <TouchableOpacity onPress={togglePlayPause} style={styles.miniButton}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={playNext} style={styles.miniButton}>
                  <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={showFullPlayer} animationType="slide">
          <View style={styles.fullScreenContainer}>
            <LinearGradient colors={["#8B5CF6", "#6D28D9", "#4C1D95"]} style={styles.fullGradient}>
              <TouchableOpacity 
                onPress={() => setShowFullPlayer(false)}
                style={styles.minimizeBtn}
              >
                <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <Image source={{ uri: currentSong?.artwork }} style={styles.fullArtwork} />

              <View style={styles.fullSongInfo}>
                <Text style={styles.fullTitle}>{currentSong?.title}</Text>
                <Text style={styles.fullArtist}>{currentSong?.artist}</Text>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.playerControls}>
                <TouchableOpacity onPress={playPrevious}>
                  <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={playNext}>
                  <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  songList: { flex: 1, paddingHorizontal: 20 },
  songItem: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 10 },
  songItemActive: { backgroundColor: "#F3E8FF", borderWidth: 1, borderColor: "#8B5CF6" },
  artwork: { width: 50, height: 50, borderRadius: 8 },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  songArtist: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  miniPlayer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#8B5CF6", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 34 },
  miniPlayerContent: { flexDirection: "row", alignItems: "center" },
  miniArtwork: { width: 48, height: 48, borderRadius: 8 },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  miniArtist: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  miniControls: { flexDirection: "row", gap: 8 },
  miniButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  fullScreenContainer: { flex: 1 },
  fullGradient: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  minimizeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 30 },
  fullArtwork: { width: 280, height: 280, borderRadius: 20, alignSelf: "center", marginBottom: 20 },
  fullSongInfo: { alignItems: "center", marginBottom: 20 },
  fullTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },
  fullArtist: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 8 },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 3 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  timeText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  playerControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 40 },
  playBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});