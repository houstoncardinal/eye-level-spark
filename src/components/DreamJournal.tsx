import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X, Moon, Sun, Star, Cloud, Sparkles, Plus, Trash2,
  Calendar, TrendingUp, Brain, Heart, Zap, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DreamJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Dream {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: "peaceful" | "exciting" | "scary" | "confusing" | "lucid" | "prophetic";
  symbols: string[];
  clarity: number; // 1-5
  lucidity: number; // 1-5
  analysis?: DreamAnalysis;
}

interface DreamAnalysis {
  themes: string[];
  emotions: string[];
  symbols: { symbol: string; meaning: string }[];
  message: string;
  insights: string[];
}

const DREAM_MOODS = {
  peaceful: { color: "#22C55E", icon: Moon, label: "Peaceful" },
  exciting: { color: "#F59E0B", icon: Zap, label: "Exciting" },
  scary: { color: "#EF4444", icon: Cloud, label: "Scary" },
  confusing: { color: "#8B5CF6", icon: Brain, label: "Confusing" },
  lucid: { color: "#06B6D4", icon: Eye, label: "Lucid" },
  prophetic: { color: "#EC4899", icon: Star, label: "Prophetic" },
};

const COMMON_SYMBOLS = [
  "water", "flying", "falling", "teeth", "death", "animals",
  "chase", "house", "car", "baby", "snake", "fire",
  "ocean", "mountain", "forest", "sky", "mirror", "door"
];

const STORAGE_KEY = "sublime-dream-journal";

// AI Dream Analysis (simulated)
const analyzeDream = (dream: Dream): DreamAnalysis => {
  const content = dream.content.toLowerCase();

  // Detect themes
  const themes: string[] = [];
  if (content.includes("fly") || content.includes("soar")) themes.push("Freedom & Liberation");
  if (content.includes("fall") || content.includes("drop")) themes.push("Loss of Control");
  if (content.includes("water") || content.includes("ocean")) themes.push("Emotions & Subconscious");
  if (content.includes("chase") || content.includes("run")) themes.push("Avoidance");
  if (content.includes("house") || content.includes("home")) themes.push("Self & Identity");
  if (content.includes("death") || content.includes("die")) themes.push("Transformation");
  if (content.includes("love") || content.includes("heart")) themes.push("Relationships");
  if (content.includes("light") || content.includes("bright")) themes.push("Awareness & Clarity");
  if (themes.length === 0) themes.push("Personal Growth");

  // Detect emotions
  const emotions: string[] = [];
  if (content.includes("happy") || content.includes("joy")) emotions.push("Joy");
  if (content.includes("fear") || content.includes("scared")) emotions.push("Fear");
  if (content.includes("peace") || content.includes("calm")) emotions.push("Peace");
  if (content.includes("anger") || content.includes("angry")) emotions.push("Anger");
  if (content.includes("love")) emotions.push("Love");
  if (content.includes("confusion") || content.includes("lost")) emotions.push("Confusion");
  if (emotions.length === 0) emotions.push("Neutral");

  // Symbol meanings
  const symbols: { symbol: string; meaning: string }[] = dream.symbols.map(symbol => {
    const meanings: Record<string, string> = {
      water: "Your emotional state and intuition",
      flying: "Desire for freedom or transcendence",
      falling: "Feeling out of control or insecure",
      teeth: "Concerns about appearance or communication",
      death: "Major life changes or endings",
      animals: "Instincts and primal emotions",
      chase: "Avoiding something in waking life",
      house: "Your sense of self and psyche",
      car: "Life direction and ambition",
      baby: "New beginnings or vulnerability",
      snake: "Hidden fears or transformation",
      fire: "Passion, anger, or purification",
      ocean: "The depths of your unconscious",
      mountain: "Obstacles or achievements",
      forest: "The unknown or your unconscious",
      sky: "Limitless potential and spirituality",
      mirror: "Self-reflection and truth",
      door: "New opportunities or transitions",
    };
    return { symbol, meaning: meanings[symbol] || "Personal significance to explore" };
  });

  // Generate message based on mood and content
  const messages: Record<string, string[]> = {
    peaceful: [
      "Your subconscious is processing positive experiences.",
      "This dream suggests inner harmony and contentment.",
      "You're in alignment with your deeper self.",
    ],
    exciting: [
      "Your mind is energized and seeking new experiences.",
      "This dream reflects your enthusiasm for life.",
      "Exciting changes may be on the horizon.",
    ],
    scary: [
      "Your mind is processing fears or anxieties.",
      "Consider what you might be avoiding in waking life.",
      "This dream invites you to face your shadows with courage.",
    ],
    confusing: [
      "Your subconscious is working through complexity.",
      "Take time to reflect on recent life decisions.",
      "Clarity will come with patience and contemplation.",
    ],
    lucid: [
      "You're developing strong awareness and control.",
      "This indicates growing self-mastery.",
      "Your consciousness is expanding beautifully.",
    ],
    prophetic: [
      "Pay attention to the symbols and messages.",
      "Your intuition is highly active right now.",
      "Trust your inner guidance system.",
    ],
  };

  const message = messages[dream.mood][Math.floor(Math.random() * messages[dream.mood].length)];

  // Generate insights
  const insights = [
    `Your dream's ${dream.clarity}/5 clarity suggests ${dream.clarity >= 3 ? "strong memory recall - journal often!" : "practice dream recall techniques."}`,
    `The ${dream.mood} nature of this dream ${dream.lucidity >= 3 ? "combined with lucidity shows developing awareness." : "offers opportunities for deeper exploration."}`,
    themes.length > 1 ? `Multiple themes suggest rich subconscious activity.` : `Focus on the ${themes[0]} theme for deeper understanding.`,
  ];

  return { themes, emotions, symbols, message, insights };
};

export const DreamJournal = ({ isOpen, onClose }: DreamJournalProps) => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isAddingDream, setIsAddingDream] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [newDream, setNewDream] = useState({
    title: "",
    content: "",
    mood: "peaceful" as Dream["mood"],
    symbols: [] as string[],
    clarity: 3,
    lucidity: 1,
  });

  // Load dreams from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDreams(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save dreams to localStorage
  const saveDreams = (newDreams: Dream[]) => {
    setDreams(newDreams);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDreams));
  };

  // Add new dream
  const addDream = () => {
    if (!newDream.title || !newDream.content) return;

    const dream: Dream = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...newDream,
    };

    // Analyze the dream
    dream.analysis = analyzeDream(dream);

    const updated = [dream, ...dreams];
    saveDreams(updated);
    setIsAddingDream(false);
    setSelectedDream(dream);
    setNewDream({
      title: "",
      content: "",
      mood: "peaceful",
      symbols: [],
      clarity: 3,
      lucidity: 1,
    });
  };

  // Delete dream
  const deleteDream = (id: string) => {
    const updated = dreams.filter(d => d.id !== id);
    saveDreams(updated);
    if (selectedDream?.id === id) setSelectedDream(null);
  };

  // Toggle symbol
  const toggleSymbol = (symbol: string) => {
    setNewDream(prev => ({
      ...prev,
      symbols: prev.symbols.includes(symbol)
        ? prev.symbols.filter(s => s !== symbol)
        : [...prev.symbols, symbol],
    }));
  };

  // Calculate dream stats
  const stats = {
    total: dreams.length,
    lucid: dreams.filter(d => d.lucidity >= 3).length,
    avgClarity: dreams.length > 0
      ? dreams.reduce((sum, d) => sum + d.clarity, 0) / dreams.length
      : 0,
    moodDistribution: Object.keys(DREAM_MOODS).reduce((acc, mood) => {
      acc[mood] = dreams.filter(d => d.mood === mood).length;
      return acc;
    }, {} as Record<string, number>),
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
            className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-violet-950/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Moon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">Dream Journal</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex h-[calc(100%-80px)]">
              {/* Left sidebar - Dream list */}
              <div className="w-72 border-r border-white/10 p-4 overflow-y-auto">
                <Button
                  className="w-full mb-4"
                  onClick={() => setIsAddingDream(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Dream
                </Button>

                {/* Stats summary */}
                <Card className="mb-4 bg-white/5 border-white/10">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-400">{stats.total}</p>
                        <p className="text-white/50 text-xs">Dreams</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{stats.lucid}</p>
                        <p className="text-white/50 text-xs">Lucid</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dream list */}
                <div className="space-y-2">
                  {dreams.map((dream) => {
                    const mood = DREAM_MOODS[dream.mood];
                    const Icon = mood.icon;
                    return (
                      <motion.div
                        key={dream.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedDream?.id === dream.id
                            ? "bg-white/20 ring-1 ring-white/30"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedDream(dream)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{dream.title}</h4>
                            <p className="text-white/50 text-xs">
                              {new Date(dream.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: mood.color + "40" }}
                          >
                            <Icon className="w-3 h-3" style={{ color: mood.color }} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {dreams.length === 0 && (
                    <p className="text-center text-white/40 text-sm py-8">
                      No dreams recorded yet.<br />Start your dream journal today!
                    </p>
                  )}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 overflow-y-auto">
                {isAddingDream ? (
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white">Record New Dream</h3>

                    <Input
                      placeholder="Dream title..."
                      value={newDream.title}
                      onChange={(e) => setNewDream(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white/5 border-white/20"
                    />

                    <Textarea
                      placeholder="Describe your dream in detail... Include feelings, colors, people, and any significant events."
                      value={newDream.content}
                      onChange={(e) => setNewDream(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[150px] bg-white/5 border-white/20"
                    />

                    {/* Mood selection */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Dream Mood</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(DREAM_MOODS).map(([key, mood]) => {
                          const Icon = mood.icon;
                          return (
                            <Button
                              key={key}
                              variant={newDream.mood === key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewDream(prev => ({ ...prev, mood: key as Dream["mood"] }))}
                              style={{
                                borderColor: newDream.mood === key ? mood.color : undefined,
                                backgroundColor: newDream.mood === key ? mood.color + "40" : undefined,
                              }}
                            >
                              <Icon className="w-4 h-4 mr-1" style={{ color: mood.color }} />
                              {mood.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Symbol selection */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Dream Symbols</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_SYMBOLS.map((symbol) => (
                          <Badge
                            key={symbol}
                            variant={newDream.symbols.includes(symbol) ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleSymbol(symbol)}
                          >
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Clarity & Lucidity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">
                          Dream Clarity: {newDream.clarity}/5
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Button
                              key={n}
                              variant={newDream.clarity >= n ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewDream(prev => ({ ...prev, clarity: n }))}
                            >
                              <Star className={`w-4 h-4 ${newDream.clarity >= n ? "fill-current" : ""}`} />
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">
                          Lucidity Level: {newDream.lucidity}/5
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Button
                              key={n}
                              variant={newDream.lucidity >= n ? "default" : "outline"}
                              size="sm"
                              onClick={() => setNewDream(prev => ({ ...prev, lucidity: n }))}
                            >
                              <Eye className={`w-4 h-4 ${newDream.lucidity >= n ? "fill-current" : ""}`} />
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button onClick={addDream} className="flex-1">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Save & Analyze Dream
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingDream(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : selectedDream ? (
                  <Tabs defaultValue="dream" className="h-full">
                    <TabsList className="w-full justify-start px-6 pt-4 bg-transparent">
                      <TabsTrigger value="dream">Dream</TabsTrigger>
                      <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dream" className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{selectedDream.title}</h3>
                          <p className="text-white/50 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(selectedDream.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => deleteDream(selectedDream.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Mood badge */}
                      {(() => {
                        const mood = DREAM_MOODS[selectedDream.mood];
                        const Icon = mood.icon;
                        return (
                          <Badge
                            className="text-sm"
                            style={{ backgroundColor: mood.color + "40", color: mood.color }}
                          >
                            <Icon className="w-4 h-4 mr-1" />
                            {mood.label}
                          </Badge>
                        );
                      })()}

                      {/* Dream content */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                          {selectedDream.content}
                        </p>
                      </div>

                      {/* Symbols */}
                      {selectedDream.symbols.length > 0 && (
                        <div>
                          <h4 className="text-white/70 text-sm mb-2">Dream Symbols</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedDream.symbols.map((symbol) => (
                              <Badge key={symbol} variant="outline" className="capitalize">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clarity & Lucidity */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Clarity</span>
                              <span className="text-white font-bold">{selectedDream.clarity}/5</span>
                            </div>
                            <Progress value={selectedDream.clarity * 20} className="mt-2" />
                          </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-white/70">Lucidity</span>
                              <span className="text-white font-bold">{selectedDream.lucidity}/5</span>
                            </div>
                            <Progress value={selectedDream.lucidity * 20} className="mt-2" />
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="p-6 space-y-4">
                      {selectedDream.analysis && (
                        <>
                          {/* AI Message */}
                          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Brain className="w-6 h-6 text-indigo-400 mt-1" />
                                <div>
                                  <h4 className="text-white font-medium mb-1">Dream Interpretation</h4>
                                  <p className="text-white/80">{selectedDream.analysis.message}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Themes */}
                          <div>
                            <h4 className="text-white/70 text-sm mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Detected Themes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedDream.analysis.themes.map((theme) => (
                                <Badge key={theme} className="bg-purple-500/30 text-purple-200">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Emotions */}
                          <div>
                            <h4 className="text-white/70 text-sm mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Emotional Undertones
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedDream.analysis.emotions.map((emotion) => (
                                <Badge key={emotion} className="bg-pink-500/30 text-pink-200">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Symbol Analysis */}
                          {selectedDream.analysis.symbols.length > 0 && (
                            <div>
                              <h4 className="text-white/70 text-sm mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Symbol Meanings
                              </h4>
                              <div className="space-y-2">
                                {selectedDream.analysis.symbols.map(({ symbol, meaning }) => (
                                  <div
                                    key={symbol}
                                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                                  >
                                    <span className="text-cyan-400 capitalize font-medium">{symbol}</span>
                                    <p className="text-white/70 text-sm mt-1">{meaning}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Insights */}
                          <div>
                            <h4 className="text-white/70 text-sm mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Personal Insights
                            </h4>
                            <ul className="space-y-2">
                              {selectedDream.analysis.insights.map((insight, i) => (
                                <li key={i} className="flex items-start gap-2 text-white/80">
                                  <span className="text-indigo-400 mt-1">•</span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/40">
                    <Moon className="w-16 h-16 mb-4" />
                    <p className="text-lg">Select a dream or record a new one</p>
                    <p className="text-sm mt-2">Track your dreams and discover hidden patterns</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
