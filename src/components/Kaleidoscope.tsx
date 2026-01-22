import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Play, Pause, Palette, Sparkles, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface KaleidoscopeProps {
  isOpen: boolean;
  onClose: () => void;
}

type PatternType = "mandala" | "fractal" | "cosmic" | "sacred" | "aurora";

interface Segment {
  id: number;
  rotation: number;
  color: string;
  size: number;
  distance: number;
  shape: "circle" | "diamond" | "triangle" | "star";
}

const COLOR_PALETTES = {
  cosmic: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
  aurora: ["#22D3EE", "#34D399", "#A78BFA", "#F472B6", "#FBBF24"],
  sunset: ["#F97316", "#EF4444", "#EC4899", "#8B5CF6", "#F59E0B"],
  ocean: ["#0EA5E9", "#06B6D4", "#14B8A6", "#3B82F6", "#6366F1"],
  forest: ["#10B981", "#059669", "#84CC16", "#22C55E", "#4ADE80"],
};

export const Kaleidoscope = ({ isOpen, onClose }: KaleidoscopeProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [pattern, setPattern] = useState<PatternType>("mandala");
  const [colorPalette, setColorPalette] = useState<keyof typeof COLOR_PALETTES>("cosmic");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rotation, setRotation] = useState(0);
  const [complexity, setComplexity] = useState(6);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const colors = COLOR_PALETTES[colorPalette];

  // Generate segments based on pattern
  const generateSegments = useCallback(() => {
    const newSegments: Segment[] = [];
    const numLayers = Math.floor(complexity);
    const segmentsPerLayer = pattern === "mandala" ? 12 : pattern === "fractal" ? 8 : 6;

    for (let layer = 0; layer < numLayers; layer++) {
      for (let i = 0; i < segmentsPerLayer; i++) {
        const angle = (360 / segmentsPerLayer) * i;
        newSegments.push({
          id: layer * segmentsPerLayer + i,
          rotation: angle,
          color: colors[(layer + i) % colors.length],
          size: 20 + layer * 15,
          distance: 50 + layer * 40,
          shape: ["circle", "diamond", "triangle", "star"][i % 4] as Segment["shape"],
        });
      }
    }
    setSegments(newSegments);
  }, [complexity, pattern, colors]);

  useEffect(() => {
    if (isOpen) {
      generateSegments();
    }
  }, [isOpen, generateSegments]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + speed) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen, speed]);

  const renderShape = (segment: Segment, index: number) => {
    const baseStyle = {
      position: "absolute" as const,
      left: "50%",
      top: "50%",
      transform: `
        translate(-50%, -50%)
        rotate(${segment.rotation + rotation}deg)
        translateY(-${segment.distance}px)
      `,
    };

    switch (segment.shape) {
      case "circle":
        return (
          <motion.div
            key={segment.id}
            style={baseStyle}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3 + index * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: segment.size,
                height: segment.size,
                background: `radial-gradient(circle, ${segment.color}80 0%, transparent 70%)`,
                boxShadow: `0 0 ${segment.size / 2}px ${segment.color}40`,
              }}
            />
          </motion.div>
        );

      case "diamond":
        return (
          <motion.div
            key={segment.id}
            style={baseStyle}
            animate={{
              rotate: [0, 45, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + index * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              style={{
                width: segment.size,
                height: segment.size,
                background: `linear-gradient(135deg, ${segment.color}60 0%, transparent 50%, ${segment.color}60 100%)`,
                transform: "rotate(45deg)",
                boxShadow: `0 0 ${segment.size / 2}px ${segment.color}30`,
              }}
            />
          </motion.div>
        );

      case "triangle":
        return (
          <motion.div
            key={segment.id}
            style={baseStyle}
            animate={{
              rotate: [0, 60, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 5 + index * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${segment.size / 2}px solid transparent`,
                borderRight: `${segment.size / 2}px solid transparent`,
                borderBottom: `${segment.size}px solid ${segment.color}70`,
                filter: `drop-shadow(0 0 ${segment.size / 4}px ${segment.color}50)`,
              }}
            />
          </motion.div>
        );

      case "star":
        return (
          <motion.div
            key={segment.id}
            style={baseStyle}
            animate={{
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6 + index * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles
              style={{
                width: segment.size,
                height: segment.size,
                color: segment.color,
                filter: `drop-shadow(0 0 ${segment.size / 3}px ${segment.color})`,
              }}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Sacred geometry overlay
  const renderSacredGeometry = useMemo(() => {
    if (pattern !== "sacred") return null;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
      >
        {/* Flower of Life pattern */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.circle
            key={i}
            cx={200 + Math.cos((angle * Math.PI) / 180) * 50}
            cy={200 + Math.sin((angle * Math.PI) / 180) * 50}
            r="50"
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth="1"
            opacity="0.5"
            animate={{
              r: [50, 55, 50],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        <motion.circle
          cx="200"
          cy="200"
          r="50"
          fill="none"
          stroke={colors[0]}
          strokeWidth="1"
          opacity="0.5"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </svg>
    );
  }, [pattern, colors]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 text-white/70 hover:text-white"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="w-5 h-5" />
          </Button>

          {/* Main kaleidoscope container */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Background glow */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, ${colors[0]}20 0%, transparent 50%)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            />

            {/* Center point */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 100,
                height: 100,
                background: `radial-gradient(circle, ${colors[0]} 0%, ${colors[1]} 50%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            {/* Segments */}
            {segments.map((segment, index) => renderShape(segment, index))}

            {/* Sacred geometry overlay */}
            {renderSacredGeometry}

            {/* Outer ring */}
            <motion.div
              className="absolute rounded-full border-2 pointer-events-none"
              style={{
                width: 600,
                height: 600,
                borderColor: `${colors[2]}30`,
              }}
              animate={{
                rotate: rotation,
                scale: [1, 1.02, 1],
              }}
              transition={{
                rotate: { duration: 0, ease: "linear" },
                scale: { duration: 5, repeat: Infinity },
              }}
            />
          </div>

          {/* Controls panel */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col gap-4">
              {/* Pattern selection */}
              <div className="flex gap-2 justify-center">
                {(["mandala", "fractal", "cosmic", "sacred", "aurora"] as PatternType[]).map((p) => (
                  <Button
                    key={p}
                    variant={pattern === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPattern(p)}
                    className="capitalize"
                  >
                    {p}
                  </Button>
                ))}
              </div>

              {/* Color palette selection */}
              <div className="flex gap-2 justify-center">
                {Object.keys(COLOR_PALETTES).map((palette) => (
                  <Button
                    key={palette}
                    variant="ghost"
                    size="sm"
                    onClick={() => setColorPalette(palette as keyof typeof COLOR_PALETTES)}
                    className={`flex gap-1 ${colorPalette === palette ? "ring-2 ring-white" : ""}`}
                  >
                    {COLOR_PALETTES[palette as keyof typeof COLOR_PALETTES].slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </Button>
                ))}
              </div>

              {/* Sliders */}
              <div className="flex gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-white/70">Complexity</span>
                  <Slider
                    value={[complexity]}
                    onValueChange={([v]) => setComplexity(v)}
                    min={3}
                    max={12}
                    step={1}
                    className="w-24"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-white/70">Speed</span>
                  <Slider
                    value={[speed]}
                    onValueChange={([v]) => setSpeed(v)}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Play/Pause */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="mx-auto"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
