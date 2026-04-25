import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import DiaryStateLottie from '../components/DiaryStateLottie';

export default function DiaryListScreen() {
  const router = useRouter();
  // 💡 වෙනස 1: අලුත් Params ටික ගන්නවා
  const { searchKeyword, filterYear, filterMonth } = useLocalSearchParams<{ searchKeyword: string, filterYear?: string, filterMonth?: string }>();
  const keyword = searchKeyword || '';
  const { token } = useAuth();

  const [allDiaries, setAllDiaries] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Backend එකෙන් ඇත්තම ඩයරි ටික ගන්නවා
  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/diary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setAllDiaries(Array.isArray(data) ? data : (data.entries || []));
      } catch (error) {
        console.error("Error fetching diaries:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDiaries();
  }, [token]);

  // 💡 වෙනස 2: Keyword එකෙන් සහ මාසෙන් ෆිල්ටර් කරනවා
  useEffect(() => {
    if (keyword && allDiaries.length > 0) {
      const lowerCaseQuery = keyword.toLowerCase();
      
      const filtered = allDiaries.filter(diary => {
        // 1. වචනේ තියෙනවද බලනවා
        const contentMatch = diary.content?.toLowerCase().includes(lowerCaseQuery);
        const summaryMatch = diary.summary?.toLowerCase().includes(lowerCaseQuery);
        const titleMatch = diary.title?.toLowerCase().includes(lowerCaseQuery);
        const hasKeyword = contentMatch || summaryMatch || titleMatch;

        // 2. අදාළ මාසෙද බලනවා (Word Cloud එකෙන් ආවොත් විතරයි මේක බලන්නේ)
        let isCorrectMonth = true;
        if (filterYear && filterMonth && diary.date) {
          const dDate = new Date(diary.date);
          const dYear = dDate.getFullYear();
          const dMonth = dDate.getMonth() + 1;
          
          isCorrectMonth = (dYear === parseInt(filterYear)) && (dMonth === parseInt(filterMonth));
        }

        return hasKeyword && isCorrectMonth;
      });
      
      setFilteredData(filtered);
    } else {
      setFilteredData(allDiaries);
    }
  }, [keyword, allDiaries, filterYear, filterMonth]);

  const getMoodColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#34D399'; 
    if (score >= 40) return '#F59E0B'; // Orange/Yellow
    if (score >= 20) return '#EF4444'; // Red
    return '#DC2626'; // Dark Red
  };

  const renderItem = ({ item }: { item: any }) => {
    const moodColor = getMoodColor(item.moodScore || 50);
    const entryDate = new Date(item.date);
    const day = String(entryDate.getDate());
    const month = entryDate.toLocaleString('en-US', { month: 'short' });
    
    return (
      <TouchableOpacity activeOpacity={0.8} style={[styles.card, { borderLeftColor: moodColor }]}>
        <View style={styles.cardMain}>
          <Text style={styles.cardTitle}>{item.summary || 'No summary'}</Text>
          <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag: any, index: number) => (
                <View key={index} style={[styles.tagBadge, { backgroundColor: (tag.color || '#3B82F6') + '15' }]}>
                  <Text style={styles.tagIcon}>{tag.icon || '🏷️'}</Text>
                  <Text style={[styles.tagText, { color: tag.color || '#3B82F6' }]}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.cardDateSection}>
          <Text style={[styles.dateDay, { color: moodColor }]}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtered Results</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Info Banner */}
      <View style={styles.filterBanner}>
        <Text style={styles.filterText}>
          Showing entries containing: <Text style={styles.filterHighlight}>"{keyword}"</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <DiaryStateLottie
            variant="loading"
            title="Loading entries"
            subtitle="We are fetching your diary entries."
            size={180}
            tone="blue"
          />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <DiaryStateLottie
                variant="empty"
                title="No entries found"
                subtitle={`We could not find any diary entries for "${keyword}". Try another keyword or write a new note.`}
                size={220}
                tone="amber"
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/diary")}
                style={styles.emptyCta}
              >
                <Text style={styles.emptyCtaText}>Write your first diary</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  // Header Styles matching your image
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    backgroundColor: '#2563EB', // The blue color from your app
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0 
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  calendarBtn: { backgroundColor: 'rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  calendarIcon: { color: '#FFF', fontSize: 16 },
  
  filterBanner: { backgroundColor: '#DBEAFE', padding: 12, alignItems: 'center' },
  filterText: { color: '#1E3A8A', fontSize: 14 },
  filterHighlight: { fontWeight: 'bold', fontSize: 15 },
  
  listContent: { padding: 16, paddingBottom: 40 },
  
  // Card Styles matching your image
  card: { 
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, 
    marginBottom: 16, padding: 16, borderLeftWidth: 6,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  cardMain: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  cardContent: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 12 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagIcon: { fontSize: 10, marginRight: 4 },
  tagText: { fontSize: 11, fontWeight: '700' },
  
  cardDateSection: { alignItems: 'center', justifyContent: 'center', minWidth: 40 },
  dateDay: { fontSize: 26, fontWeight: '900' },
  dateMonth: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: -4 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: '#6B7280' },
  emptyCta: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
