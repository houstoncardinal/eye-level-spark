import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { X, Play, Pause, FastForward, Rewind, Clock, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useHaptic } from "@/hooks/useHaptic";

interface TimeWarpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WarpParticle {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  color: string;
  size: number;
}

type WarpMode = "hyperspace" | "temporal" | "quantum" | "void";

const WARP_MODES = {
  hyperspace: {
    name: "Hyperspace",
    description: "Travel through the stars",
    colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#FFFFFF"],
    speed: 1.5,
  },
  temporal: {
    name: "Temporal Flow",
    description: "Journey through time",
    colors: ["#F59E0B", "#EF4444", "#FBBF24", "#F97316"],
    speed: 1,
  },
  quantum: {
    name: "Quantum Tunnel",
    description: "Enter the quantum realm",
    colors: ["#22C55E", "#10B981", "#84CC16", "#06B6D4"],
    speed: 2,
  },
  void: {
    name: "The Void",
    description: "Embrace nothingness",
    colors: ["#1F2937", "#374151", "#4B5563", "#6B7280"],
    speed: 0.5,
  },
};

export const TimeWarp = ({ isOpen, onClose }: TimeWarpProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [warpMode, setWarpMode] = useState<WarpMode>("hyperspace");
  const [warpSpeed, setWarpSpeed] = useState(1);
  const [particles, setParticles] = useState<WarpParticle[]>([]);
  const [consciousness, setConsciousness] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { pulse, heavyTap } = useHaptic();

  const currentMode = WARP_MODES[warpMode];

  // Initialize particles
  const initParticles = useCallback(() => {
    const newParticles: WarpParticle[] = [];
    const colors = currentMode.colors;

    for (let i = 0; i < 300; i++) {
      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000,
        speed: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1,
      });
    }
    setParticles(newParticles);
  }, [currentMode.colors]);

  useEffect(() => {
    if (isOpen) {
      initParticles();
    }
  }, [isOpen, initParticles]);

  // Canvas animation
  useEffect(() => {
    if (!isOpen || !isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${warpMode === "void" ? 0.1 : 0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => {
        return prev.map(particle => {
          // Move particle towards viewer
          let newZ = particle.z - particle.speed * warpSpeed * currentMode.speed * 20;

          // Reset if too close
          if (newZ <= 0) {
            newZ = 2000;
            particle.x = (Math.random() - 0.5) * 2000;
            particle.y = (Math.random() - 0.5) * 2000;
          }

          // Project 3D to 2D
          const scale = 500 / newZ;
          const screenX = centerX + particle.x * scale;
          const screenY = centerY + particle.y * scale;

          // Only draw if on screen
          if (screenX > 0 && screenX < canvas.width && screenY > 0 && screenY < canvas.height) {
            const brightness = Math.min(1, (2000 - newZ) / 1000);
            const size = particle.size * scale * 2;

            // Draw streak
            const prevZ = newZ + particle.speed * warpSpeed * currentMode.speed * 20;
            const prevScale = 500 / prevZ;
            const prevX = centerX + particle.x * prevScale;
            const prevY = centerY + particle.y * prevScale;

            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(screenX, screenY);
            ctx.strokeStyle = particle.color + Math.floor(brightness * 255).toString(16).padStart(2, "0");
            ctx.lineWidth = size;
            ctx.lineCap = "round";
            ctx.stroke();

            // Draw glow
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, size * 2);
            gradient.addColorStop(0, particle.color + "80");
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX - size * 2, screenY - size * 2, size * 4, size * 4);
          }

          return { ...particle, z: newZ };
        });
      });

      // Increase consciousness
      setConsciousness(prev => Math.min(100, prev + 0.05 * warpSpeed));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, isPlaying, warpMode, warpSpeed, currentMode.speed]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Haptic feedback at consciousness milestones
  useEffect(() => {
    if (consciousness >= 25 && consciousness < 26) pulse();
    if (consciousness >= 50 && consciousness < 51) pulse();
    if (consciousness >= 75 && consciousness < 76) pulse();
    if (consciousness >= 99) heavyTap();
  }, [consciousness, pulse, heavyTap]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
          />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)",
            }}
          />

          {/* Center focal point */}
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 / warpSpeed,
              repeat: Infinity,
            }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: currentMode.colors[0],
                boxShadow: `0 0 60px ${currentMode.colors[0]}, 0 0 120px ${currentMode.colors[1]}`,
              }}
            />
          </motion.div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Consciousness meter */}
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-6 py-2 border border-white/10"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
          >
            <div className="flex items-center gap-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div className="w-48">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70">Consciousness Expansion</span>
                  <span className="text-amber-400">{Math.round(consciousness)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${consciousness}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mode info */}
          <motion.div
            className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h2 className="text-2xl font-bold text-white mb-1">{currentMode.name}</h2>
            <p className="text-white/50 text-sm">{currentMode.description}</p>
          </motion.div>

          {/* Bottom controls */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
          >
            <div className="flex flex-col gap-4">
              {/* Mode selection */}
              <div className="flex gap-2 justify-center">
                {(Object.keys(WARP_MODES) as WarpMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={warpMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setWarpMode(mode);
                      initParticles();
                      heavyTap();
                    }}
                    className="capitalize"
                  >
                    {WARP_MODES[mode].name}
                  </Button>
                ))}
              </div>

              {/* Speed control */}
              <div className="flex items-center gap-4 justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWarpSpeed(Math.max(0.25, warpSpeed - 0.25))}
                >
                  <Rewind className="w-4 h-4" />
                </Button>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-white/70 text-xs">Warp Speed</span>
                  <Slider
                    value={[warpSpeed]}
                    onValueChange={([v]) => setWarpSpeed(v)}
                    min={0.25}
                    max={3}
                    step={0.25}
                    className="w-32"
                  />
                  <span className="text-white text-sm font-mono">{warpSpeed.toFixed(2)}x</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWarpSpeed(Math.min(3, warpSpeed + 0.25))}
                >
                  <FastForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Play/Pause */}
              <div className="flex justify-center">
                <Button
                  variant={isPlaying ? "outline" : "default"}
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause Journey
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Continue Journey
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Consciousness achieved message */}
          <AnimatePresence>
            {consciousness >= 100 && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Consciousness Expanded</h3>
                  <p className="text-white/70">You have transcended ordinary awareness</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
