import React from 'react';
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import { getImageUrl } from '../utils/api';

type DiaryImage = {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  order: number;
  url: string;
};

type ImageThumbnailStripProps = {
  images: DiaryImage[];
  pendingUris?: string[];
  editMode?: boolean;
  onRemoveSaved?: (id: number) => void;
  onRemovePending?: (index: number) => void;
  onPress?: (index: number, source: 'saved' | 'pending') => void;
};

const THUMB_SIZE = 72;

export default function ImageThumbnailStrip({
  images,
  pendingUris = [],
  editMode = false,
  onRemoveSaved,
  onRemovePending,
  onPress,
}: ImageThumbnailStripProps) {
  if (images.length === 0 && pendingUris.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {images.map((image, index) => (
        <View key={`saved-${image.id}`} style={styles.thumbWrapper}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onPress?.(index, 'saved')}
            style={styles.thumbTouch}
          >
            <Image
              source={{ uri: getImageUrl(image.url) }}
              style={styles.thumb}
              resizeMode="cover"
            />
          </TouchableOpacity>
          {editMode && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemoveSaved?.(image.id)}
              hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {pendingUris.map((uri, index) => (
        <View key={`pending-${index}`} style={styles.thumbWrapper}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onPress?.(index, 'pending')}
            style={styles.thumbTouch}
          >
            <Image
              source={{ uri }}
              style={styles.thumb}
              resizeMode="cover"
            />
          </TouchableOpacity>
          {editMode && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemovePending?.(index)}
              hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrapper: {
    position: 'relative',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumbTouch: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4A3728',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(180, 150, 120, 0.25)',
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E53E3E',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
