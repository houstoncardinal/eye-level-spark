import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { X, Play, Pause, Info, Zap, Heart, Sun, Eye, Crown, Waves, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHaptic } from "@/hooks/useHaptic";

interface ChakraFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Chakra {
  id: string;
  name: string;
  sanskrit: string;
  color: string;
  frequency: number;
  position: number; // 0-100 vertical position
  element: string;
  affirmation: string;
  icon: React.ElementType;
  description: string;
}

const CHAKRAS: Chakra[] = [
  {
    id: "root",
    name: "Root",
    sanskrit: "Muladhara",
    color: "#EF4444",
    frequency: 396,
    position: 90,
    element: "Earth",
    affirmation: "I am safe and grounded",
    icon: Waves,
    description: "Foundation, stability, security",
  },
  {
    id: "sacral",
    name: "Sacral",
    sanskrit: "Svadhisthana",
    color: "#F97316",
    frequency: 417,
    position: 77,
    element: "Water",
    affirmation: "I embrace pleasure and creativity",
    icon: Waves,
    description: "Creativity, sexuality, emotions",
  },
  {
    id: "solar",
    name: "Solar Plexus",
    sanskrit: "Manipura",
    color: "#EAB308",
    frequency: 528,
    position: 64,
    element: "Fire",
    affirmation: "I am confident and powerful",
    icon: Flame,
    description: "Personal power, confidence, will",
  },
  {
    id: "heart",
    name: "Heart",
    sanskrit: "Anahata",
    color: "#22C55E",
    frequency: 639,
    position: 50,
    element: "Air",
    affirmation: "I give and receive love freely",
    icon: Heart,
    description: "Love, compassion, connection",
  },
  {
    id: "throat",
    name: "Throat",
    sanskrit: "Vishuddha",
    color: "#06B6D4",
    frequency: 741,
    position: 37,
    element: "Ether",
    affirmation: "I speak my truth with clarity",
    icon: Waves,
    description: "Communication, expression, truth",
  },
  {
    id: "third-eye",
    name: "Third Eye",
    sanskrit: "Ajna",
    color: "#6366F1",
    frequency: 852,
    position: 25,
    element: "Light",
    affirmation: "I trust my inner wisdom",
    icon: Eye,
    description: "Intuition, insight, imagination",
  },
  {
    id: "crown",
    name: "Crown",
    sanskrit: "Sahasrara",
    color: "#A855F7",
    frequency: 963,
    position: 12,
    element: "Cosmic Energy",
    affirmation: "I am connected to the divine",
    icon: Crown,
    description: "Spirituality, enlightenment, unity",
  },
];

export const ChakraFlow = ({ isOpen, onClose }: ChakraFlowProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChakra, setActiveChakra] = useState<string | null>(null);
  const [chakraEnergy, setChakraEnergy] = useState<Record<string, number>>({});
  const [flowProgress, setFlowProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const { mediumTap, heavyTap } = useHaptic();

  // Initialize energy levels
  useEffect(() => {
    if (isOpen) {
      const initialEnergy: Record<string, number> = {};
      CHAKRAS.forEach(chakra => {
        initialEnergy[chakra.id] = Math.random() * 40 + 30; // 30-70%
      });
      setChakraEnergy(initialEnergy);
    }
  }, [isOpen]);

  // Play chakra frequency
  const playChakraFrequency = useCallback((frequency: number) => {
    const ctx = audioContext || new AudioContext();
    if (!audioContext) setAudioContext(ctx);

    // Stop existing oscillator
    if (oscillator) {
      try { oscillator.stop(); } catch {}
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);

    setOscillator(osc);

    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => osc.stop(), 600);
    };
  }, [audioContext, oscillator]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (oscillator && audioContext) {
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      setTimeout(() => {
        try { oscillator.stop(); } catch {}
      }, 400);
      setOscillator(null);
    }
  }, [oscillator, audioContext]);

  // Energy flow animation
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      setFlowProgress(prev => {
        const next = (prev + 0.5) % 100;

        // Activate chakra based on flow position
        const chakraIndex = Math.floor((next / 100) * CHAKRAS.length);
        const newActiveChakra = CHAKRAS[chakraIndex]?.id;

        if (newActiveChakra !== activeChakra) {
          setActiveChakra(newActiveChakra);
          const chakra = CHAKRAS.find(c => c.id === newActiveChakra);
          if (chakra) {
            playChakraFrequency(chakra.frequency);
            mediumTap();
          }
        }

        return next;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      stopAudio();
    };
  }, [isPlaying, isOpen, activeChakra, playChakraFrequency, stopAudio, mediumTap]);

  // Focus on specific chakra
  const focusChakra = (chakraId: string) => {
    setActiveChakra(chakraId);
    const chakra = CHAKRAS.find(c => c.id === chakraId);
    if (chakra) {
      playChakraFrequency(chakra.frequency);
      heavyTap();

      // Boost energy for focused chakra
      setChakraEnergy(prev => ({
        ...prev,
        [chakraId]: Math.min(100, (prev[chakraId] || 50) + 10),
      }));
    }
  };

  // Energy particle effect
  const renderEnergyParticles = () => {
    return CHAKRAS.map((chakra, index) => {
      const isActive = activeChakra === chakra.id;
      const energy = chakraEnergy[chakra.id] || 50;

      return (
        <motion.div
          key={`particles-${chakra.id}`}
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{ top: `${chakra.position}%` }}
        >
          {[...Array(isActive ? 8 : 3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                backgroundColor: chakra.color,
                boxShadow: `0 0 10px ${chakra.color}`,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 50],
                opacity: [0.8, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                repeatDelay: Math.random() * 0.5,
              }}
            />
          ))}
        </motion.div>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
            onClick={() => {
              stopAudio();
              onClose();
            }}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Info button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 text-white/70 hover:text-white"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info className="w-5 h-5" />
          </Button>

          {/* Main content */}
          <div className="relative w-full max-w-6xl h-full flex">
            {/* Left panel - chakra info */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-72 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 z-20"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Chakra System</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {CHAKRAS.slice().reverse().map((chakra) => (
                      <div
                        key={chakra.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          activeChakra === chakra.id
                            ? "bg-white/20 ring-1 ring-white/30"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => focusChakra(chakra.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: chakra.color }}
                          />
                          <span className="text-white font-medium">{chakra.name}</span>
                          <span className="text-white/50 text-xs">({chakra.sanskrit})</span>
                        </div>
                        <p className="text-white/60 text-xs mt-1">{chakra.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress
                            value={chakraEnergy[chakra.id] || 50}
                            className="h-1 flex-1"
                          />
                          <span className="text-xs text-white/50">{Math.round(chakraEnergy[chakra.id] || 50)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center - body silhouette with chakras */}
            <div className="flex-1 relative flex items-center justify-center">
              {/* Body silhouette outline */}
              <motion.div
                className="relative w-32 h-[500px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Energy flow line */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="energyGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      {CHAKRAS.map((chakra, i) => (
                        <stop
                          key={chakra.id}
                          offset={`${(1 - chakra.position / 100) * 100}%`}
                          stopColor={chakra.color}
                          stopOpacity={activeChakra === chakra.id ? 1 : 0.5}
                        />
                      ))}
                    </linearGradient>
                  </defs>
                  <motion.line
                    x1="50%"
                    y1="10%"
                    x2="50%"
                    y2="90%"
                    stroke="url(#energyGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </svg>

                {/* Chakra points */}
                {CHAKRAS.map((chakra, index) => {
                  const Icon = chakra.icon;
                  const isActive = activeChakra === chakra.id;
                  const energy = chakraEnergy[chakra.id] || 50;

                  return (
                    <motion.div
                      key={chakra.id}
                      className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                      style={{ top: `${chakra.position}%` }}
                      onClick={() => focusChakra(chakra.id)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* Outer glow */}
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          width: isActive ? 80 : 50,
                          height: isActive ? 80 : 50,
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          background: `radial-gradient(circle, ${chakra.color}40 0%, transparent 70%)`,
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: isActive ? 1 : 2,
                          repeat: Infinity,
                        }}
                      />

                      {/* Main chakra circle */}
                      <motion.div
                        className="relative rounded-full flex items-center justify-center"
                        style={{
                          width: isActive ? 50 : 30,
                          height: isActive ? 50 : 30,
                          backgroundColor: chakra.color,
                          boxShadow: `0 0 ${isActive ? 30 : 15}px ${chakra.color}`,
                        }}
                        animate={{
                          scale: isActive ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          duration: 1,
                          repeat: isActive ? Infinity : 0,
                        }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </motion.div>

                      {/* Energy level indicator */}
                      <motion.div
                        className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-xs text-white/70 whitespace-nowrap"
                        animate={{ opacity: isActive ? 1 : 0.5 }}
                      >
                        {chakra.name}
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Energy particles */}
                {renderEnergyParticles()}
              </motion.div>
            </div>

            {/* Right panel - active chakra details */}
            <AnimatePresence>
              {activeChakra && (
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-72 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                >
                  {(() => {
                    const chakra = CHAKRAS.find(c => c.id === activeChakra);
                    if (!chakra) return null;
                    const Icon = chakra.icon;

                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: chakra.color }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{chakra.name} Chakra</h3>
                            <p className="text-white/60 text-sm">{chakra.sanskrit}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-white/50 text-xs uppercase tracking-wide">Element</span>
                            <p className="text-white">{chakra.element}</p>
                          </div>

                          <div>
                            <span className="text-white/50 text-xs uppercase tracking-wide">Frequency</span>
                            <p className="text-white">{chakra.frequency} Hz (Solfeggio)</p>
                          </div>

                          <div>
                            <span className="text-white/50 text-xs uppercase tracking-wide">Energy Level</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={chakraEnergy[activeChakra] || 50} className="flex-1" />
                              <span className="text-white">{Math.round(chakraEnergy[activeChakra] || 50)}%</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-white/50 text-xs uppercase tracking-wide">Affirmation</span>
                            <motion.p
                              className="text-white italic mt-1"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              "{chakra.affirmation}"
                            </motion.p>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => {
                              setChakraEnergy(prev => ({
                                ...prev,
                                [activeChakra]: Math.min(100, (prev[activeChakra] || 50) + 15),
                              }));
                              heavyTap();
                            }}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Energize Chakra
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom controls */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-full px-8 py-4 border border-white/10 flex items-center gap-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <span className="text-white/70 text-sm">
              {isPlaying ? "Energy flowing..." : "Start energy flow"}
            </span>

            <div className="h-8 w-px bg-white/20" />

            <div className="text-sm text-white/50">
              Click any chakra to focus
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
