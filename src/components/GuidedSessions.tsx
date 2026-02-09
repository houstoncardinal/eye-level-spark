import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, X, Clock, Star, Heart, Zap, Moon, Sun, Leaf, Volume2, VolumeX, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useVoiceSynthesis } from "@/hooks/useVoiceSynthesis";

interface GuidedSession {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  category: "mindfulness" | "breathing" | "body-scan" | "loving-kindness" | "visualization";
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: React.ReactNode;
  benefits: string[];
  instructions: string[];
}

interface GuidedSessionsProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (duration: number) => void;
}

const SESSIONS: GuidedSession[] = [
  {
    id: "mindful-breathing",
    title: "Mindful Breathing",
    description: "Focus on your breath to cultivate present-moment awareness",
    duration: 10,
    category: "breathing",
    difficulty: "beginner",
    icon: <Heart className="w-5 h-5" />,
    benefits: ["Reduced stress", "Better focus", "Emotional balance"],
    instructions: [
      "Find a comfortable seated position",
      "Close your eyes and focus on your natural breath",
      "Notice the sensation of air entering and leaving your nostrils",
      "When your mind wanders, gently return to your breath",
      "Continue for the full duration"
    ]
  },
  {
    id: "body-scan",
    title: "Body Scan Meditation",
    description: "Systematically relax each part of your body",
    duration: 15,
    category: "body-scan",
    difficulty: "beginner",
    icon: <Leaf className="w-5 h-5" />,
    benefits: ["Deep relaxation", "Body awareness", "Stress relief"],
    instructions: [
      "Lie down comfortably on your back",
      "Close your eyes and take a few deep breaths",
      "Bring awareness to your toes, noticing any sensations",
      "Slowly move your attention up through your body",
      "Release tension as you go, ending at the top of your head"
    ]
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    description: "Cultivate compassion for yourself and others",
    duration: 12,
    category: "loving-kindness",
    difficulty: "intermediate",
    icon: <Heart className="w-5 h-5" />,
    benefits: ["Increased compassion", "Reduced self-criticism", "Better relationships"],
    instructions: [
      "Sit comfortably with eyes closed",
      "Begin by sending love to yourself",
      "Extend loving-kindness to a loved one",
      "Include neutral people in your practice",
      "Finally, extend love to all beings everywhere"
    ]
  },
  {
    id: "morning-energy",
    title: "Morning Energy Boost",
    description: "Start your day with vitality and clarity",
    duration: 8,
    category: "mindfulness",
    difficulty: "beginner",
    icon: <Sun className="w-5 h-5" />,
    benefits: ["Morning motivation", "Mental clarity", "Positive mindset"],
    instructions: [
      "Sit up straight in a chair or on the floor",
      "Take three deep energizing breaths",
      "Set an intention for your day",
      "Visualize yourself accomplishing your goals",
      "Feel the energy flowing through your body"
    ]
  },
  {
    id: "evening-wind-down",
    title: "Evening Wind Down",
    description: "Release the day's stress and prepare for restful sleep",
    duration: 20,
    category: "mindfulness",
    difficulty: "intermediate",
    icon: <Moon className="w-5 h-5" />,
    benefits: ["Better sleep", "Stress release", "Peaceful mind"],
    instructions: [
      "Lie down in a comfortable position",
      "Take slow, deep breaths to relax your body",
      "Review your day with gratitude",
      "Let go of any worries or tension",
      "Allow yourself to drift into peaceful rest"
    ]
  },
  {
    id: "focus-enhancement",
    title: "Focus Enhancement",
    description: "Sharpen your concentration and mental clarity",
    duration: 15,
    category: "mindfulness",
    difficulty: "intermediate",
    icon: <Zap className="w-5 h-5" />,
    benefits: ["Improved concentration", "Mental clarity", "Productivity boost"],
    instructions: [
      "Sit in a quiet space with good posture",
      "Choose a single point of focus (breath or object)",
      "Maintain attention on your chosen focus",
      "When distracted, gently return your attention",
      "Build concentration gradually over time"
    ]
  }
];

const CATEGORIES = [
  { id: "all", name: "All Sessions", icon: <Star className="w-4 h-4" /> },
  { id: "mindfulness", name: "Mindfulness", icon: <Heart className="w-4 h-4" /> },
  { id: "breathing", name: "Breathing", icon: <Leaf className="w-4 h-4" /> },
  { id: "body-scan", name: "Body Scan", icon: <Sun className="w-4 h-4" /> },
  { id: "loving-kindness", name: "Loving Kindness", icon: <Moon className="w-4 h-4" /> },
  { id: "visualization", name: "Visualization", icon: <Zap className="w-4 h-4" /> },
];

export const GuidedSessions = ({ isOpen, onClose, onStartSession }: GuidedSessionsProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSession, setSelectedSession] = useState<GuidedSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [progress, setProgress] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const {
    isActive,
    timeRemaining,
    elapsedTime,
    startSession,
    stopSession,
    formatTime
  } = useSessionTimer();

  const {
    isSupported: voiceSupported,
    isSpeaking,
    voices,
    currentVoice,
    options: voiceOptions,
    speak,
    pause,
    resume,
    stop: stopVoice,
    setVoice,
    updateOptions
  } = useVoiceSynthesis();

  const filteredSessions = selectedCategory === "all"
    ? SESSIONS
    : SESSIONS.filter(session => session.category === selectedCategory);

  const handleStartSession = (session: GuidedSession) => {
    setSelectedSession(session);
    setCurrentInstruction(0);
    setProgress(0);
    setIsPlaying(true);
    startSession(session.duration);
    onStartSession(session.duration);
  };

  const handleStopSession = () => {
    setIsPlaying(false);
    setSelectedSession(null);
    setCurrentInstruction(0);
    setProgress(0);
    stopSession();
  };

  // Update progress and instructions during session
  useEffect(() => {
    if (isActive && selectedSession) {
      const totalTime = selectedSession.duration * 60;
      const currentProgress = (elapsedTime / totalTime) * 100;
      setProgress(currentProgress);

      // Update instruction based on progress
      const instructionIndex = Math.floor((elapsedTime / totalTime) * selectedSession.instructions.length);
      setCurrentInstruction(Math.min(instructionIndex, selectedSession.instructions.length - 1));
    }
  }, [isActive, elapsedTime, selectedSession]);

  // Voice guidance - speak instructions when they change
  useEffect(() => {
    if (isActive && selectedSession && voiceEnabled && voiceSupported && autoAdvance && isPlaying) {
      const currentText = selectedSession.instructions[currentInstruction];
      if (currentText) {
        speak(currentText);
      }
    }
  }, [currentInstruction, selectedSession, voiceEnabled, voiceSupported, autoAdvance, isPlaying, isActive, speak]);

  // Handle session start - speak first instruction
  useEffect(() => {
    if (isActive && selectedSession && voiceEnabled && voiceSupported && currentInstruction === 0) {
      const firstInstruction = selectedSession.instructions[0];
      if (firstInstruction) {
        // Small delay to let the session start
        setTimeout(() => speak(firstInstruction), 1000);
      }
    }
  }, [isActive, selectedSession, voiceEnabled, voiceSupported, currentInstruction, speak]);

  // Handle play/pause voice
  useEffect(() => {
    if (!isPlaying && voiceSupported) {
      pause();
    } else if (isPlaying && voiceSupported && !isSpeaking && voiceEnabled) {
      // Resume speaking current instruction if paused
      const currentText = selectedSession?.instructions[currentInstruction];
      if (currentText) {
        speak(currentText);
      }
    }
  }, [isPlaying, voiceSupported, isSpeaking, voiceEnabled, selectedSession, currentInstruction, pause, speak]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "advanced": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
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
            className="w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Guided Meditation Sessions
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                {!selectedSession ? (
                  <>
                    {/* Category Filter */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      {CATEGORIES.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="flex items-center gap-1 whitespace-nowrap"
                        >
                          {category.icon}
                          {category.name}
                        </Button>
                      ))}
                    </div>

                    {/* Sessions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSessions.map((session) => (
                        <Card
                          key={session.id}
                          className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
                          onClick={() => handleStartSession(session)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {session.icon}
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getDifficultyColor(session.difficulty)}`}
                                >
                                  {session.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {session.duration}m
                              </div>
                            </div>

                            <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{session.description}</p>

                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {session.benefits.slice(0, 2).map((benefit, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Button className="w-full mt-4" size="sm">
                              <Play className="w-3 h-3 mr-1" />
                              Start Session
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Active Session View */
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {selectedSession.icon}
                        <h2 className="text-2xl font-bold">{selectedSession.title}</h2>
                      </div>

                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-mono font-bold text-primary">
                            {formatTime(timeRemaining)}
                          </div>
                          <div className="text-sm text-muted-foreground">Remaining</div>
                        </div>

                        <div className="flex-1 max-w-xs">
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="text-center">
                          <div className="text-3xl font-mono font-bold text-primary">
                            {formatTime(elapsedTime)}
                          </div>
                          <div className="text-sm text-muted-foreground">Elapsed</div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-2 mb-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStopSession}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                        {voiceSupported && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVoiceEnabled(!voiceEnabled)}
                              className={voiceEnabled ? "border-green-500/50" : "border-red-500/50"}
                            >
                              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Voice Settings */}
                      {showVoiceSettings && voiceSupported && (
                        <Card className="max-w-2xl mx-auto mb-6">
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-4">Voice Settings</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="voice-enabled">Voice Guidance</Label>
                                <Switch
                                  id="voice-enabled"
                                  checked={voiceEnabled}
                                  onCheckedChange={setVoiceEnabled}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label htmlFor="auto-advance">Auto Advance Instructions</Label>
                                <Switch
                                  id="auto-advance"
                                  checked={autoAdvance}
                                  onCheckedChange={setAutoAdvance}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Voice Speed: {voiceOptions.rate?.toFixed(1)}x</Label>
                                <Slider
                                  value={[voiceOptions.rate || 0.8]}
                                  onValueChange={(value) => updateOptions({ rate: value[0] })}
                                  min={0.5}
                                  max={2}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Voice Volume: {Math.round((voiceOptions.volume || 0.8) * 100)}%</Label>
                                <Slider
                                  value={[voiceOptions.volume || 0.8]}
                                  onValueChange={(value) => updateOptions({ volume: value[0] })}
                                  min={0.1}
                                  max={1}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Voice Selection</Label>
                                <Select
                                  value={currentVoice?.name || ""}
                                  onValueChange={(voiceName) => {
                                    const voice = voices.find(v => v.name === voiceName);
                                    if (voice) setVoice(voice);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select voice" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {voices.map((voice) => (
                                      <SelectItem key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Current Instruction */}
                    <Card className="max-w-2xl mx-auto">
                      <CardContent className="p-6 text-center">
                        <div className="text-lg font-medium mb-4">
                          Step {currentInstruction + 1} of {selectedSession.instructions.length}
                        </div>
                        <p className="text-xl leading-relaxed">
                          {selectedSession.instructions[currentInstruction]}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Session Benefits */}
                    <div className="max-w-2xl mx-auto">
                      <h3 className="text-lg font-semibold mb-3 text-center">Benefits of this practice:</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {selectedSession.benefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
