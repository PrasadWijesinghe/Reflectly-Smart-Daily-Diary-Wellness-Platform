import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";

type Props = {
  visible: boolean;
  durationMs?: number;
};

const COLORS = ["#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6", "#F97316"];

export default function ConfettiDrop({ visible, durationMs = 2600 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const pieces = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => {
      const left = ((index * 13) % 100) / 100;
      const size = 6 + (index % 3) * 2;
      const xShift = (index % 2 === 0 ? 1 : -1) * (18 + (index % 5) * 6);
      const drop = 260 + (index % 6) * 42;
      const rotation = (index % 2 === 0 ? 1 : -1) * (180 + (index % 5) * 60);
      return {
        key: `confetti-${index}`,
        left: `${Math.min(96, Math.max(2, left * 100))}%`,
        size,
        xShift,
        drop,
        rotation,
        color: COLORS[index % COLORS.length],
        delay: index * 35,
      };
    });
  }, []);

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [durationMs, progress, visible]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {pieces.map((piece) => {
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, piece.drop],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, piece.xShift],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${piece.rotation}deg`],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.08, 0.9, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={piece.key}
            style={[
              styles.piece,
              {
                left: piece.left,
                width: piece.size,
                height: piece.size * 1.7,
                backgroundColor: piece.color,
                opacity,
                transform: [
                  { translateY },
                  { translateX },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
      <View style={[styles.widthGuard, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },
  piece: {
    position: "absolute",
    top: -20,
    borderRadius: 999,
  },
  widthGuard: {
    height: 1,
    opacity: 0,
  },
});
