import { useState, useEffect, useCallback } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number; // points
}

interface GameStats {
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  achievements: Achievement[];
  cosmicExploration: number; // 0-100
  meditationPets: MeditationPet[];
  gardenPlants: GardenPlant[];
}

interface MeditationPet {
  id: string;
  name: string;
  type: string;
  level: number;
  happiness: number;
  hunger: number;
  energy: number;
  cleanliness: number;
  lastFed: number;
  lastPlayed: number;
  lastCleaned: number;
  personality: 'playful' | 'calm' | 'curious' | 'lazy';
  unlocked: boolean;
}

interface GardenPlant {
  id: string;
  name: string;
  type: 'flower' | 'tree' | 'herb' | 'crystal';
  growth: number; // 0-100
  health: number; // 0-100
  lastWatered: number;
  unlocked: boolean;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_session",
    name: "First Steps",
    description: "Complete your first meditation session",
    icon: "🌟",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 100
  },
  {
    id: "streak_3",
    name: "Consistency",
    description: "Maintain a 3-day meditation streak",
    icon: "🔥",
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    reward: 250
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day meditation streak",
    icon: "⚡",
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    reward: 500
  },
  {
    id: "total_60",
    name: "Hour Master",
    description: "Meditate for a total of 60 minutes",
    icon: "⏰",
    unlocked: false,
    progress: 0,
    maxProgress: 60,
    reward: 300
  },
  {
    id: "cosmic_explorer",
    name: "Cosmic Explorer",
    description: "Explore 50% of the cosmic universe",
    icon: "🚀",
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    reward: 400
  },
  {
    id: "zen_master",
    name: "Zen Master",
    description: "Reach meditation level 10",
    icon: "🧘",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    reward: 1000
  }
];

const INITIAL_PETS: MeditationPet[] = [
  {
    id: "cosmic_kitten",
    name: "Luna",
    type: "cosmic_cat",
    level: 1,
    happiness: 50,
    hunger: 70,
    energy: 80,
    cleanliness: 90,
    lastFed: Date.now(),
    lastPlayed: Date.now(),
    lastCleaned: Date.now(),
    personality: "playful",
    unlocked: false
  },
  {
    id: "meditation_dragon",
    name: "Zenith",
    type: "dragon",
    level: 1,
    happiness: 50,
    hunger: 60,
    energy: 90,
    cleanliness: 85,
    lastFed: Date.now(),
    lastPlayed: Date.now(),
    lastCleaned: Date.now(),
    personality: "calm",
    unlocked: false
  },
  {
    id: "crystal_fox",
    name: "Crystal",
    type: "fox",
    level: 1,
    happiness: 50,
    hunger: 75,
    energy: 70,
    cleanliness: 95,
    lastFed: Date.now(),
    lastPlayed: Date.now(),
    lastCleaned: Date.now(),
    personality: "curious",
    unlocked: false
  }
];

export const useMeditationGame = () => {
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem("meditationGame");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      level: 1,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      totalMinutes: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      cosmicExploration: 0,
      meditationPets: INITIAL_PETS,
      gardenPlants: []
    };
  });

  // Save to localStorage whenever gameStats changes
  useEffect(() => {
    localStorage.setItem("meditationGame", JSON.stringify(gameStats));
  }, [gameStats]);

  const calculateLevel = useCallback((points: number) => {
    return Math.floor(points / 500) + 1; // Level up every 500 points
  }, []);

  const addPoints = useCallback((points: number) => {
    setGameStats(prev => {
      const newTotal = prev.totalPoints + points;
      const newLevel = calculateLevel(newTotal);

      return {
        ...prev,
        totalPoints: newTotal,
        level: newLevel
      };
    });
  }, [calculateLevel]);

  const completeSession = useCallback((minutes: number) => {
    setGameStats(prev => {
      const sessionPoints = Math.floor(minutes * 10); // 10 points per minute
      const newTotalPoints = prev.totalPoints + sessionPoints;
      const newLevel = calculateLevel(newTotalPoints);
      const newTotalSessions = prev.totalSessions + 1;
      const newTotalMinutes = prev.totalMinutes + minutes;

      // Update achievements
      const updatedAchievements = prev.achievements.map(achievement => {
        let newProgress = achievement.progress;

        switch (achievement.id) {
          case "first_session":
            newProgress = Math.min(newTotalSessions, achievement.maxProgress);
            break;
          case "total_60":
            newProgress = Math.min(newTotalMinutes, achievement.maxProgress);
            break;
          case "zen_master":
            newProgress = Math.min(newLevel, achievement.maxProgress);
            break;
        }

        const wasUnlocked = achievement.unlocked;
        const nowUnlocked = newProgress >= achievement.maxProgress;

        return {
          ...achievement,
          progress: newProgress,
          unlocked: nowUnlocked
        };
      });

      // Award achievement points for newly unlocked achievements
      const newAchievementPoints = updatedAchievements
        .filter(a => a.unlocked && !prev.achievements.find(pa => pa.id === a.id)?.unlocked)
        .reduce((sum, a) => sum + a.reward, 0);

      return {
        ...prev,
        totalPoints: newTotalPoints + newAchievementPoints,
        level: calculateLevel(newTotalPoints + newAchievementPoints),
        totalSessions: newTotalSessions,
        totalMinutes: newTotalMinutes,
        achievements: updatedAchievements
      };
    });
  }, [calculateLevel]);

  const updateStreak = useCallback((streak: number) => {
    setGameStats(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        let newProgress = achievement.progress;

        if (achievement.id === "streak_3") {
          newProgress = Math.min(streak, achievement.maxProgress);
        } else if (achievement.id === "streak_7") {
          newProgress = Math.min(streak, achievement.maxProgress);
        }

        return {
          ...achievement,
          progress: newProgress,
          unlocked: newProgress >= achievement.maxProgress
        };
      });

      // Award points for streak achievements
      const newStreakPoints = updatedAchievements
        .filter(a => a.unlocked && !prev.achievements.find(pa => pa.id === a.id)?.unlocked)
        .reduce((sum, a) => sum + a.reward, 0);

      return {
        ...prev,
        currentStreak: streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        totalPoints: prev.totalPoints + newStreakPoints,
        level: calculateLevel(prev.totalPoints + newStreakPoints),
        achievements: updatedAchievements
      };
    });
  }, [calculateLevel]);

  const exploreCosmic = useCallback((amount: number) => {
    setGameStats(prev => {
      const newExploration = Math.min(prev.cosmicExploration + amount, 100);

      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.id === "cosmic_explorer") {
          return {
            ...achievement,
            progress: Math.min(newExploration, achievement.maxProgress),
            unlocked: newExploration >= achievement.maxProgress
          };
        }
        return achievement;
      });

      // Award points for exploration achievement
      const explorationPoints = updatedAchievements
        .filter(a => a.unlocked && !prev.achievements.find(pa => pa.id === a.id)?.unlocked)
        .reduce((sum, a) => sum + a.reward, 0);

      return {
        ...prev,
        cosmicExploration: newExploration,
        totalPoints: prev.totalPoints + explorationPoints,
        level: calculateLevel(prev.totalPoints + explorationPoints),
        achievements: updatedAchievements
      };
    });
  }, [calculateLevel]);

  const unlockPet = useCallback((petId: string) => {
    setGameStats(prev => ({
      ...prev,
      meditationPets: prev.meditationPets.map(pet =>
        pet.id === petId ? { ...pet, unlocked: true } : pet
      )
    }));
  }, []);

  const feedPet = useCallback((petId: string) => {
    setGameStats(prev => ({
      ...prev,
      meditationPets: prev.meditationPets.map(pet =>
        pet.id === petId
          ? {
              ...pet,
              hunger: Math.min(pet.hunger + 40, 100),
              happiness: Math.min(pet.happiness + 15, 100),
              lastFed: Date.now(),
              level: pet.happiness + 15 >= 100 ? pet.level + 1 : pet.level
            }
          : pet
      )
    }));
  }, []);

  const playWithPet = useCallback((petId: string) => {
    setGameStats(prev => ({
      ...prev,
      meditationPets: prev.meditationPets.map(pet =>
        pet.id === petId
          ? {
              ...pet,
              happiness: Math.min(pet.happiness + 25, 100),
              energy: Math.max(pet.energy - 15, 0),
              lastPlayed: Date.now(),
              level: pet.happiness + 25 >= 100 ? pet.level + 1 : pet.level
            }
          : pet
      )
    }));
  }, []);

  const cleanPet = useCallback((petId: string) => {
    setGameStats(prev => ({
      ...prev,
      meditationPets: prev.meditationPets.map(pet =>
        pet.id === petId
          ? {
              ...pet,
              cleanliness: Math.min(pet.cleanliness + 50, 100),
              happiness: Math.min(pet.happiness + 10, 100),
              lastCleaned: Date.now()
            }
          : pet
      )
    }));
  }, []);

  const restPet = useCallback((petId: string) => {
    setGameStats(prev => ({
      ...prev,
      meditationPets: prev.meditationPets.map(pet =>
        pet.id === petId
          ? {
              ...pet,
              energy: Math.min(pet.energy + 30, 100),
              happiness: Math.min(pet.happiness + 5, 100)
            }
          : pet
      )
    }));
  }, []);

  // Time-based pet needs decay
  useEffect(() => {
    const interval = setInterval(() => {
      setGameStats(prev => ({
        ...prev,
        meditationPets: prev.meditationPets.map(pet => {
          const timeSinceFed = (Date.now() - pet.lastFed) / (1000 * 60 * 60); // hours
          const timeSincePlayed = (Date.now() - pet.lastPlayed) / (1000 * 60 * 60);
          const timeSinceCleaned = (Date.now() - pet.lastCleaned) / (1000 * 60 * 60);

          return {
            ...pet,
            hunger: Math.max(pet.hunger - (timeSinceFed * 2), 0),
            happiness: Math.max(pet.happiness - (timeSincePlayed * 1.5) - (timeSinceFed * 1), 0),
            energy: Math.max(pet.energy - (timeSincePlayed * 3), 10), // minimum energy
            cleanliness: Math.max(pet.cleanliness - (timeSinceCleaned * 1.5), 0)
          };
        })
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getNextLevelPoints = useCallback(() => {
    return (gameStats.level) * 500; // Points needed for next level
  }, [gameStats.level]);

  const getProgressToNextLevel = useCallback(() => {
    const currentLevelPoints = (gameStats.level - 1) * 500;
    const nextLevelPoints = gameStats.level * 500;
    const progress = gameStats.totalPoints - currentLevelPoints;
    const needed = nextLevelPoints - currentLevelPoints;
    return Math.min((progress / needed) * 100, 100);
  }, [gameStats.level, gameStats.totalPoints]);

  return {
    gameStats,
    addPoints,
    completeSession,
    updateStreak,
    exploreCosmic,
    unlockPet,
    feedPet,
    playWithPet,
    cleanPet,
    restPet,
    getNextLevelPoints,
    getProgressToNextLevel
  };
};
