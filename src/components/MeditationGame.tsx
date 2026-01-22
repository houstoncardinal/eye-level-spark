import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Flame,
  Target,
  Rocket,
  Heart,
  X,
  ChevronRight,
  Award,
  Gamepad2,
  Crown,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeditationGame } from "@/hooks/useMeditationGame";

interface MeditationGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const PET_EMOJIS = {
  cosmic_cat: "🐱",
  dragon: "🐉",
  fox: "🦊"
};

const ACHIEVEMENT_COLORS = {
  locked: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  unlocked: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
};

export const MeditationGame = ({ isOpen, onClose }: MeditationGameProps) => {
  const { gameStats, feedPet, playWithPet, cleanPet, restPet, unlockPet } = useMeditationGame();
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleFeedPet = (petId: string) => {
    feedPet(petId);
  };

  const handlePlayWithPet = (petId: string) => {
    playWithPet(petId);
  };

  const handleCleanPet = (petId: string) => {
    cleanPet(petId);
  };

  const handleRestPet = (petId: string) => {
    restPet(petId);
  };

  const handleUnlockPet = (petId: string) => {
    unlockPet(petId);
  };

  const getPetStatusEmoji = (pet: any) => {
    const avgHealth = (pet.happiness + pet.hunger + pet.energy + pet.cleanliness) / 4;
    if (avgHealth > 80) return "😊";
    if (avgHealth > 60) return "😐";
    if (avgHealth > 40) return "😟";
    return "😢";
  };

  const getPetMoodColor = (pet: any) => {
    const avgHealth = (pet.happiness + pet.hunger + pet.energy + pet.cleanliness) / 4;
    if (avgHealth > 80) return "text-green-400";
    if (avgHealth > 60) return "text-yellow-400";
    if (avgHealth > 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-purple-400" />
                  Meditation Quest
                  <Badge variant="secondary" className="ml-2">
                    Level {gameStats.level}
                  </Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="pets">Pets</TabsTrigger>
                    <TabsTrigger value="garden">Garden</TabsTrigger>
                    <TabsTrigger value="cosmic">Cosmic</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Level Progress */}
                    <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="font-semibold">Level {gameStats.level}</span>
                          </div>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            {gameStats.totalPoints.toLocaleString()} Points
                          </Badge>
                        </div>
                        <Progress value={((gameStats.totalPoints % 500) / 500) * 100} className="h-3" />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{gameStats.totalPoints % 500} / 500 points to next level</span>
                          <span>Level {gameStats.level + 1}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-400 mb-1">
                            {gameStats.currentStreak}
                          </div>
                          <div className="text-sm text-muted-foreground">Current Streak</div>
                          <Flame className="w-4 h-4 mx-auto mt-1 text-orange-400" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {gameStats.longestStreak}
                          </div>
                          <div className="text-sm text-muted-foreground">Best Streak</div>
                          <Zap className="w-4 h-4 mx-auto mt-1 text-blue-400" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            {gameStats.totalSessions}
                          </div>
                          <div className="text-sm text-muted-foreground">Sessions</div>
                          <Target className="w-4 h-4 mx-auto mt-1 text-green-400" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-1">
                            {Math.floor(gameStats.totalMinutes / 60)}h {gameStats.totalMinutes % 60}m
                          </div>
                          <div className="text-sm text-muted-foreground">Total Time</div>
                          <Trophy className="w-4 h-4 mx-auto mt-1 text-purple-400" />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Achievements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {gameStats.achievements
                            .filter(a => a.unlocked)
                            .slice(-3)
                            .map((achievement) => (
                              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <span className="text-2xl">{achievement.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium">{achievement.name}</div>
                                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                                </div>
                                <Badge variant="secondary">+{achievement.reward}</Badge>
                              </div>
                            ))}
                          {gameStats.achievements.filter(a => a.unlocked).length === 0 && (
                            <div className="text-center text-muted-foreground py-4">
                              Complete your first meditation to unlock achievements!
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gameStats.achievements.map((achievement) => (
                        <Card
                          key={achievement.id}
                          className={`transition-all ${
                            achievement.unlocked
                              ? "border-yellow-500/50 bg-yellow-500/5"
                              : "border-gray-500/20 bg-gray-500/5"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{achievement.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{achievement.name}</span>
                                  {achievement.unlocked && (
                                    <Award className="w-4 h-4 text-yellow-400" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {achievement.description}
                                </p>
                                <div className="space-y-2">
                                  <Progress
                                    value={(achievement.progress / achievement.maxProgress) * 100}
                                    className="h-2"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{achievement.progress} / {achievement.maxProgress}</span>
                                    <span>+{achievement.reward} points</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pets" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {gameStats.meditationPets.map((pet) => (
                        <Card key={pet.id} className="relative overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="text-6xl">
                                {pet.unlocked ? PET_EMOJIS[pet.type as keyof typeof PET_EMOJIS] : "🔒"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                                  <span className={`text-sm px-2 py-1 rounded-full ${
                                    pet.personality === 'playful' ? 'bg-orange-500/20 text-orange-400' :
                                    pet.personality === 'calm' ? 'bg-blue-500/20 text-blue-400' :
                                    pet.personality === 'curious' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {pet.personality}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground capitalize mb-2">
                                  {pet.type.replace('_', ' ')} • Level {pet.level}
                                </p>
                                <div className="text-2xl">
                                  {getPetStatusEmoji(pet)}
                                </div>
                              </div>
                            </div>

                            {pet.unlocked ? (
                              <>
                                {/* Pet Stats */}
                                <div className="space-y-3 mb-6">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>🍽️ Hunger</span>
                                      <span className={pet.hunger < 30 ? 'text-red-400' : pet.hunger < 60 ? 'text-yellow-400' : 'text-green-400'}>
                                        {pet.hunger}/100
                                      </span>
                                    </div>
                                    <Progress value={pet.hunger} className="h-2" />
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>❤️ Happiness</span>
                                      <span className={pet.happiness < 30 ? 'text-red-400' : pet.happiness < 60 ? 'text-yellow-400' : 'text-green-400'}>
                                        {pet.happiness}/100
                                      </span>
                                    </div>
                                    <Progress value={pet.happiness} className="h-2" />
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>⚡ Energy</span>
                                      <span className={pet.energy < 30 ? 'text-red-400' : pet.energy < 60 ? 'text-yellow-400' : 'text-green-400'}>
                                        {pet.energy}/100
                                      </span>
                                    </div>
                                    <Progress value={pet.energy} className="h-2" />
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>🧼 Cleanliness</span>
                                      <span className={pet.cleanliness < 30 ? 'text-red-400' : pet.cleanliness < 60 ? 'text-yellow-400' : 'text-green-400'}>
                                        {pet.cleanliness}/100
                                      </span>
                                    </div>
                                    <Progress value={pet.cleanliness} className="h-2" />
                                  </div>
                                </div>

                                {/* Care Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleFeedPet(pet.id)}
                                    disabled={pet.hunger >= 90}
                                    className="text-xs"
                                  >
                                    🍽️ Feed
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePlayWithPet(pet.id)}
                                    disabled={pet.energy < 20}
                                    className="text-xs"
                                  >
                                    🎾 Play
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCleanPet(pet.id)}
                                    disabled={pet.cleanliness >= 90}
                                    className="text-xs"
                                  >
                                    🧼 Clean
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRestPet(pet.id)}
                                    disabled={pet.energy >= 90}
                                    className="text-xs"
                                  >
                                    😴 Rest
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <Button
                                onClick={() => handleUnlockPet(pet.id)}
                                className="w-full"
                                disabled={gameStats.level < 2}
                              >
                                {gameStats.level >= 2 ? 'Unlock Pet' : `Reach Level 2 to Unlock`}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-3 text-center">🌱 Living Pet Ecosystem</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">📊 Pet Needs</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Hunger decreases over time</li>
                              <li>• Happiness depends on care & play</li>
                              <li>• Energy drains during play</li>
                              <li>• Cleanliness needs regular care</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">🎮 Care Actions</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Feed to restore hunger & happiness</li>
                              <li>• Play to boost happiness (uses energy)</li>
                              <li>• Clean to maintain hygiene</li>
                              <li>• Rest to recharge energy</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-center text-muted-foreground">
                            Your pets have unique personalities and needs that change over time.
                            Care for them regularly to keep them happy and help them level up!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="garden" className="space-y-6">
                    <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">🌱</span>
                          <h3 className="font-semibold text-lg">Meditation Garden</h3>
                        </div>

                        <div className="text-center mb-6">
                          <p className="text-muted-foreground">
                            Grow your inner peace by nurturing these sacred plants.
                            Water them regularly and watch them flourish with your mindfulness practice!
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Placeholder plants - in a real app these would be dynamic */}
                          {[
                            { emoji: "🌸", name: "Lotus Flower", type: "flower", growth: 75, health: 85 },
                            { emoji: "🌿", name: "Sage Herb", type: "herb", growth: 60, health: 90 },
                            { emoji: "🌳", name: "Buddha Tree", type: "tree", growth: 45, health: 70 },
                            { emoji: "💎", name: "Crystal Vine", type: "crystal", growth: 30, health: 95 }
                          ].map((plant, index) => (
                            <Card key={index} className="text-center p-4">
                              <div className="text-4xl mb-2">{plant.emoji}</div>
                              <h4 className="font-medium text-sm mb-1">{plant.name}</h4>
                              <p className="text-xs text-muted-foreground capitalize mb-3">{plant.type}</p>

                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Growth</span>
                                    <span className={plant.growth < 40 ? 'text-red-400' : plant.growth < 70 ? 'text-yellow-400' : 'text-green-400'}>
                                      {plant.growth}%
                                    </span>
                                  </div>
                                  <Progress value={plant.growth} className="h-1" />
                                </div>

                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Health</span>
                                    <span className={plant.health < 40 ? 'text-red-400' : plant.health < 70 ? 'text-yellow-400' : 'text-green-400'}>
                                      {plant.health}%
                                    </span>
                                  </div>
                                  <Progress value={plant.health} className="h-1" />
                                </div>
                              </div>

                              <Button size="sm" className="w-full mt-3 text-xs" disabled={plant.health >= 95}>
                                💧 Water
                              </Button>
                            </Card>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2 text-center">🌿 Garden Care Guide</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium mb-1">💧 Watering</h5>
                              <p className="text-muted-foreground text-xs">
                                Water plants regularly to maintain their health and encourage growth.
                                Over-watering can harm them!
                              </p>
                            </div>
                            <div>
                              <h5 className="font-medium mb-1">☀️ Meditation Bonus</h5>
                              <p className="text-muted-foreground text-xs">
                                Your meditation sessions naturally nourish the garden.
                                Longer sessions = healthier plants!
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="cosmic" className="space-y-6">
                    <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Rocket className="w-5 h-5 text-blue-400" />
                          <h3 className="font-semibold text-lg">Cosmic Exploration</h3>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Exploration Progress</span>
                              <span>{gameStats.cosmicExploration}%</span>
                            </div>
                            <Progress value={gameStats.cosmicExploration} className="h-3" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl mb-1">🌌</div>
                              <div className="text-sm font-medium">Nebula</div>
                              <div className="text-xs text-muted-foreground">0-25%</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl mb-1">🌑</div>
                              <div className="text-sm font-medium">Void</div>
                              <div className="text-xs text-muted-foreground">25-50%</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl mb-1">⭐</div>
                              <div className="text-sm font-medium">Core</div>
                              <div className="text-xs text-muted-foreground">50-75%</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl mb-1">⚫</div>
                              <div className="text-sm font-medium">Event Horizon</div>
                              <div className="text-xs text-muted-foreground">75-100%</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground text-center">
                            Explore deeper into the cosmic universe by interacting with the meditation interface.
                            Each level of exploration unlocks new visual experiences and achievements!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
