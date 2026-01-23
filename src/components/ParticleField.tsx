import { useCallback, useEffect, useRef, useState, memo } from "react";
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
}

const PARTICLE_COUNT_DESKTOP = 50;
const PARTICLE_COUNT_MOBILE = 15;

// Use CSS animations instead of Framer Motion for performance
const ParticleElement = memo(({ particle, influence }: { particle: Particle; influence: number }) => {
  const baseHue = particle.hue + influence * 20;
  const baseLightness = 50 + influence * 20;

  return (
    <div
      className="absolute rounded-full will-change-transform"
      style={{
        left: `${particle.x * 100}%`,
        top: `${particle.y * 100}%`,
        width: particle.size + influence * 4,
        height: particle.size + influence * 4,
        background: `radial-gradient(circle, hsl(${baseHue}, 80%, ${baseLightness}%) 0%, transparent 70%)`,
        opacity: particle.opacity + influence * 0.3,
        transform: `translate(-50%, -50%) scale(${1 + influence * 0.3})`,
        transition: 'opacity 0.3s ease-out',
      }}
    />
  );
});

ParticleElement.displayName = 'ParticleElement';

export const ParticleField = memo(() => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number>();
  const frameCountRef = useRef(0);

  const PARTICLE_COUNT = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const types: Particle['type'][] = ['dust', 'spark', 'cosmic', 'energy'];
      const type = types[Math.floor(Math.random() * types.length)];

      let hue = 30;
      let size = Math.random() * 4 + 1;
      let opacity = Math.random() * 0.5 + 0.1;

      switch (type) {
        case 'dust':
          hue = Math.random() * 40 + 20;
          size = Math.random() * 2 + 0.5;
          break;
        case 'spark':
          hue = Math.random() * 60 + 45;
          size = Math.random() * 3 + 1;
          opacity = Math.random() * 0.3 + 0.2;
          break;
        case 'cosmic':
          hue = Math.random() * 120 + 200;
          size = Math.random() * 5 + 2;
          opacity = Math.random() * 0.4 + 0.1;
          break;
        case 'energy':
          hue = Math.random() * 80 + 160;
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
          x: (Math.random() - 0.5) * 0.0008,
          y: (Math.random() - 0.5) * 0.0008,
        },
      };
    });
    setParticles(initialParticles);
  }, [PARTICLE_COUNT]);

  // Throttled animation loop - update every 2nd frame on mobile
  const animateParticles = useCallback(() => {
    frameCountRef.current++;

    // Skip frames on mobile for better performance
    if (isMobile && frameCountRef.current % 2 !== 0) {
      animationRef.current = requestAnimationFrame(animateParticles);
      return;
    }

    setParticles(prev => prev.map(particle => {
      let newX = particle.x + particle.velocity.x;
      let newY = particle.y + particle.velocity.y;

      // Wrap around edges
      if (newX < 0) newX = 1;
      if (newX > 1) newX = 0;
      if (newY < 0) newY = 1;
      if (newY > 1) newY = 0;

      return {
        ...particle,
        x: newX,
        y: newY,
      };
    }));

    animationRef.current = requestAnimationFrame(animateParticles);
  }, [isMobile]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animateParticles]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || isMobile) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  }, [isMobile]);

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
        const influence = isMobile ? 0 : Math.max(0, 1 - dist * 3);

        return (
          <ParticleElement
            key={particle.id}
            particle={particle}
            influence={influence}
          />
        );
      })}
    </div>
  );
});

ParticleField.displayName = 'ParticleField';
