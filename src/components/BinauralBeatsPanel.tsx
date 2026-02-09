import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, X, Volume2, Brain, Zap, Moon, Sun, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useBinauralBeats } from "@/hooks/useBinauralBeats";

interface BinauralBeatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCY_PRESETS = [
  {
    name: "Deep Relaxation",
    state: "theta" as const,
    description: "Perfect for meditation and stress relief",
    benefits: ["Deep relaxation", "Enhanced creativity", "Emotional healing"],
    color: "from-blue-500/20 to-purple-500/20"
  },
  {
    name: "Focus & Clarity",
    state: "focus" as const,
    description: "Sharpen concentration and mental acuity",
    benefits: ["Improved focus", "Mental clarity", "Learning enhancement"],
    color: "from-green-500/20 to-teal-500/20"
  },
  {
    name: "Sleep & Recovery",
    state: "delta" as const,
    description: "Promote restful sleep and physical healing",
    benefits: ["Better sleep", "Physical recovery", "Deep restoration"],
    color: "from-indigo-500/20 to-blue-500/20"
  },
  {
    name: "Energy & Alertness",
    state: "gamma" as const,
    description: "Boost cognitive performance and insight",
    benefits: ["Peak mental performance", "Heightened awareness", "Problem solving"],
    color: "from-yellow-500/20 to-orange-500/20"
  },
  {
    name: "Calm Awareness",
    state: "alpha" as const,
    description: "Gentle relaxation while staying alert",
    benefits: ["Reduced anxiety", "Present moment awareness", "Light meditation"],
    color: "from-pink-500/20 to-rose-500/20"
  }
];

export const BinauralBeatsPanel = ({ isOpen, onClose }: BinauralBeatsPanelProps) => {
  const { currentState, setBrainwaveState, volume, setVolume, configs } = useBinauralBeats();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(currentState !== "off");
  }, [currentState]);

  const handlePresetSelect = (presetName: string, state: any) => {
    setSelectedPreset(presetName);
    setBrainwaveState(state);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setBrainwaveState("off");
    } else if (selectedPreset) {
      const preset = FREQUENCY_PRESETS.find(p => p.name === selectedPreset);
      if (preset) {
        setBrainwaveState(preset.state);
      }
    }
  };

  const handleStop = () => {
    setBrainwaveState("off");
    setSelectedPreset(null);
  };

  const getCurrentConfig = () => {
    if (currentState === "off") return null;
    return configs[currentState as keyof typeof configs];
  };

  const currentConfig = getCurrentConfig();

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
                  <Brain className="w-5 h-5 text-purple-400" />
                  Binaural Beats Therapy
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                {/* Current Session Status */}
                {currentConfig && (
                  <Card className="mb-6 border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{currentConfig.name}</h3>
                          <p className="text-muted-foreground">{currentConfig.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePlayPause}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStop}
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Frequency Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-mono font-bold text-primary">
                            {currentConfig.baseFrequency}Hz
                          </div>
                          <div className="text-sm text-muted-foreground">Base Frequency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-mono font-bold text-primary">
                            {currentConfig.beatFrequency}Hz
                          </div>
                          <div className="text-sm text-muted-foreground">Beat Frequency</div>
                        </div>
                      </div>

                      {/* Volume Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Volume</span>
                          <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                        </div>
                        <Slider
                          value={[volume]}
                          onValueChange={(value) => setVolume(value[0])}
                          max={1}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Frequency Presets */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Choose Your Frequency</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FREQUENCY_PRESETS.map((preset) => (
                      <Card
                        key={preset.name}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedPreset === preset.name && isPlaying
                            ? 'border-purple-500/50 bg-gradient-to-r ' + preset.color
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handlePresetSelect(preset.name, preset.state)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {preset.state === "theta" && <Moon className="w-5 h-5 text-blue-400" />}
                              {preset.state === "focus" && <Zap className="w-5 h-5 text-green-400" />}
                              {preset.state === "delta" && <Heart className="w-5 h-5 text-indigo-400" />}
                              {preset.state === "gamma" && <Sun className="w-5 h-5 text-yellow-400" />}
                              {preset.state === "alpha" && <Brain className="w-5 h-5 text-pink-400" />}
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {configs[preset.state].beatFrequency}Hz
                              </Badge>
                            </div>
                            {selectedPreset === preset.name && isPlaying && (
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                            )}
                          </div>

                          <h4 className="font-semibold text-lg mb-2">{preset.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>

                          <div className="space-y-1">
                            {preset.benefits.map((benefit, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">How to Use Binaural Beats</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Use headphones for the best experience</p>
                      <p>• Find a comfortable position and close your eyes</p>
                      <p>• Focus on your breath while the frequencies work</p>
                      <p>• Start with 10-15 minute sessions</p>
                      <p>• Regular use enhances the benefits over time</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Cardinal Binaural Link */}
                <Card className="mt-6 border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Advanced Binaural Research</h3>
                        <p className="text-muted-foreground mb-4">
                          Explore our comprehensive collection of scientifically-designed binaural frequencies for optimal brainwave entrainment.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                          <Brain className="w-4 h-4" />
                          cardinalbinaural.com
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-purple-500/50 hover:bg-purple-500/10"
                        onClick={() => window.open('https://cardinalbinaural.com', '_blank')}
                      >
                        Explore More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
