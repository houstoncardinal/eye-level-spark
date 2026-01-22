import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import { motion, useSpring } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  hue: number;
  type: 'dust' | 'spark' | 'cosmic' | 'energy';
  velocity: { x: number; y: number };
  twinkleSpeed: number;
}

const PARTICLE_COUNT_DESKTOP = 80;
const PARTICLE_COUNT_MOBILE = 20;

export const ParticleField = () => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number>();

  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(0.5, springConfig);
  const mouseY = useSpring(0.5, springConfig);

  const PARTICLE_COUNT = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const types: Particle['type'][] = ['dust', 'spark', 'cosmic', 'energy'];
      const type = types[Math.floor(Math.random() * types.length)];

      let hue = 30; // default amber
      let size = Math.random() * 4 + 1;
      let opacity = Math.random() * 0.5 + 0.1;

      switch (type) {
        case 'dust':
          hue = Math.random() * 40 + 20; // warm tones
          size = Math.random() * 2 + 0.5;
          break;
        case 'spark':
          hue = Math.random() * 60 + 45; // yellow to red
          size = Math.random() * 3 + 1;
          opacity = Math.random() * 0.3 + 0.2;
          break;
        case 'cosmic':
          hue = Math.random() * 120 + 200; // blue to purple
          size = Math.random() * 5 + 2;
          opacity = Math.random() * 0.4 + 0.1;
          break;
        case 'energy':
          hue = Math.random() * 80 + 160; // cyan to purple
          size = Math.random() * 2 + 0.8;
          opacity = Math.random() * 0.6 + 0.2;
          break;
      }

      return {
        id: i,
        x: Math.random(),
        y: Math.random(),
        size,
        opacity,
        hue,
        type,
        velocity: {
          x: (Math.random() - 0.5) * 0.001,
          y: (Math.random() - 0.5) * 0.001,
        },
        twinkleSpeed: Math.random() * 2 + 1,
      };
    });
    setParticles(initialParticles);
  }, []);

  // Animation loop for particle movement
  const animateParticles = useCallback(() => {
    setParticles(prev => prev.map(particle => {
      let newX = particle.x + particle.velocity.x;
      let newY = particle.y + particle.velocity.y;

      // Wrap around edges
      if (newX < 0) newX = 1;
      if (newX > 1) newX = 0;
      if (newY < 0) newY = 1;
      if (newY > 1) newY = 0;

      // Add some random movement
      const newVelocity = {
        x: particle.velocity.x + (Math.random() - 0.5) * 0.0001,
        y: particle.velocity.y + (Math.random() - 0.5) * 0.0001,
      };

      // Dampen velocity
      newVelocity.x *= 0.999;
      newVelocity.y *= 0.999;

      return {
        ...particle,
        x: newX,
        y: newY,
        velocity: newVelocity,
      };
    }));

    animationRef.current = requestAnimationFrame(animateParticles);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animateParticles]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const getParticleStyle = (particle: Particle, influence: number) => {
    const baseHue = particle.hue + influence * 20;
    const baseSaturation = 80;
    const baseLightness = 50 + influence * 20;

    switch (particle.type) {
      case 'dust':
        return {
          background: `radial-gradient(circle, hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%) 0%, transparent 70%)`,
          boxShadow: influence > 0.2 ? `0 0 ${10 * influence}px hsl(${baseHue}, 90%, 60%)` : 'none',
        };
      case 'spark':
        return {
          background: `hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%)`,
          boxShadow: `0 0 ${15 * influence}px hsl(${baseHue}, 100%, 70%), 0 0 ${30 * influence}px hsl(${baseHue}, 100%, 50%)`,
        };
      case 'cosmic':
        return {
          background: `radial-gradient(circle at 30% 30%, hsl(${baseHue}, ${baseSaturation}%, ${baseLightness + 20}%) 0%, hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%) 50%, transparent 100%)`,
          boxShadow: `0 0 ${25 * influence}px hsl(${baseHue}, 90%, 60%), inset 0 0 ${10}px hsl(${baseHue + 30}, 100%, 80%)`,
        };
      case 'energy':
        return {
          background: `hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%)`,
          boxShadow: `0 0 ${8 * influence}px hsl(${baseHue}, 100%, 70%), 0 0 ${16 * influence}px hsl(${baseHue}, 100%, 50%), 0 0 ${24 * influence}px hsl(${baseHue}, 80%, 30%)`,
        };
      default:
        return {
          backgroundColor: `hsl(${baseHue}, ${baseSaturation}%, ${baseLightness}%)`,
          boxShadow: influence > 0.2 ? `0 0 ${20 * influence}px hsl(${baseHue}, 90%, 60%)` : 'none',
        };
    }
  };

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

        const particleStyle = getParticleStyle(particle, influence);

        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x * 100}%`,
              top: `${particle.y * 100}%`,
              width: particle.size + influence * 8,
              height: particle.size + influence * 8,
              borderRadius: particle.type === 'cosmic' ? '50%' : '50%',
              ...particleStyle,
            }}
            animate={{
              x: distX * influence * 40,
              y: distY * influence * 40,
              opacity: particle.opacity + influence * 0.5,
              scale: 1 + influence * 0.5,
              rotate: particle.type === 'energy' ? [0, 360] : 0,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 200,
              rotate: particle.type === 'energy' ? {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              } : undefined,
            }}
          >
            {/* Inner glow for cosmic particles */}
            {particle.type === 'cosmic' && (
              <motion.div
                className="absolute inset-1 rounded-full"
                style={{
                  background: `radial-gradient(circle, hsl(${particle.hue + 60}, 100%, 80%) 0%, transparent 100%)`,
                  opacity: 0.6,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Energy particle trail effect */}
            {particle.type === 'energy' && influence > 0.3 && (
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: [
                    `0 0 5px hsl(${particle.hue}, 100%, 70%)`,
                    `0 0 20px hsl(${particle.hue}, 100%, 70%), 0 0 40px hsl(${particle.hue}, 80%, 50%)`,
                    `0 0 5px hsl(${particle.hue}, 100%, 70%)`,
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
