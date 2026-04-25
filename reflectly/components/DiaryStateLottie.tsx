import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";

type Variant = "loading" | "thinking" | "empty" | "success";

type Props = {
  variant: Variant;
  title: string;
  subtitle: string;
  size?: number;
  showText?: boolean;
  tone?: "blue" | "emerald" | "amber";
};

const animations = {
  loading: require("../assets/animations/loading-dots.json"),
  thinking: require("../assets/animations/loading-dots.json"),
  empty: require("../assets/animations/empty-diary.json"),
  success: require("../assets/animations/insights-ready.json"),
};

const toneStyles = {
  blue: {
    frame: "#EFF6FF",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
    accent: "#2563EB",
  },
  emerald: {
    frame: "#ECFDF5",
    badgeBg: "#D1FAE5",
    badgeText: "#047857",
    accent: "#10B981",
  },
  amber: {
    frame: "#FFFBEB",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
    accent: "#F59E0B",
  },
} as const;

let LottieView: any = null;

if (Platform.OS !== "web") {
  try {
    LottieView = eval("require")("lottie-react-native").default;
  } catch (error) {
    console.warn("[DiaryStateLottie] lottie-react-native is not installed yet.", error);
  }
}

export default function DiaryStateLottie({
  variant,
  title,
  subtitle,
  size = 220,
  showText = true,
  tone = variant === "loading" ? "blue" : "emerald",
}: Props) {
  const colors = toneStyles[tone];
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const badgeLabel =
    variant === "loading" || variant === "thinking"
      ? "Brain Thinking"
      : variant === "success"
        ? "Insights Ready"
        : "All caught up";

  useEffect(() => {
    if (variant !== "empty") return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [floatAnim, pulseAnim, variant]);

  if (variant === "empty") {
    const floatY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });
    const iconScale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });
    const dotScale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.25],
    });

    return (
      <View style={styles.container}>
        <View style={styles.emptyFrameFlat}>
          <Animated.View
            style={[
              styles.emptyIconWrapFlat,
              {
                borderColor: `${colors.accent}22`,
                backgroundColor: `${colors.badgeBg}AA`,
                transform: [{ translateY: floatY }, { scale: iconScale }],
              },
            ]}
          >
            <View style={[styles.emptyDocTop, { backgroundColor: colors.accent }]} />
            <View style={[styles.emptyDocPage, { borderColor: `${colors.accent}44` }]}>
              <View style={[styles.emptyLineFull, { backgroundColor: `${colors.accent}22` }]} />
              <View style={[styles.emptyLineMid, { backgroundColor: `${colors.accent}18` }]} />
              <View style={[styles.emptyLineShort, { backgroundColor: `${colors.accent}14` }]} />
            </View>
          </Animated.View>
          <Text style={[styles.emptyBadgeTextFlat, { color: colors.badgeText }]}>
            ALL CAUGHT UP
          </Text>
          <Text style={styles.emptyTitleFlat}>{title}</Text>
          <Text style={styles.emptySubtitleFlat}>{subtitle}</Text>
          <View style={styles.emptyDotsRow}>
            <Animated.View style={[styles.emptyDot, { backgroundColor: colors.accent, transform: [{ scale: dotScale }] }]} />
            <Animated.View style={[styles.emptyDot, { backgroundColor: `${colors.accent}88`, transform: [{ scale: dotScale }] }]} />
            <Animated.View style={[styles.emptyDot, { backgroundColor: `${colors.accent}55`, transform: [{ scale: dotScale }] }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.frame, { backgroundColor: colors.frame }]}>
        <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.badgeText, { color: colors.badgeText }]}>
            {badgeLabel}
          </Text>
        </View>
        {LottieView ? (
          <LottieView
            source={animations[variant]}
            autoPlay
            loop={variant !== "success"}
            style={[
              styles.lottie,
              {
                width: size,
                height: size,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.lottieFallback,
              {
                width: size,
                height: size,
                backgroundColor: `${colors.badgeBg}AA`,
                borderColor: `${colors.accent}22`,
              },
            ]}
          >
            <View style={[styles.fallbackOrb, { backgroundColor: colors.accent }]} />
            <Text style={[styles.fallbackLabel, { color: colors.badgeText }]}>
              {variant === "success" ? "Ready" : "Loading"}
            </Text>
          </View>
        )}
      </View>
      {showText ? (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "100%",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.08)",
  },
  lottie: {
    alignSelf: "center",
  },
  lottieFallback: {
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  fallbackOrb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    opacity: 0.9,
  },
  fallbackLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  emptyFrameFlat: {
    width: "100%",
    minHeight: 180,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  emptyIconWrapFlat: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  emptyDocTop: {
    position: "absolute",
    top: 12,
    width: 22,
    height: 22,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  emptyDocPage: {
    width: 58,
    height: 70,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingTop: 10,
  },
  emptyLineFull: {
    width: 32,
    height: 6,
    borderRadius: 999,
  },
  emptyLineMid: {
    width: 26,
    height: 6,
    borderRadius: 999,
  },
  emptyLineShort: {
    width: 18,
    height: 6,
    borderRadius: 999,
  },
  emptyBadgeTextFlat: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptyTitleFlat: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitleFlat: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  emptyDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
