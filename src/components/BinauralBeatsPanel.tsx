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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl glass overflow-hidden">
              {/* Top shimmer line */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
              
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-display tracking-wide text-foreground">Binaural Beats Therapy</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-y-auto px-6 pb-6 scrollbar-hide">
                {/* Current Session Status */}
                {currentConfig && (
                  <div className="mb-6 rounded-2xl glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-foreground">{currentConfig.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{currentConfig.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePlayPause}
                          className="p-2.5 rounded-xl glass-button hover:scale-105 transition-all"
                        >
                          {isPlaying ? <Pause className="w-4 h-4 text-foreground" /> : <Play className="w-4 h-4 text-foreground" />}
                        </button>
                        <button
                          onClick={handleStop}
                          className="p-2.5 rounded-xl glass-button hover:scale-105 transition-all"
                        >
                          <Square className="w-4 h-4 text-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Frequency Info */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                        <div className="text-2xl font-mono font-bold text-primary">
                          {currentConfig.baseFrequency}Hz
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Base</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                        <div className="text-2xl font-mono font-bold text-primary">
                          {currentConfig.beatFrequency}Hz
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Beat</div>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground/80">Volume</span>
                        <span className="text-xs text-muted-foreground font-mono">{Math.round(volume * 100)}%</span>
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
                  </div>
                )}

                {/* Frequency Presets */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Choose Your Frequency</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FREQUENCY_PRESETS.map((preset) => (
                      <div
                        key={preset.name}
                        className={`cursor-pointer rounded-2xl glass-card p-4 transition-all duration-300 hover:scale-[1.02] ${
                          selectedPreset === preset.name && isPlaying
                            ? 'border-purple-400/30 bg-purple-500/5'
                            : ''
                        }`}
                        onClick={() => handlePresetSelect(preset.name, preset.state)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-white/[0.04]">
                              {preset.state === "theta" && <Moon className="w-4 h-4 text-blue-400" />}
                              {preset.state === "focus" && <Zap className="w-4 h-4 text-green-400" />}
                              {preset.state === "delta" && <Heart className="w-4 h-4 text-indigo-400" />}
                              {preset.state === "gamma" && <Sun className="w-4 h-4 text-yellow-400" />}
                              {preset.state === "alpha" && <Brain className="w-4 h-4 text-pink-400" />}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-white/10 bg-white/[0.03] font-mono"
                            >
                              {configs[preset.state].beatFrequency}Hz
                            </Badge>
                          </div>
                          {selectedPreset === preset.name && isPlaying && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                          )}
                        </div>

                        <h4 className="font-medium text-foreground mb-1">{preset.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{preset.description}</p>

                        <div className="space-y-1">
                          {preset.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <div className="w-1 h-1 bg-primary/60 rounded-full" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 rounded-2xl glass-card p-6">
                  <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">How to Use</h3>
                  <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                    <p>• Use headphones for the best experience</p>
                    <p>• Find a comfortable position and close your eyes</p>
                    <p>• Focus on your breath while the frequencies work</p>
                    <p>• Start with 10-15 minute sessions</p>
                    <p>• Regular use enhances the benefits over time</p>
                  </div>
                </div>

                {/* Cardinal Binaural Link */}
                <div className="mt-6 rounded-2xl glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground mb-1.5">Advanced Binaural Research</h3>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Explore scientifically-designed binaural frequencies for optimal brainwave entrainment.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-purple-400/80">
                        <Brain className="w-3.5 h-3.5" />
                        cardinalbinaural.com
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-purple-400/20 hover:bg-purple-500/10 text-xs"
                      onClick={() => window.open('https://cardinalbinaural.com', '_blank')}
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
