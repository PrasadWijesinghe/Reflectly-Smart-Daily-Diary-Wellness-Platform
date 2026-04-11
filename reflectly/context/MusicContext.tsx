import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Song, SONGS } from "../data/music";

type MusicContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  playlist: Song[];
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
  
  playSong: (song: Song) => void;
  stopSong: () => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (position: number) => void;
  addToPlaylist: (songs: Song[]) => void;
  clearPlaylist: () => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>(SONGS);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    async function setup() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log("Audio setup error:", error);
      }
    }
    
    setup();
    
    return () => {
      isMountedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSong = useCallback(async (song: Song) => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      if (!isMountedRef.current) {
        sound.unloadAsync();
        return;
      }
      
      soundRef.current = sound;
      setCurrentSong(song);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.log("Error playing song:", error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!isMountedRef.current || !status.isLoaded) return;

    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      handleSongEnd();
    }
  }

  const handleSongEnd = useCallback(() => {
    if (!isMountedRef.current) return;
    
    const currentIndex = playlist.findIndex(s => s.id === currentSong?.id);
    if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    }
  }, [currentSong, playlist, playSong]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || !isMountedRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.log("Toggle error:", error);
    }
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (!currentSong || !isMountedRef.current) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    }
  }, [currentSong, playlist, playSong]);

  const previousSong = useCallback(() => {
    if (!currentSong || !isMountedRef.current) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(playlist[currentIndex - 1]);
    }
  }, [currentSong, playlist, playSong]);

  const seekTo = useCallback(async (positionMs: number) => {
    if (!soundRef.current || !isMountedRef.current) return;
    try {
      await soundRef.current.setPositionAsync(positionMs);
    } catch (error) {
      console.log("Seek error:", error);
    }
  }, []);

  const addToPlaylist = useCallback((songs: Song[]) => {
    setPlaylist(songs);
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist(SONGS);
  }, []);

  const stopSong = useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      console.log("Stop error:", e);
    }
    
    setCurrentSong(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoading,
        position,
        duration,
        playlist,
        isFullScreen,
        setIsFullScreen,
        playSong,
        stopSong,
        togglePlayPause,
        nextSong,
        previousSong,
        seekTo,
        addToPlaylist,
        clearPlaylist,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}