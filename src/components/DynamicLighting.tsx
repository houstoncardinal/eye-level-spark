import { memo, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface DynamicLightingProps {
  mousePos: { x: number; y: number };
  isEngaged: boolean;
  mode?: "presence" | "breathing" | "constellation";
}

export const DynamicLighting = memo(({ mousePos, isEngaged, mode = "presence" }: DynamicLightingProps) => {
  const isMobile = useIsMobile();
  const [lightPulse, setLightPulse] = useState(0);

  // Subtle light pulse animation
  useEffect(() => {
    if (isMobile) return;
    
    const interval = setInterval(() => {
      setLightPulse(prev => (prev + 0.05) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [isMobile]);

  const getModeColors = useCallback(() => {
    switch (mode) {
      case "breathing":
        return {
          primary: "hsl(200 70% 50%)",
          secondary: "hsl(180 60% 45%)",
          accent: "hsl(160 80% 55%)",
        };
      case "constellation":
        return {
          primary: "hsl(270 70% 60%)",
          secondary: "hsl(300 60% 50%)",
          accent: "hsl(45 90% 65%)",
        };
      default:
        return {
          primary: "hsl(35 80% 55%)",
          secondary: "hsl(270 50% 45%)",
          accent: "hsl(200 70% 50%)",
        };
    }
  }, [mode]);

  const colors = getModeColors();
  const pulseIntensity = Math.sin(lightPulse) * 0.3 + 0.7;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary spotlight following mouse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full will-change-transform"
        style={{
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          x: "-50%",
          y: "-50%",
          background: `radial-gradient(circle, 
            ${colors.primary}${isEngaged ? '25' : '15'} 0%, 
            ${colors.secondary}10 40%, 
            transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{
          scale: isEngaged ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isEngaged ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Ambient corner lights */}
      {!isMobile && (
        <>
          {/* Top-left glow */}
          <motion.div
            className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.secondary}20 0%, transparent 70%)`,
              filter: "blur(80px)",
              opacity: pulseIntensity * 0.5,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Bottom-right glow */}
          <motion.div
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.accent}15 0%, transparent 70%)`,
              filter: "blur(100px)",
              opacity: pulseIntensity * 0.4,
            }}
            animate={{
              scale: [1.1, 0.9, 1.1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Center ambient pulse */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.primary}${Math.round(pulseIntensity * 20).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
              filter: "blur(50px)",
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Edge vignette lighting */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.secondary}08 0%, transparent 50%),
            radial-gradient(ellipse 120% 100% at 50% 100%, ${colors.primary}06 0%, transparent 50%)
          `,
        }}
      />

      {/* Engagement reactive rays */}
      {isEngaged && !isMobile && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[200px] origin-bottom"
              style={{
                left: "50%",
                bottom: "50%",
                background: `linear-gradient(to top, ${colors.accent}40, transparent)`,
                transform: `translateX(-50%) rotate(${i * 60}deg)`,
                filter: "blur(2px)",
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scaleY: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
});

DynamicLighting.displayName = "DynamicLighting";
