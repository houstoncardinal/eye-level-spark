import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Ripple {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface CosmicRipplesProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  color?: string;
  maxRipples?: number;
}

export const CosmicRipples = memo(({ containerRef, color = "hsl(35 80% 55%)", maxRipples = 5 }: CosmicRipplesProps) => {
  const isMobile = useIsMobile();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((x: number, y: number) => {
    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      timestamp: Date.now(),
    };

    setRipples(prev => {
      const updated = [...prev, newRipple];
      return updated.slice(-maxRipples);
    });
  }, [maxRipples]);

  // Clean up old ripples
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRipples(prev => prev.filter(r => now - r.timestamp < 3000));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Handle click events
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      addRipple(x, y);
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        addRipple(x, y);
      }
    };

    container.addEventListener("click", handleClick);
    container.addEventListener("touchstart", handleTouch);

    return () => {
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchstart", handleTouch);
    };
  }, [containerRef, addRipple]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
            }}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
          >
            {/* Multiple expanding rings */}
            {Array.from({ length: isMobile ? 2 : 3 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{
                  border: `${1 + i * 0.5}px solid ${color}`,
                  opacity: 0.6 - i * 0.15,
                }}
                initial={{ width: 0, height: 0 }}
                animate={{
                  width: [0, 200 + i * 60],
                  height: [0, 200 + i * 60],
                  opacity: [0.6 - i * 0.15, 0],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Central flash */}
            <motion.div
              className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                boxShadow: `0 0 20px ${color}`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 3, 0], opacity: [1, 0.5, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ambient ripple effect in corners */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-[10%] left-[10%] w-[100px] h-[100px] rounded-full"
            style={{
              border: `1px solid ${color}30`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[15%] right-[15%] w-[80px] h-[80px] rounded-full"
            style={{
              border: `1px solid ${color}25`,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.25, 0, 0.25],
            }}
            transition={{
              duration: 8,
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

CosmicRipples.displayName = "CosmicRipples";
