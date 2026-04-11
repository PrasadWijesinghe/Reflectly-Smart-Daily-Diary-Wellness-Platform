import React from "react";
import { useLocalSearchParams } from "expo-router";
import CalmBreathingScreen from "./calm-breathing";
import MemoryMatchScreen from "./memory-match";
import Game2048Screen from "./game-2048";
import WordScrambleScreen from "./word-scramble";
import ColorMatchScreen from "./color-match";
import PatternMemoryScreen from "./pattern-memory";
import BalloonPopScreen from "./balloon-pop";
import TappingGameScreen from "./tapping-game";
import MathQuickScreen from "./math-quick";
import ShadowMatchScreen from "./shadow-match";
import NumberTapScreen from "./number-tap";
import DotConnectScreen from "./dot-connect";

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const renderGame = () => {
    switch (gameId) {
      case "calm-breathing":
        return <CalmBreathingScreen />;
      case "memory-match":
        return <MemoryMatchScreen />;
      case "game-2048":
        return <Game2048Screen />;
      case "word-scramble":
        return <WordScrambleScreen />;
      case "color-match":
        return <ColorMatchScreen />;
      case "pattern-memory":
        return <PatternMemoryScreen />;
      case "balloon-pop":
        return <BalloonPopScreen />;
      case "tapping-game":
        return <TappingGameScreen />;
      case "math-quick":
        return <MathQuickScreen />;
      case "shadow-match":
        return <ShadowMatchScreen />;
      case "number-tap":
        return <NumberTapScreen />;
      case "dot-connect":
        return <DotConnectScreen />;
      default:
        return null;
    }
  };

  return renderGame();
}
