import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface NebulaCloudProps {
  mousePos?: { x: number; y: number };
  engagement?: number;
}

export const NebulaCloud = memo(({ mousePos = { x: 0.5, y: 0.5 }, engagement = 0 }: NebulaCloudProps) => {
  const isMobile = useIsMobile();

  const clouds = useMemo(() => [
    { id: 1, x: 20, y: 30, size: 400, hue: 270, opacity: 0.15 },
    { id: 2, x: 70, y: 60, size: 350, hue: 200, opacity: 0.12 },
    { id: 3, x: 40, y: 80, size: 300, hue: 320, opacity: 0.1 },
    { id: 4, x: 80, y: 20, size: 280, hue: 35, opacity: 0.08 },
    { id: 5, x: 10, y: 60, size: 320, hue: 180, opacity: 0.1 },
  ].slice(0, isMobile ? 2 : 5), [isMobile]);

  const dustLayers = useMemo(() => [
    { id: 1, scale: 1.2, blur: 100, opacity: 0.08 },
    { id: 2, scale: 0.8, blur: 60, opacity: 0.12 },
    { id: 3, scale: 1, blur: 80, opacity: 0.1 },
  ].slice(0, isMobile ? 1 : 3), [isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cosmic dust layers */}
      {dustLayers.map(layer => (
        <motion.div
          key={layer.id}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 100% 80% at ${50 + (mousePos.x - 0.5) * 20}% ${50 + (mousePos.y - 0.5) * 20}%, 
              hsl(270 40% 15% / ${layer.opacity + engagement * 0.05}) 0%, 
              transparent 60%)`,
            filter: `blur(${layer.blur}px)`,
            transform: `scale(${layer.scale})`,
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8 + layer.id * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Nebula cloud formations */}
      {clouds.map(cloud => {
        const offsetX = (mousePos.x - 0.5) * 30;
        const offsetY = (mousePos.y - 0.5) * 30;
        
        return (
          <motion.div
            key={cloud.id}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: cloud.size,
              height: cloud.size * 0.6,
              background: `radial-gradient(ellipse at center,
                hsl(${cloud.hue} 60% 50% / ${cloud.opacity + engagement * 0.1}) 0%,
                hsl(${cloud.hue + 30} 50% 40% / ${cloud.opacity * 0.5}) 40%,
                transparent 70%)`,
              filter: "blur(40px)",
              transform: `translate(${offsetX}px, ${offsetY}px)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 15 + cloud.id * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Central nebula glow - reactive to engagement */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 400,
          background: `radial-gradient(ellipse at center,
            hsl(270 70% 60% / ${0.1 + engagement * 0.15}) 0%,
            hsl(35 80% 50% / ${0.05 + engagement * 0.1}) 30%,
            transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5 + engagement * 0.3, 0.8 + engagement * 0.2, 0.5 + engagement * 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glowing star seeds */}
      {!isMobile && Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`seed-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${15 + (i * 10)}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: `hsl(${45 + i * 20} 100% 80%)`,
            boxShadow: `0 0 ${10 + engagement * 10}px hsl(${45 + i * 20} 100% 70%)`,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

NebulaCloud.displayName = "NebulaCloud";
