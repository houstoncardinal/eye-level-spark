import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, Play, Pause, Volume2, Info, Heart, Zap, Star, Sparkles, Sun, Moon, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useHaptic } from "@/hooks/useHaptic";

interface SolfeggioHealingProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SolfeggioFrequency {
  hz: number;
  name: string;
  description: string;
  benefits: string[];
  color: string;
  chakra?: string;
  icon: React.ElementType;
}

const SOLFEGGIO_FREQUENCIES: SolfeggioFrequency[] = [
  {
    hz: 174,
    name: "Foundation",
    description: "Pain reduction & security",
    benefits: ["Reduces pain", "Relieves tension", "Creates sense of security", "Grounds energy"],
    color: "#DC2626",
    chakra: "Root",
    icon: Waves,
  },
  {
    hz: 285,
    name: "Quantum Cognition",
    description: "Tissue healing & regeneration",
    benefits: ["Heals tissues", "Regenerates cells", "Restructures damaged organs", "Influences energy fields"],
    color: "#EA580C",
    icon: Zap,
  },
  {
    hz: 396,
    name: "Liberation",
    description: "Release guilt & fear",
    benefits: ["Liberates guilt", "Releases fear", "Achieves goals", "Grounds and awakens"],
    color: "#CA8A04",
    chakra: "Root",
    icon: Star,
  },
  {
    hz: 417,
    name: "Transformation",
    description: "Facilitate change",
    benefits: ["Clears negativity", "Removes blocks", "Facilitates change", "Undoes situations"],
    color: "#65A30D",
    chakra: "Sacral",
    icon: Sparkles,
  },
  {
    hz: 528,
    name: "Miracle / Love",
    description: "DNA repair & transformation",
    benefits: ["Repairs DNA", "Brings transformation", "Increases life energy", "Clarity of mind"],
    color: "#22C55E",
    chakra: "Solar Plexus",
    icon: Heart,
  },
  {
    hz: 639,
    name: "Connection",
    description: "Harmonize relationships",
    benefits: ["Enhances communication", "Creates harmony", "Heals relationships", "Connects with others"],
    color: "#14B8A6",
    chakra: "Heart",
    icon: Heart,
  },
  {
    hz: 741,
    name: "Awakening",
    description: "Intuition & expression",
    benefits: ["Awakens intuition", "Promotes expression", "Solves problems", "Cleanses cells"],
    color: "#0EA5E9",
    chakra: "Throat",
    icon: Sun,
  },
  {
    hz: 852,
    name: "Spiritual Order",
    description: "Return to spiritual order",
    benefits: ["Returns to spiritual order", "Awakens intuition", "Raises vibration", "Inner strength"],
    color: "#6366F1",
    chakra: "Third Eye",
    icon: Moon,
  },
  {
    hz: 963,
    name: "Divine Connection",
    description: "Connect with divine consciousness",
    benefits: ["Activates pineal gland", "Divine connection", "Perfect state", "Oneness"],
    color: "#A855F7",
    chakra: "Crown",
    icon: Sparkles,
  },
];

export const SolfeggioHealing = ({ isOpen, onClose }: SolfeggioHealingProps) => {
  const [activeFrequency, setActiveFrequency] = useState<SolfeggioFrequency | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showInfo, setShowInfo] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { mediumTap, heavyTap } = useHaptic();

  // Play frequency
  const playFrequency = useCallback((freq: SolfeggioFrequency) => {
    // Stop existing
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
    }

    const ctx = audioContextRef.current || new AudioContext();
    audioContextRef.current = ctx;

    if (ctx.state === "suspended") ctx.resume();

    // Create oscillator with rich harmonics
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Use sine wave for pure tone
    oscillator.type = "sine";
    oscillator.frequency.value = freq.hz;

    // Add subtle modulation for richness
    const modulator = ctx.createOscillator();
    const modulatorGain = ctx.createGain();
    modulator.frequency.value = 0.5; // Very slow modulation
    modulatorGain.gain.value = 2;
    modulator.connect(modulatorGain);
    modulatorGain.connect(oscillator.frequency);
    modulator.start();

    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    setActiveFrequency(freq);
    setIsPlaying(true);
    setSessionTime(0);
    heavyTap();

    // Start session timer
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  }, [volume, heavyTap]);

  // Stop playing
  const stopPlaying = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

    setTimeout(() => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch {}
        oscillatorRef.current = null;
      }
    }, 1100);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsPlaying(false);
    mediumTap();
  }, [mediumTap]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current && isPlaying) {
      gainNodeRef.current.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume, isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) try { oscillatorRef.current.stop(); } catch {}
      if (intervalRef.current) clearInterval(intervalRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-slate-900/90 via-indigo-950/90 to-violet-950/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Waves className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Solfeggio Frequencies</h2>
                <Badge variant="outline" className="ml-2">Sound Healing</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-white/70 hover:text-white"
                >
                  <Info className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { stopPlaying(); onClose(); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex h-[calc(100%-80px)]">
              {/* Frequency Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
                  {SOLFEGGIO_FREQUENCIES.map((freq) => {
                    const Icon = freq.icon;
                    const isActive = activeFrequency?.hz === freq.hz;

                    return (
                      <motion.div
                        key={freq.hz}
                        className={`relative rounded-2xl p-5 cursor-pointer overflow-hidden ${
                          isActive
                            ? "ring-2 ring-offset-2 ring-offset-transparent"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                        style={{
                          ringColor: isActive ? freq.color : undefined,
                          backgroundColor: isActive ? `${freq.color}20` : undefined,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => isActive ? stopPlaying() : playFrequency(freq)}
                      >
                        {/* Animated background for active */}
                        {isActive && isPlaying && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at center, ${freq.color}30 0%, transparent 70%)`,
                            }}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}

                        <div className="relative">
                          {/* Frequency value */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="text-3xl font-bold"
                              style={{ color: freq.color }}
                            >
                              {freq.hz}
                            </span>
                            <span className="text-white/40 text-sm">Hz</span>
                          </div>

                          {/* Icon and name */}
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5" style={{ color: freq.color }} />
                            <span className="text-white font-medium">{freq.name}</span>
                          </div>

                          {/* Description */}
                          <p className="text-white/60 text-sm">{freq.description}</p>

                          {/* Chakra badge */}
                          {freq.chakra && (
                            <Badge
                              className="mt-3 text-xs"
                              style={{ backgroundColor: `${freq.color}30`, color: freq.color }}
                            >
                              {freq.chakra} Chakra
                            </Badge>
                          )}

                          {/* Playing indicator */}
                          {isActive && isPlaying && (
                            <motion.div
                              className="absolute top-0 right-0"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: freq.color }}
                              />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel - Info & Controls */}
              <div className="w-80 border-l border-white/10 p-6 flex flex-col">
                {/* Now Playing */}
                {activeFrequency && (
                  <motion.div
                    className="bg-white/5 rounded-xl p-4 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/50 text-sm">Now Playing</span>
                      <span className="text-white font-mono">{formatTime(sessionTime)}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${activeFrequency.color}30` }}
                        animate={isPlaying ? {
                          boxShadow: [
                            `0 0 20px ${activeFrequency.color}40`,
                            `0 0 40px ${activeFrequency.color}60`,
                            `0 0 20px ${activeFrequency.color}40`,
                          ],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span
                          className="text-2xl font-bold"
                          style={{ color: activeFrequency.color }}
                        >
                          {activeFrequency.hz}
                        </span>
                      </motion.div>
                      <div>
                        <h4 className="text-white font-semibold">{activeFrequency.name}</h4>
                        <p className="text-white/50 text-sm">{activeFrequency.hz} Hz</p>
                      </div>
                    </div>

                    {/* Play/Pause */}
                    <Button
                      className="w-full"
                      onClick={() => isPlaying ? stopPlaying() : playFrequency(activeFrequency)}
                      style={{
                        backgroundColor: isPlaying ? undefined : activeFrequency.color,
                      }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* Volume Control */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Volume
                    </span>
                    <span className="text-white/50 text-sm">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={([v]) => setVolume(v)}
                    min={0}
                    max={0.5}
                    step={0.01}
                  />
                </div>

                {/* Benefits list */}
                {activeFrequency && (
                  <div className="flex-1">
                    <h4 className="text-white/70 text-sm mb-3">Benefits</h4>
                    <ul className="space-y-2">
                      {activeFrequency.benefits.map((benefit, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-2 text-white/80 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span style={{ color: activeFrequency.color }}>•</span>
                          {benefit}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info panel */}
                {showInfo && (
                  <motion.div
                    className="bg-white/5 rounded-xl p-4 mt-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h4 className="text-white font-medium mb-2">About Solfeggio Frequencies</h4>
                    <p className="text-white/60 text-xs leading-relaxed">
                      The Solfeggio frequencies are a set of ancient musical tones that were used in
                      sacred music, including Gregorian chants. Each frequency has unique healing
                      properties that can positively affect the body, mind, and spirit.
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      Use headphones for best results. Listen for at least 15 minutes for optimal benefits.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Visualization at bottom */}
            {activeFrequency && isPlaying && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden"
                style={{ backgroundColor: `${activeFrequency.color}20` }}
              >
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: activeFrequency.color }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
