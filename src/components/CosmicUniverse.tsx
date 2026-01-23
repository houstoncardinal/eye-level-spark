import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  color: string;
}

interface Planet {
  id: number;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  size: number;
  color: string;
}

interface CosmicUniverseProps {
  mousePos: { x: number; y: number };
  isConstellationMode: boolean;
  engagement: number;
  enableNavigation?: boolean;
}

const STAR_COUNT_DESKTOP = 80;
const STAR_COUNT_MOBILE = 25;
const PLANET_COUNT_DESKTOP = 3;
const PLANET_COUNT_MOBILE = 1;

// Memoized star component using CSS instead of Framer Motion
const StarElement = memo(({ star }: { star: Star }) => (
  <div
    className="absolute rounded-full"
    style={{
      left: `${star.x * 100}%`,
      top: `${star.y * 100}%`,
      width: star.size,
      height: star.size,
      backgroundColor: star.color,
      opacity: star.brightness,
      animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite`,
    }}
  />
));

StarElement.displayName = 'StarElement';

export const CosmicUniverse = memo(({
  isConstellationMode,
  engagement,
  enableNavigation = true
}: CosmicUniverseProps) => {
  const isMobile = useIsMobile();
  const [stars, setStars] = useState<Star[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [galaxyRotation, setGalaxyRotation] = useState(0);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const animationRef = useRef<number>();
  const frameCountRef = useRef(0);

  const STAR_COUNT = isMobile ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
  const PLANET_COUNT = isMobile ? PLANET_COUNT_MOBILE : PLANET_COUNT_DESKTOP;

  // Initialize cosmic elements
  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 0.5,
      brightness: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 70}%)`,
    }));
    setStars(initialStars);

    const initialPlanets: Planet[] = Array.from({ length: PLANET_COUNT }, (_, i) => ({
      id: i,
      orbitRadius: 120 + i * 70,
      orbitSpeed: 0.003 + i * 0.001,
      angle: Math.random() * Math.PI * 2,
      size: 15 + i * 8,
      color: `hsl(${Math.random() * 60 + 20}, 60%, 50%)`,
    }));
    setPlanets(initialPlanets);
  }, [STAR_COUNT, PLANET_COUNT]);

  // Mouse/touch navigation handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enableNavigation || isMobile) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
  }, [camera, enableNavigation, isMobile]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !enableNavigation) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setCamera(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, enableNavigation]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableNavigation || isMobile) return;
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, camera.zoom * zoomFactor));
    setCamera(prev => ({ ...prev, zoom: newZoom }));
  }, [camera.zoom, enableNavigation, isMobile]);

  // Simplified animation loop
  const animate = useCallback(() => {
    frameCountRef.current++;

    // On mobile, only update every 3rd frame
    if (isMobile && frameCountRef.current % 3 !== 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    setGalaxyRotation(prev => prev + 0.05);

    // Update planets
    setPlanets(prev => prev.map(planet => ({
      ...planet,
      angle: planet.angle + planet.orbitSpeed,
    })));

    animationRef.current = requestAnimationFrame(animate);
  }, [isMobile]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  // Memoized galaxy background style
  const galaxyStyle = useMemo(() => ({
    background: `conic-gradient(from ${galaxyRotation}deg at 50% 50%,
      transparent 0deg,
      hsl(270 30% 15% / 0.08) 45deg,
      transparent 90deg,
      hsl(240 40% 20% / 0.08) 135deg,
      transparent 180deg,
      hsl(200 50% 15% / 0.08) 225deg,
      transparent 270deg,
      hsl(280 30% 18% / 0.08) 315deg,
      transparent 360deg)`,
  }), [galaxyRotation]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${enableNavigation && !isMobile ? 'cursor-grab' : 'pointer-events-none'} ${isDragging ? 'cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      {/* CSS for star twinkle animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Camera viewport container */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Galaxy spiral arms background - simplified */}
        <div className="absolute inset-0" style={galaxyStyle} />

        {/* Stars - using CSS animations */}
        {stars.map(star => (
          <StarElement key={star.id} star={star} />
        ))}

        {/* Planetary system - simplified */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {planets.map(planet => (
            <div key={planet.id}>
              {/* Orbit path */}
              <div
                className="absolute border border-white/5 rounded-full"
                style={{
                  width: planet.orbitRadius * 2,
                  height: planet.orbitRadius * 2,
                  left: -planet.orbitRadius,
                  top: -planet.orbitRadius,
                }}
              />

              {/* Planet */}
              <div
                className="absolute rounded-full will-change-transform"
                style={{
                  width: planet.size,
                  height: planet.size,
                  left: -planet.size / 2,
                  top: -planet.size / 2,
                  background: `radial-gradient(circle at 30% 30%, ${planet.color} 0%, hsl(30 60% 30%) 100%)`,
                  boxShadow: `0 0 ${planet.size / 2}px ${planet.color}40`,
                  transform: `translate(${Math.cos(planet.angle) * planet.orbitRadius}px, ${Math.sin(planet.angle) * planet.orbitRadius}px)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Constellation overlay in constellation mode - simplified */}
        <AnimatePresence>
          {isConstellationMode && !isMobile && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <svg className="absolute inset-0 w-full h-full">
                {stars
                  .filter(star => star.size > 1.5)
                  .slice(0, 8)
                  .map((star, i, filteredStars) => {
                    const nextStar = filteredStars[(i + 1) % filteredStars.length];
                    return (
                      <line
                        key={`constellation-${i}`}
                        x1={`${star.x * 100}%`}
                        y1={`${star.y * 100}%`}
                        x2={`${nextStar.x * 100}%`}
                        y2={`${nextStar.y * 100}%`}
                        stroke="hsl(45 100% 80% / 0.3)"
                        strokeWidth={1}
                      />
                    );
                  })}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Black hole effect when highly engaged - only on desktop */}
        <AnimatePresence>
          {engagement > 0.8 && !isMobile && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.25 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div
                className="w-24 h-24 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    transparent 0%,
                    hsl(240 100% 10%) 30%,
                    hsl(240 100% 5%) 70%,
                    black 100%)`,
                  boxShadow: `0 0 60px black, inset 0 0 30px hsl(240 100% 20%)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation indicator - desktop only */}
      {enableNavigation && !isMobile && (
        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center gap-2 bg-background/70 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-mono">
              {Math.round(camera.x)}, {Math.round(camera.y)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

CosmicUniverse.displayName = 'CosmicUniverse';
