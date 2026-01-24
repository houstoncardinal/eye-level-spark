import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuroraWavesProps {
  intensity?: number;
  colorScheme?: "cosmic" | "northern" | "ethereal";
}

export const AuroraWaves = memo(({ intensity = 0.5, colorScheme = "cosmic" }: AuroraWavesProps) => {
  const isMobile = useIsMobile();
  const waveCount = isMobile ? 3 : 5;

  const colors = useMemo(() => {
    switch (colorScheme) {
      case "northern":
        return ["hsl(160 80% 40%)", "hsl(180 70% 50%)", "hsl(200 60% 45%)", "hsl(220 70% 55%)", "hsl(280 60% 50%)"];
      case "ethereal":
        return ["hsl(280 70% 50%)", "hsl(300 60% 45%)", "hsl(320 70% 55%)", "hsl(340 60% 50%)", "hsl(360 70% 55%)"];
      default:
        return ["hsl(270 60% 40%)", "hsl(35 80% 55%)", "hsl(200 70% 45%)", "hsl(160 60% 50%)", "hsl(320 70% 50%)"];
    }
  }, [colorScheme]);

  const waves = useMemo(() => 
    Array.from({ length: waveCount }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      delay: i * 0.8,
      duration: 12 + i * 2,
      yOffset: 20 + i * 15,
    })), [waveCount, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {waves.map(wave => (
        <motion.div
          key={wave.id}
          className="absolute inset-x-0 h-[40%]"
          style={{
            top: `${wave.yOffset}%`,
            background: `linear-gradient(180deg, 
              transparent 0%, 
              ${wave.color}${Math.round(intensity * 15).toString(16).padStart(2, '0')} 30%, 
              ${wave.color}${Math.round(intensity * 25).toString(16).padStart(2, '0')} 50%, 
              ${wave.color}${Math.round(intensity * 15).toString(16).padStart(2, '0')} 70%, 
              transparent 100%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: ["-20%", "20%", "-20%"],
            scaleY: [1, 1.3, 1],
            opacity: [0.3 * intensity, 0.6 * intensity, 0.3 * intensity],
          }}
          transition={{
            duration: wave.duration,
            delay: wave.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Shimmering highlights */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{
              top: "30%",
              left: "20%",
              background: `radial-gradient(circle, ${colors[0]}40 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-[150px] h-[150px] rounded-full"
            style={{
              top: "50%",
              right: "25%",
              background: `radial-gradient(circle, ${colors[2]}40 0%, transparent 70%)`,
              filter: "blur(35px)",
            }}
            animate={{
              scale: [1.2, 0.8, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10,
              delay: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </div>
  );
});

AuroraWaves.displayName = "AuroraWaves";
