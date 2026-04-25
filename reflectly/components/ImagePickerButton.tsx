import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type ImagePickerButtonProps = {
  onImagesSelected: (uris: string[]) => void;
  maxImages: number;
  disabled?: boolean;
};

export default function ImagePickerButton({
  onImagesSelected,
  maxImages,
  disabled = false,
}: ImagePickerButtonProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isDisabled = disabled || maxImages === 0;

  const openSheet = () => {
    setSheetVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 320,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetVisible(false);
      if (cb) setTimeout(cb, 150);
    });
  };

  const handleCamera = () => {
    closeSheet(async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'Enable camera access in Settings to take photos.',
          [{ text: 'OK' }],
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        onImagesSelected(result.assets.map((a) => a.uri));
      }
    });
  };

  const handleGallery = () => {
    closeSheet(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Access Required',
          'Enable photo library access in Settings to choose photos.',
          [{ text: 'OK' }],
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        onImagesSelected(result.assets.map((a) => a.uri));
      }
    });
  };

  return (
    <>
      {/* Trigger button */}
      <Pressable
        onPress={isDisabled ? undefined : openSheet}
        disabled={isDisabled}
        className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
          isDisabled
            ? 'border-white/10 bg-white/5'
            : 'border-amber-500/40 bg-amber-500/10 active:bg-amber-500/20'
        }`}
      >
        <Ionicons
          name="camera-outline"
          size={18}
          color={isDisabled ? 'rgba(255,255,255,0.25)' : '#f59e0b'}
        />
        <Text
          className={`text-sm font-medium ${
            isDisabled ? 'text-white/25' : 'text-amber-400'
          }`}
        >
          Add Photo
        </Text>
        {!isDisabled && maxImages > 0 && (
          <View className="ml-0.5 w-4 h-4 rounded-full bg-amber-500/30 items-center justify-center">
            <Text className="text-amber-300 text-[10px] font-bold leading-none">
              {maxImages}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Bottom sheet modal */}
      <Modal
        transparent
        visible={sheetVisible}
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => closeSheet()}
      >
        {/* Scrim */}
        <TouchableWithoutFeedback onPress={() => closeSheet()}>
          <Animated.View
            style={{ opacity: fadeAnim, flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl pb-10 pt-2 px-4 border-t border-white/10"
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-white/20 self-center mb-6" />

          {/* Section label */}
          <Text className="text-white/40 text-[11px] font-semibold tracking-widest uppercase mb-3 px-1">
            Add Photo
          </Text>

          {/* Take Photo */}
          <Pressable
            onPress={handleCamera}
            className="flex-row items-center gap-4 px-4 py-4 rounded-2xl mb-2 bg-white/5 active:bg-white/10"
          >
            <View className="w-10 h-10 rounded-full bg-amber-500/15 items-center justify-center">
              <Ionicons name="camera" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">Take Photo</Text>
              <Text className="text-white/40 text-xs mt-0.5">Use your camera</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
          </Pressable>

          {/* Choose from Gallery */}
          <Pressable
            onPress={handleGallery}
            className="flex-row items-center gap-4 px-4 py-4 rounded-2xl mb-4 bg-white/5 active:bg-white/10"
          >
            <View className="w-10 h-10 rounded-full bg-sky-500/15 items-center justify-center">
              <Ionicons name="images-outline" size={20} color="#38bdf8" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">Choose from Gallery</Text>
              <Text className="text-white/40 text-xs mt-0.5">
                Up to {maxImages} photo{maxImages !== 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
          </Pressable>

          {/* Cancel */}
          <Pressable
            onPress={() => closeSheet()}
            className="items-center py-4 rounded-2xl bg-white/5 active:bg-white/10"
          >
            <Text className="text-rose-400 text-base font-semibold">Cancel</Text>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}
