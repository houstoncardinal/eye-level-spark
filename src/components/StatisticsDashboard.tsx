import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Award, Target, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface StatisticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string | null;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_session", title: "First Steps", description: "Complete your first meditation session", icon: "🌱", unlocked: false },
  { id: "week_warrior", title: "Week Warrior", description: "Meditate for 7 consecutive days", icon: "⚔️", unlocked: false },
  { id: "hour_master", title: "Hour Master", description: "Accumulate 60 minutes of meditation", icon: "⏰", unlocked: false },
  { id: "streak_master", title: "Streak Master", description: "Maintain a 30-day meditation streak", icon: "🔥", unlocked: false },
  { id: "zen_master", title: "Zen Master", description: "Complete 100 meditation sessions", icon: "🧘", unlocked: false },
  { id: "pattern_seeker", title: "Pattern Seeker", description: "Experience all sacred geometry patterns", icon: "⭐", unlocked: false },
];

const WEEKLY_DATA = [
  { day: "Mon", minutes: 15 },
  { day: "Tue", minutes: 20 },
  { day: "Wed", minutes: 10 },
  { day: "Thu", minutes: 25 },
  { day: "Fri", minutes: 30 },
  { day: "Sat", minutes: 45 },
  { day: "Sun", minutes: 35 },
];

const MONTHLY_DATA = [
  { month: "Jan", sessions: 12 },
  { month: "Feb", sessions: 18 },
  { month: "Mar", sessions: 15 },
  { month: "Apr", sessions: 22 },
  { month: "May", sessions: 28 },
  { month: "Jun", sessions: 20 },
];

const MODE_DATA = [
  { name: "Presence", value: 45, color: "#8b5cf6" },
  { name: "Breathing", value: 35, color: "#06b6d4" },
  { name: "Constellation", value: 20, color: "#f59e0b" },
];

export const StatisticsDashboard = ({ isOpen, onClose, stats }: StatisticsDashboardProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);

  useEffect(() => {
    // Update achievements based on stats
    setAchievements(prev => prev.map(achievement => {
      let unlocked = false;
      let progress = 0;
      let maxProgress = 1;

      switch (achievement.id) {
        case "first_session":
          unlocked = stats.totalSessions >= 1;
          break;
        case "week_warrior":
          unlocked = stats.longestStreak >= 7;
          progress = Math.min(stats.currentStreak, 7);
          maxProgress = 7;
          break;
        case "hour_master":
          unlocked = stats.totalMinutes >= 60;
          progress = Math.min(stats.totalMinutes, 60);
          maxProgress = 60;
          break;
        case "streak_master":
          unlocked = stats.longestStreak >= 30;
          progress = Math.min(stats.longestStreak, 30);
          maxProgress = 30;
          break;
        case "zen_master":
          unlocked = stats.totalSessions >= 100;
          progress = Math.min(stats.totalSessions, 100);
          maxProgress = 100;
          break;
        case "pattern_seeker":
          unlocked = true; // Assume unlocked for demo
          break;
      }

      return { ...achievement, unlocked, progress, maxProgress };
    }));
  }, [stats]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;
  const achievementProgress = (unlockedAchievements.length / totalAchievements) * 100;

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
                  <BarChart3 className="w-5 h-5" />
                  Meditation Statistics
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Total Sessions</span>
                          </div>
                          <p className="text-2xl font-bold">{stats.totalSessions}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Total Time</span>
                          </div>
                          <p className="text-2xl font-bold">{formatTime(stats.totalMinutes)}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Current Streak</span>
                          </div>
                          <p className="text-2xl font-bold">{stats.currentStreak}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Best Streak</span>
                          </div>
                          <p className="text-2xl font-bold">{stats.longestStreak}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Weekly Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={WEEKLY_DATA}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="minutes" fill="hsl(var(--primary))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Mode Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={MODE_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {MODE_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex justify-center gap-4 mt-2">
                            {MODE_DATA.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1 text-sm">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="progress" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Monthly Sessions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={MONTHLY_DATA}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="sessions"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={{ fill: "hsl(var(--primary))" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Average Session Length</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">
                            {stats.totalSessions > 0 ? Math.round(stats.totalMinutes / stats.totalSessions) : 0}m
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Based on {stats.totalSessions} completed sessions
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Consistency Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">
                            {stats.longestStreak > 0 ? Math.min(Math.round((stats.currentStreak / stats.longestStreak) * 100), 100) : 0}%
                          </div>
                          <Progress
                            value={stats.longestStreak > 0 ? (stats.currentStreak / stats.longestStreak) * 100 : 0}
                            className="mt-2"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Achievement Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-2xl font-bold">
                            {unlockedAchievements.length}/{totalAchievements}
                          </div>
                          <Progress value={achievementProgress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(achievementProgress)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {achievements.map((achievement) => (
                            <Card
                              key={achievement.id}
                              className={`transition-all ${
                                achievement.unlocked
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-border/50 opacity-60"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl">{achievement.icon}</div>
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${achievement.unlocked ? "text-primary" : ""}`}>
                                      {achievement.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {achievement.description}
                                    </p>
                                    {achievement.progress !== undefined && achievement.maxProgress && (
                                      <div className="mt-2">
                                        <Progress
                                          value={(achievement.progress / achievement.maxProgress) * 100}
                                          className="h-1"
                                        />
                                        <span className="text-xs text-muted-foreground mt-1 block">
                                          {achievement.progress}/{achievement.maxProgress}
                                        </span>
                                      </div>
                                    )}
                                    {achievement.unlocked && (
                                      <Badge variant="secondary" className="mt-2">
                                        Unlocked
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Weekly Goal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary mb-2">4/7</div>
                          <Progress value={57} className="mb-2" />
                          <p className="text-sm text-muted-foreground">
                            3 more sessions this week to reach your goal
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Peak Meditation Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary mb-2">Evening</div>
                          <p className="text-sm text-muted-foreground">
                            You meditate most between 6-9 PM
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Favorite Mode</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary mb-2">Presence</div>
                          <p className="text-sm text-muted-foreground">
                            45% of your sessions use this mode
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Milestone</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary mb-2">2h Total</div>
                          <p className="text-sm text-muted-foreground">
                            Next milestone: 5h total meditation time
                          </p>
                        </CardContent>
                      </Card>
                    </div>
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
