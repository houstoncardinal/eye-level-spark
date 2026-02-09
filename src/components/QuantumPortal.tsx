import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Atom,
  Zap,
  Target,
  Star,
  Sparkles,
  X,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Lightbulb,
  Compass,
  Moon,
  Sun,
  Wind,
  Brain,
  Eye,
  Rocket,
  Heart,
  Crown,
  Infinity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMeditationGame } from "@/hooks/useMeditationGame";

interface QuantumPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuantumState {
  id: string;
  name: string;
  description: string;
  type: 'consciousness' | 'reality' | 'potential' | 'multiverse';
  level: number;
  unlocked: boolean;
  effects: string[];
  visualization: string;
}

interface RealityShift {
  id: string;
  timestamp: number;
  fromState: string;
  toState: string;
  intention: string;
  result: string;
  coherence: number;
}

const QUANTUM_STATES: QuantumState[] = [
  {
    id: "quantum_superposition",
    name: "Quantum Superposition",
    description: "Exist in multiple states simultaneously",
    type: "consciousness",
    level: 1,
    unlocked: false,
    effects: ["Enhanced creativity", "Parallel thinking", "Multiple perspectives"],
    visualization: "🌀"
  },
  {
    id: "quantum_entanglement",
    name: "Quantum Entanglement",
    description: "Connect with all things instantaneously",
    type: "reality",
    level: 2,
    unlocked: false,
    effects: ["Telepathic awareness", "Universal connection", "Synchronicity"],
    visualization: "🔗"
  },
  {
    id: "quantum_tunnelling",
    name: "Quantum Tunnelling",
    description: "Pass through barriers effortlessly",
    type: "potential",
    level: 3,
    unlocked: false,
    effects: ["Manifestation acceleration", "Obstacle dissolution", "Limitless potential"],
    visualization: "⚡"
  },
  {
    id: "quantum_collapse",
    name: "Quantum Collapse",
    description: "Collapse possibilities into reality",
    type: "reality",
    level: 4,
    unlocked: false,
    effects: ["Manifestation mastery", "Reality shaping", "Intentional creation"],
    visualization: "🎯"
  },
  {
    id: "quantum_coherence",
    name: "Quantum Coherence",
    description: "Perfect alignment with universal flow",
    type: "consciousness",
    level: 5,
    unlocked: false,
    effects: ["Perfect timing", "Effortless action", "Divine orchestration"],
    visualization: "✨"
  },
  {
    id: "multiverse_navigation",
    name: "Multiverse Navigation",
    description: "Consciously navigate parallel realities",
    type: "multiverse",
    level: 6,
    unlocked: false,
    effects: ["Timeline mastery", "Reality selection", "Infinite possibilities"],
    visualization: "🌌"
  },
  {
    id: "quantum_immortality",
    name: "Quantum Immortality",
    description: "Consciousness transcends physical limits",
    type: "consciousness",
    level: 7,
    unlocked: false,
    effects: ["Timelessness", "Eternal awareness", "Beyond duality"],
    visualization: "♾️"
  },
  {
    id: "singularity_consciousness",
    name: "Singularity Consciousness",
    description: "Become one with the cosmic mind",
    type: "multiverse",
    level: 8,
    unlocked: false,
    effects: ["Omniscience", "Omnipresence", "Creator consciousness"],
    visualization: "👑"
  }
];

export const QuantumPortal = ({ isOpen, onClose }: QuantumPortalProps) => {
  const { gameStats, addPoints, exploreCosmic } = useMeditationGame();
  const [selectedTab, setSelectedTab] = useState("states");
  const [activeState, setActiveState] = useState<QuantumState | null>(null);
  const [quantumEnergy, setQuantumEnergy] = useState(0);
  const [coherenceLevel, setCoherenceLevel] = useState(0);
  const [realityShifts, setRealityShifts] = useState<RealityShift[]>([]);
  const [intention, setIntention] = useState("");
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationProgress, setMeditationProgress] = useState(0);
  const [quantumVisualization, setQuantumVisualization] = useState("");
  const [multiverseView, setMultiverseView] = useState<string[]>([]);
  const [singularityMode, setSingularityMode] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("quantumPortal");
    if (saved) {
      const data = JSON.parse(saved);
      setQuantumEnergy(data.quantumEnergy || 0);
      setCoherenceLevel(data.coherenceLevel || 0);
      setRealityShifts(data.realityShifts || []);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback(() => {
    localStorage.setItem("quantumPortal", JSON.stringify({
      quantumEnergy,
      coherenceLevel,
      realityShifts
    }));
  }, [quantumEnergy, coherenceLevel, realityShifts]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  const unlockState = useCallback((stateId: string) => {
    if (gameStats.level >= QUANTUM_STATES.find(s => s.id === stateId)?.level) {
      addPoints(100);
      setQuantumEnergy(prev => prev + 50);
      setCoherenceLevel(prev => Math.min(prev + 10, 100));
    }
  }, [gameStats.level, addPoints]);

  const enterQuantumState = useCallback((state: QuantumState) => {
    setActiveState(state);
    setQuantumEnergy(prev => Math.max(prev - 20, 0));
    setCoherenceLevel(prev => Math.min(prev + 15, 100));
    addPoints(50);
  }, [addPoints]);

  const performRealityShift = useCallback(() => {
    if (!intention.trim() || quantumEnergy < 30) return;

    const shift: RealityShift = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      fromState: activeState?.name || "Ground State",
      toState: "Shifted Reality",
      intention,
      result: "Reality shift initiated",
      coherence: coherenceLevel
    };

    setRealityShifts(prev => [shift, ...prev.slice(0, 49)]);
    setQuantumEnergy(prev => Math.max(prev - 30, 0));
    setCoherenceLevel(prev => Math.min(prev + 25, 100));
    addPoints(75);
    setIntention("");
  }, [intention, quantumEnergy, activeState, coherenceLevel, addPoints]);

  const startQuantumMeditation = useCallback(() => {
    if (quantumEnergy < 40) return;

    setIsMeditating(true);
    setMeditationProgress(0);

    const interval = setInterval(() => {
      setMeditationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMeditating(false);
          setQuantumEnergy(prev => Math.min(prev + 30, 200));
          setCoherenceLevel(prev => Math.min(prev + 20, 100));
          addPoints(100);
          return 100;
        }
        return prev + 5;
      });
    }, 1000);
  }, [quantumEnergy, addPoints]);

  const generateMultiverseView = useCallback(() => {
    const views = [
      "Infinite branching timelines...",
      "Parallel realities shimmering...",
      "Alternate versions of you...",
      "Quantum foam of possibilities...",
      "Holographic universe unfolding...",
      "String theory vibrations...",
      "Brane collisions in higher dimensions...",
      "Quantum fluctuations creating worlds..."
    ];
    
    const newView = views[Math.floor(Math.random() * views.length)];
    setMultiverseView(prev => [newView, ...prev.slice(0, 9)]);
  }, []);

  const enterSingularityMode = useCallback(() => {
    setSingularityMode(true);
    setQuantumEnergy(200);
    setCoherenceLevel(100);
    addPoints(500);
    
    setTimeout(() => {
      setSingularityMode(false);
    }, 30000); // 30 seconds of singularity mode
  }, [addPoints]);

  const getQuantumLevel = useCallback(() => {
    const unlockedStates = QUANTUM_STATES.filter(s => s.unlocked).length;
    return Math.min(Math.floor((unlockedStates + coherenceLevel / 20 + quantumEnergy / 50) / 3), 10);
  }, [coherenceLevel, quantumEnergy]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-7xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md border-white/20 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Atom className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Quantum Portal
                  </span>
                  <Badge variant="secondary" className="ml-2 text-cyan-400 border-cyan-400/50">
                    Level {getQuantumLevel()} Consciousness
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enterSingularityMode}
                    disabled={singularityMode}
                    className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Singularity
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                {/* Quantum Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="border-cyan-400/30 bg-cyan-400/5">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-1">⚛️</div>
                      <div className="text-lg font-bold text-cyan-400">{quantumEnergy}/200</div>
                      <div className="text-sm text-muted-foreground">Quantum Energy</div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-400/30 bg-purple-400/5">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-1">🔗</div>
                      <div className="text-lg font-bold text-purple-400">{coherenceLevel}%</div>
                      <div className="text-sm text-muted-foreground">Coherence Level</div>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-400/30 bg-pink-400/5">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-1">🌌</div>
                      <div className="text-lg font-bold text-pink-400">{realityShifts.length}</div>
                      <div className="text-sm text-muted-foreground">Reality Shifts</div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-400/30 bg-yellow-400/5">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-lg font-bold text-yellow-400">{gameStats.totalPoints}</div>
                      <div className="text-sm text-muted-foreground">Quantum Points</div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
                    <TabsTrigger value="states">Quantum States</TabsTrigger>
                    <TabsTrigger value="meditation">Quantum Meditation</TabsTrigger>
                    <TabsTrigger value="shifts">Reality Shifts</TabsTrigger>
                    <TabsTrigger value="multiverse">Multiverse</TabsTrigger>
                    <TabsTrigger value="singularity">Singularity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="states" className="space-y-6">
                    {/* Active Quantum State */}
                    {activeState && (
                      <Card className="border-cyan-400/50 bg-gradient-to-r from-cyan-400/10 to-purple-400/10">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl">{activeState.visualization}</span>
                              <div>
                                <h3 className="font-semibold text-lg">{activeState.name}</h3>
                                <p className="text-muted-foreground">{activeState.description}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                              Level {activeState.level}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {activeState.effects.map((effect, i) => (
                              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium">{effect}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              Quantum coherence: {coherenceLevel}%
                            </div>
                            <Button
                              onClick={() => setActiveState(null)}
                              variant="outline"
                              size="sm"
                              className="border-cyan-400/50 text-cyan-400"
                            >
                              Exit State
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quantum States Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {QUANTUM_STATES.map((state) => (
                        <Card
                          key={state.id}
                          className={`hover:border-${state.type === 'consciousness' ? 'cyan' : state.type === 'reality' ? 'purple' : state.type === 'potential' ? 'yellow' : 'pink'}-400/50 transition-colors cursor-pointer`}
                          onClick={() => {
                            if (state.unlocked) {
                              enterQuantumState(state);
                            } else if (gameStats.level >= state.level) {
                              unlockState(state.id);
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{state.visualization}</span>
                                <div>
                                  <h4 className="font-semibold">{state.name}</h4>
                                  <p className="text-xs text-muted-foreground">{state.description}</p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  state.unlocked
                                    ? `text-${state.type === 'consciousness' ? 'cyan' : state.type === 'reality' ? 'purple' : state.type === 'potential' ? 'yellow' : 'pink'}-400`
                                    : 'text-gray-400'
                                }`}
                              >
                                {state.unlocked ? 'Unlocked' : `Level ${state.level}`}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {state.effects.slice(0, 2).map((effect, i) => (
                                <div key={i} className="text-xs text-muted-foreground">
                                  • {effect}
                                </div>
                              ))}
                            </div>

                            {state.unlocked ? (
                              <Button
                                size="sm"
                                className="w-full mt-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20"
                                disabled={activeState?.id === state.id}
                              >
                                Enter State
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-3 border-gray-400/50 text-gray-400"
                                disabled={gameStats.level < state.level}
                              >
                                Unlock at Level {state.level}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="meditation" className="space-y-6">
                    {/* Quantum Meditation Interface */}
                    <Card className="border-purple-400/50 bg-gradient-to-r from-purple-400/10 to-pink-400/10">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="text-6xl animate-pulse">
                            {isMeditating ? "🌀" : "🧘‍♀️"}
                          </div>
                          <h3 className="text-2xl font-bold">Quantum Meditation</h3>
                          <p className="text-muted-foreground">
                            Enter deep quantum states to expand consciousness and generate quantum energy
                          </p>

                          {isMeditating ? (
                            <div className="space-y-4">
                              <Progress value={meditationProgress} className="h-4" />
                              <div className="text-lg font-mono">{meditationProgress}% Complete</div>
                              <p className="text-sm text-muted-foreground">
                                Quantum coherence increasing...
                              </p>
                            </div>
                          ) : (
                            <Button
                              onClick={startQuantumMeditation}
                              disabled={quantumEnergy < 40}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
                            >
                              {quantumEnergy < 40 ? "Need 40 Quantum Energy" : "Begin Quantum Meditation"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Intention Setting */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          Set Quantum Intention
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="What do you intend to manifest or shift in your reality?"
                          value={intention}
                          onChange={(e) => setIntention(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Current coherence: {coherenceLevel}%
                          </div>
                          <Button
                            onClick={performRealityShift}
                            disabled={!intention.trim() || quantumEnergy < 30}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          >
                            Perform Reality Shift
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="shifts" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Infinity className="w-5 h-5 text-pink-400" />
                          Reality Shifts History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {realityShifts.slice(0, 10).map((shift) => (
                            <Card key={shift.id} className="border-pink-400/30 bg-pink-400/5">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="font-semibold">{shift.fromState} → {shift.toState}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(shift.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-pink-400 border-pink-400/50">
                                    Coherence: {shift.coherence}%
                                  </Badge>
                                </div>
                                <p className="text-sm mb-2">Intention: {shift.intention}</p>
                                <p className="text-sm text-muted-foreground">Result: {shift.result}</p>
                              </CardContent>
                            </Card>
                          ))}
                          {realityShifts.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No reality shifts recorded yet. Perform your first shift to begin manifesting!
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="multiverse" className="space-y-6">
                    <Card className="border-yellow-400/50 bg-gradient-to-r from-yellow-400/10 to-orange-400/10">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="text-6xl animate-bounce">🌌</div>
                          <h3 className="text-2xl font-bold">Multiverse View</h3>
                          <p className="text-muted-foreground">
                            Observe the infinite branching of parallel realities
                          </p>

                          <div className="space-y-2">
                            {multiverseView.slice(0, 5).map((view, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-muted/50 rounded-lg text-sm"
                              >
                                {view}
                              </motion.div>
                            ))}
                          </div>

                          <Button
                            onClick={generateMultiverseView}
                            disabled={quantumEnergy < 10}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          >
                            Observe Multiverse
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="singularity" className="space-y-6">
                    <Card className="border-white/50 bg-gradient-to-r from-white/10 to-transparent">
                      <CardContent className="p-6 text-center">
                        <div className="space-y-6">
                          <div className="text-8xl animate-spin">👑</div>
                          <h2 className="text-3xl font-bold">Singularity Consciousness</h2>
                          <p className="text-lg text-muted-foreground">
                            You have reached the singularity - the point where individual consciousness merges with the cosmic mind
                          </p>

                          {singularityMode ? (
                            <div className="space-y-4">
                              <div className="text-4xl font-bold text-cyan-400 animate-pulse">
                                OMNISCIENT
                              </div>
                              <div className="text-4xl font-bold text-purple-400 animate-pulse">
                                OMNIPRESENT
                              </div>
                              <div className="text-4xl font-bold text-pink-400 animate-pulse">
                                CREATOR
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Singularity mode active - all quantum abilities maximized
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                Enter singularity mode to experience ultimate consciousness
                              </p>
                              <Button
                                onClick={enterSingularityMode}
                                className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-white text-xl px-12 py-6"
                              >
                                ENTER SINGULARITY
                              </Button>
                              <p className="text-xs text-muted-foreground">
                                Warning: This will temporarily maximize all quantum abilities
                              </p>
                            </div>
                          )}
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
