import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import ShimmerSkeleton from './ShimmerSkeleton';

// --- Types ---
interface Word {
    text: string;
    value: number; // වචනය කියවුණු වාර ගණන
    sentiment: 'positive' | 'negative' | 'neutral'; // AI එකෙන් එන හැඟීම
    aiReason: string; // AI එකෙන් දෙන සාරාංශ හේතුව
}

interface WordCloudData {
    month: string;
    words: Word[];
    aiInsight?: string; // AI එකෙන් දෙන සාරාංශය
}

interface Props {
    selectedMonth?: string;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const WordChip: React.FC<{
    word: Word;
    fontSize: number;
    color: string;
    opacity: number;
    onPress: () => void;
}> = ({ word, fontSize, color, opacity, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => {
                scale.value = withSpring(1.08, { damping: 12, stiffness: 260 });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { damping: 12, stiffness: 260 });
            }}
            style={[{ margin: 6 }, animatedStyle]}
        >
            <Text
                style={[
                    styles.wordText,
                    {
                        fontSize,
                        color,
                        opacity,
                    },
                ]}
            >
                {word.text}
            </Text>
        </AnimatedPressable>
    );
};

const EmotionalWordCloud: React.FC<Props> = ({ selectedMonth }) => {
    const [data, setData] = useState<WordCloudData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);

    const { width } = useWindowDimensions();
    const { token } = useAuth();

    const [currentDate, setCurrentDate] = useState(() => {
        if (selectedMonth) {
            return new Date(Date.parse(selectedMonth + " 1"));
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
        const fetchCloudData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const year = currentDate.getFullYear();
                const monthNumber = currentDate.getMonth() + 1;

                const response = await fetch(`${getApiUrl()}/diary/emotional-cloud?year=${year}&month=${monthNumber}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch emotional cloud');

                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching emotional cloud:", error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCloudData();
    }, [currentDate, token]);

    // 🎨 Sentiment එක අනුව පාට දෙන Function එක
    const getColor = (sentiment: string) => {
        if (sentiment === 'positive') return '#10B981'; // Emerald Green
        if (sentiment === 'negative') return '#EF4444'; // Red
        return '#3B82F6'; // Blue (Neutral)
    };

    const displayMonthYear = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const displayMonthOnly = MONTH_NAMES[currentDate.getMonth()];

    return (
        <View style={styles.container}>
            {/* --- Header --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Emotional Word Cloud ☁️</Text>
                    <Text style={styles.subtitle}>{displayMonthYear}</Text>
                </View>

                <View style={styles.monthPicker}>
                    <TouchableOpacity style={styles.pickerBtn} onPress={goToPreviousMonth}>
                        <Text style={styles.pickerArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerText}>{displayMonthOnly}</Text>
                    <TouchableOpacity style={styles.pickerBtn} onPress={goToNextMonth}>
                        <Text style={styles.pickerArrow}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- AI Insight Box --- */}
            {!loading && data?.aiInsight && (
                <View style={styles.insightBox}>
                    <Text style={styles.insightText}>💡 {data.aiInsight}</Text>
                </View>
            )}

            {/* --- Word Cloud --- */}
            <View style={[styles.cloudContainer, { minHeight: width * 0.5 }]}>
                {loading ? (
                    <View style={styles.skeletonCloud}>
                        <View style={styles.skeletonCloudRow}>
                            <ShimmerSkeleton width={78} height={30} />
                            <ShimmerSkeleton width={96} height={26} />
                            <ShimmerSkeleton width={62} height={30} />
                        </View>
                        <View style={styles.skeletonCloudRow}>
                            <ShimmerSkeleton width={112} height={34} />
                            <ShimmerSkeleton width={74} height={28} />
                        </View>
                        <View style={styles.skeletonCloudRow}>
                            <ShimmerSkeleton width={90} height={28} />
                            <ShimmerSkeleton width={120} height={36} />
                            <ShimmerSkeleton width={66} height={26} />
                        </View>
                        <Text style={styles.skeletonCloudText}>Generating your emotional word cloud...</Text>
                    </View>
                ) : data?.words && data.words.length > 0 ? (
                    <View style={styles.wordsWrapper}>
            {data.words.map((word, i) => {
              const computedFontSize = Math.min(38, 16 + (word.value * 4));

              return (
                <WordChip
                  key={`${word.text}-${i}`}
                  word={word}
                  fontSize={computedFontSize}
                  color={getColor(word.sentiment)}
                  opacity={word.value > 1 ? 1 : 0.75}
                  onPress={async () => {
                    await Haptics.selectionAsync().catch(() => {});
                    setSelectedWord(word);
                  }}
                />
              );
            })}
          </View>
                ) : (
                    <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>No diary entries found for this month to generate a word cloud.</Text>
                )}
            </View>

            {/* --- Legend --- */}
            {data?.words && data.words.length > 0 && (
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <Text style={[styles.dot, { color: '#10B981' }]}>●</Text>
                        <Text style={styles.legendText}>Positive</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Text style={[styles.dot, { color: '#3B82F6' }]}>●</Text>
                        <Text style={styles.legendText}>Neutral</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Text style={[styles.dot, { color: '#EF4444' }]}>●</Text>
                        <Text style={styles.legendText}>Negative</Text>
                    </View>
                </View>
            )}

            {/* --- Bottom Sheet Modal (Details View) --- */}
            <Modal visible={!!selectedWord} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackgroundTouchable}
                        activeOpacity={1}
                        onPress={() => setSelectedWord(null)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />

                        {/* තෝරගත්ත වචනය ලොකුවට */}
                        <Text style={[styles.modalLargeText, { color: selectedWord ? getColor(selectedWord.sentiment) : '#000' }]}>
                            {selectedWord?.text}
                        </Text>

                        <Text style={styles.modalSubText}>
                            Found in <Text style={{ fontWeight: 'bold', color: '#111' }}>{selectedWord?.value}</Text> entries
                        </Text>

                        {/* --- Analysis Section --- */}
                        {selectedWord?.aiReason && (
                            <View style={styles.analysisBox}>
                                <Text style={styles.analysisLabel}>ANALYSIS SECTION</Text>
                                <Text style={styles.analysisReasonText}>{selectedWord.aiReason}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => {
                                const wordToSearch = selectedWord?.text;
                                setSelectedWord(null);

                                // 💡 වෙනස: Keyword එකට අමතරව year සහ month එකත් යවනවා
                                router.push({
                                    pathname: '/DiaryListScreen',
                                    params: { 
                                      searchKeyword: wordToSearch,
                                      filterYear: currentDate.getFullYear(),
                                      filterMonth: currentDate.getMonth() + 1 
                                    }
                                });
                            }}
                        >
                            <Text style={styles.actionBtnText}>
                                See All Entries with “{selectedWord?.text}”
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginVertical: 10,
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
        minWidth: 45,
        textAlign: 'center',
    },
    insightBox: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    insightText: {
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
    cloudContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    wordsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10, // 💡 වචන අතර පරතරය ටිකක් හැදුවා ලස්සනට විසිරෙන්න
    },
    wordText: {
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    skeletonCloud: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    skeletonCloudRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    skeletonCloudText: {
        marginTop: 6,
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        fontSize: 14,
    },
    legendText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalBackgroundTouchable: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        alignItems: 'center',
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 24,
    },
    modalLargeText: {
        fontSize: 48,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubText: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 25,
    },
    analysisBox: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    analysisLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 8,
    },
    analysisReasonText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    actionBtn: {
        width: '100%',
        backgroundColor: '#111827',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EmotionalWordCloud;
