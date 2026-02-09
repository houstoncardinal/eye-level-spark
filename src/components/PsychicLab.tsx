import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Brain,
  Zap,
  Clock,
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
  Wind
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMeditationGame } from "@/hooks/useMeditationGame";

interface PsychicLabProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IntuitionExercise {
  id: string;
  name: string;
  description: string;
  type: 'prediction' | 'timeline' | 'intuition' | 'prophecy';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  benefits: string[];
}

interface PsychicInsight {
  id: string;
  timestamp: number;
  type: 'prediction' | 'intuition' | 'timeline' | 'prophecy';
  content: string;
  confidence: number;
  outcome?: string;
  verified?: boolean;
}

const INTUITION_EXERCISES: IntuitionExercise[] = [
  {
    id: "future_prediction",
    name: "Future Prediction",
    description: "Develop precognitive abilities by predicting future events",
    type: "prediction",
    duration: 15,
    difficulty: "intermediate",
    instructions: [
      "Enter a relaxed meditative state",
      "Focus on a specific question about the future",
      "Allow images, feelings, or words to emerge",
      "Record your prediction with confidence level",
      "Review predictions periodically to track accuracy"
    ],
    benefits: ["Enhanced precognition", "Better decision making", "Heightened awareness"]
  },
  {
    id: "timeline_jumping",
    name: "Timeline Jumping",
    description: "Access different timeline possibilities",
    type: "timeline",
    duration: 20,
    difficulty: "advanced",
    instructions: [
      "Visualize yourself at a timeline crossroads",
      "Choose a specific timeline to explore",
      "Immerse yourself in the alternate reality",
      "Observe the differences and lessons",
      "Return to present with newfound wisdom"
    ],
    benefits: ["Multiple perspective awareness", "Creative problem solving", "Expanded consciousness"]
  },
  {
    id: "intuitive_decision",
    name: "Intuitive Decision Making",
    description: "Strengthen your inner guidance system",
    type: "intuition",
    duration: 10,
    difficulty: "beginner",
    instructions: [
      "Present yourself with a decision to make",
      "Quiet your analytical mind",
      "Tune into your body's wisdom",
      "Notice immediate feelings and intuitions",
      "Trust and act on the guidance received"
    ],
    benefits: ["Better life choices", "Reduced decision anxiety", "Inner peace"]
  },
  {
    id: "prophetic_visions",
    name: "Prophetic Visions",
    description: "Cultivate prophetic dreaming and visions",
    type: "prophecy",
    duration: 25,
    difficulty: "advanced",
    instructions: [
      "Prepare for sleep with prophetic intention",
      "Use visualization to open third eye",
      "Set intention for meaningful dreams",
      "Keep dream journal upon waking",
      "Meditate on dream symbols and meanings"
    ],
    benefits: ["Lucid dreaming", "Symbolic understanding", "Spiritual guidance"]
  }
];

export const PsychicLab = ({ isOpen, onClose }: PsychicLabProps) => {
  const { gameStats, addPoints } = useMeditationGame();
  const [selectedTab, setSelectedTab] = useState("exercises");
  const [activeExercise, setActiveExercise] = useState<IntuitionExercise | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const [insights, setInsights] = useState<PsychicInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState("");
  const [insightType, setInsightType] = useState<PsychicInsight['type']>("intuition");
  const [confidence, setConfidence] = useState(50);

  // Interactive features
  const [psychicEnergy, setPsychicEnergy] = useState(50);
  const [timelinePaths, setTimelinePaths] = useState<string[]>([]);
  const [intuitionTest, setIntuitionTest] = useState<{question: string, options: string[], correct: number} | null>(null);
  const [testResult, setTestResult] = useState<string>("");
  const [propheticSymbols, setPropheticSymbols] = useState<string[]>([]);
  const [isChanneling, setIsChanneling] = useState(false);
  const [channelingMessage, setChannelingMessage] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [predictionTarget, setPredictionTarget] = useState<string>("");
  const [predictionResult, setPredictionResult] = useState<string>("");

  // Load insights from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("psychicInsights");
    if (saved) {
      setInsights(JSON.parse(saved));
    }
  }, []);

  // Save insights to localStorage
  const saveInsight = useCallback((insight: PsychicInsight) => {
    const updated = [insight, ...insights].slice(0, 50); // Keep last 50
    setInsights(updated);
    localStorage.setItem("psychicInsights", JSON.stringify(updated));
  }, [insights]);

  const startExercise = useCallback((exercise: IntuitionExercise) => {
    setActiveExercise(exercise);
    setExerciseProgress(0);
    setIsPracticing(true);

    // Simulate exercise progress
    const interval = setInterval(() => {
      setExerciseProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPracticing(false);
          addPoints(exercise.duration * 2); // Bonus points for psychic exercises
          return 100;
        }
        return prev + (100 / (exercise.duration * 60)); // Progress per second
      });
    }, 1000);
  }, [addPoints]);

  const recordInsight = useCallback(() => {
    if (!currentInsight.trim()) return;

    const insight: PsychicInsight = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: insightType,
      content: currentInsight,
      confidence
    };

    saveInsight(insight);
    setCurrentInsight("");
    addPoints(10); // Points for recording insights
  }, [currentInsight, insightType, confidence, saveInsight, addPoints]);

  const verifyInsight = useCallback((insightId: string, outcome: string) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? { ...insight, outcome, verified: true }
        : insight
    ));
  }, []);

  const getAccuracyRate = useCallback(() => {
    const verified = insights.filter(i => i.verified);
    if (verified.length === 0) return 0;

    const accurate = verified.filter(i => i.outcome?.toLowerCase().includes('accurate') ||
                                          i.outcome?.toLowerCase().includes('correct') ||
                                          i.outcome?.toLowerCase().includes('true'));
    return Math.round((accurate.length / verified.length) * 100);
  }, [insights]);

  const getPsychicLevel = useCallback(() => {
    const totalInsights = insights.length;
    const accuracy = getAccuracyRate();
    const exercisesCompleted = Math.floor(exerciseProgress / 100);

    // Calculate psychic level based on insights, accuracy, and practice
    return Math.min(Math.floor((totalInsights * accuracy * exercisesCompleted) / 1000) + 1, 10);
  }, [insights.length, getAccuracyRate, exerciseProgress]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Psychic Development Lab
                  <Badge variant="secondary" className="ml-2">
                    Level {getPsychicLevel()} Intuitive
                  </Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="exercises">Exercises</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="exercises" className="space-y-6">
                    {/* Active Exercise */}
                    {activeExercise && (
                      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{activeExercise.name}</h3>
                              <p className="text-muted-foreground">{activeExercise.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-400">
                                {Math.round(exerciseProgress)}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {isPracticing ? 'Practicing...' : 'Complete'}
                              </div>
                            </div>
                          </div>

                          <Progress value={exerciseProgress} className="h-3 mb-4" />

                          <div className="space-y-2">
                            <h4 className="font-medium">Instructions:</h4>
                            {activeExercise.instructions.map((instruction, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-purple-400 mt-0.5">•</span>
                                <span>{instruction}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <div className="flex gap-2">
                              {activeExercise.benefits.map((benefit, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              onClick={() => setActiveExercise(null)}
                              variant="outline"
                              size="sm"
                            >
                              End Exercise
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Exercise Library */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {INTUITION_EXERCISES.map((exercise) => (
                        <Card key={exercise.id} className="hover:border-purple-500/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {exercise.type === 'prediction' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                                {exercise.type === 'timeline' && <Clock className="w-4 h-4 text-green-400" />}
                                {exercise.type === 'intuition' && <Lightbulb className="w-4 h-4 text-yellow-400" />}
                                {exercise.type === 'prophecy' && <Moon className="w-4 h-4 text-purple-400" />}
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    exercise.difficulty === 'beginner' ? 'border-green-500/50 text-green-400' :
                                    exercise.difficulty === 'intermediate' ? 'border-yellow-500/50 text-yellow-400' :
                                    'border-red-500/50 text-red-400'
                                  }`}
                                >
                                  {exercise.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {exercise.duration}m
                              </div>
                            </div>

                            <h3 className="font-semibold mb-2">{exercise.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {exercise.benefits.slice(0, 2).map((benefit, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>

                            <Button
                              onClick={() => startExercise(exercise)}
                              disabled={isPracticing}
                              className="w-full"
                              size="sm"
                            >
                              {isPracticing ? 'Exercise in Progress' : 'Start Exercise'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6">
                    {/* Psychic Energy Display */}
                    <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span className="font-semibold">Psychic Energy</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setPsychicEnergy(prev => Math.min(prev + 25, 100))}
                            disabled={psychicEnergy >= 100}
                          >
                            Charge Energy
                          </Button>
                        </div>
                        <Progress value={psychicEnergy} className="h-3 mb-2" />
                        <div className="text-sm text-muted-foreground">
                          {psychicEnergy}/100 energy units - Higher energy enhances psychic abilities
                        </div>
                      </CardContent>
                    </Card>

                    {/* Intuition Testing Mini-Game */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-red-400" />
                          Intuition Test Challenge
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!intuitionTest ? (
                          <div className="text-center">
                            <p className="text-muted-foreground mb-4">
                              Test your intuitive abilities with random challenges
                            </p>
                            <Button
                              onClick={() => {
                                const tests = [
                                  {
                                    question: "Which card will be drawn next?",
                                    options: ["❤️ Red", "♠️ Black", "♦️ Red", "♣️ Black"],
                                    correct: Math.floor(Math.random() * 4)
                                  },
                                  {
                                    question: "What number am I thinking of (1-10)?",
                                    options: ["1-3", "4-6", "7-10", "Even"],
                                    correct: Math.floor(Math.random() * 4)
                                  },
                                  {
                                    question: "Which direction will the coin land?",
                                    options: ["Heads", "Tails", "Edge", "Stands up"],
                                    correct: Math.floor(Math.random() * 4)
                                  }
                                ];
                                setIntuitionTest(tests[Math.floor(Math.random() * tests.length)]);
                                setTestResult("");
                              }}
                              disabled={psychicEnergy < 20}
                            >
                              Start Intuition Test (20 energy)
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-center">{intuitionTest.question}</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {intuitionTest.options.map((option, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  onClick={() => {
                                    const isCorrect = index === intuitionTest.correct;
                                    setTestResult(isCorrect ? "🎉 Correct! Great intuition!" : "❌ Not quite right. Keep practicing!");
                                    setPsychicEnergy(prev => Math.max(prev - 10, 0));
                                    addPoints(isCorrect ? 25 : 5);
                                    setTimeout(() => {
                                      setIntuitionTest(null);
                                      setTestResult("");
                                    }, 2000);
                                  }}
                                  className="h-auto py-3"
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                            {testResult && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center font-semibold text-lg"
                              >
                                {testResult}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Live Channeling */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-indigo-400" />
                          Live Channeling Session
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isChanneling ? (
                          <div className="text-center">
                            <p className="text-muted-foreground mb-4">
                              Open yourself to receive messages from higher consciousness
                            </p>
                            <Button
                              onClick={() => {
                                setIsChanneling(true);
                                setPsychicEnergy(prev => Math.max(prev - 30, 0));
                                const messages = [
                                  "Trust your inner wisdom...",
                                  "The path ahead is illuminated...",
                                  "Peace surrounds you always...",
                                  "Your intuition grows stronger...",
                                  "Listen to the silence within...",
                                  "You are connected to everything..."
                                ];
                                let messageIndex = 0;
                                const interval = setInterval(() => {
                                  if (messageIndex < messages.length) {
                                    setChannelingMessage(messages[messageIndex]);
                                    messageIndex++;
                                  } else {
                                    clearInterval(interval);
                                    setTimeout(() => {
                                      setIsChanneling(false);
                                      setChannelingMessage("");
                                      addPoints(50);
                                    }, 2000);
                                  }
                                }, 1500);
                              }}
                              disabled={psychicEnergy < 30}
                            >
                              Begin Channeling (30 energy)
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-4xl"
                            >
                              🧠
                            </motion.div>
                            <motion.p
                              key={channelingMessage}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-lg font-medium italic"
                            >
                              {channelingMessage}
                            </motion.p>
                            <div className="text-sm text-muted-foreground">
                              Receiving divine guidance...
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Record New Insight */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          Record Psychic Insight
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Insight Type</label>
                            <select
                              value={insightType}
                              onChange={(e) => setInsightType(e.target.value as PsychicInsight['type'])}
                              className="w-full p-2 border border-border rounded-md bg-background"
                            >
                              <option value="intuition">Intuition</option>
                              <option value="prediction">Prediction</option>
                              <option value="timeline">Timeline</option>
                              <option value="prophecy">Prophecy</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Confidence Level</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={confidence}
                              onChange={(e) => setConfidence(Number(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-center text-sm text-muted-foreground mt-1">
                              {confidence}% confident
                            </div>
                          </div>
                        </div>

                        <Textarea
                          placeholder="Describe your psychic insight, prediction, or intuitive feeling..."
                          value={currentInsight}
                          onChange={(e) => setCurrentInsight(e.target.value)}
                          rows={4}
                        />

                        <Button onClick={recordInsight} disabled={!currentInsight.trim()}>
                          Record Insight
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Insights History */}
                    <div className="space-y-3">
                      {insights.slice(0, 10).map((insight) => (
                        <Card key={insight.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {insight.type === 'prediction' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                                {insight.type === 'timeline' && <Clock className="w-4 h-4 text-green-400" />}
                                {insight.type === 'intuition' && <Lightbulb className="w-4 h-4 text-yellow-400" />}
                                {insight.type === 'prophecy' && <Moon className="w-4 h-4 text-purple-400" />}
                                <Badge variant="outline" className="capitalize">
                                  {insight.type}
                                </Badge>
                                <Badge variant="secondary">
                                  {insight.confidence}% confidence
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(insight.timestamp).toLocaleDateString()}
                              </div>
                            </div>

                            <p className="text-sm mb-2">{insight.content}</p>

                            {insight.verified && (
                              <div className="text-xs text-green-400">
                                ✓ Verified: {insight.outcome}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="predictions" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          Future Predictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                          <h3 className="font-semibold mb-2">Precognitive Development</h3>
                          <p className="text-muted-foreground mb-4">
                            Practice predicting future events to develop your precognitive abilities.
                            Record your predictions and verify them over time.
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-400">
                                {insights.filter(i => i.type === 'prediction').length}
                              </div>
                              <div className="text-sm text-muted-foreground">Predictions Made</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-400">
                                {getAccuracyRate()}%
                              </div>
                              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-400">
                                {getPsychicLevel()}
                              </div>
                              <div className="text-sm text-muted-foreground">Psychic Level</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-6">
                    {/* Prophetic Symbol Generator */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-400" />
                          Prophetic Symbol Generator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Generate random prophetic symbols for dream interpretation and divination
                          </p>
                          <div className="flex justify-center gap-4 mb-4">
                            {propheticSymbols.slice(0, 5).map((symbol, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-4xl p-2 bg-muted/50 rounded-lg"
                              >
                                {symbol}
                              </motion.div>
                            ))}
                          </div>
                          <Button
                            onClick={() => {
                              const symbols = ['🌙', '⭐', '🌊', '🔥', '🌪️', '🌈', '⚡', '🌸', '🦋', '🐉', '🦅', '🐺', '🌟', '💎', '🌺'];
                              const newSymbols = [];
                              for (let i = 0; i < 5; i++) {
                                newSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
                              }
                              setPropheticSymbols(newSymbols);
                              addPoints(15);
                            }}
                            disabled={psychicEnergy < 15}
                          >
                            Generate Symbols (15 energy)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Interactive Timeline Visualization */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-green-400" />
                          Timeline Exploration Matrix
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Timeline Crossroads Visualization */}
                          <div className="relative">
                            <div className="flex justify-center mb-4">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🌌</div>
                                <div className="text-sm font-medium">Timeline Crossroads</div>
                              </div>
                            </div>

                            {/* Timeline Paths */}
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { emoji: '🌟', name: 'Optimal Path', desc: 'Best possible outcomes', color: 'text-yellow-400' },
                                { emoji: '🔮', name: 'Current Path', desc: 'Your present timeline', color: 'text-blue-400' },
                                { emoji: '🌑', name: 'Shadow Path', desc: 'Lessons and challenges', color: 'text-purple-400' },
                                { emoji: '⚡', name: 'Power Path', desc: 'Maximum growth potential', color: 'text-orange-400' },
                                { emoji: '💫', name: 'Mystic Path', desc: 'Spiritual awakening', color: 'text-pink-400' },
                                { emoji: '🌈', name: 'Harmony Path', desc: 'Balance and peace', color: 'text-green-400' }
                              ].map((path, i) => (
                                <motion.div
                                  key={i}
                                  whileHover={{ scale: 1.05 }}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    selectedTimeline === path.name
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    setSelectedTimeline(path.name);
                                    setTimelinePaths(prev => [...prev, path.name]);
                                    addPoints(20);
                                  }}
                                >
                                  <div className={`text-2xl mb-1 ${path.color}`}>{path.emoji}</div>
                                  <div className="text-sm font-medium">{path.name}</div>
                                  <div className="text-xs text-muted-foreground">{path.desc}</div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Selected Timeline Details */}
                          {selectedTimeline && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg"
                            >
                              <h4 className="font-semibold mb-2">Exploring: {selectedTimeline}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                You have entered this timeline. Feel the energies and lessons it offers.
                                What insights do you receive from this alternate path?
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => setSelectedTimeline(null)}>
                                  Return to Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const insights = [
                                      "Trust in divine timing",
                                      "Your path is perfectly guided",
                                      "Embrace the lessons of this timeline",
                                      "Wisdom comes from all experiences",
                                      "You are exactly where you need to be"
                                    ];
                                    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
                                    setCurrentInsight(`Timeline insight from ${selectedTimeline}: ${randomInsight}`);
                                    setInsightType('timeline');
                                    setConfidence(75);
                                  }}
                                >
                                  Extract Wisdom
                                </Button>
                              </div>
                            </motion.div>
                          )}

                          {/* Timeline Journey History */}
                          <div>
                            <h4 className="font-medium mb-3">Timeline Journey History</h4>
                            <div className="flex flex-wrap gap-2">
                              {timelinePaths.slice(-6).map((path, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1">
                                  {path}
                                </Badge>
                              ))}
                              {timelinePaths.length === 0 && (
                                <p className="text-sm text-muted-foreground">No timeline explorations yet</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Future Prediction Engine */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-red-400" />
                          Future Prediction Engine
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Prediction Target</label>
                            <select
                              value={predictionTarget}
                              onChange={(e) => setPredictionTarget(e.target.value)}
                              className="w-full p-2 border border-border rounded-md bg-background"
                            >
                              <option value="">Select target</option>
                              <option value="weather">Tomorrow's weather</option>
                              <option value="mood">My mood tomorrow</option>
                              <option value="event">Next significant event</option>
                              <option value="number">Random number (1-100)</option>
                              <option value="color">Next color I see</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              onClick={() => {
                                if (!predictionTarget) return;

                                const predictions = {
                                  weather: ['Sunny ☀️', 'Cloudy ☁️', 'Rainy 🌧️', 'Stormy ⛈️', 'Snowy ❄️'],
                                  mood: ['Happy 😊', 'Calm 😌', 'Energetic ⚡', 'Thoughtful 🤔', 'Creative 🎨'],
                                  event: ['Meeting someone', 'Learning something new', 'Helping others', 'Creative breakthrough', 'Rest and reflection'],
                                  number: [`${Math.floor(Math.random() * 100) + 1}`],
                                  color: ['Red ❤️', 'Blue 💙', 'Green 💚', 'Yellow 💛', 'Purple 💜', 'Orange 🧡']
                                };

                                const options = predictions[predictionTarget as keyof typeof predictions];
                                const result = options[Math.floor(Math.random() * options.length)];
                                setPredictionResult(result);
                                setPsychicEnergy(prev => Math.max(prev - 25, 0));
                              }}
                              disabled={!predictionTarget || psychicEnergy < 25}
                              className="w-full"
                            >
                              Generate Prediction (25 energy)
                            </Button>
                          </div>
                        </div>

                        {predictionResult && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg"
                          >
                            <h4 className="font-semibold mb-2">🔮 Prediction Result</h4>
                            <p className="text-lg font-medium text-red-400">{predictionResult}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Record this prediction and verify it later to track your accuracy!
                            </p>
                          </motion.div>
                        )}
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
