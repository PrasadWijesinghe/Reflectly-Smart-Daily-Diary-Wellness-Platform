import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Modal, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export type Video = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  youtubeId: string;
  category: string;
  views: string;
  duration: string;
};

export const VIDEOS: Video[] = [
  { id: "asmr1", title: "Satisfying ASMR Clay Crunching", channel: "ASMR Time", thumbnail: "https://i.ytimg.com/vi/K4W展Q5Yqzk/mqdefault.jpg", youtubeId: "K4W展Q5Yqzk", category: "asmr", views: "2.5M", duration: "15:32" },
  { id: "asmr2", title: "100 Layer Squishy Cake ASMR", channel: "Dancing Bear", thumbnail: "https://i.ytimg.com/vi/s5hLhQ3YsGk/mqdefault.jpg", youtubeId: "s5hLhQ3YsGk", category: "asmr", views: "5.2M", duration: "20:15" },
  { id: "asmr3", title: "Satisfying Soap Cutting", channel: "Mr. L tranch", thumbnail: "https://i.ytimg.com/vi/13KxT5q4YsGk/mqdefault.jpg", youtubeId: "13KxT5q4YsGk", category: "asmr", views: "7.2M", duration: "12:28" },
  { id: "asmr4", title: "Giant Soap ASMR Unboxing", channel: "ASMR Glow", thumbnail: "https://i.ytimg.com/vi/19KxT5q4YsGk/mqdefault.jpg", youtubeId: "19KxT5q4YsGk", category: "asmr", views: "6.3M", duration: "25:45" },
  { id: "asmr5", title: "Microwave Slime ASMR", channel: "Slime Soda", thumbnail: "https://i.ytimg.com/vi/26KxT5q4YsGk/mqdefault.jpg", youtubeId: "26KxT5q4YsGk", category: "asmr", views: "8.5M", duration: "35:00" },
  { id: "asmr6", title: "Fire Kinetic Sand ASMR", channel: "SATISFYING LAB", thumbnail: "https://i.ytimg.com/vi/27KxT5q4YsGk/mqdefault.jpg", youtubeId: "27KxT5q4YsGk", category: "asmr", views: "4.1M", duration: "18:22" },
  { id: "asmr7", title: "Butter Slime ASMR Crunch", channel: "Smart Cookie", thumbnail: "https://i.ytimg.com/vi/28KxT5q4YsGk/mqdefault.jpg", youtubeId: "28KxT5q4YsGk", category: "asmr", views: "3.8M", duration: "22:10" },
  { id: "asmr8", title: "Jelly Cube Cut ASMR", channel: "Mr. Beanc", thumbnail: "https://i.ytimg.com/vi/29KxT5q4YsGk/mqdefault.jpg", youtubeId: "29KxT5q4YsGk", category: "asmr", views: "9.2M", duration: "15:48" },

  { id: "sleep1", title: "8 Hours Rain Sounds for Sleep", channel: "Nature Relaxation", thumbnail: "https://i.ytimg.com/vi/s5hLhQ3YsGk/mqdefault.jpg", youtubeId: "s5hLhQ3YsGk", category: "sleep", views: "12M", duration: "8:00:00" },
  { id: "sleep2", title: "Deep Sleep 10 Hours", channel: "Calm Wave", thumbnail: "https://i.ytimg.com/vi/30KxT5q4YsGk/mqdefault.jpg", youtubeId: "30KxT5q4YsGk", category: "sleep", views: "8.5M", duration: "10:00:00" },
  { id: "sleep3", title: "Rain &Thunderstorm Sleep", channel: "Sleep Sounds", thumbnail: "https://i.ytimg.com/vi/31KxT5q4YsGk/mqdefault.jpg", youtubeId: "31KxT5q4YsGk", category: "sleep", views: "6.2M", duration: "6:00:00" },
  { id: "sleep4", title: "White Noise for Sleep", channel: "Dream Sound", thumbnail: "https://i.ytimg.com/vi/32KxT5q4YsGk/mqdefault.jpg", youtubeId: "32KxT5q4YsGk", category: "sleep", views: "4.8M", duration: "12:00:00" },
  { id: "sleep5", title: "Deep Sleep Music 432Hz", channel: "Healing Mind", thumbnail: "https://i.ytimg.com/vi/33KxT5q4YsGk/mqdefault.jpg", youtubeId: "33KxT5q4YsGk", category: "sleep", views: "7.1M", duration: "9:00:00" },
  { id: "sleep6", title: "Rain on Tent Sleep", channel: "Nature Vision", thumbnail: "https://i.ytimg.com/vi/34KxT5q4YsGk/mqdefault.jpg", youtubeId: "34KxT5q4YsGk", category: "sleep", views: "5.9M", duration: "8:00:00" },

  { id: "calm1", title: "Calm Piano for Relaxation", channel: "Relaxing Music", thumbnail: "https://i.ytimg.com/vi/35KxT5q4YsGk/mqdefault.jpg", youtubeId: "35KxT5q4YsGk", category: "calm", views: "15M", duration: "60:00" },
  { id: "calm2", title: "Ambient Music for Focus", channel: "Chill Hop", thumbnail: "https://i.ytimg.com/vi/36KxT5q4YsGk/mqdefault.jpg", youtubeId: "36KxT5q4YsGk", category: "calm", views: "8.3M", duration: "120:00" },
  { id: "calm3", title: "Peaceful Meditation Music", channel: "Zen Garden", thumbnail: "https://i.ytimg.com/vi/37KxT5q4YsGk/mqdefault.jpg", youtubeId: "37KxT5q4YsGk", category: "calm", views: "4.2M", duration: "45:00" },
  { id: "calm4", title: "Relaxing Acoustic Guitar", channel: "Guitar Dreams", thumbnail: "https://i.ytimg.com/vi/38KxT5q4YsGk/mqdefault.jpg", youtubeId: "38KxT5q4YsGk", category: "calm", views: "6.7M", duration: "55:00" },
  { id: "calm5", title: "Soft Jazz for Work", channel: "Smooth Jazz", thumbnail: "https://i.ytimg.com/vi/39KxT5q4YsGk/mqdefault.jpg", youtubeId: "39KxT5q4YsGk", category: "calm", views: "3.4M", duration: "180:00" },
  { id: "calm6", title: "Healing Frequencies 528Hz", channel: "Wellness Sound", thumbnail: "https://i.ytimg.com/vi/40KxT5q4YsGk/mqdefault.jpg", youtubeId: "40KxT5q4YsGk", category: "calm", views: "5.1M", duration: "90:00" },

  { id: "nature1", title: "Ocean Waves 10 Hours", channel: "Nature Sounds", thumbnail: "https://i.ytimg.com/vi/41KxT5q4YsGk/mqdefault.jpg", youtubeId: "41KxT5q4YsGk", category: "nature", views: "9.8M", duration: "10:00:00" },
  { id: "nature2", title: "Rain on Roof Sounds", channel: "Relaxing Rain", thumbnail: "https://i.ytimg.com/vi/42KxT5q4YsGk/mqdefault.jpg", youtubeId: "42KxT5q4YsGk", category: "nature", views: "7.5M", duration: "8:00:00" },
  { id: "nature3", title: "Forest Birds Ambience", channel: "Wild Nature", thumbnail: "https://i.ytimg.com/vi/43KxT5q4YsGk/mqdefault.jpg", youtubeId: "43KxT5q4YsGk", category: "nature", views: "4.2M", duration: "6:00:00" },
  { id: "nature4", title: "River Stream Sounds", channel: "Water World", thumbnail: "https://i.ytimg.com/vi/44KxT5q4YsGk/mqdefault.jpg", youtubeId: "44KxT5q4YsGk", category: "nature", views: "3.9M", duration: "5:00:00" },
  { id: "nature5", title: "Thunderstorm with Rain", channel: "Storm Chasers", thumbnail: "https://i.ytimg.com/vi/45KxT5q4YsGk/mqdefault.jpg", youtubeId: "45KxT5q4YsGk", category: "nature", views: "6.1M", duration: "4:00:00" },
  { id: "nature6", title: "Wind through Trees", channel: "Nature Pure", thumbnail: "https://i.ytimg.com/vi/46KxT5q4YsGk/mqdefault.jpg", youtubeId: "46KxT5q4YsGk", category: "nature", views: "2.8M", duration: "7:00:00" },

  { id: "meditation1", title: "Morning Meditation Guide", channel: "Mindful Life", thumbnail: "https://i.ytimg.com/vi/47KxT5q4YsGk/mqdefault.jpg", youtubeId: "47KxT5q4YsGk", category: "meditation", views: "8.2M", duration: "15:00" },
  { id: "meditation2", title: "10 Minute Body Scan", channel: "Meditation Studio", thumbnail: "https://i.ytimg.com/vi/48KxT5q4YsGk/mqdefault.jpg", youtubeId: "48KxT5q4YsGk", category: "meditation", views: "5.6M", duration: "10:00" },
  { id: "meditation3", title: "Stress Relief Meditation", channel: "Inner Peace", thumbnail: "https://i.ytimg.com/vi/49KxT5q4YsGk/mqdefault.jpg", youtubeId: "49KxT5q4YsGk", category: "meditation", views: "12M", duration: "20:00" },
  { id: "meditation4", title: "Sleep Meditation 4-7-8", channel: "Breathe Well", thumbnail: "https://i.ytimg.com/vi/50KxT5q4YsGk/mqdefault.jpg", youtubeId: "50KxT5q4YsGk", category: "meditation", views: "9.4M", duration: "12:00" },
  { id: "meditation5", title: "Anxiety Relief Session", channel: "Calm Mind", thumbnail: "https://i.ytimg.com/vi/51KxT5q4YsGk/mqdefault.jpg", youtubeId: "51KxT5q4YsGk", category: "meditation", views: "7.8M", duration: "18:00" },
  { id: "meditation6", title: "Gratitude Meditation", channel: "Happy Heart", thumbnail: "https://i.ytimg.com/vi/52KxT5q4YsGk/mqdefault.jpg", youtubeId: "52KxT5q4YsGk", category: "meditation", views: "4.1M", duration: "8:00" },

  { id: "yoga1", title: "Morning Yoga Flow 20 min", channel: "Yoga With Adriene", thumbnail: "https://i.ytimg.com/vi/53KxT5q4YsGk/mqdefault.jpg", youtubeId: "53KxT5q4YsGk", category: "yoga", views: "18M", duration: "20:00" },
  { id: "yoga2", title: "Yoga for Stress Relief", channel: "Fightmaster Yoga", thumbnail: "https://i.ytimg.com/vi/54KxT5q4YsGk/mqdefault.jpg", youtubeId: "54KxT5q4YsGk", category: "yoga", views: "6.5M", duration: "30:00" },
  { id: "yoga3", title: "Bedtime Yoga Stretch", channel: "Yoga Night", thumbnail: "https://i.ytimg.com/vi/55KxT5q4YsGk/mqdefault.jpg", youtubeId: "55KxT5q4YsGk", category: "yoga", views: "9.2M", duration: "15:00" },
  { id: "yoga4", title: "Quick Desk Yoga", channel: "Office Yoga", thumbnail: "https://i.ytimg.com/vi/56KxT5q4YsGk/mqdefault.jpg", youtubeId: "56KxT5q4YsGk", category: "yoga", views: "4.8M", duration: "10:00" },
  { id: "yoga5", title: "Beginner Yoga Tutorial", channel: "Easy Yoga", thumbnail: "https://i.ytimg.com/vi/57KxT5q4YsGk/mqdefault.jpg", youtubeId: "57KxT5q4YsGk", category: "yoga", views: "25M", duration: "45:00" },
  { id: "yoga6", title: "Power Yoga Workout", channel: "Fit Yoga", thumbnail: "https://i.ytimg.com/vi/58KxT5q4YsGk/mqdefault.jpg", youtubeId: "58KxT5q4YsGk", category: "yoga", views: "3.2M", duration: "40:00" },

  { id: "fitness1", title: "10 Min Morning Stretch", channel: "FitnessBlender", thumbnail: "https://i.ytimg.com/vi/59KxT5q4YsGk/mqdefault.jpg", youtubeId: "59KxT5q4YsGk", category: "fitness", views: "22M", duration: "10:00" },
  { id: "fitness2", title: "Full Body Workout No Equipment", channel: "POPSUGAR", thumbnail: "https://i.ytimg.com/vi/60KxT5q4YsGk/mqdefault.jpg", youtubeId: "60KxT5q4YsGk", category: "fitness", views: "15M", duration: "30:00" },
  { id: "fitness3", title: "Relaxing Stretching Routine", channel: "Mindful Movement", thumbnail: "https://i.ytimg.com/vi/61KxT5q4YsGk/mqdefault.jpg", youtubeId: "61KxT5q4YsGk", category: "fitness", views: "8.7M", duration: "20:00" },
  { id: "fitness4", title: "Quick Abs Workout", channel: "Six Pack Shortcuts", thumbnail: "https://i.ytimg.com/vi/62KxT5q4YsGk/mqdefault.jpg", youtubeId: "62KxT5q4YsGk", category: "fitness", views: "11M", duration: "15:00" },
  { id: "fitness5", title: "Evening Walk Exercise", channel: "Walk at Home", thumbnail: "https://i.ytimg.com/vi/63KxT5q4YsGk/mqdefault.jpg", youtubeId: "63KxT5q4YsGk", category: "fitness", views: "7.3M", duration: "25:00" },

  { id: "cars1", title: "Lamborghini Huracan Sound", channel: "Supercar Blast", thumbnail: "https://i.ytimg.com/vi/8JzT5q4YsGk/mqdefault.jpg", youtubeId: "8JzT5q4YsGk", category: "cars", views: "1.2M", duration: "8:24" },
  { id: "cars2", title: "Ferrari 488 Pista Accelerations", channel: "TheStradman", thumbnail: "https://i.ytimg.com/vi/9KxT5q4YsGk/mqdefault.jpg", youtubeId: "9KxT5q4YsGk", category: "cars", views: "3.8M", duration: "12:15" },
  { id: "cars3", title: "Porsche 911 GT3 RS Review", channel: "TopGear", thumbnail: "https://i.ytimg.com/vi/8KxT5q4YsGk/mqdefault.jpg", youtubeId: "8KxT5q4YsGk", category: "cars", views: "2.1M", duration: "18:45" },
  { id: "cars4", title: "McLaren P1 Soundtest", channel: "Haynor", thumbnail: "https://i.ytimg.com/vi/12KxT5q4YsGk/mqdefault.jpg", youtubeId: "12KxT5q4YsGk", category: "cars", views: "1.8M", duration: "6:42" },
  { id: "cars5", title: "Ferrari SF90 Stradale", channel: "Doug DeMuro", thumbnail: "https://i.ytimg.com/vi/17KxT5q4YsGk/mqdefault.jpg", youtubeId: "17KxT5q4YsGk", category: "cars", views: "2.9M", duration: "22:10" },
  { id: "cars6", title: "BMW M4 Competition", channel: "Racingpoint", thumbnail: "https://i.ytimg.com/vi/21KxT5q4YsGk/mqdefault.jpg", youtubeId: "21KxT5q4YsGk", category: "cars", views: "1.5M", duration: "10:33" },

  { id: "gaming1", title: "Top 10 Gaming Moments 2024", channel: "GameSpot", thumbnail: "https://i.ytimg.com/vi/2KxT5q4YsGk/mqdefault.jpg", youtubeId: "2KxT5q4YsGk", category: "gaming", views: "4.3M", duration: "22:18" },
  { id: "gaming2", title: "Minecraft Survival Episode 1", channel: "PewDiePie", thumbnail: "https://i.ytimg.com/vi/7KxT5q4YsGk/mqdefault.jpg", youtubeId: "7KxT5q4YsGk", category: "gaming", views: "20M", duration: "45:00" },
  { id: "gaming3", title: "Call of Duty Gameplay", channel: "JackFrags", thumbnail: "https://i.ytimg.com/vi/11KxT5q4YsGk/mqdefault.jpg", youtubeId: "11KxT5q4YsGk", category: "gaming", views: "5.6M", duration: "28:33" },
  { id: "gaming4", title: "Apex Legends Gameplay", channel: "Shroud", thumbnail: "https://i.ytimg.com/vi/20KxT5q4YsGk/mqdefault.jpg", youtubeId: "20KxT5q4YsGk", category: "gaming", views: "4.8M", duration: "35:42" },

  { id: "movies1", title: "Box Office Movie Highlights", channel: "MovieClips", thumbnail: "https://i.ytimg.com/vi/1KxT5q4YsGk/mqdefault.jpg", youtubeId: "1KxT5q4YsGk", category: "movies", views: "8.1M", duration: "18:42" },
  { id: "movies2", title: "New Movie Trailers 2024", channel: "Fandor", thumbnail: "https://i.ytimg.com/vi/14KxT5q4YsGk/mqdefault.jpg", youtubeId: "14KxT5q4YsGk", category: "movies", views: "4.1M", duration: "16:45" },
  { id: "movies3", title: "Horror Movie Scenes", channel: "Screen Rant", thumbnail: "https://i.ytimg.com/vi/22KxT5q4YsGk/mqdefault.jpg", youtubeId: "22KxT5q4YsGk", category: "movies", views: "3.2M", duration: "18:55" },

  { id: "music1", title: "Best Indian Classical Music", channel: "Shankar Mahadevan", thumbnail: "https://i.ytimg.com/vi/3KxT5q4YsGk/mqdefault.jpg", youtubeId: "3KxT5q4YsGk", category: "music", views: "12M", duration: "45:00" },
  { id: "music2", title: "Bollywood Mashup 2024", channel: "T-Series", thumbnail: "https://i.ytimg.com/vi/6KxT5q4YsGk/mqdefault.jpg", youtubeId: "6KxT5q4YsGk", category: "music", views: "15M", duration: "35:22" },
  { id: "music3", title: "Tamil Melodies Collection", channel: "Aditya Music", thumbnail: "https://i.ytimg.com/vi/9KxT5q4YsGk/mqdefault.jpg", youtubeId: "9KxT5q4YsGk", category: "music", views: "8.9M", duration: "55:12" },
  { id: "music4", title: "Sinhala Old Songs Mix", channel: "eTunes", thumbnail: "https://i.ytimg.com/vi/10KxT5q4YsGk/mqdefault.jpg", youtubeId: "10KxT5q4YsGk", category: "music", views: "3.4M", duration: "40:15" },
  { id: "music5", title: "Lofi Hip Hop Mix", channel: "ChilledCow", thumbnail: "https://i.ytimg.com/vi/24KxT5q4YsGk/mqdefault.jpg", youtubeId: "24KxT5q4YsGk", category: "music", views: "25M", duration: "120:00" },
  { id: "music6", title: "Relaxing Jazz Piano", channel: "BGM channel", thumbnail: "https://i.ytimg.com/vi/16KxT5q4YsGk/mqdefault.jpg", youtubeId: "16KxT5q4YsGk", category: "music", views: "3.7M", duration: "60:00" },

  { id: "sports1", title: "NBA Best Dunks 2024", channel: "NBA", thumbnail: "https://i.ytimg.com/vi/4KxT5q4YsGk/mqdefault.jpg", youtubeId: "4KxT5q4YsGk", category: "sports", views: "6.7M", duration: "14:55" },
  { id: "sports2", title: "Cricket Best Moments", channel: "ICC", thumbnail: "https://i.ytimg.com/vi/5KxT5q4YsGk/mqdefault.jpg", youtubeId: "5KxT5q4YsGk", category: "sports", views: "9.2M", duration: "20:33" },
  { id: "sports3", title: "Football Best Goals", channel: "Premier League", thumbnail: "https://i.ytimg.com/vi/15KxT5q4YsGk/mqdefault.jpg", youtubeId: "15KxT5q4YsGk", category: "sports", views: "11M", duration: "25:18" },
  { id: "sports4", title: "Cricket IPL Highlights", channel: "Star Sports", thumbnail: "https://i.ytimg.com/vi/23KxT5q4YsGk/mqdefault.jpg", youtubeId: "23KxT5q4YsGk", category: "sports", views: "14M", duration: "30:45" },

  { id: "animals1", title: "Cute Animals Compilation", channel: "The Dodo", thumbnail: "https://i.ytimg.com/vi/18KxT5q4YsGk/mqdefault.jpg", youtubeId: "18KxT5q4YsGk", category: "animals", views: "18M", duration: "15:25" },
];

export const CATEGORIES = [
  { id: "all", name: "All", icon: "grid", color: "#FF0000" },
  { id: "asmr", name: "ASMR", icon: "volume-high", color: "#F59E0B" },
  { id: "sleep", name: "Sleep", icon: "moon", color: "#6366F1" },
  { id: "calm", name: "Calm", icon: "leaf", color: "#10B981" },
  { id: "nature", name: "Nature", icon: "water", color: "#14B8A6" },
  { id: "meditation", name: "Meditation", icon: "infinite", color: "#8B5CF6" },
  { id: "yoga", name: "Yoga", icon: "body", color: "#EC4899" },
  { id: "fitness", name: "Fitness", icon: "fitness", color: "#EF4444" },
  { id: "cars", name: "Cars", icon: "car-sport", color: "#F97316" },
  { id: "gaming", name: "Gaming", icon: "game-controller", color: "#22C55E" },
  { id: "movies", name: "Movies", icon: "film", color: "#EAB308" },
  { id: "music", name: "Music", icon: "musical-notes", color: "#06B6D4" },
  { id: "sports", name: "Sports", icon: "football", color: "#DC2626" },
  { id: "animals", name: "Animals", icon: "paw", color: "#84CC16" },
];

export default function VideosScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filteredVideos = useMemo(() => {
    return VIDEOS.filter((video) => {
      const matchesSearch = 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleVideoPress = (video: Video) => {
    setSelectedVideo(video);
  };

  const openYouTube = (video: Video) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${video.youtubeId}`);
    setSelectedVideo(null);
  };

  const renderVideoItem = ({ item }: { item: Video }) => {
    const isSelected = selectedVideo?.id === item.id;
    const categoryColor = CATEGORIES.find(c => c.id === item.category)?.color || "#FF0000";

    return (
      <TouchableOpacity
        style={[styles.videoCard, isSelected && { borderColor: categoryColor, borderWidth: 2 }]}
        onPress={() => handleVideoPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.videoMetaRow}>
            <Text style={styles.videoChannel}>{item.channel}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.videoMeta}>{item.views} views</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF0000", "#E50000", "#CC0000"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="logo-youtube" size={28} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Videos</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
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

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && { backgroundColor: cat.color },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={16} 
                color={selectedCategory === cat.id ? "#FFFFFF" : cat.color} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultCount}>{filteredVideos.length} videos</Text>
      </View>

      <FlatList
        data={filteredVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.videoList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />

      <Modal visible={!!selectedVideo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVideo && (
              <>
                <TouchableOpacity onPress={() => setSelectedVideo(null)} style={styles.modalClose}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Image source={{ uri: selectedVideo.thumbnail }} style={styles.modalThumbnail} />
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedVideo.title}</Text>
                  <Text style={styles.modalChannel}>{selectedVideo.channel}</Text>
                  <Text style={styles.modalMeta}>{selectedVideo.views} views • {selectedVideo.duration}</Text>
                </View>

                <TouchableOpacity style={styles.watchButton} onPress={() => openYouTube(selectedVideo)}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                  <Text style={styles.watchButtonText}>Watch on YouTube</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  header: { paddingTop: 54, paddingBottom: 16, paddingHorizontal: 16 },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitleContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#1F1F1F", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#FFFFFF" },
  categoriesWrapper: { paddingTop: 16 },
  categoriesContainer: { paddingHorizontal: 16, gap: 10 },
  categoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: "#1F1F1F", gap: 6 },
  categoryChipText: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
  categoryChipTextActive: { color: "#FFFFFF" },
  resultsRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  resultCount: { fontSize: 13, color: "#6B7280" },
  videoList: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { justifyContent: "space-between" },
  videoCard: { width: "48%", backgroundColor: "#1F1F1F", borderRadius: 16, marginBottom: 16, overflow: "hidden" },
  thumbnailContainer: { position: "relative" },
  thumbnail: { width: "100%", height: 110, backgroundColor: "#2A2A2A" },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  playButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  durationBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.85)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  durationText: { fontSize: 11, color: "#FFFFFF", fontWeight: "600" },
  videoInfo: { padding: 12 },
  videoTitle: { fontSize: 14, fontWeight: "600", color: "#FFFFFF", lineHeight: 20 },
  videoMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  videoChannel: { fontSize: 12, color: "#9CA3AF" },
  dot: { fontSize: 12, color: "#6B7280", marginHorizontal: 4 },
  videoMeta: { fontSize: 12, color: "#6B7280" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", maxWidth: 380, backgroundColor: "#1F1F1F", borderRadius: 24, overflow: "hidden" },
  modalClose: { position: "absolute", top: 16, right: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  modalThumbnail: { width: "100%", height: 220, backgroundColor: "#2A2A2A" },
  modalInfo: { padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", lineHeight: 24 },
  modalChannel: { fontSize: 14, color: "#9CA3AF", marginTop: 8 },
  modalMeta: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  watchButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FF0000", paddingVertical: 16, gap: 10 },
  watchButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});