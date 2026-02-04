import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Zap, Sparkles, Volume2, VolumeX, ChevronUp, ChevronDown, RotateCcw, Maximize2, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface TunnelTravelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TunnelRing {
  z: number;
  rotation: number;
  hue: number;
  segments: number;
  pulsePhase: number;
  hasEnergy: boolean;
  hasCollectible: boolean;
  collectibleType?: 'orb' | 'star' | 'crystal';
  collected?: boolean;
}

interface EnergyOrb {
  x: number;
  y: number;
  z: number;
  size: number;
  hue: number;
  collected: boolean;
  type: 'orb' | 'star' | 'crystal';
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  hue: number;
  life: number;
  maxLife: number;
}

type TunnelMode = 'hyperspace' | 'quantum' | 'chakra' | 'void' | 'aurora' | 'nebula';

const TUNNEL_MODES: Record<TunnelMode, {
  name: string;
  description: string;
  baseHue: number;
  hueRange: number;
  ringCount: number;
  segmentCount: number;
  glowIntensity: number;
  particleDensity: number;
  backgroundGradient: string;
}> = {
  hyperspace: {
    name: "Hyperspace",
    description: "Travel through the fabric of space-time",
    baseHue: 220,
    hueRange: 60,
    ringCount: 40,
    segmentCount: 24,
    glowIntensity: 1.2,
    particleDensity: 100,
    backgroundGradient: "radial-gradient(ellipse at center, #0a0a2e 0%, #000010 100%)"
  },
  quantum: {
    name: "Quantum Realm",
    description: "Enter the subatomic dimension",
    baseHue: 280,
    hueRange: 80,
    ringCount: 50,
    segmentCount: 16,
    glowIntensity: 1.5,
    particleDensity: 150,
    backgroundGradient: "radial-gradient(ellipse at center, #1a0a2e 0%, #050015 100%)"
  },
  chakra: {
    name: "Chakra Vortex",
    description: "Align with universal energy",
    baseHue: 0,
    hueRange: 360,
    ringCount: 35,
    segmentCount: 12,
    glowIntensity: 1.0,
    particleDensity: 80,
    backgroundGradient: "radial-gradient(ellipse at center, #1a1a0a 0%, #0a0500 100%)"
  },
  void: {
    name: "The Void",
    description: "Embrace infinite emptiness",
    baseHue: 200,
    hueRange: 20,
    ringCount: 30,
    segmentCount: 8,
    glowIntensity: 0.5,
    particleDensity: 30,
    backgroundGradient: "radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)"
  },
  aurora: {
    name: "Aurora Stream",
    description: "Dance with cosmic lights",
    baseHue: 120,
    hueRange: 100,
    ringCount: 45,
    segmentCount: 32,
    glowIntensity: 1.3,
    particleDensity: 120,
    backgroundGradient: "radial-gradient(ellipse at center, #0a1a15 0%, #000a08 100%)"
  },
  nebula: {
    name: "Nebula Core",
    description: "Birth of stars awaits",
    baseHue: 320,
    hueRange: 70,
    ringCount: 55,
    segmentCount: 20,
    glowIntensity: 1.4,
    particleDensity: 140,
    backgroundGradient: "radial-gradient(ellipse at center, #2a0a1a 0%, #100008 100%)"
  }
};

export const TunnelTravel = memo(({ isOpen, onClose }: TunnelTravelProps) => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [mode, setMode] = useState<TunnelMode>('hyperspace');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [distance, setDistance] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [combo, setCombo] = useState(0);
  const [lastCollectTime, setLastCollectTime] = useState(0);

  const ringsRef = useRef<TunnelRing[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<EnergyOrb[]>([]);
  const timeRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const modeConfig = TUNNEL_MODES[mode];

  // Initialize tunnel rings
  const initializeTunnel = useCallback(() => {
    const rings: TunnelRing[] = [];
    const orbs: EnergyOrb[] = [];

    for (let i = 0; i < modeConfig.ringCount; i++) {
      const z = i * 100;
      const hasCollectible = Math.random() > 0.85;

      rings.push({
        z,
        rotation: (i * 7) % 360,
        hue: modeConfig.baseHue + (Math.random() - 0.5) * modeConfig.hueRange,
        segments: modeConfig.segmentCount,
        pulsePhase: Math.random() * Math.PI * 2,
        hasEnergy: Math.random() > 0.7,
        hasCollectible,
        collectibleType: hasCollectible ? (['orb', 'star', 'crystal'] as const)[Math.floor(Math.random() * 3)] : undefined,
        collected: false
      });

      if (hasCollectible) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.random() * 100;
        orbs.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z,
          size: 15 + Math.random() * 10,
          hue: modeConfig.baseHue + Math.random() * 60,
          collected: false,
          type: (['orb', 'star', 'crystal'] as const)[Math.floor(Math.random() * 3)]
        });
      }
    }

    ringsRef.current = rings;
    orbsRef.current = orbs;

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < modeConfig.particleDensity; i++) {
      particles.push(createParticle());
    }
    particlesRef.current = particles;
  }, [mode, modeConfig]);

  const createParticle = useCallback((): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 100 + Math.random() * 300;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: Math.random() * 4000,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      vz: 0,
      size: 1 + Math.random() * 3,
      hue: modeConfig.baseHue + (Math.random() - 0.5) * modeConfig.hueRange,
      life: 1,
      maxLife: 1
    };
  }, [modeConfig]);

  // Handle keyboard input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ') {
        e.preventDefault();
        setSpeed(prev => Math.min(prev + 0.5, 5));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
      if (e.key === ' ') {
        setSpeed(prev => Math.max(prev - 0.3, 0.5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  // Handle touch input
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !canvasRef.current) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const deltaX = (touch.clientX - centerX) / centerX;
    const deltaY = (touch.clientY - centerY) / centerY;

    setPlayerPos({
      x: deltaX * 150,
      y: deltaY * 150
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  // Mouse movement for desktop
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || isMobile) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (e.clientX - rect.left - centerX) / centerX;
    const deltaY = (e.clientY - rect.top - centerY) / centerY;

    setPlayerPos({
      x: deltaX * 200,
      y: deltaY * 200
    });
  }, [isMobile]);

  // Sound effects
  useEffect(() => {
    if (!soundEnabled || !isOpen) return;

    try {
      audioContextRef.current = new AudioContext();
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(100 + speed * 50, audioContextRef.current.currentTime);
      gainNodeRef.current.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);

      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      oscillatorRef.current.start();
    } catch (e) {
      console.log('Audio not supported');
    }

    return () => {
      oscillatorRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, [soundEnabled, isOpen, speed]);

  // Main render loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    initializeTunnel();

    const render = () => {
      timeRef.current += 0.016 * speed;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2 + playerPos.x;
      const centerY = height / 2 + playerPos.y;

      // Clear with fade effect for trails
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + speed * 0.05})`;
      ctx.fillRect(0, 0, width, height);

      // Handle keyboard movement
      if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) {
        setPlayerPos(prev => ({ ...prev, x: Math.max(-200, prev.x - 5) }));
      }
      if (keysRef.current.has('arrowright') || keysRef.current.has('d')) {
        setPlayerPos(prev => ({ ...prev, x: Math.min(200, prev.x + 5) }));
      }
      if (keysRef.current.has('arrowup') || keysRef.current.has('w')) {
        setPlayerPos(prev => ({ ...prev, y: Math.max(-200, prev.y - 5) }));
      }
      if (keysRef.current.has('arrowdown') || keysRef.current.has('s')) {
        setPlayerPos(prev => ({ ...prev, y: Math.min(200, prev.y + 5) }));
      }

      // Update and render tunnel rings
      const rings = ringsRef.current;
      const sortedRings = [...rings].sort((a, b) => b.z - a.z);

      for (const ring of sortedRings) {
        // Move ring towards player
        ring.z -= speed * 20;
        ring.rotation += speed * 0.5;

        // Reset ring when too close
        if (ring.z < -100) {
          ring.z = modeConfig.ringCount * 100;
          ring.collected = false;
          ring.hasCollectible = Math.random() > 0.85;
          ring.hue = modeConfig.baseHue + (Math.random() - 0.5) * modeConfig.hueRange;
        }

        // Calculate perspective
        const perspective = 600 / (600 + ring.z);
        if (perspective < 0.05 || ring.z < 0) continue;

        const radius = 300 * perspective;
        const pulse = Math.sin(timeRef.current * 3 + ring.pulsePhase) * 0.2 + 1;
        const adjustedRadius = radius * pulse;

        // Draw ring segments
        const segmentAngle = (Math.PI * 2) / ring.segments;
        const rotationRad = (ring.rotation * Math.PI) / 180;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRad);

        for (let i = 0; i < ring.segments; i++) {
          const startAngle = i * segmentAngle;
          const endAngle = startAngle + segmentAngle * 0.8;

          const hue = (ring.hue + i * 5 + timeRef.current * 30) % 360;
          const saturation = 70 + Math.sin(timeRef.current + i) * 20;
          const lightness = 50 + perspective * 30;

          // Outer glow
          ctx.beginPath();
          ctx.arc(0, 0, adjustedRadius + 5 * perspective, startAngle, endAngle);
          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 * perspective * modeConfig.glowIntensity})`;
          ctx.lineWidth = 8 * perspective;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Main segment
          ctx.beginPath();
          ctx.arc(0, 0, adjustedRadius, startAngle, endAngle);
          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.8 * perspective})`;
          ctx.lineWidth = 4 * perspective;
          ctx.stroke();

          // Inner glow
          ctx.beginPath();
          ctx.arc(0, 0, adjustedRadius - 3 * perspective, startAngle, endAngle);
          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, ${0.5 * perspective})`;
          ctx.lineWidth = 2 * perspective;
          ctx.stroke();

          // Energy nodes at segment intersections
          if (ring.hasEnergy && i % 3 === 0) {
            const nodeX = Math.cos(startAngle) * adjustedRadius;
            const nodeY = Math.sin(startAngle) * adjustedRadius;

            const gradient = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, 10 * perspective);
            gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, ${perspective})`);
            gradient.addColorStop(0.5, `hsla(${hue}, 80%, 60%, ${0.5 * perspective})`);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 10 * perspective, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        }

        ctx.restore();

        // Draw collectibles
        if (ring.hasCollectible && !ring.collected && ring.z > 0 && ring.z < 200) {
          const collectX = centerX;
          const collectY = centerY;
          const collectSize = 20 * perspective;

          // Check collision
          const dx = playerPos.x;
          const dy = playerPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (ring.z < 100 && dist < 80) {
            ring.collected = true;
            const points = ring.collectibleType === 'crystal' ? 50 : ring.collectibleType === 'star' ? 30 : 20;

            // Combo system
            const now = Date.now();
            if (now - lastCollectTime < 2000) {
              setCombo(prev => prev + 1);
              setScore(prev => prev + points * (1 + combo * 0.5));
            } else {
              setCombo(1);
              setScore(prev => prev + points);
            }
            setLastCollectTime(now);
            setEnergy(prev => Math.min(100, prev + 5));

            // Spawn burst particles
            for (let p = 0; p < 10; p++) {
              particlesRef.current.push({
                x: collectX - centerX,
                y: collectY - centerY,
                z: ring.z,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                vz: -5,
                size: 3 + Math.random() * 3,
                hue: ring.hue,
                life: 1,
                maxLife: 1
              });
            }
          } else {
            // Draw collectible
            const collectHue = (ring.hue + timeRef.current * 100) % 360;

            ctx.save();
            ctx.translate(collectX, collectY);
            ctx.rotate(timeRef.current * 2);

            if (ring.collectibleType === 'star') {
              // Draw star
              ctx.beginPath();
              for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * collectSize;
                const y = Math.sin(angle) * collectSize;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.closePath();
              ctx.fillStyle = `hsla(${collectHue}, 100%, 70%, ${perspective})`;
              ctx.fill();
            } else if (ring.collectibleType === 'crystal') {
              // Draw crystal (diamond shape)
              ctx.beginPath();
              ctx.moveTo(0, -collectSize);
              ctx.lineTo(collectSize * 0.6, 0);
              ctx.lineTo(0, collectSize);
              ctx.lineTo(-collectSize * 0.6, 0);
              ctx.closePath();
              ctx.fillStyle = `hsla(${collectHue}, 90%, 75%, ${perspective})`;
              ctx.fill();
              ctx.strokeStyle = `hsla(${collectHue}, 100%, 90%, ${perspective})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            } else {
              // Draw orb
              const orbGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, collectSize);
              orbGradient.addColorStop(0, `hsla(${collectHue}, 100%, 90%, ${perspective})`);
              orbGradient.addColorStop(0.5, `hsla(${collectHue}, 90%, 60%, ${perspective})`);
              orbGradient.addColorStop(1, `hsla(${collectHue}, 80%, 40%, ${perspective * 0.5})`);

              ctx.beginPath();
              ctx.arc(0, 0, collectSize, 0, Math.PI * 2);
              ctx.fillStyle = orbGradient;
              ctx.fill();
            }

            // Glow effect
            const glowGradient = ctx.createRadialGradient(0, 0, collectSize, 0, 0, collectSize * 2);
            glowGradient.addColorStop(0, `hsla(${collectHue}, 100%, 70%, ${0.3 * perspective})`);
            glowGradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(0, 0, collectSize * 2, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();

            ctx.restore();
          }
        }
      }

      // Render particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z -= speed * 30;
        p.life -= 0.01;

        if (p.z < -100 || p.life <= 0) {
          particles[i] = createParticle();
          continue;
        }

        const perspective = 600 / (600 + p.z);
        if (perspective < 0.05) continue;

        const screenX = centerX + p.x * perspective;
        const screenY = centerY + p.y * perspective;
        const size = p.size * perspective;

        // Particle trail
        const trailLength = speed * 10 * perspective;
        const gradient = ctx.createLinearGradient(
          screenX,
          screenY,
          screenX,
          screenY + trailLength
        );
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.life * perspective})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX, screenY + trailLength);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Particle head
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${p.life * perspective})`;
        ctx.fill();
      }

      // Central vortex effect
      const vortexGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 100
      );
      vortexGradient.addColorStop(0, `hsla(${modeConfig.baseHue}, 100%, 90%, ${0.5 + speed * 0.1})`);
      vortexGradient.addColorStop(0.3, `hsla(${modeConfig.baseHue}, 80%, 60%, 0.3)`);
      vortexGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fillStyle = vortexGradient;
      ctx.fill();

      // Player indicator
      ctx.beginPath();
      ctx.arc(width / 2 + playerPos.x, height / 2 + playerPos.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${modeConfig.baseHue + 60}, 100%, 80%, 0.8)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update distance and energy
      setDistance(prev => prev + speed * 0.5);
      setEnergy(prev => Math.max(0, prev - speed * 0.01));

      // Update sound pitch
      if (oscillatorRef.current && audioContextRef.current) {
        oscillatorRef.current.frequency.setValueAtTime(
          100 + speed * 50 + Math.sin(timeRef.current) * 20,
          audioContextRef.current.currentTime
        );
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, isPlaying, mode, speed, playerPos, modeConfig, initializeTunnel, createParticle, combo, lastCollectTime]);

  const resetJourney = useCallback(() => {
    setScore(0);
    setDistance(0);
    setEnergy(100);
    setCombo(0);
    setPlayerPos({ x: 0, y: 0 });
    setSpeed(1);
    initializeTunnel();
  }, [initializeTunnel]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: modeConfig.backgroundGradient }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-none"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'
            }}
          />

          {/* Top HUD */}
          <AnimatePresence>
            {showHUD && (
              <motion.div
                className="absolute top-4 left-4 right-4 flex justify-between items-start z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Score and combo */}
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{Math.floor(score)}</span>
                  </div>
                  {combo > 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1"
                    >
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-bold">x{combo} COMBO!</span>
                    </motion.div>
                  )}
                </div>

                {/* Mode and controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="text-white/70 hover:text-white"
                  >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white/70 hover:text-white"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Energy and distance */}
          <AnimatePresence>
            {showHUD && (
              <motion.div
                className="absolute top-20 left-4 z-20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <div className="w-24">
                      <Progress value={energy} className="h-2" />
                    </div>
                    <span className="text-xs text-white/70">{Math.floor(energy)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-white/70">{Math.floor(distance)} units</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls */}
          <motion.div
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex flex-col gap-4">
                {/* Mode name */}
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-1 border-white/30">
                    {modeConfig.name}
                  </Badge>
                  <p className="text-xs text-white/50 mt-1">{modeConfig.description}</p>
                </div>

                {/* Mode selection */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {(Object.keys(TUNNEL_MODES) as TunnelMode[]).map((m) => (
                    <Button
                      key={m}
                      variant={mode === m ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setMode(m);
                        setTimeout(initializeTunnel, 0);
                      }}
                      className="text-xs"
                    >
                      {TUNNEL_MODES[m].name.split(' ')[0]}
                    </Button>
                  ))}
                </div>

                {/* Speed control */}
                <div className="flex items-center gap-4 justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSpeed(Math.max(0.5, speed - 0.5))}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-white/70 text-xs">Speed</span>
                    <Slider
                      value={[speed]}
                      onValueChange={([v]) => setSpeed(v)}
                      min={0.5}
                      max={5}
                      step={0.25}
                      className="w-32"
                    />
                    <span className="text-white text-sm font-mono">{speed.toFixed(2)}x</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSpeed(Math.min(5, speed + 0.5))}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>

                {/* Play/Pause/Reset */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={isPlaying ? "outline" : "default"}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Pause" : "Resume"}
                  </Button>
                  <Button variant="outline" onClick={resetJourney}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Controls hint */}
                {!isMobile && (
                  <div className="text-xs text-white/40 text-center">
                    <span className="text-cyan-400">WASD/Arrows</span> to move | <span className="text-cyan-400">Hold Space</span> to boost | <span className="text-cyan-400">Mouse</span> to steer
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Toggle HUD button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHUD(!showHUD)}
            className="absolute bottom-4 right-4 z-20 text-white/50 hover:text-white"
          >
            {showHUD ? "Hide HUD" : "Show HUD"}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TunnelTravel.displayName = 'TunnelTravel';
