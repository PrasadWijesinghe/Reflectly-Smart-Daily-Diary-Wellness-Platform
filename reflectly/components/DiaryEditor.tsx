import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { getApiUrl } from "../utils/api";
import ConfirmModal from "./ConfirmModal";

type RecordingState = "idle" | "recording" | "processing";
type Tag = { id: number; name: string; icon: string; color: string };
type DiaryEntry = { id: number; date: string; content: string; summary: string; tags: Tag[] };

type Props = {
  entry?: DiaryEntry | null;
  date: string;
  tags: Tag[];
  token: string | null;
  onSave: () => void;
  onCancel: () => void;
};

export default function DiaryEditor({ entry, date, tags, token, onSave, onCancel }: Props) {
  const [diaryText, setDiaryText] = useState(entry?.content || "");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(entry?.tags.map((t) => t.id) || []);
  const [saving, setSaving] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const recording = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSave = async () => {
    if (!diaryText.trim()) return Alert.alert("Empty Entry", "Please write something before saving.");
    if (!token) return Alert.alert("Error", "You must be logged in to save entries.");

    if (entry) {
      setShowUpdateModal(true);
    } else {
      await saveEntry();
    }
  };

  const saveEntry = async () => {
    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const url = entry ? `${getApiUrl()}/diary/${entry.id}` : `${getApiUrl()}/diary`;
      const method = entry ? "PUT" : "POST";
      const body: any = { content: diaryText, tagIds: selectedTagIds };
      if (!entry) body.date = date;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err.error || "Failed to save entry");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave();
    } catch (err: any) {
      console.error("Save entry error:", err);
      Alert.alert("Error", err.message || "Could not save entry.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Microphone permission is needed to record your voice.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recording.current = rec;
      setRecordingState("recording");
      setRecordingDuration(0);
      startPulseAnimation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      durationInterval.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      stopPulseAnimation();
      setRecordingState("processing");
      await recording.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.current.getURI();
      recording.current = null;
      if (!uri) return Alert.alert("Error", "No recording found.");

      const formData = new FormData();
      formData.append("audio", { uri, name: "recording.m4a", type: "audio/m4a" } as any);
      const res = await fetch(`${getApiUrl()}/transcribe`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Transcription failed");
      }

      const data = await res.json();
      const newText = data.text ? data.text.trim() : "";
      if (newText) {
        setDiaryText((prev) => (prev ? `${prev} ${newText}` : newText));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      Alert.alert("Transcription Failed", err.message || "Could not transcribe audio. Please try again.");
    } finally {
      stopPulseAnimation();
      setRecordingState("idle");
    }
  };

  const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return (
    <View>
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={{ fontSize: 18 }}>✍️</Text>
          <Text style={styles.entryHeaderText}>{entry ? "Edit your entry" : "What’s on your mind?"}</Text>
          <View style={{ flex: 1 }} />
          {entry && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.voiceButton, recordingState === "recording" && styles.voiceButtonRecording, recordingState === "processing" && styles.voiceButtonProcessing]}
            onPress={() => (recordingState === "idle" ? startRecording() : stopRecording())}
            disabled={recordingState === "processing"}
          >
            {recordingState === "processing" ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : recordingState === "recording" ? (
              <Animated.View style={[styles.voiceButtonInner, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.stopIcon} />
              </Animated.View>
            ) : (
              <Ionicons name="mic" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {recordingState === "recording" && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording {formatDuration(recordingDuration)}</Text>
          </View>
        )}
        {recordingState === "processing" && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.processingText}>Transcribing...</Text>
          </View>
        )}

        <TextInput
          style={styles.textInput}
          placeholder="Write your thoughts here... How was your day? What made you smile? What challenged you?"
          placeholderTextColor="#9CA3AF"
          multiline
          value={diaryText}
          onChangeText={setDiaryText}
          textAlignVertical="top"
        />

        <View style={styles.entryFooter}>
          <Text style={styles.charCount}>📝 {diaryText.length} characters</Text>
          <Text style={styles.timeStamp}>🕐 {timeString}</Text>
        </View>
      </View>

      <View style={styles.tagSection}>
        <View style={styles.tagHeader}>
          <Text style={{ fontSize: 14 }}>✨</Text>
          <Text style={styles.tagHeaderText}>Tag your entry</Text>
        </View>
        <View style={styles.tagRow}>
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagChip, isSelected && { backgroundColor: `${tag.color}20`, borderColor: tag.color }]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text style={{ fontSize: 13 }}>{tag.icon}</Text>
                <Text style={[styles.tagChipText, isSelected && { color: tag.color }]}>{tag.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={handleSave} disabled={saving} style={styles.saveButtonContainer}>
        <View style={[styles.saveButton, saving && { opacity: 0.7 }]}>
          {saving ? <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} /> : <Ionicons name="save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />}
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : entry ? "Update Entry" : "Save Entry"}</Text>
        </View>
      </TouchableOpacity>

      <ConfirmModal
        visible={showUpdateModal}
        type="update"
        onConfirm={saveEntry}
        onCancel={() => setShowUpdateModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  entryCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginTop: 14, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  entryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  entryHeaderText: { fontSize: 15, fontWeight: "600", color: "#EF4444", marginLeft: 8 },
  cancelBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  voiceButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#3B82F6", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  voiceButtonRecording: { backgroundColor: "#EF4444" },
  voiceButtonProcessing: { backgroundColor: "#9CA3AF" },
  voiceButtonInner: { alignItems: "center", justifyContent: "center" },
  stopIcon: { width: 10, height: 10, borderRadius: 2, backgroundColor: "#FFFFFF" },
  recordingIndicator: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingHorizontal: 4 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", marginRight: 6 },
  recordingText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },
  processingText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
  textInput: { minHeight: 120, fontSize: 14, color: "#374151", lineHeight: 22, padding: 0 },
  entryFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  charCount: { fontSize: 12, color: "#9CA3AF" },
  timeStamp: { fontSize: 12, color: "#9CA3AF" },
  tagSection: { marginTop: 14 },
  tagHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  tagHeaderText: { fontSize: 15, fontWeight: "600", color: "#1F2937", marginLeft: 6 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E5E7EB", gap: 6 },
  tagChipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  saveButtonContainer: { marginTop: 18 },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 16, backgroundColor: "#3B82F6" },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
