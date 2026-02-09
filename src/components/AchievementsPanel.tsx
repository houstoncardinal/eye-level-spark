import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X, Trophy, Star, Flame, Zap, Heart, Crown, Moon, Sun,
  Clock, Target, Sparkles, Eye, Brain, Waves, Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: "meditation" | "exploration" | "mastery" | "cosmic" | "wellness";
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Meditation achievements
  {
    id: "first-breath",
    name: "First Breath",
    description: "Complete your first breathing session",
    icon: Waves,
    color: "#22C55E",
    category: "meditation",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "common",
    xp: 10,
  },
  {
    id: "breath-master",
    name: "Breath Master",
    description: "Complete 100 breathing sessions",
    icon: Waves,
    color: "#22C55E",
    category: "meditation",
    requirement: 100,
    progress: 0,
    unlocked: false,
    rarity: "epic",
    xp: 500,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Meditate before 6 AM",
    icon: Sun,
    color: "#F59E0B",
    category: "meditation",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 50,
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Meditate after midnight",
    icon: Moon,
    color: "#6366F1",
    category: "meditation",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 50,
  },
  {
    id: "hour-of-peace",
    name: "Hour of Peace",
    description: "Accumulate 60 minutes of meditation",
    icon: Clock,
    color: "#06B6D4",
    category: "meditation",
    requirement: 60,
    progress: 0,
    unlocked: false,
    rarity: "common",
    xp: 100,
  },
  {
    id: "zen-master",
    name: "Zen Master",
    description: "Accumulate 24 hours of meditation",
    icon: Crown,
    color: "#F59E0B",
    category: "meditation",
    requirement: 1440,
    progress: 0,
    unlocked: false,
    rarity: "legendary",
    xp: 2000,
  },

  // Exploration achievements
  {
    id: "stargazer",
    name: "Stargazer",
    description: "Visit the constellation mode",
    icon: Star,
    color: "#8B5CF6",
    category: "exploration",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "common",
    xp: 10,
  },
  {
    id: "cosmic-traveler",
    name: "Cosmic Traveler",
    description: "Experience all visual modes",
    icon: Sparkles,
    color: "#EC4899",
    category: "exploration",
    requirement: 5,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 100,
  },
  {
    id: "frequency-seeker",
    name: "Frequency Seeker",
    description: "Try all Solfeggio frequencies",
    icon: Zap,
    color: "#10B981",
    category: "exploration",
    requirement: 9,
    progress: 0,
    unlocked: false,
    rarity: "epic",
    xp: 200,
  },
  {
    id: "chakra-awakening",
    name: "Chakra Awakening",
    description: "Activate all 7 chakras",
    icon: Eye,
    color: "#A855F7",
    category: "exploration",
    requirement: 7,
    progress: 0,
    unlocked: false,
    rarity: "epic",
    xp: 300,
  },

  // Mastery achievements
  {
    id: "streak-starter",
    name: "Streak Starter",
    description: "Maintain a 3-day meditation streak",
    icon: Flame,
    color: "#EF4444",
    category: "mastery",
    requirement: 3,
    progress: 0,
    unlocked: false,
    rarity: "common",
    xp: 30,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day meditation streak",
    icon: Flame,
    color: "#F97316",
    category: "mastery",
    requirement: 7,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 100,
  },
  {
    id: "month-master",
    name: "Month Master",
    description: "Maintain a 30-day meditation streak",
    icon: Flame,
    color: "#EF4444",
    category: "mastery",
    requirement: 30,
    progress: 0,
    unlocked: false,
    rarity: "legendary",
    xp: 1000,
  },
  {
    id: "focus-champion",
    name: "Focus Champion",
    description: "Achieve 95%+ focus score",
    icon: Target,
    color: "#22C55E",
    category: "mastery",
    requirement: 95,
    progress: 0,
    unlocked: false,
    rarity: "epic",
    xp: 250,
  },

  // Cosmic achievements
  {
    id: "warp-pioneer",
    name: "Warp Pioneer",
    description: "Complete a time warp journey",
    icon: Zap,
    color: "#3B82F6",
    category: "cosmic",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 75,
  },
  {
    id: "consciousness-expansion",
    name: "Consciousness Expansion",
    description: "Reach 100% consciousness in Time Warp",
    icon: Brain,
    color: "#EC4899",
    category: "cosmic",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "epic",
    xp: 200,
  },
  {
    id: "kaleidoscope-king",
    name: "Kaleidoscope King",
    description: "Experience all kaleidoscope patterns",
    icon: Sparkles,
    color: "#8B5CF6",
    category: "cosmic",
    requirement: 5,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 100,
  },

  // Wellness achievements
  {
    id: "dream-keeper",
    name: "Dream Keeper",
    description: "Record 10 dreams",
    icon: Moon,
    color: "#6366F1",
    category: "wellness",
    requirement: 10,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 100,
  },
  {
    id: "manifestor",
    name: "Manifestor",
    description: "Create 5 manifestation intentions",
    icon: Star,
    color: "#F59E0B",
    category: "wellness",
    requirement: 5,
    progress: 0,
    unlocked: false,
    rarity: "rare",
    xp: 100,
  },
  {
    id: "inner-peace",
    name: "Inner Peace",
    description: "Log 7 days of positive moods",
    icon: Heart,
    color: "#EC4899",
    category: "wellness",
    requirement: 7,
    progress: 0,
    unlocked: false,
    rarity: "epic",
    xp: 150,
  },
  {
    id: "enlightened",
    name: "Enlightened One",
    description: "Unlock all other achievements",
    icon: Crown,
    color: "#F59E0B",
    category: "mastery",
    requirement: 19, // All other achievements
    progress: 0,
    unlocked: false,
    rarity: "legendary",
    xp: 5000,
  },
];

const RARITY_COLORS = {
  common: "#6B7280",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

const STORAGE_KEY = "sublime-achievements";

export const AchievementsPanel = ({ isOpen, onClose }: AchievementsPanelProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  // Load achievements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAchievements(prev =>
          prev.map(a => {
            const saved = parsed.find((s: Achievement) => s.id === a.id);
            return saved ? { ...a, ...saved } : a;
          })
        );
      } catch {}
    }
  }, []);

  // Calculate stats
  useEffect(() => {
    const unlockedXP = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.xp, 0);
    setTotalXP(unlockedXP);
    setLevel(Math.floor(unlockedXP / 500) + 1);
  }, [achievements]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const categories = ["meditation", "exploration", "mastery", "cosmic", "wellness"] as const;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "meditation": return Waves;
      case "exploration": return Sparkles;
      case "mastery": return Trophy;
      case "cosmic": return Star;
      case "wellness": return Heart;
      default: return Star;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-amber-950/90 via-orange-950/90 to-yellow-950/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">Achievements</h2>
                <Badge className="bg-amber-500/30 text-amber-400">
                  {unlockedCount}/{totalCount}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex h-[calc(100%-80px)]">
              {/* Stats sidebar */}
              <div className="w-64 border-r border-white/10 p-4">
                {/* Level & XP */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{level}</span>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">LEVEL</p>
                      <p className="text-white font-semibold">Consciousness</p>
                    </div>
                  </div>
                  <div className="mb-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">XP</span>
                      <span className="text-amber-400">{totalXP} / {level * 500}</span>
                    </div>
                    <Progress value={(totalXP % 500) / 5} />
                  </div>
                </div>

                {/* Category progress */}
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat);
                    const catAchievements = achievements.filter(a => a.category === cat);
                    const unlocked = catAchievements.filter(a => a.unlocked).length;
                    const total = catAchievements.length;

                    return (
                      <div key={cat} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-white/70" />
                            <span className="text-white/80 text-sm capitalize">{cat}</span>
                          </div>
                          <span className="text-white/50 text-xs">{unlocked}/{total}</span>
                        </div>
                        <Progress value={(unlocked / total) * 100} className="h-1" />
                      </div>
                    );
                  })}
                </div>

                {/* Rarity legend */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-white/50 text-xs mb-3">RARITY</p>
                  <div className="space-y-2">
                    {Object.entries(RARITY_COLORS).map(([rarity, color]) => (
                      <div key={rarity} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-white/70 text-xs capitalize">{rarity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievement grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <Tabs defaultValue="all">
                  <TabsList className="mb-6 bg-white/5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                    <TabsTrigger value="locked">Locked</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          onClick={() => setSelectedAchievement(achievement)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="unlocked">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {achievements
                        .filter(a => a.unlocked)
                        .map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onClick={() => setSelectedAchievement(achievement)}
                          />
                        ))}
                      {achievements.filter(a => a.unlocked).length === 0 && (
                        <div className="col-span-3 text-center py-12 text-white/40">
                          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No achievements unlocked yet</p>
                          <p className="text-sm">Start meditating to earn your first badge!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="locked">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {achievements
                        .filter(a => !a.unlocked)
                        .map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onClick={() => setSelectedAchievement(achievement)}
                          />
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Achievement detail modal */}
            <AnimatePresence>
              {selectedAchievement && (
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAchievement(null)}
                >
                  <motion.div
                    className="w-full max-w-md bg-gradient-to-br from-amber-900/90 to-orange-900/90 rounded-2xl p-6 border border-white/20"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const Icon = selectedAchievement.icon;
                      return (
                        <>
                          <div className="flex items-center justify-center mb-6">
                            <motion.div
                              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                                selectedAchievement.unlocked ? "" : "opacity-50 grayscale"
                              }`}
                              style={{
                                backgroundColor: selectedAchievement.color + "30",
                                boxShadow: selectedAchievement.unlocked
                                  ? `0 0 40px ${selectedAchievement.color}50`
                                  : "none",
                              }}
                              animate={selectedAchievement.unlocked ? {
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Icon
                                className="w-12 h-12"
                                style={{ color: selectedAchievement.color }}
                              />
                            </motion.div>
                          </div>

                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-1">
                              {selectedAchievement.name}
                            </h3>
                            <Badge
                              className="capitalize"
                              style={{
                                backgroundColor: RARITY_COLORS[selectedAchievement.rarity] + "30",
                                color: RARITY_COLORS[selectedAchievement.rarity],
                              }}
                            >
                              {selectedAchievement.rarity}
                            </Badge>
                          </div>

                          <p className="text-white/80 text-center mb-6">
                            {selectedAchievement.description}
                          </p>

                          {/* Progress */}
                          <div className="bg-white/10 rounded-xl p-4 mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-white/70">Progress</span>
                              <span className="text-white">
                                {selectedAchievement.progress} / {selectedAchievement.requirement}
                              </span>
                            </div>
                            <Progress
                              value={
                                (selectedAchievement.progress / selectedAchievement.requirement) * 100
                              }
                            />
                          </div>

                          {/* Reward */}
                          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <span className="text-white/70">Reward</span>
                            <span className="text-amber-400 font-bold">
                              +{selectedAchievement.xp} XP
                            </span>
                          </div>

                          {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                            <p className="text-white/40 text-xs text-center mt-4">
                              Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Achievement Card Component
const AchievementCard = ({
  achievement,
  onClick,
}: {
  achievement: Achievement;
  onClick: () => void;
}) => {
  const Icon = achievement.icon;

  return (
    <motion.div
      className={`relative rounded-xl p-4 cursor-pointer transition-all ${
        achievement.unlocked
          ? "bg-white/10 hover:bg-white/15"
          : "bg-white/5 opacity-60 hover:opacity-80"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Rarity indicator */}
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{ backgroundColor: RARITY_COLORS[achievement.rarity] }}
      />

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            achievement.unlocked ? "" : "grayscale"
          }`}
          style={{ backgroundColor: achievement.color + "30" }}
        >
          <Icon className="w-6 h-6" style={{ color: achievement.color }} />
        </div>
      </div>

      {/* Name & XP */}
      <h4 className="text-white text-sm font-medium text-center mb-1 truncate">
        {achievement.name}
      </h4>
      <p className="text-amber-400/70 text-xs text-center">+{achievement.xp} XP</p>

      {/* Progress bar */}
      {!achievement.unlocked && (
        <div className="mt-2">
          <Progress
            value={(achievement.progress / achievement.requirement) * 100}
            className="h-1"
          />
        </div>
      )}

      {/* Unlocked badge */}
      {achievement.unlocked && (
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
