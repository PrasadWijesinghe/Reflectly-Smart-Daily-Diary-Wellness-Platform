import React, { useState } from "react";
import { DeviceEventEmitter, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiUrl, getImageUrl } from "../utils/api";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ConfirmModal from "./ConfirmModal";
import { DIARY_UPDATED_EVENT } from "../utils/notifications";
import ImageThumbnailStrip from "./ImageThumbnailStrip";
import FullscreenImageViewer from "./FullscreenImageViewer";

type Tag = {
  id: number;
  name: string;
  icon: string;
  color: string;
};

type DiaryImage = {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  order: number;
  url: string;
};

type DiaryEntry = {
  id: number;
  date: string;
  content: string;
  summary: string;
  tags: Tag[];
  images: DiaryImage[];
};

const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatFullDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
}

type Props = {
  entry: DiaryEntry;
  token: string | null;
  onEdit: () => void;
  onDelete: () => void;
};

export default function DiaryCard({ entry, token, onEdit, onDelete }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const res = await fetch(`${getApiUrl()}/diary/${entry.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      DeviceEventEmitter.emit(DIARY_UPDATED_EVENT);
      onDelete();
    } catch (err: any) {
      console.error("Delete error:", err);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateLabel}>Your Entry</Text>
            <Text style={styles.dateText}>{formatFullDate(entry.date)}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
              <Ionicons name="pencil" size={18} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              style={styles.actionBtn}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.content}>{entry.content}</Text>

        {entry.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {entry.tags.map((tag) => (
              <View
                key={tag.id}
                style={[styles.tag, { backgroundColor: tag.color }]}
              >
                <Text style={styles.tagText}>
                  {tag.icon} {tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {entry.images && entry.images.length > 0 && (
          <ImageThumbnailStrip
            images={entry.images}
            editMode={false}
            onPress={(index) => {
              setViewerIndex(index);
              setViewerVisible(true);
            }}
          />
        )}
      </View>

      {entry.images && entry.images.length > 0 && (
        <FullscreenImageViewer
          visible={viewerVisible}
          images={entry.images.map((img) => getImageUrl(img.url))}
          initialIndex={viewerIndex}
          onClose={() => setViewerVisible(false)}
        />
      )}

      <ConfirmModal
        visible={showDeleteModal}
        type="delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
