import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Smile,
  Frown,
  Meh,
  X,
  Star,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useSessionTimer } from "@/hooks/useSessionTimer";

interface WellnessEntry {
  id: string;
  date: string;
  mood: number; // 1-5 scale
  gratitude: string[];
  intentions: string[];
  notes: string;
}

interface WellnessDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAILY_AFFIRMATIONS = [
  "I am worthy of peace and happiness",
  "My mind is calm and focused",
  "I radiate positive energy",
  "I am grateful for this moment",
  "I choose joy and well-being",
  "My body and mind are in harmony",
  "I am capable of amazing things",
  "I deserve love and compassion"
];

const WELLNESS_TIPS = [
  "Take 3 deep breaths when feeling stressed",
  "Practice gratitude by noting 3 things you're thankful for",
  "Stay hydrated - drink water mindfully",
  "Take short walks in nature when possible",
  "Set boundaries to protect your energy",
  "Connect with loved ones regularly",
  "Practice self-compassion daily",
  "Get adequate restorative sleep"
];

const MOOD_ICONS = [
  { icon: Frown, label: "Challenging", color: "text-red-400" },
  { icon: Meh, label: "Neutral", color: "text-yellow-400" },
  { icon: Smile, label: "Good", color: "text-green-400" },
  { icon: Heart, label: "Great", color: "text-pink-400" },
  { icon: Sparkles, label: "Amazing", color: "text-purple-400" }
];

export const WellnessDashboard = ({ isOpen, onClose }: WellnessDashboardProps) => {
  const [currentView, setCurrentView] = useState<"overview" | "gratitude" | "intentions" | "mood">("overview");
  const [todayEntry, setTodayEntry] = useState<WellnessEntry | null>(null);
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [intentionInput, setIntentionInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const { stats } = useSessionTimer();

  // Load today's entry from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`wellness-${today}`);
    if (saved) {
      setTodayEntry(JSON.parse(saved));
    } else {
      setTodayEntry({
        id: today,
        date: today,
        mood: 3,
        gratitude: [],
        intentions: [],
        notes: ""
      });
    }
  }, []);

  const saveEntry = (updates: Partial<WellnessEntry>) => {
    if (!todayEntry) return;

    const updated = { ...todayEntry, ...updates };
    setTodayEntry(updated);
    localStorage.setItem(`wellness-${updated.date}`, JSON.stringify(updated));
  };

  const addGratitude = () => {
    if (!gratitudeInput.trim() || !todayEntry) return;

    const updated = {
      ...todayEntry,
      gratitude: [...todayEntry.gratitude, gratitudeInput.trim()]
    };
    saveEntry(updated);
    setGratitudeInput("");
  };

  const addIntention = () => {
    if (!intentionInput.trim() || !todayEntry) return;

    const updated = {
      ...todayEntry,
      intentions: [...todayEntry.intentions, intentionInput.trim()]
    };
    saveEntry(updated);
    setIntentionInput("");
  };

  const updateMood = (mood: number) => {
    setSelectedMood(mood);
    saveEntry({ mood });
  };

  const getStreakDays = () => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      if (localStorage.getItem(`wellness-${dateStr}`)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getWeeklyProgress = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const entry = localStorage.getItem(`wellness-${dateStr}`);
      weekData.push(entry ? JSON.parse(entry).mood : null);
    }
    return weekData;
  };

  const getRandomAffirmation = () => {
    return DAILY_AFFIRMATIONS[Math.floor(Math.random() * DAILY_AFFIRMATIONS.length)];
  };

  const getRandomTip = () => {
    return WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)];
  };

  const weeklyProgress = getWeeklyProgress();
  const streakDays = getStreakDays();

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
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Wellness Dashboard
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                {/* Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {[
                    { id: "overview", name: "Overview", icon: Star },
                    { id: "gratitude", name: "Gratitude", icon: Heart },
                    { id: "intentions", name: "Intentions", icon: Target },
                    { id: "mood", name: "Mood", icon: Smile }
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={currentView === tab.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentView(tab.id as any)}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                    </Button>
                  ))}
                </div>

                {/* Content based on current view */}
                {currentView === "overview" && (
                  <div className="space-y-6">
                    {/* Daily Inspiration */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          <h3 className="font-semibold">Daily Inspiration</h3>
                        </div>
                        <p className="text-lg italic text-center mb-4">"{getRandomAffirmation()}"</p>
                        <p className="text-sm text-muted-foreground text-center">
                          💡 {getRandomTip()}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary mb-1">{streakDays}</div>
                          <div className="text-sm text-muted-foreground">Day Streak</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary mb-1">{stats.totalSessions}</div>
                          <div className="text-sm text-muted-foreground">Sessions Completed</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
                          </div>
                          <div className="text-sm text-muted-foreground">Total Practice Time</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Weekly Mood Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Weekly Mood Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between h-20 gap-1">
                          {weeklyProgress.map((mood, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div
                                className={`w-full rounded-t transition-all ${
                                  mood ? 'bg-primary' : 'bg-muted'
                                }`}
                                style={{ height: mood ? `${(mood / 5) * 100}%` : '10%' }}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { weekday: 'short' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cardinal Binaural Reference */}
                    <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Explore Advanced Binaural Experiences</h3>
                            <p className="text-muted-foreground mb-4">
                              Discover scientifically-designed binaural beat frequencies for enhanced meditation, focus, and well-being.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-purple-400">
                              <ExternalLink className="w-4 h-4" />
                              cardinalbinaural.com
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="border-purple-500/50 hover:bg-purple-500/10"
                            onClick={() => window.open('https://cardinalbinaural.com', '_blank')}
                          >
                            Visit Site
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === "gratitude" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Gratitude Practice</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="What are you grateful for today?"
                            value={gratitudeInput}
                            onChange={(e) => setGratitudeInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={addGratitude} disabled={!gratitudeInput.trim()}>
                            Add
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {todayEntry?.gratitude.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === "intentions" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Set Your Daily Intentions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="What do you intend to focus on today?"
                            value={intentionInput}
                            onChange={(e) => setIntentionInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={addIntention} disabled={!intentionInput.trim()}>
                            Add
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {todayEntry?.intentions.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                              <Target className="w-4 h-4 text-blue-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentView === "mood" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>How are you feeling today?</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex justify-center gap-4">
                          {MOOD_ICONS.map((mood, i) => {
                            const Icon = mood.icon;
                            return (
                              <Button
                                key={i}
                                variant={selectedMood === i + 1 ? "default" : "outline"}
                                size="lg"
                                onClick={() => updateMood(i + 1)}
                                className="flex flex-col items-center gap-2 h-auto p-4"
                              >
                                <Icon className={`w-8 h-8 ${mood.color}`} />
                                <span className="text-sm">{mood.label}</span>
                              </Button>
                            );
                          })}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes (optional)</label>
                          <Textarea
                            placeholder="Any additional thoughts about your day..."
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            onBlur={() => saveEntry({ notes: notesInput })}
                          />
                        </div>
                      </CardContent>
                    </Card>
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
