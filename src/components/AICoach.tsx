import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  X,
  RefreshCw,
  MessageCircle,
  Star,
  Clock,
  Heart,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeditationAI } from "@/hooks/useMeditationAI";
import { useMeditationGame } from "@/hooks/useMeditationGame";

interface AICoachProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICoach = ({ isOpen, onClose }: AICoachProps) => {
  const { analysis, isAnalyzing, analyzePatterns, getPersonalizedGreeting } = useMeditationAI();
  const { gameStats } = useMeditationGame();
  const [selectedTab, setSelectedTab] = useState("insights");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (isOpen) {
      setGreeting(getPersonalizedGreeting());
      // Auto-analyze if we don't have analysis yet
      if (!analysis && !isAnalyzing) {
        analyzePatterns();
      }
    }
  }, [isOpen, analysis, isAnalyzing, getPersonalizedGreeting, analyzePatterns]);

  const handleRefreshAnalysis = () => {
    analyzePatterns();
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
            className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Meditation Coach
                  <Badge variant="secondary" className="ml-2">
                    Level {gameStats.level} Practitioner
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAnalysis}
                    disabled={isAnalyzing}
                  >
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                {/* Personalized Greeting */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg"
                >
                  <div className="text-2xl mb-2">🤖</div>
                  <p className="text-lg font-medium">{greeting}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your AI coach is here to guide your meditation journey
                  </p>
                </motion.div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  </TabsList>

                  <TabsContent value="insights" className="space-y-6">
                    {isAnalyzing ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
                        <p className="text-muted-foreground">Analyzing your meditation patterns...</p>
                      </div>
                    ) : analysis ? (
                      <>
                        {/* Key Insights */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-400" />
                              AI Insights
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {analysis.insights.map((insight, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                              >
                                <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{insight}</p>
                              </motion.div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                              <div className="text-2xl font-bold text-blue-400">
                                {analysis.optimalTime}
                              </div>
                              <div className="text-sm text-muted-foreground">Best Time to Meditate</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
                              <div className="text-2xl font-bold text-green-400">
                                {analysis.recommendedDuration}m
                              </div>
                              <div className="text-sm text-muted-foreground">Recommended Duration</div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 text-center">
                              <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                              <div className="text-2xl font-bold text-pink-400">
                                {analysis.preferredTechniques[0] || "Mindfulness"}
                              </div>
                              <div className="text-sm text-muted-foreground">Top Technique</div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Environmental Factors */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-indigo-400" />
                              Your Ideal Environment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysis.environmentalFactors.map((factor, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                              These environmental factors have shown to enhance your meditation experience the most.
                            </p>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                          Complete a few more meditation sessions for personalized AI insights
                        </p>
                        <Button onClick={handleRefreshAnalysis} disabled={isAnalyzing}>
                          <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                          Analyze Patterns
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-6">
                    {analysis?.nextSessionSuggestion && (
                      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Next Session Suggestion
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">
                              {analysis.nextSessionSuggestion.type === 'time' && '⏰'}
                              {analysis.nextSessionSuggestion.type === 'technique' && '🧘'}
                              {analysis.nextSessionSuggestion.type === 'duration' && '⏱️'}
                              {analysis.nextSessionSuggestion.type === 'environment' && '🏠'}
                              {analysis.nextSessionSuggestion.type === 'challenge' && '🎯'}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                {analysis.nextSessionSuggestion.title}
                              </h3>
                              <p className="text-muted-foreground mb-3">
                                {analysis.nextSessionSuggestion.description}
                              </p>
                              <p className="text-sm text-purple-400 mb-3">
                                {analysis.nextSessionSuggestion.reason}
                              </p>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-purple-400 border-purple-400">
                                  {analysis.nextSessionSuggestion.confidence}% confidence
                                </Badge>
                                <Button size="sm">
                                  {analysis.nextSessionSuggestion.action}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Additional Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">Optimal Timing</h4>
                              <p className="text-sm text-muted-foreground">
                                {analysis?.optimalTime || "Morning"} sessions
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your most effective meditation times based on historical data
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">Progress Tracking</h4>
                              <p className="text-sm text-muted-foreground">
                                Level {gameStats.level} • {gameStats.totalPoints} points
                              </p>
                            </div>
                          </div>
                          <Progress value={(gameStats.totalPoints % 500) / 5} className="h-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          Your Weekly Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analysis?.weeklyGoals.map((goal, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                              <span className="text-xs text-green-400">{i + 1}</span>
                            </div>
                            <p className="text-sm">{goal}</p>
                          </motion.div>
                        )) || (
                          <div className="text-center py-4">
                            <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">Complete more sessions for personalized goals</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Achievement Progress */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Next Achievements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {gameStats.achievements
                          .filter(a => !a.unlocked)
                          .slice(0, 3)
                          .map((achievement) => (
                            <div key={achievement.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{achievement.name}</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <Progress
                                value={(achievement.progress / achievement.maxProgress) * 100}
                                className="h-2"
                              />
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="patterns" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                          Meditation Patterns
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                              {gameStats.totalSessions}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Sessions</div>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {Math.round(gameStats.totalMinutes / gameStats.totalSessions) || 0}m
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Duration</div>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400 mb-1">
                              {gameStats.currentStreak}
                            </div>
                            <div className="text-sm text-muted-foreground">Current Streak</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pattern Analysis */}
                    {analysis && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Pattern Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Preferred Techniques</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysis.preferredTechniques.map((tech, i) => (
                                <Badge key={i} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Effective Time Slots</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="capitalize">
                                {analysis.optimalTime} sessions
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
