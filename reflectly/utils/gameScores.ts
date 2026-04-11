import AsyncStorage from "@react-native-async-storage/async-storage";

const GAME_SCORES_KEY = "reflectly_game_scores";

type GameScores = {
  [gameId: string]: number;
};

export async function getGameBestScore(gameId: string): Promise<number> {
  try {
    const scoresJson = await AsyncStorage.getItem(GAME_SCORES_KEY);
    if (!scoresJson) return 0;
    
    const scores: GameScores = JSON.parse(scoresJson);
    return scores[gameId] || 0;
  } catch (error) {
    console.error(`Failed to get best score for ${gameId}:`, error);
    return 0;
  }
}

export async function saveGameBestScore(gameId: string, score: number): Promise<boolean> {
  try {
    const scoresJson = await AsyncStorage.getItem(GAME_SCORES_KEY);
    const scores: GameScores = scoresJson ? JSON.parse(scoresJson) : {};
    
    const currentBest = scores[gameId] || 0;
    
    if (score > currentBest) {
      scores[gameId] = score;
      await AsyncStorage.setItem(GAME_SCORES_KEY, JSON.stringify(scores));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to save best score for ${gameId}:`, error);
    return false;
  }
}

export async function getAllGameScores(): Promise<GameScores> {
  try {
    const scoresJson = await AsyncStorage.getItem(GAME_SCORES_KEY);
    return scoresJson ? JSON.parse(scoresJson) : {};
  } catch (error) {
    console.error("Failed to get all game scores:", error);
    return {};
  }
}

export async function resetGameScore(gameId: string): Promise<void> {
  try {
    const scoresJson = await AsyncStorage.getItem(GAME_SCORES_KEY);
    const scores: GameScores = scoresJson ? JSON.parse(scoresJson) : {};
    
    delete scores[gameId];
    await AsyncStorage.setItem(GAME_SCORES_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error(`Failed to reset score for ${gameId}:`, error);
  }
}

export async function resetAllScores(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_SCORES_KEY);
  } catch (error) {
    console.error("Failed to reset all scores:", error);
  }
}
