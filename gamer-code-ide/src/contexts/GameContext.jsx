import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playLevelUp, playXpGain, playCodeSave, playCodeRun, soundManager } from '../utils/sounds';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [codeSaveCount, setCodeSaveCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const soundsLoaded = useRef(false);

  // Calculate XP needed for next level (simple exponential curve)
  const calculateXpForNextLevel = (currentLevel) => {
    return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
  };

  // Handle level up animation completion
  const handleLevelUpComplete = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  // Load sounds on first render
  useEffect(() => {
    if (!soundsLoaded.current) {
      soundManager.init();
      soundManager.setVolume(volume);
      soundsLoaded.current = true;
    }
  }, [volume]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = soundManager.toggleMute();
    setIsMuted(newMutedState);
    return newMutedState;
  }, []);

  // Set volume
  const setGameVolume = useCallback((newVolume) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    soundManager.setVolume(vol);
    setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Add XP and handle level up
  const addXp = useCallback((amount) => {
    setLevel(prevLevel => {
      const newXp = xp + amount;
      const xpNeeded = calculateXpForNextLevel(prevLevel);
      
      if (newXp >= xpNeeded) {
        // Level up!
        const nextLevel = prevLevel + 1;
        setXp(newXp - xpNeeded);
        setXpToNextLevel(calculateXpForNextLevel(nextLevel));
        setNewLevel(nextLevel);
        setShowLevelUp(true);
        playLevelUp();
        console.log(` Level up! You are now level ${nextLevel}`);
        return nextLevel;
      } else {
        setXp(newXp);
        playXpGain();
        return prevLevel;
      }
    });
  }, [xp]);

  // Save code handler that also awards XP
  const saveCode = useCallback((code) => {
    setCodeSaveCount(prev => {
      const newCount = prev + 1;
      // Award more XP for every 5th save
      if (newCount % 5 === 0) {
        addXp(25);
      } else {
        addXp(10);
      }
      return newCount;
    });
    playCodeSave();
    console.log('Code saved!');
  }, [addXp]);

  // Run code handler that awards XP
  const runCode = useCallback(() => {
    addXp(5);
    playCodeRun();
    console.log('Code executed!');
  }, [addXp]);

  // Debug effect
  useEffect(() => {
    console.log(`Level: ${level}, XP: ${xp}/${xpToNextLevel}, Saves: ${codeSaveCount}`);
  }, [level, xp, xpToNextLevel, codeSaveCount]);

  // Clear save (for development/testing)
  const clearSave = useCallback(() => {
    localStorage.removeItem(GAME_STORAGE_KEY);
    setLevel(1);
    setXp(0);
    setXpToNextLevel(100);
    setCodeSaveCount(0);
    console.log('Game save cleared!');
  }, []);

  return (
    <GameContext.Provider
      value={{
        level,
        xp,
        xpToNextLevel,
        codeSaveCount,
        showLevelUp,
        newLevel,
        onLevelUpComplete: handleLevelUpComplete,
        addXp,
        saveCode,
        runCode,
        toggleMute,
        setGameVolume,
        isMuted,
        volume,
        clearSave
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
