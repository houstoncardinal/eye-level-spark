import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
  velocity: { x: number; y: number };
  targetX?: number;
  targetY?: number;
}

interface Connection {
  from: number;
  to: number;
  strength: number;
}

interface GeometryPattern {
  name: string;
  positions: { x: number; y: number }[];
  connections: [number, number][];
  innerCircles?: { x: number; y: number; r: number }[];
}

interface ConsciousnessFieldProps {
  mousePos: { x: number; y: number };
  onConnection?: () => void;
  isConstellationMode?: boolean;
}

const SACRED_PATTERNS: GeometryPattern[] = [
  {
    name: "Seed of Life",
    positions: [
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.35 },
      { x: 0.37, y: 0.425 },
      { x: 0.37, y: 0.575 },
      { x: 0.5, y: 0.65 },
      { x: 0.63, y: 0.575 },
      { x: 0.63, y: 0.425 },
    ],
    connections: [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
      [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
    ],
    innerCircles: [
      { x: 0.5, y: 0.5, r: 0.08 },
    ],
  },
  {
    name: "Metatron's Cube",
    positions: [
      { x: 0.5, y: 0.3 },
      { x: 0.33, y: 0.4 },
      { x: 0.33, y: 0.6 },
      { x: 0.5, y: 0.7 },
      { x: 0.67, y: 0.6 },
      { x: 0.67, y: 0.4 },
      { x: 0.5, y: 0.5 },
    ],
    connections: [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
      [1, 2], [2, 3], [3, 4], [4, 5], [5, 1],
      [1, 3], [1, 4], [1, 5],
      [2, 4], [2, 5], [2, 6],
      [3, 5], [3, 6], [3, 1],
      [4, 6], [4, 1], [4, 2],
      [5, 1], [5, 2], [5, 3],
      [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    ],
  },
  {
    name: "Vesica Piscis",
    positions: [
      { x: 0.42, y: 0.5 },
      { x: 0.58, y: 0.5 },
      { x: 0.5, y: 0.35 },
      { x: 0.5, y: 0.65 },
      { x: 0.35, y: 0.42 },
      { x: 0.65, y: 0.42 },
      { x: 0.5, y: 0.5 },
    ],
    connections: [
      [0, 2], [0, 3], [1, 2], [1, 3],
      [2, 6], [3, 6], [0, 6], [1, 6],
      [4, 0], [5, 1], [4, 2], [5, 2],
    ],
    innerCircles: [
      { x: 0.42, y: 0.5, r: 0.12 },
      { x: 0.58, y: 0.5, r: 0.12 },
    ],
  },
];

const ORB_COUNT = 7;
const CONNECTION_THRESHOLD = 0.25;

export const ConsciousnessField = ({ 
  mousePos, 
  onConnection, 
  isConstellationMode = false 
}: ConsciousnessFieldProps) => {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [patternProgress, setPatternProgress] = useState(0);
  const [geometryConnections, setGeometryConnections] = useState<[number, number][]>([]);
  const animationRef = useRef<number>();
  const lastConnectionRef = useRef<number>(0);
  const patternTransitionRef = useRef<number>(0);

  useEffect(() => {
    const initialOrbs: Orb[] = Array.from({ length: ORB_COUNT }, (_, i) => ({
      id: i,
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      size: 20 + Math.random() * 15,
      hue: 30 + Math.random() * 30,
      velocity: {
        x: (Math.random() - 0.5) * 0.001,
        y: (Math.random() - 0.5) * 0.001,
      },
    }));
    setOrbs(initialOrbs);
  }, []);

  // Cycle through patterns in constellation mode
  useEffect(() => {
    if (!isConstellationMode) return;
    
    const interval = setInterval(() => {
      setCurrentPattern(prev => (prev + 1) % SACRED_PATTERNS.length);
      setPatternProgress(0);
    }, 12000);

    return () => clearInterval(interval);
  }, [isConstellationMode]);

  const updateOrbs = useCallback(() => {
    const pattern = SACRED_PATTERNS[currentPattern];
    
    setOrbs(prevOrbs => {
      const newOrbs = prevOrbs.map((orb, index) => {
        let targetX = orb.x;
        let targetY = orb.y;
        let vx = orb.velocity.x;
        let vy = orb.velocity.y;

        if (isConstellationMode && pattern.positions[index]) {
          // Move toward sacred geometry position
          targetX = pattern.positions[index].x;
          targetY = pattern.positions[index].y;
          
          const dx = targetX - orb.x;
          const dy = targetY - orb.y;
          
          vx = dx * 0.02;
          vy = dy * 0.02;
        } else {
          // Normal wandering behavior
          const dx = mousePos.x - orb.x;
          const dy = mousePos.y - orb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 0.3) {
            vx += dx * 0.0001;
            vy += dy * 0.0001;
          }
          
          vx += (Math.random() - 0.5) * 0.0002;
          vy += (Math.random() - 0.5) * 0.0002;
          vx *= 0.99;
          vy *= 0.99;
        }
        
        let newX = orb.x + vx;
        let newY = orb.y + vy;
        
        if (!isConstellationMode) {
          if (newX < 0.1 || newX > 0.9) vx *= -0.5;
          if (newY < 0.1 || newY > 0.9) vy *= -0.5;
          newX = Math.max(0.1, Math.min(0.9, newX));
          newY = Math.max(0.1, Math.min(0.9, newY));
        }
        
        return {
          ...orb,
          x: newX,
          y: newY,
          velocity: { x: vx, y: vy },
          targetX,
          targetY,
        };
      });

      // Calculate pattern alignment progress
      if (isConstellationMode) {
        let totalDist = 0;
        newOrbs.forEach((orb, i) => {
          if (pattern.positions[i]) {
            const dx = orb.x - pattern.positions[i].x;
            const dy = orb.y - pattern.positions[i].y;
            totalDist += Math.sqrt(dx * dx + dy * dy);
          }
        });
        const avgDist = totalDist / ORB_COUNT;
        const progress = Math.max(0, Math.min(1, 1 - avgDist * 10));
        setPatternProgress(progress);

        // When aligned, show geometry connections
        if (progress > 0.8) {
          setGeometryConnections(pattern.connections);
          if (Date.now() - lastConnectionRef.current > 3000) {
            lastConnectionRef.current = Date.now();
            onConnection?.();
          }
        } else {
          setGeometryConnections([]);
        }
      }

      // Regular connections
      const newConnections: Connection[] = [];
      for (let i = 0; i < newOrbs.length; i++) {
        for (let j = i + 1; j < newOrbs.length; j++) {
          const dx = newOrbs[i].x - newOrbs[j].x;
          const dy = newOrbs[i].y - newOrbs[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_THRESHOLD) {
            const strength = 1 - dist / CONNECTION_THRESHOLD;
            newConnections.push({ from: i, to: j, strength });
          }
        }
      }
      setConnections(newConnections);

      return newOrbs;
    });

    animationRef.current = requestAnimationFrame(updateOrbs);
  }, [mousePos, onConnection, isConstellationMode, currentPattern]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateOrbs);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [updateOrbs]);

  const pattern = SACRED_PATTERNS[currentPattern];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        {/* Sacred geometry overlay when aligned */}
        <AnimatePresence>
          {isConstellationMode && patternProgress > 0.5 && (
            <>
              {/* Inner circles for some patterns */}
              {pattern.innerCircles?.map((circle, i) => (
                <motion.circle
                  key={`inner-${i}`}
                  cx={`${circle.x * 100}%`}
                  cy={`${circle.y * 100}%`}
                  r={`${circle.r * 100}%`}
                  fill="none"
                  stroke={`hsl(35 80% 60% / ${patternProgress * 0.3})`}
                  strokeWidth={1}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: patternProgress }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 1 }}
                />
              ))}

              {/* Geometry connection lines */}
              {geometryConnections.map(([from, to], i) => {
                const fromOrb = orbs[from];
                const toOrb = orbs[to];
                if (!fromOrb || !toOrb) return null;
                
                return (
                  <motion.line
                    key={`geo-${from}-${to}-${i}`}
                    x1={`${fromOrb.x * 100}%`}
                    y1={`${fromOrb.y * 100}%`}
                    x2={`${toOrb.x * 100}%`}
                    y2={`${toOrb.y * 100}%`}
                    stroke={`hsl(270 60% 70% / ${patternProgress * 0.6})`}
                    strokeWidth={patternProgress * 2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: patternProgress }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.02 }}
                  />
                );
              })}

              {/* Central sacred symbol */}
              <motion.circle
                cx="50%"
                cy="50%"
                r={`${patternProgress * 5}%`}
                fill="none"
                stroke={`hsl(35 90% 60% / ${patternProgress * 0.4})`}
                strokeWidth={1}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Regular connection lines */}
        {connections.map((conn) => {
          const from = orbs[conn.from];
          const to = orbs[conn.to];
          if (!from || !to) return null;
          
          const isGeometryConnection = geometryConnections.some(
            ([f, t]) => (f === conn.from && t === conn.to) || (f === conn.to && t === conn.from)
          );
          
          if (isGeometryConnection && patternProgress > 0.5) return null;
          
          return (
            <motion.line
              key={`${conn.from}-${conn.to}`}
              x1={`${from.x * 100}%`}
              y1={`${from.y * 100}%`}
              x2={`${to.x * 100}%`}
              y2={`${to.y * 100}%`}
              stroke={`hsl(35 80% 60% / ${conn.strength * 0.5})`}
              strokeWidth={conn.strength * 3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>

      {/* Pattern name indicator */}
      <AnimatePresence>
        {isConstellationMode && patternProgress > 0.9 && (
          <motion.div
            className="absolute top-20 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-display text-lg tracking-[0.3em] text-primary text-glow uppercase">
              {pattern.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbs */}
      {orbs.map(orb => {
        const isConnected = connections.some(c => c.from === orb.id || c.to === orb.id);
        const connectionStrength = connections
          .filter(c => c.from === orb.id || c.to === orb.id)
          .reduce((acc, c) => acc + c.strength, 0);
        
        const isInPattern = isConstellationMode && patternProgress > 0.8;
        
        return (
          <motion.div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              left: `${orb.x * 100}%`,
              top: `${orb.y * 100}%`,
              width: orb.size,
              height: orb.size,
              x: "-50%",
              y: "-50%",
              background: `radial-gradient(circle at 30% 30%, 
                hsl(${orb.hue + (isInPattern ? 30 : 10)} 90% 70%) 0%, 
                hsl(${orb.hue + (isInPattern ? 20 : 0)} 85% 55%) 50%, 
                hsl(${orb.hue - 10} 80% 40%) 100%)`,
              boxShadow: isInPattern
                ? `0 0 ${40 + patternProgress * 40}px hsl(270 70% 60% / ${0.5 + patternProgress * 0.3}), 0 0 ${80}px hsl(35 90% 60% / 0.3)`
                : isConnected
                  ? `0 0 ${30 + connectionStrength * 30}px hsl(${orb.hue} 90% 60% / ${0.4 + connectionStrength * 0.3})`
                  : `0 0 20px hsl(${orb.hue} 90% 60% / 0.3)`,
            }}
            animate={{
              scale: isInPattern ? 1.3 : isConnected ? 1 + connectionStrength * 0.2 : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Inner pupil */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: orb.size * 0.4,
                height: orb.size * 0.4,
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
                background: isInPattern 
                  ? "radial-gradient(circle, hsl(270 40% 20%) 0%, hsl(230 40% 5%) 100%)"
                  : "radial-gradient(circle, hsl(230 30% 8%) 0%, hsl(230 40% 3%) 100%)",
              }}
              animate={{
                x: `calc(-50% + ${(mousePos.x - orb.x) * 20}px)`,
                y: `calc(-50% + ${(mousePos.y - orb.y) * 20}px)`,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  top: 3,
                  left: 4,
                  background: "hsl(45 100% 95%)",
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
