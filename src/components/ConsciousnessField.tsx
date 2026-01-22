import { motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
  velocity: { x: number; y: number };
}

interface Connection {
  from: number;
  to: number;
  strength: number;
}

interface ConsciousnessFieldProps {
  mousePos: { x: number; y: number };
  onConnection?: () => void;
}

const ORB_COUNT = 5;
const CONNECTION_THRESHOLD = 0.25;

export const ConsciousnessField = ({ mousePos, onConnection }: ConsciousnessFieldProps) => {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const animationRef = useRef<number>();
  const lastConnectionRef = useRef<number>(0);

  useEffect(() => {
    const initialOrbs: Orb[] = Array.from({ length: ORB_COUNT }, (_, i) => ({
      id: i,
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      size: 20 + Math.random() * 15,
      hue: 30 + Math.random() * 30, // amber range
      velocity: {
        x: (Math.random() - 0.5) * 0.001,
        y: (Math.random() - 0.5) * 0.001,
      },
    }));
    setOrbs(initialOrbs);
  }, []);

  const updateOrbs = useCallback(() => {
    setOrbs(prevOrbs => {
      const newOrbs = prevOrbs.map(orb => {
        // Gentle attraction to mouse
        const dx = mousePos.x - orb.x;
        const dy = mousePos.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let vx = orb.velocity.x;
        let vy = orb.velocity.y;
        
        if (dist < 0.3) {
          vx += dx * 0.0001;
          vy += dy * 0.0001;
        }
        
        // Gentle wandering
        vx += (Math.random() - 0.5) * 0.0002;
        vy += (Math.random() - 0.5) * 0.0002;
        
        // Damping
        vx *= 0.99;
        vy *= 0.99;
        
        // Update position
        let newX = orb.x + vx;
        let newY = orb.y + vy;
        
        // Boundary bounce
        if (newX < 0.1 || newX > 0.9) vx *= -0.5;
        if (newY < 0.1 || newY > 0.9) vy *= -0.5;
        
        newX = Math.max(0.1, Math.min(0.9, newX));
        newY = Math.max(0.1, Math.min(0.9, newY));
        
        return {
          ...orb,
          x: newX,
          y: newY,
          velocity: { x: vx, y: vy },
        };
      });

      // Calculate connections
      const newConnections: Connection[] = [];
      for (let i = 0; i < newOrbs.length; i++) {
        for (let j = i + 1; j < newOrbs.length; j++) {
          const dx = newOrbs[i].x - newOrbs[j].x;
          const dy = newOrbs[i].y - newOrbs[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_THRESHOLD) {
            const strength = 1 - dist / CONNECTION_THRESHOLD;
            newConnections.push({ from: i, to: j, strength });
            
            // Trigger connection callback
            if (strength > 0.7 && Date.now() - lastConnectionRef.current > 2000) {
              lastConnectionRef.current = Date.now();
              onConnection?.();
            }
          }
        }
      }
      setConnections(newConnections);

      return newOrbs;
    });

    animationRef.current = requestAnimationFrame(updateOrbs);
  }, [mousePos, onConnection]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateOrbs);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [updateOrbs]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, i) => {
          const from = orbs[conn.from];
          const to = orbs[conn.to];
          if (!from || !to) return null;
          
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

      {/* Orbs */}
      {orbs.map(orb => {
        const isConnected = connections.some(c => c.from === orb.id || c.to === orb.id);
        const connectionStrength = connections
          .filter(c => c.from === orb.id || c.to === orb.id)
          .reduce((acc, c) => acc + c.strength, 0);
        
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
                hsl(${orb.hue + 10} 90% 70%) 0%, 
                hsl(${orb.hue} 85% 55%) 50%, 
                hsl(${orb.hue - 10} 80% 40%) 100%)`,
              boxShadow: isConnected
                ? `0 0 ${30 + connectionStrength * 30}px hsl(${orb.hue} 90% 60% / ${0.4 + connectionStrength * 0.3})`
                : `0 0 20px hsl(${orb.hue} 90% 60% / 0.3)`,
            }}
            animate={{
              scale: isConnected ? 1 + connectionStrength * 0.2 : 1,
            }}
            transition={{ duration: 0.3 }}
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
                background: "radial-gradient(circle, hsl(230 30% 8%) 0%, hsl(230 40% 3%) 100%)",
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
