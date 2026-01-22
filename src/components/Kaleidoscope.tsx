import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, Play, Pause, Palette, Sparkles, Maximize2, Navigation, Zap, Eye, RotateCcw, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface KaleidoscopeProps {
  isOpen: boolean;
  onClose: () => void;
}

type TunnelType = "flower-of-life" | "metatrons-cube" | "sri-yantra" | "merkaba" | "golden-spiral" | "fractal-mandala";

interface TunnelSegment {
  id: number;
  z: number;
  rotation: number;
  scale: number;
  geometry: {
    type: "circle" | "triangle" | "square" | "pentagon" | "hexagon" | "star" | "spiral" | "mandala";
    vertices: Array<{ x: number; y: number }>;
    connections: Array<[number, number]>;
  };
  color: string;
  glow: number;
}

interface Camera {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  speed: number;
}

const TUNNEL_TYPES = {
  "flower-of-life": {
    name: "Flower of Life",
    description: "Sacred geometry of creation and interconnectedness",
    colors: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
    geometry: "circle"
  },
  "metatrons-cube": {
    name: "Metatron's Cube",
    description: "Archangel Metatron's sacred geometric pattern",
    colors: ["#22D3EE", "#34D399", "#A78BFA", "#F472B6", "#FBBF24"],
    geometry: "triangle"
  },
  "sri-yantra": {
    name: "Sri Yantra",
    description: "Ancient Hindu yantra for spiritual awakening",
    colors: ["#F97316", "#EF4444", "#EC4899", "#8B5CF6", "#F59E0B"],
    geometry: "triangle"
  },
  "merkaba": {
    name: "Merkaba",
    description: "Sacred geometric vehicle of light",
    colors: ["#0EA5E9", "#06B6D4", "#14B8A6", "#3B82F6", "#6366F1"],
    geometry: "star"
  },
  "golden-spiral": {
    name: "Golden Spiral",
    description: "Fibonacci sequence in sacred geometry",
    colors: ["#10B981", "#059669", "#84CC16", "#22C55E", "#4ADE80"],
    geometry: "spiral"
  },
  "fractal-mandala": {
    name: "Fractal Mandala",
    description: "Infinite self-similar sacred patterns",
    colors: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
    geometry: "mandala"
  }
};

export const Kaleidoscope = ({ isOpen, onClose }: KaleidoscopeProps) => {
  const [tunnelType, setTunnelType] = useState<TunnelType>("flower-of-life");
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, speed: 2 });
  const [tunnelSegments, setTunnelSegments] = useState<TunnelSegment[]>([]);
  const [isTraveling, setIsTraveling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [depth, setDepth] = useState(0);

  const tunnelData = TUNNEL_TYPES[tunnelType];
  const colors = tunnelData.colors;
  const animationRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  // Generate tunnel geometry based on type
  const generateTunnelGeometry = useCallback(() => {
    const segments: TunnelSegment[] = [];
    const segmentCount = 50;

    for (let i = 0; i < segmentCount; i++) {
      const z = i * 100;
      const rotation = (i * 15) % 360;
      const scale = 1 + Math.sin(i * 0.2) * 0.3;

      let geometry: TunnelSegment['geometry'];

      switch (tunnelType) {
        case "flower-of-life":
          geometry = {
            type: "circle",
            vertices: Array.from({ length: 6 }, (_, j) => ({
              x: Math.cos((j / 6) * Math.PI * 2) * 80 * scale,
              y: Math.sin((j / 6) * Math.PI * 2) * 80 * scale
            })),
            connections: Array.from({ length: 6 }, (_, j) => [j, (j + 1) % 6] as [number, number])
          };
          break;

        case "metatrons-cube":
          geometry = {
            type: "triangle",
            vertices: [
              { x: 0, y: -100 * scale },
              { x: -87 * scale, y: 50 * scale },
              { x: 87 * scale, y: 50 * scale }
            ],
            connections: [[0, 1], [1, 2], [2, 0]]
          };
          break;

        case "sri-yantra":
          geometry = {
            type: "triangle",
            vertices: [
              { x: 0, y: -120 * scale },
              { x: -104 * scale, y: 60 * scale },
              { x: 104 * scale, y: 60 * scale }
            ],
            connections: [[0, 1], [1, 2], [2, 0]]
          };
          break;

        case "merkaba":
          geometry = {
            type: "star",
            vertices: Array.from({ length: 8 }, (_, j) => ({
              x: Math.cos((j / 8) * Math.PI * 2) * (j % 2 === 0 ? 60 : 100) * scale,
              y: Math.sin((j / 8) * Math.PI * 2) * (j % 2 === 0 ? 60 : 100) * scale
            })),
            connections: Array.from({ length: 8 }, (_, j) => [j, (j + 1) % 8] as [number, number])
          };
          break;

        case "golden-spiral":
          const phi = (1 + Math.sqrt(5)) / 2;
          geometry = {
            type: "spiral",
            vertices: Array.from({ length: 20 }, (_, j) => {
              const angle = j * 0.5;
              const radius = Math.pow(phi, angle * 0.1) * 10 * scale;
              return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
              };
            }),
            connections: Array.from({ length: 19 }, (_, j) => [j, j + 1] as [number, number])
          };
          break;

        case "fractal-mandala":
          geometry = {
            type: "mandala",
            vertices: Array.from({ length: 12 }, (_, j) => ({
              x: Math.cos((j / 12) * Math.PI * 2) * (50 + Math.sin(j * 2) * 30) * scale,
              y: Math.sin((j / 12) * Math.PI * 2) * (50 + Math.sin(j * 2) * 30) * scale
            })),
            connections: Array.from({ length: 12 }, (_, j) => [j, (j + 1) % 12] as [number, number])
          };
          break;

        default:
          geometry = {
            type: "circle",
            vertices: [],
            connections: []
          };
      }

      segments.push({
        id: i,
        z,
        rotation,
        scale,
        geometry,
        color: colors[i % colors.length],
        glow: Math.sin(i * 0.3) * 0.5 + 0.5
      });
    }

    setTunnelSegments(segments);
  }, [tunnelType, colors]);

  useEffect(() => {
    if (isOpen) {
      generateTunnelGeometry();
    }
  }, [isOpen, generateTunnelGeometry]);

  // Keyboard controls for tunnel navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  // Animation and navigation loop
  useEffect(() => {
    if (!isOpen) return;

    const animate = () => {
      setDepth(prev => prev + camera.speed * 0.1);

      // Handle keyboard navigation
      setCamera(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newRotationX = prev.rotationX;
        let newRotationY = prev.rotationY;

        if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
          newX -= 2;
        }
        if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
          newX += 2;
        }
        if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
          newY -= 2;
        }
        if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
          newY += 2;
        }
        if (keysPressed.current.has('q')) {
          newRotationY -= 1;
        }
        if (keysPressed.current.has('e')) {
          newRotationY += 1;
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          rotationX: newRotationX,
          rotationY: newRotationY,
          z: prev.z + (isTraveling ? camera.speed : 0)
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, camera.speed, isTraveling]);

  const renderTunnelSegment = (segment: TunnelSegment) => {
    const cameraZ = camera.z + depth;
    const relativeZ = segment.z - cameraZ;
    const perspective = 1000 / (1000 + relativeZ);

    if (perspective < 0.1 || relativeZ < -500) return null;

    const screenX = (segment.geometry.vertices[0]?.x || 0) * perspective + camera.x;
    const screenY = (segment.geometry.vertices[0]?.y || 0) * perspective + camera.y;

    return (
      <motion.div
        key={segment.id}
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${screenX}px, ${screenY}px) rotate(${segment.rotation + camera.rotationY}deg)`,
          zIndex: Math.floor(relativeZ),
        }}
        animate={{
          opacity: perspective,
          scale: perspective * segment.scale,
        }}
      >
        {/* Render geometry based on type */}
        <svg
          width={200 * perspective}
          height={200 * perspective}
          className="absolute"
          style={{
            left: -100 * perspective,
            top: -100 * perspective,
          }}
        >
          {/* Connections */}
          {segment.geometry.connections.map(([from, to], i) => {
            const v1 = segment.geometry.vertices[from];
            const v2 = segment.geometry.vertices[to];
            if (!v1 || !v2) return null;

            return (
              <motion.line
                key={i}
                x1={v1.x + 100}
                y1={v1.y + 100}
                x2={v2.x + 100}
                y2={v2.y + 100}
                stroke={segment.color}
                strokeWidth={2 * perspective}
                opacity={segment.glow * 0.8}
                animate={{
                  opacity: [segment.glow * 0.5, segment.glow, segment.glow * 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            );
          })}

          {/* Vertices */}
          {segment.geometry.vertices.map((vertex, i) => (
            <motion.circle
              key={i}
              cx={vertex.x + 100}
              cy={vertex.y + 100}
              r={4 * perspective}
              fill={segment.color}
              animate={{
                r: [4 * perspective, 6 * perspective, 4 * perspective],
                opacity: [segment.glow * 0.6, segment.glow, segment.glow * 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </svg>

        {/* Glow effect */}
        <motion.div
          className="absolute rounded-full blur-xl"
          style={{
            width: 100 * perspective,
            height: 100 * perspective,
            left: -50 * perspective,
            top: -50 * perspective,
            background: `radial-gradient(circle, ${segment.color}40 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0, segment.glow * 0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </motion.div>
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetCamera = () => {
    setCamera({ x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, speed: 2 });
    setDepth(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
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

          {/* Tunnel view */}
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-purple-900/20 to-black">
            {/* Tunnel segments */}
            {tunnelSegments.map(segment => renderTunnelSegment(segment))}

            {/* Central light beam */}
            <motion.div
              className="absolute left-1/2 top-1/2 w-2 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
              style={{
                transform: 'translateX(-50%) translateY(-50%)',
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scaleX: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Navigation HUD */}
            <motion.div
              className="absolute top-6 left-6 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showControls ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Tunnel Navigation</span>
                </div>

                <div className="space-y-2 text-xs text-white/70">
                  <div>Depth: {Math.floor(depth)} units</div>
                  <div>Speed: {camera.speed.toFixed(1)}x</div>
                  <div>Position: {Math.floor(camera.x)}, {Math.floor(camera.y)}</div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant={isTraveling ? "default" : "outline"}
                    onClick={() => setIsTraveling(!isTraveling)}
                    className="text-xs"
                  >
                    {isTraveling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetCamera}
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tunnel info */}
            <motion.div
              className="absolute bottom-6 left-6 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showControls ? 1 : 0.3 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/10 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                    {tunnelData.name}
                  </Badge>
                </div>
                <p className="text-xs text-white/70">{tunnelData.description}</p>
              </div>
            </motion.div>

            {/* Controls panel */}
            <motion.div
              className="absolute bottom-6 right-6 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showControls ? 1 : 0.3 }}
              transition={{ delay: 0.7 }}
            >
              <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex flex-col gap-4">
                  {/* Tunnel type selection */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(Object.keys(TUNNEL_TYPES) as TunnelType[]).map((type) => (
                      <Button
                        key={type}
                        variant={tunnelType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTunnelType(type)}
                        className="text-xs capitalize"
                      >
                        {TUNNEL_TYPES[type].name.split(' ')[0]}
                      </Button>
                    ))}
                  </div>

                  {/* Speed control */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-white/70">Travel Speed</span>
                    <Slider
                      value={[camera.speed]}
                      onValueChange={([v]) => setCamera(prev => ({ ...prev, speed: v }))}
                      min={0.5}
                      max={10}
                      step={0.5}
                      className="w-32"
                    />
                  </div>

                  {/* Movement hints */}
                  <div className="text-xs text-white/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">WASD</span>
                      <span>Move</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">QE</span>
                      <span>Rotate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">Space</span>
                      <span>Travel</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hide controls hint */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: showControls ? 0 : 0.7 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="text-white/50 hover:text-white"
              >
                {showControls ? "Hide Controls" : "Show Controls"}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
