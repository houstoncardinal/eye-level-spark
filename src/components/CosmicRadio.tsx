import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Radio, Play, Pause, Volume2, SkipForward, SkipBack,
  Star, Moon, Sun, Cloud, Waves, Sparkles, Zap, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useHaptic } from "@/hooks/useHaptic";

interface CosmicRadioProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RadioStation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  icon: React.ElementType;
  color: string;
  baseFreq: number;
  harmonics: number[];
  waveform: OscillatorType;
  message: string;
}

const STATIONS: RadioStation[] = [
  {
    id: "stellar-dreams",
    name: "Stellar Dreams",
    description: "Transmissions from distant galaxies",
    frequency: "432.0 FM",
    icon: Star,
    color: "#8B5CF6",
    baseFreq: 108,
    harmonics: [1, 1.5, 2, 3],
    waveform: "sine",
    message: "The stars whisper secrets of eternity...",
  },
  {
    id: "lunar-lullaby",
    name: "Lunar Lullaby",
    description: "Moon waves for deep relaxation",
    frequency: "528.0 FM",
    icon: Moon,
    color: "#6366F1",
    baseFreq: 132,
    harmonics: [1, 1.33, 2],
    waveform: "triangle",
    message: "Let the moon guide you to peaceful shores...",
  },
  {
    id: "solar-pulse",
    name: "Solar Pulse",
    description: "Energy waves from the sun",
    frequency: "639.0 FM",
    icon: Sun,
    color: "#F59E0B",
    baseFreq: 160,
    harmonics: [1, 1.25, 1.5, 2],
    waveform: "sine",
    message: "Absorb the life-giving rays of cosmic energy...",
  },
  {
    id: "nebula-static",
    name: "Nebula Static",
    description: "Ambient noise from cosmic clouds",
    frequency: "741.0 FM",
    icon: Cloud,
    color: "#EC4899",
    baseFreq: 185,
    harmonics: [1, 1.1, 1.2, 1.3],
    waveform: "sine",
    message: "Float among the cosmic clouds of creation...",
  },
  {
    id: "ocean-cosmos",
    name: "Ocean Cosmos",
    description: "Where water meets stars",
    frequency: "852.0 FM",
    icon: Waves,
    color: "#06B6D4",
    baseFreq: 213,
    harmonics: [1, 1.5, 2, 2.5],
    waveform: "triangle",
    message: "The cosmic ocean flows through all things...",
  },
  {
    id: "aurora-whispers",
    name: "Aurora Whispers",
    description: "Northern lights frequencies",
    frequency: "963.0 FM",
    icon: Sparkles,
    color: "#22C55E",
    baseFreq: 241,
    harmonics: [1, 1.2, 1.5, 2, 3],
    waveform: "sine",
    message: "Dance with the celestial lights above...",
  },
  {
    id: "quantum-field",
    name: "Quantum Field",
    description: "Subatomic vibrations",
    frequency: "1111.0 FM",
    icon: Zap,
    color: "#3B82F6",
    baseFreq: 278,
    harmonics: [1, 1.414, 2, 2.414],
    waveform: "sine",
    message: "At the quantum level, all is connected...",
  },
  {
    id: "heart-of-cosmos",
    name: "Heart of Cosmos",
    description: "Universal love frequency",
    frequency: "528.0 FM",
    icon: Heart,
    color: "#EF4444",
    baseFreq: 132,
    harmonics: [1, 1.25, 1.5, 2, 2.5, 3],
    waveform: "sine",
    message: "Love is the fundamental frequency of existence...",
  },
];

export const CosmicRadio = ({ isOpen, onClose }: CosmicRadioProps) => {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(32).fill(0));

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const { mediumTap, heavyTap } = useHaptic();

  // Create audio for station
  const playStation = useCallback((station: RadioStation) => {
    // Stop existing audio
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];

    const ctx = audioContextRef.current || new AudioContext();
    audioContextRef.current = ctx;

    if (ctx.state === "suspended") ctx.resume();

    // Create analyser for visualization
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGainRef.current = masterGain;

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Create oscillators for each harmonic
    station.harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = station.waveform;
      osc.frequency.value = station.baseFreq * harmonic;

      // Amplitude decreases with higher harmonics
      gain.gain.value = volume * (1 / (i + 1));

      // Add subtle vibrato
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 0.2 + Math.random() * 0.3;
      vibratoGain.gain.value = station.baseFreq * 0.02;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start();

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      oscillatorsRef.current.push(osc);
      gainNodesRef.current.push(gain);
    });

    // Fade in
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);

    setCurrentStation(station);
    setIsPlaying(true);
    heavyTap();
  }, [volume, heavyTap]);

  // Stop audio
  const stopPlaying = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);

    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      oscillatorsRef.current = [];
    }, 1100);

    setIsPlaying(false);
    mediumTap();
  }, [mediumTap]);

  // Update volume
  useEffect(() => {
    if (!isPlaying) return;

    gainNodesRef.current.forEach((gain, i) => {
      if (audioContextRef.current) {
        gain.gain.linearRampToValueAtTime(
          volume * (1 / (i + 1)),
          audioContextRef.current.currentTime + 0.1
        );
      }
    });

    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume, isPlaying]);

  // Visualizer animation
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      setVisualizerData(new Array(32).fill(0));
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      setVisualizerData(Array.from(dataArray));
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Navigate stations
  const nextStation = () => {
    if (!currentStation) {
      playStation(STATIONS[0]);
      return;
    }
    const currentIndex = STATIONS.findIndex(s => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % STATIONS.length;
    playStation(STATIONS[nextIndex]);
  };

  const prevStation = () => {
    if (!currentStation) {
      playStation(STATIONS[STATIONS.length - 1]);
      return;
    }
    const currentIndex = STATIONS.findIndex(s => s.id === currentStation.id);
    const prevIndex = (currentIndex - 1 + STATIONS.length) % STATIONS.length;
    playStation(STATIONS[prevIndex]);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

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
            className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 overflow-hidden"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
              onClick={() => { stopPlaying(); onClose(); }}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">Cosmic Radio</h2>
              </div>
              <p className="text-white/50 mt-1">Tune into frequencies from across the universe</p>
            </div>

            <div className="p-6">
              {/* Main display */}
              <div className="bg-black/50 rounded-2xl p-6 mb-6">
                {/* Visualizer */}
                <div className="h-24 flex items-end justify-center gap-1 mb-6">
                  {visualizerData.map((value, i) => (
                    <motion.div
                      key={i}
                      className="w-2 rounded-full"
                      style={{
                        backgroundColor: currentStation?.color || "#6B7280",
                        height: `${(value / 255) * 100}%`,
                        minHeight: 4,
                      }}
                      animate={{
                        opacity: isPlaying ? [0.5, 1, 0.5] : 0.3,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.02,
                      }}
                    />
                  ))}
                </div>

                {/* Station display */}
                {currentStation ? (
                  <div className="text-center">
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                      style={{ backgroundColor: currentStation.color + "30" }}
                      animate={isPlaying ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          `0 0 20px ${currentStation.color}40`,
                          `0 0 40px ${currentStation.color}60`,
                          `0 0 20px ${currentStation.color}40`,
                        ],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {(() => {
                        const Icon = currentStation.icon;
                        return <Icon className="w-10 h-10" style={{ color: currentStation.color }} />;
                      })()}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-1">{currentStation.name}</h3>
                    <p className="text-white/50 text-sm mb-2">{currentStation.description}</p>

                    <motion.div
                      className="inline-block bg-white/10 rounded-full px-4 py-1 font-mono text-lg"
                      style={{ color: currentStation.color }}
                      animate={isPlaying ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.5 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {currentStation.frequency}
                    </motion.div>

                    {isPlaying && (
                      <motion.p
                        className="text-white/40 text-sm italic mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        "{currentStation.message}"
                      </motion.p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-white/40">
                    <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a station to begin</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevStation}
                  className="w-12 h-12"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>

                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full"
                  onClick={() => {
                    if (isPlaying) {
                      stopPlaying();
                    } else if (currentStation) {
                      playStation(currentStation);
                    } else {
                      playStation(STATIONS[0]);
                    }
                  }}
                  style={{
                    backgroundColor: currentStation?.color || "#6B7280",
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextStation}
                  className="w-12 h-12"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Volume2 className="w-5 h-5 text-white/50" />
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  min={0}
                  max={0.5}
                  step={0.01}
                  className="w-48"
                />
                <span className="text-white/50 text-sm w-12">
                  {Math.round(volume * 200)}%
                </span>
              </div>

              {/* Station grid */}
              <div className="grid grid-cols-4 gap-3">
                {STATIONS.map((station) => {
                  const Icon = station.icon;
                  const isActive = currentStation?.id === station.id;

                  return (
                    <motion.button
                      key={station.id}
                      className={`p-4 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-white/15 ring-2"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                      style={{
                        ringColor: isActive ? station.color : undefined,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => playStation(station)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" style={{ color: station.color }} />
                        <span className="text-white text-sm font-medium truncate">
                          {station.name}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs truncate">{station.frequency}</p>

                      {isActive && isPlaying && (
                        <motion.div
                          className="flex gap-0.5 mt-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 rounded-full"
                              style={{ backgroundColor: station.color }}
                              animate={{
                                height: [4, 12, 4],
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
