import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  hue: number;
}

const PARTICLE_COUNT = 60;

export const ParticleField = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(0.5, springConfig);
  const mouseY = useSpring(0.5, springConfig);

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + 20, // amber to orange range
    }));
    setParticles(initialParticles);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
    >
      {particles.map((particle) => {
        const distX = mousePos.x - particle.x;
        const distY = mousePos.y - particle.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const influence = Math.max(0, 1 - dist * 2);
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x * 100}%`,
              top: `${particle.y * 100}%`,
              width: particle.size + influence * 8,
              height: particle.size + influence * 8,
              backgroundColor: `hsl(${particle.hue + influence * 20}, 80%, ${50 + influence * 20}%)`,
              boxShadow: influence > 0.2 
                ? `0 0 ${20 * influence}px hsl(${particle.hue}, 90%, 60%)` 
                : 'none',
            }}
            animate={{
              x: distX * influence * 40,
              y: distY * influence * 40,
              opacity: particle.opacity + influence * 0.5,
              scale: 1 + influence * 0.5,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 200,
            }}
          />
        );
      })}
    </div>
  );
};
