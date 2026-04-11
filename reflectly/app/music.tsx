import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMusic } from "../context/MusicContext";
import { Song, LANGUAGES, GENRES, SONGS } from "../data/music";

export default function MusicScreen() {
  const router = useRouter();
  const { currentSong, isPlaying, isLoading, playSong, togglePlayPause, nextSong, previousSong, position, duration, isFullScreen, setIsFullScreen } = useMusic();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const filteredSongs = useMemo(() => {
    return SONGS.filter((song) => {
      const matchesSearch = 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = selectedLanguage === "all" || song.language === selectedLanguage;
      const matchesGenre = selectedGenre === "all" || song.genre === selectedGenre;
      
      return matchesSearch && matchesLanguage && matchesGenre;
    });
  }, [searchQuery, selectedLanguage, selectedGenre]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const renderSongItem = ({ item }: { item: Song }) => {
    const isCurrentSong = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentSong && styles.songItemActive]}
        onPress={() => {
          playSong(item);
          setIsFullScreen(true);
        }}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.artwork }} style={styles.artwork} />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isCurrentSong && styles.songTitleActive]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        {isCurrentSong && isPlaying && (
          <Ionicons name="volume-high" size={20} color="#8B5CF6" />
        )}
      </TouchableOpacity>
    );
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#8B5CF6", "#6D28D9", "#4C1D95"]} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hear Some Music</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Language</Text>
        <View style={styles.filterOptions}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.filterButton, selectedLanguage === lang && styles.filterButtonActive]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text style={[styles.filterText, selectedLanguage === lang && styles.filterTextActive]}>
                {lang === "all" ? "All" : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Genre</Text>
        <View style={styles.filterOptions}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[styles.filterButton, selectedGenre === genre && styles.filterButtonActive]}
              onPress={() => setSelectedGenre(genre)}
            >
              <Text style={[styles.filterText, selectedGenre === genre && styles.filterTextActive]}>
                {genre === "all" ? "All" : genre.charAt(0).toUpperCase() + genre.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.resultCount}>{filteredSongs.length} songs found</Text>

      <FlatList
        data={filteredSongs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.songList}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={isFullScreen && !!currentSong} animationType="slide">
        <View style={styles.fullScreenContainer}>
          <LinearGradient colors={["#8B5CF6", "#6D28D9", "#4C1D95"]} style={styles.fullGradient}>
            <TouchableOpacity onPress={() => setIsFullScreen(false)} style={styles.minimizeBtn}>
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
              <TouchableOpacity onPress={previousSong}>
                <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextSong}>
                <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#1F2937" },
  filterContainer: { paddingHorizontal: 20, paddingBottom: 8 },
  filterLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 8, textTransform: "uppercase" },
  filterOptions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#E5E7EB" },
  filterButtonActive: { backgroundColor: "#8B5CF6" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterTextActive: { color: "#FFFFFF" },
  resultCount: { paddingHorizontal: 20, paddingVertical: 8, fontSize: 13, color: "#6B7280" },
  songList: { paddingHorizontal: 20, paddingBottom: 120 },
  songItem: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 10 },
  songItemActive: { backgroundColor: "#F3E8FF", borderWidth: 1, borderColor: "#8B5CF6" },
  artwork: { width: 50, height: 50, borderRadius: 8 },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  songTitleActive: { color: "#8B5CF6" },
  songArtist: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  
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