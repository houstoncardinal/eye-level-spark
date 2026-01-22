import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  color: string;
  type: 'star' | 'nova' | 'pulsar';
}

interface Planet {
  id: number;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  size: number;
  color: string;
  moons?: { angle: number; distance: number; size: number }[];
}

interface Nebula {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  rotation: number;
}

interface CosmicPortal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  active: boolean;
}

interface Meteor {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  trail: { x: number; y: number }[];
}

interface CosmicUniverseProps {
  mousePos: { x: number; y: number };
  isConstellationMode: boolean;
  engagement: number;
  enableNavigation?: boolean;
}

const STAR_COUNT = 200;
const PLANET_COUNT = 3;
const NEBULA_COUNT = 4;

export const CosmicUniverse = ({
  mousePos,
  isConstellationMode,
  engagement,
  enableNavigation = true
}: CosmicUniverseProps) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [nebulae, setNebulae] = useState<Nebula[]>([]);
  const [portals, setPortals] = useState<CosmicPortal[]>([]);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [galaxyRotation, setGalaxyRotation] = useState(0);
  const [cosmicTime, setCosmicTime] = useState(0);

  // Navigation state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [showNavigationHints, setShowNavigationHints] = useState(true);

  const animationRef = useRef<number>();
  const meteorIdRef = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Keyboard navigation
  useEffect(() => {
    if (!enableNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key.toLowerCase());
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableNavigation]);

  // Initialize cosmic elements
  useEffect(() => {
    // Create stars
    const initialStars: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 3 + 0.5,
      brightness: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 70}%)`,
      type: Math.random() > 0.9 ? 'nova' : Math.random() > 0.8 ? 'pulsar' : 'star'
    }));
    setStars(initialStars);

    // Create planets
    const initialPlanets: Planet[] = Array.from({ length: PLANET_COUNT }, (_, i) => ({
      id: i,
      orbitRadius: 150 + i * 80,
      orbitSpeed: 0.005 + i * 0.002,
      angle: Math.random() * Math.PI * 2,
      size: 20 + i * 10,
      color: `hsl(${Math.random() * 60 + 20}, 60%, 50%)`,
      moons: Math.random() > 0.5 ? [{
        angle: Math.random() * Math.PI * 2,
        distance: 40 + Math.random() * 20,
        size: 4 + Math.random() * 4
      }] : undefined
    }));
    setPlanets(initialPlanets);

    // Create nebulae
    const initialNebulae: Nebula[] = Array.from({ length: NEBULA_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 0.8 + 0.1,
      y: Math.random() * 0.8 + 0.1,
      width: Math.random() * 300 + 200,
      height: Math.random() * 200 + 150,
      color: `hsl(${Math.random() * 60 + 240}, 40%, 30%)`,
      opacity: Math.random() * 0.3 + 0.1,
      rotation: Math.random() * 360
    }));
    setNebulae(initialNebulae);

    // Create cosmic portals
    const initialPortals: CosmicPortal[] = Array.from({ length: 2 }, (_, i) => ({
      id: i,
      x: Math.random() * 0.6 + 0.2,
      y: Math.random() * 0.6 + 0.2,
      size: 60 + Math.random() * 40,
      rotation: Math.random() * 360,
      active: Math.random() > 0.7
    }));
    setPortals(initialPortals);
  }, []);

  // Mouse/touch navigation handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enableNavigation) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
    setVelocity({ x: 0, y: 0 });
  }, [camera, enableNavigation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !enableNavigation) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setCamera(prev => ({ ...prev, x: newX, y: newY }));

    // Calculate velocity for momentum
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    setVelocity({ x: deltaX * 0.5, y: deltaY * 0.5 });
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, dragStart, enableNavigation]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableNavigation) return;
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, camera.zoom * zoomFactor));

    setCamera(prev => ({ ...prev, zoom: newZoom }));
  }, [camera.zoom, enableNavigation]);

  // Animation loop
  const animate = useCallback(() => {
    setCosmicTime(prev => prev + 0.016); // ~60fps

    // Update galaxy rotation
    setGalaxyRotation(prev => prev + 0.1);

    // Handle keyboard navigation
    if (enableNavigation) {
      let moveX = 0;
      let moveY = 0;
      const moveSpeed = 3;

      // Arrow keys or WASD
      if (keysPressed.has('arrowleft') || keysPressed.has('a')) moveX += moveSpeed;
      if (keysPressed.has('arrowright') || keysPressed.has('d')) moveX -= moveSpeed;
      if (keysPressed.has('arrowup') || keysPressed.has('w')) moveY += moveSpeed;
      if (keysPressed.has('arrowdown') || keysPressed.has('s')) moveY -= moveSpeed;

      // Apply keyboard movement
      if (moveX !== 0 || moveY !== 0) {
        setCamera(prev => ({
          ...prev,
          x: prev.x + moveX,
          y: prev.y + moveY,
        }));
      }

      // Apply momentum when not dragging or moving with keyboard
      if (!isDragging && moveX === 0 && moveY === 0) {
        setVelocity(prev => ({
          x: prev.x * 0.95, // friction
          y: prev.y * 0.95,
        }));

        // Apply velocity to camera
        if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
          setCamera(prev => ({
            ...prev,
            x: prev.x + velocity.x,
            y: prev.y + velocity.y,
          }));
        }
      }
    }

    // Update planets
    setPlanets(prev => prev.map(planet => ({
      ...planet,
      angle: planet.angle + planet.orbitSpeed,
      moons: planet.moons?.map(moon => ({
        ...moon,
        angle: moon.angle + planet.orbitSpeed * 2
      }))
    })));

    // Update nebulae
    setNebulae(prev => prev.map(nebula => ({
      ...nebula,
      rotation: nebula.rotation + 0.05,
      opacity: nebula.opacity + Math.sin(cosmicTime + nebula.id) * 0.01
    })));

    // Update portals
    setPortals(prev => prev.map(portal => ({
      ...portal,
      rotation: portal.rotation + 1,
      active: Math.random() > 0.95 ? !portal.active : portal.active
    })));

    // Spawn meteors occasionally
    if (Math.random() < 0.005 && meteors.length < 3) {
      const newMeteor: Meteor = {
        id: meteorIdRef.current++,
        x: Math.random(),
        y: 0,
        angle: Math.PI / 2 + (Math.random() - 0.5) * 0.5,
        speed: 2 + Math.random() * 3,
        size: 2 + Math.random() * 3,
        trail: []
      };
      setMeteors(prev => [...prev, newMeteor]);
    }

    // Update meteors
    setMeteors(prev => prev
      .map(meteor => {
        const newX = meteor.x + Math.cos(meteor.angle) * meteor.speed * 0.005;
        const newY = meteor.y + Math.sin(meteor.angle) * meteor.speed * 0.005;

        const newTrail = [...meteor.trail, { x: meteor.x, y: meteor.y }];
        if (newTrail.length > 10) newTrail.shift();

        return { ...meteor, x: newX, y: newY, trail: newTrail };
      })
      .filter(meteor => meteor.y < 1.2 && meteor.x > -0.2 && meteor.x < 1.2)
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [cosmicTime, meteors.length, isDragging, velocity, enableNavigation]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${enableNavigation ? 'cursor-grab' : 'pointer-events-none'} ${isDragging ? 'cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      {/* Camera viewport container */}
      <motion.div
        className="absolute inset-0"
        style={{
          x: camera.x,
          y: camera.y,
          scale: camera.zoom,
          transformOrigin: 'center center',
        }}
        transition={isDragging ? { duration: 0 } : { type: "spring", damping: 20, stiffness: 100 }}
      >
        {/* Galaxy spiral arms background */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from ${galaxyRotation}deg at 50% 50%,
              transparent 0deg,
              hsl(270 30% 15% / 0.1) 45deg,
              transparent 90deg,
              hsl(240 40% 20% / 0.1) 135deg,
              transparent 180deg,
              hsl(200 50% 15% / 0.1) 225deg,
              transparent 270deg,
              hsl(280 30% 18% / 0.1) 315deg,
              transparent 360deg)`,
          }}
          animate={{
            rotate: galaxyRotation,
          }}
          transition={{ duration: 0 }}
        />

      {/* Nebulae */}
      {nebulae.map(nebula => (
        <motion.div
          key={nebula.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${nebula.x * 100}%`,
            top: `${nebula.y * 100}%`,
            width: nebula.width,
            height: nebula.height,
            background: `radial-gradient(ellipse at center,
              ${nebula.color} 0%,
              transparent 70%)`,
            opacity: nebula.opacity,
            transform: `translate(-50%, -50%) rotate(${nebula.rotation}deg)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [nebula.opacity, nebula.opacity + 0.1, nebula.opacity],
          }}
          transition={{
            duration: 8 + nebula.id * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Cosmic portals */}
      {portals.map(portal => (
        <AnimatePresence key={portal.id}>
          {portal.active && (
            <motion.div
              className="absolute"
              style={{
                left: `${portal.x * 100}%`,
                top: `${portal.y * 100}%`,
                width: portal.size,
                height: portal.size,
                transform: `translate(-50%, -50%) rotate(${portal.rotation}deg)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Portal ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: 'hsl(280 80% 60%)',
                  boxShadow: '0 0 30px hsl(280 80% 60% / 0.5)',
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity },
                }}
              />

              {/* Portal core */}
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    hsl(280 100% 80%) 0%,
                    hsl(240 100% 60%) 50%,
                    transparent 100%)`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />

              {/* Portal particles */}
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: Math.cos((i / 8) * Math.PI * 2) * 25,
                    y: Math.sin((i / 8) * Math.PI * 2) * 25,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Stars */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x * 100}%`,
            top: `${star.y * 100}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: star.type === 'nova'
              ? `0 0 ${star.size * 3}px ${star.color}`
              : star.type === 'pulsar'
                ? `0 0 ${star.size * 2}px ${star.color}, 0 0 ${star.size * 4}px ${star.color}40`
                : `0 0 ${star.size}px ${star.color}60`,
          }}
          animate={{
            opacity: star.type === 'pulsar'
              ? [star.brightness, star.brightness + 0.3, star.brightness]
              : [star.brightness, star.brightness + 0.2, star.brightness],
            scale: star.type === 'nova'
              ? [1, 1.5, 1]
              : 1,
          }}
          transition={{
            duration: star.twinkleSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Planetary system around center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {planets.map(planet => (
          <div key={planet.id}>
            {/* Orbit path */}
            <motion.div
              className="absolute border border-white/10 rounded-full"
              style={{
                width: planet.orbitRadius * 2,
                height: planet.orbitRadius * 2,
                left: -planet.orbitRadius,
                top: -planet.orbitRadius,
              }}
              animate={{
                rotate: planet.angle * (180 / Math.PI),
              }}
              transition={{ duration: 0 }}
            />

            {/* Planet */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: planet.size,
                height: planet.size,
                left: -planet.size / 2,
                top: -planet.size / 2,
                background: `radial-gradient(circle at 30% 30%,
                  ${planet.color} 0%,
                  hsl(${planet.color.split('(')[1].split(',')[0]} 60% 30%) 100%)`,
                boxShadow: `0 0 ${planet.size}px ${planet.color}40`,
              }}
              animate={{
                x: Math.cos(planet.angle) * planet.orbitRadius,
                y: Math.sin(planet.angle) * planet.orbitRadius,
              }}
              transition={{ duration: 0 }}
            >
              {/* Planet atmosphere */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 70% 30%,
                    transparent 30%,
                    ${planet.color}20 70%)`,
                }}
                animate={{
                  rotate: planet.angle * 50,
                }}
                transition={{ duration: 0 }}
              />
            </motion.div>

            {/* Moons */}
            {planet.moons?.map((moon, moonIndex) => (
              <motion.div
                key={moonIndex}
                className="absolute rounded-full bg-gray-300"
                style={{
                  width: moon.size,
                  height: moon.size,
                  left: -moon.size / 2,
                  top: -moon.size / 2,
                }}
                animate={{
                  x: Math.cos(planet.angle + moon.angle) * (planet.orbitRadius + moon.distance),
                  y: Math.sin(planet.angle + moon.angle) * (planet.orbitRadius + moon.distance),
                }}
                transition={{ duration: 0 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Meteors */}
      {meteors.map(meteor => (
        <div key={meteor.id}>
          {/* Meteor trail */}
          {meteor.trail.map((point, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${point.x * 100}%`,
                top: `${point.y * 100}%`,
                width: meteor.size * (1 - i / meteor.trail.length),
                height: 2,
                background: `linear-gradient(to right,
                  hsl(45 100% 80%) 0%,
                  hsl(25 100% 60%) 100%)`,
                opacity: (1 - i / meteor.trail.length) * 0.8,
              }}
            />
          ))}

          {/* Meteor head */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: `${meteor.x * 100}%`,
              top: `${meteor.y * 100}%`,
              width: meteor.size,
              height: meteor.size,
              background: `radial-gradient(circle,
                hsl(45 100% 90%) 0%,
                hsl(25 100% 70%) 100%)`,
              boxShadow: `0 0 ${meteor.size * 2}px hsl(45 100% 80%)`,
            }}
          />
        </div>
      ))}

      {/* Black hole effect when highly engaged */}
      <AnimatePresence>
        {engagement > 0.8 && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{
                background: `radial-gradient(circle,
                  transparent 0%,
                  hsl(240 100% 10%) 30%,
                  hsl(240 100% 5%) 70%,
                  black 100%)`,
                boxShadow: `0 0 100px black, inset 0 0 50px hsl(240 100% 20%)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />

            {/* Event horizon */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-500/30"
              animate={{
                rotate: 360,
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation overlay in constellation mode */}
      <AnimatePresence>
        {isConstellationMode && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {/* Constellation lines connecting major stars */}
            <svg className="absolute inset-0 w-full h-full">
              {stars
                .filter(star => star.size > 2)
                .slice(0, 12)
                .map((star, i, filteredStars) => {
                  const nextStar = filteredStars[(i + 1) % filteredStars.length];
                  return (
                    <motion.line
                      key={`constellation-${i}`}
                      x1={`${star.x * 100}%`}
                      y1={`${star.y * 100}%`}
                      x2={`${nextStar.x * 100}%`}
                      y2={`${nextStar.y * 100}%`}
                      stroke="hsl(45 100% 80% / 0.3)"
                      strokeWidth={1}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{
                        duration: 3,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>

      {/* Navigation Hints Overlay */}
      <AnimatePresence>
        {showNavigationHints && enableNavigation && (
          <motion.div
            className="absolute bottom-6 right-6 z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div className="bg-background/90 backdrop-blur-sm border border-primary/20 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-primary text-sm font-medium">SPACE NAVIGATION</div>
                <button
                  onClick={() => setShowNavigationHints(false)}
                  className="text-muted-foreground hover:text-primary text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">WASD</kbd>
                  <span>or</span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑↓←→</kbd>
                  <span>Move</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-primary">🖱️</span>
                  <span>Drag to pan</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-primary">🔍</span>
                  <span>Scroll to zoom</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-primary">⭐</span>
                  <span>Explore the universe!</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini navigation indicator */}
      {enableNavigation && (
        <motion.div
          className="absolute top-6 right-6 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-primary font-mono">
              NAV: {Math.round(camera.x)}, {Math.round(camera.y)} ×{camera.zoom.toFixed(1)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
