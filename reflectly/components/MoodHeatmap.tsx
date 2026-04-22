import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, useWindowDimensions, ActivityIndicator, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';

interface HeatmapDay {
  dayOfWeek: number;
  moodScore: number;
  moodEmoji: string;
  date: string;
  shortEntry: string;
}

interface MonthlyHeatmapData {
  month: string;
  heatmap: HeatmapDay[];
  stats: {
    greenDays: number;
    redDays: number;
    avgMood: number;
  };
}

interface Props {
  selectedMonth?: string;
}

const getMoodLabel = (score: number) => {
  if (score >= 80) return 'Awesome ✨';
  if (score >= 60) return 'Good 🙂';
  if (score >= 40) return 'Neutral 😐';
  if (score >= 20) return 'Stressed 😟';
  return 'Sad 😫';
};

const getNoteBgColor = (score: number) => {
  if (score >= 60) return '#ECFDF5'; 
  if (score >= 40) return '#FFFBEB'; 
  return '#FEF2F2'; 
};

const getMoodColor = (score: number) => {
  if (score < 0) return '#F3F4F6'; 
  if (score >= 80) return '#10B981'; 
  if (score >= 60) return '#34D399'; 
  if (score >= 40) return '#FBBF24'; 
  if (score >= 20) return '#FB923C'; 
  return '#EF4444'; 
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HeatmapCell: React.FC<{
  day: HeatmapDay | null;
  size: number;
  onPress: () => void;
}> = ({ day, size, onPress }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const isActive = !!day && day.moodScore !== -1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <AnimatedPressable
      disabled={!isActive}
      onPress={onPress}
      onPressIn={() => {
        if (!isActive) return;
        scale.value = withSpring(1.08, { damping: 12, stiffness: 260 });
        translateY.value = withSpring(-2, { damping: 12, stiffness: 260 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 260 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 260 });
      }}
      style={[
        styles.cell,
        isActive && styles.cellFilled,
        animatedStyle,
        {
          backgroundColor: day ? getMoodColor(day.moodScore) : 'transparent',
          width: size,
          height: size,
        },
      ]}
    >
      <Text style={styles.cellEmoji}>{day && isActive ? day.moodEmoji : ''}</Text>
    </AnimatedPressable>
  );
};

const MonthlyMoodHeatmap: React.FC<Props> = ({ selectedMonth }) => {
  const [data, setData] = useState<MonthlyHeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const { width } = useWindowDimensions();
  const { token } = useAuth();

  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedMonth) {
      // Assuming selectedMonth might be "April 2026"
      const parts = selectedMonth.split(' ');
      if (parts.length === 2) {
        const m = MONTH_NAMES.indexOf(parts[0]);
        if (m !== -1) return new Date(parseInt(parts[1]), m, 1);
      }
    }
    return new Date();
  });

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const monthNumber = currentDate.getMonth() + 1;

        const res = await fetch(`${getApiUrl()}/diary/monthly-moods?year=${year}&month=${monthNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok) {
          const heatmap: HeatmapDay[] = [];
          let greenDays = 0;
          let redDays = 0;
          let totalScore = 0;
          let entryCount = 0;

          const daysInMonth = new Date(year, monthNumber, 0).getDate();

          for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(monthNumber).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const entry = result.moods.find((m: any) => m.date === dateStr);

            if (entry) {
              if (entry.moodScore >= 60) greenDays++;
              if (entry.moodScore <= 20) redDays++;
              totalScore += entry.moodScore;
              entryCount++;

              heatmap.push({
                dayOfWeek: new Date(dateStr).getDay(),
                moodScore: entry.moodScore,
                moodEmoji: entry.moodEmoji || '🙂',
                date: dateStr,
                shortEntry: entry.summary || "No summary available.",
              });
            } else {
              heatmap.push({
                dayOfWeek: new Date(dateStr).getDay(),
                moodScore: -1,
                moodEmoji: '',
                date: dateStr,
                shortEntry: '',
              });
            }
          }

          setData({
            month: `${MONTH_NAMES[currentDate.getMonth()]} ${year}`,
            heatmap,
            stats: {
              greenDays,
              redDays,
              avgMood: entryCount > 0 ? Math.round(totalScore / entryCount) : 0
            }
          });
        }
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [currentDate, token]);

  const buildGrid = () => {
    if (!data || !data.heatmap || data.heatmap.length === 0) return [];
    const grid: (HeatmapDay | null)[][] = [];
    let week: (HeatmapDay | null)[] = [];

    const firstDay = data.heatmap[0];
    for (let i = 0; i < firstDay.dayOfWeek; i++) {
        week.push(null);
    }

    data.heatmap.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      grid.push(week);
    }
    return grid;
  };

  const grid = buildGrid();
  const SQUARE_SIZE = (width - 76) / 7;

  const displayMonthYear = data?.month || `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  const displayMonthOnly = MONTH_NAMES[currentDate.getMonth()];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Monthly Consistency 🗓️</Text>
          <Text style={styles.subtitle}>{displayMonthYear}</Text>
        </View>

        <View style={styles.monthPicker}>
          <TouchableOpacity style={styles.pickerBtn} onPress={goToPreviousMonth}>
            <Text style={styles.pickerArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pickerText}>{displayMonthOnly.substring(0, 3)}</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={goToNextMonth}>
            <Text style={styles.pickerArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#9CA3AF" />
          <Text style={styles.loadingText}>Loading {displayMonthOnly} data...</Text>
        </View>
      ) : (
        <>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Happy</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#FBBF24' }]} />
              <Text style={styles.legendText}>Neutral</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Stress</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.dayLabels}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={[styles.dayLabel, { width: SQUARE_SIZE }]}>{d}</Text>
              ))}
            </View>
            {grid.map((week, wIdx) => (
              <View key={wIdx} style={styles.weekRow}>
                {week.map((day, dIdx) => (
                  <HeatmapCell
                    key={dIdx}
                    day={day}
                    size={SQUARE_SIZE}
                    onPress={async () => {
                      if (!day || day.moodScore === -1) return;
                      await Haptics.selectionAsync().catch(() => {});
                      setSelectedDay(day);
                    }}
                  />
                ))}
              </View>
            ))}
          </View>

          {data && data.stats && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: '#059669' }]}>{data.stats.greenDays}</Text>
                <Text style={styles.statLabel}>Green Days 🔥</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.statNum, { color: '#DC2626' }]}>{data.stats.redDays}</Text>
                <Text style={styles.statLabel}>Red Days 😟</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.statNum, { color: '#374151' }]}>{data.stats.avgMood}</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
            </View>
          )}
        </>
      )}

      <Modal visible={!!selectedDay} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalEmoji}>{selectedDay?.moodEmoji}</Text>
            <Text style={styles.modalDate}>{selectedDay?.date}</Text>
            <Text style={styles.modalScore}>
              Mood Score: {selectedDay?.moodScore}/100 ({selectedDay && getMoodLabel(selectedDay.moodScore)})
            </Text>

            <View style={[
              styles.modalNoteContainer, 
              { backgroundColor: selectedDay ? getNoteBgColor(selectedDay.moodScore) : '#F9FAFB' }
            ]}>
              <Text style={styles.modalNoteLabel}>WHAT YOU WROTE</Text>
              <Text style={styles.modalNoteText} numberOfLines={3}>{selectedDay?.shortEntry}</Text>
              
              <TouchableOpacity style={styles.readMoreBtn} onPress={() => { /* Navigate to Full Entry Page */ }}>
                <Text style={styles.readMoreText}>Read Full Entry 📖</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setSelectedDay(null)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pickerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickerArrow: {
    fontSize: 16,
    color: '#374151',
    fontWeight: 'bold',
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 40,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  gridContainer: {
    gap: 6,
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cellEmoji: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: '40%',
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalScore: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  modalNoteContainer: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)', 
  },
  modalNoteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalNoteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#3B82F6', 
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    width: '100%',
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MonthlyMoodHeatmap;
