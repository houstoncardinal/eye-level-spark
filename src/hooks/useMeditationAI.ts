import { useState, useEffect, useCallback } from "react";
import { useMeditationGame } from "./useMeditationGame";

interface MeditationPattern {
  timeOfDay: string;
  duration: number;
  effectiveness: number;
  moodBefore: number;
  moodAfter: number;
  techniques: string[];
  environment: string[];
}

interface PersonalizedRecommendation {
  id: string;
  type: 'technique' | 'duration' | 'time' | 'environment' | 'challenge';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  action: string;
}

interface AIAnalysis {
  optimalTime: string;
  recommendedDuration: number;
  preferredTechniques: string[];
  environmentalFactors: string[];
  weeklyGoals: string[];
  insights: string[];
  nextSessionSuggestion: PersonalizedRecommendation;
}

export const useMeditationAI = () => {
  const { gameStats } = useMeditationGame();
  const [patterns, setPatterns] = useState<MeditationPattern[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load patterns from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("meditationPatterns");
    if (saved) {
      setPatterns(JSON.parse(saved));
    }
  }, []);

  // Save patterns to localStorage
  const savePattern = useCallback((pattern: MeditationPattern) => {
    const updated = [...patterns, pattern].slice(-50); // Keep last 50 sessions
    setPatterns(updated);
    localStorage.setItem("meditationPatterns", JSON.stringify(updated));
  }, [patterns]);

  // AI Analysis Engine
  const analyzePatterns = useCallback(async () => {
    if (patterns.length < 3) return null;

    setIsAnalyzing(true);

    // Simulate AI analysis (in real app, this would call an AI service)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis: AIAnalysis = {
      optimalTime: calculateOptimalTime(),
      recommendedDuration: calculateRecommendedDuration(),
      preferredTechniques: identifyPreferredTechniques(),
      environmentalFactors: identifyEnvironmentalFactors(),
      weeklyGoals: generateWeeklyGoals(),
      insights: generateInsights(),
      nextSessionSuggestion: generateNextSessionSuggestion()
    };

    setAnalysis(analysis);
    setIsAnalyzing(false);
    return analysis;
  }, [patterns]);

  const calculateOptimalTime = (): string => {
    const timeSlots = patterns.reduce((acc, pattern) => {
      acc[pattern.timeOfDay] = (acc[pattern.timeOfDay] || 0) + pattern.effectiveness;
      return acc;
    }, {} as Record<string, number>);

    const bestTime = Object.entries(timeSlots).reduce((a, b) =>
      timeSlots[a[0]] > timeSlots[b[0]] ? a : b
    )[0];

    return bestTime;
  };

  const calculateRecommendedDuration = (): number => {
    const avgEffectiveness = patterns.reduce((sum, p) => sum + p.effectiveness, 0) / patterns.length;
    const avgDuration = patterns.reduce((sum, p) => sum + p.duration, 0) / patterns.length;

    // Recommend longer sessions if effectiveness is high, shorter if low
    if (avgEffectiveness > 7) return Math.min(avgDuration + 5, 45);
    if (avgEffectiveness < 5) return Math.max(avgDuration - 5, 5);
    return avgDuration;
  };

  const identifyPreferredTechniques = (): string[] => {
    const techniqueCount = patterns.reduce((acc, pattern) => {
      pattern.techniques.forEach(tech => {
        acc[tech] = (acc[tech] || 0) + pattern.effectiveness;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(techniqueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tech]) => tech);
  };

  const identifyEnvironmentalFactors = (): string[] => {
    const envCount = patterns.reduce((acc, pattern) => {
      pattern.environment.forEach(env => {
        acc[env] = (acc[env] || 0) + pattern.effectiveness;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(envCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([env]) => env);
  };

  const generateWeeklyGoals = (): string[] => {
    const goals = [];
    const weeklySessions = gameStats.totalSessions;

    if (weeklySessions < 3) {
      goals.push("Aim for 5 sessions this week to build consistency");
    } else if (weeklySessions < 7) {
      goals.push("Great progress! Try for daily practice this week");
    } else {
      goals.push("Excellent consistency! Focus on deepening your practice");
    }

    if (gameStats.currentStreak < 3) {
      goals.push("Build a 7-day streak for bonus achievements");
    }

    if (gameStats.level < 5) {
      goals.push(`You're level ${gameStats.level}. Reach level ${gameStats.level + 2} this week!`);
    }

    return goals;
  };

  const generateInsights = (): string[] => {
    const insights = [];

    const avgMoodImprovement = patterns.reduce((sum, p) =>
      sum + (p.moodAfter - p.moodBefore), 0
    ) / patterns.length;

    if (avgMoodImprovement > 2) {
      insights.push("Your meditation practice significantly improves your mood! 🎉");
    } else if (avgMoodImprovement > 0) {
      insights.push("You're experiencing positive mood shifts from meditation");
    }

    const consistency = patterns.length > 7 ? "highly consistent" : "developing consistency";
    insights.push(`Your practice shows ${consistency} patterns`);

    if (gameStats.longestStreak > 7) {
      insights.push("You're a meditation champion with impressive streaks! 🏆");
    }

    return insights;
  };

  const generateNextSessionSuggestion = (): PersonalizedRecommendation => {
    const suggestions = [
      {
        id: "optimal_timing",
        type: "time" as const,
        title: "Perfect Timing",
        description: `Try meditating at ${calculateOptimalTime()} when you're most effective`,
        reason: "AI analysis shows this time maximizes your meditation benefits",
        confidence: 85,
        action: "Schedule your next session"
      },
      {
        id: "technique_focus",
        type: "technique" as const,
        title: "Master Your Favorite",
        description: `Deepen your practice with ${identifyPreferredTechniques()[0]}`,
        reason: "This technique shows the highest effectiveness for you",
        confidence: 78,
        action: "Try this technique next"
      },
      {
        id: "extended_session",
        type: "duration" as const,
        title: "Go Deeper",
        description: `Try a ${calculateRecommendedDuration()}-minute session`,
        reason: "Your pattern analysis suggests this duration optimizes benefits",
        confidence: 72,
        action: "Extend your practice"
      },
      {
        id: "environment_optimization",
        type: "environment" as const,
        title: "Perfect Environment",
        description: `Create a space with ${identifyEnvironmentalFactors().join(", ")}`,
        reason: "These environmental factors enhance your meditation experience",
        confidence: 80,
        action: "Set up your space"
      }
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const recordSession = useCallback((sessionData: Omit<MeditationPattern, 'timeOfDay'>) => {
    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? "morning" :
                     now.getHours() < 17 ? "afternoon" : "evening";

    const pattern: MeditationPattern = {
      ...sessionData,
      timeOfDay
    };

    savePattern(pattern);
  }, [savePattern]);

  const getPersonalizedGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    const greetings = {
      morning: ["Good morning, mindful explorer! 🌅", "Rise and shine, meditation master! ☀️", "Start your day with peace 🧘"],
      afternoon: ["Good afternoon, zen practitioner! 🌤️", "Find your center this afternoon 🧘‍♀️", "Afternoon mindfulness awaits 🌸"],
      evening: ["Good evening, night meditator! 🌙", "Unwind with evening meditation 🌌", "End your day in peace ✨"]
    };

    const timeGreetings = greetings[timeOfDay as keyof typeof greetings];
    return timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
  }, []);

  return {
    patterns,
    analysis,
    isAnalyzing,
    analyzePatterns,
    recordSession,
    getPersonalizedGreeting,
    savePattern
  };
};
