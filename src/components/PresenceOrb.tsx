import { motion, useSpring } from "framer-motion";
import { useCallback, useState } from "react";

export const PresenceOrb = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  
  const springConfig = { damping: 15, stiffness: 100 };
  const orbX = useSpring(0, springConfig);
  const orbY = useSpring(0, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / rect.width;
    const offsetY = (e.clientY - centerY) / rect.height;
    setMouseOffset({ x: offsetX, y: offsetY });
    orbX.set(offsetX * 20);
    orbY.set(offsetY * 20);
  }, [orbX, orbY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    orbX.set(0);
    orbY.set(0);
  }, [orbX, orbY]);

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer glow rings */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, hsl(35 90% 60% / 0.05) 0%, transparent 70%)",
        }}
        animate={{
          scale: isHovered ? 1.2 : 1,
          opacity: isHovered ? 1 : 0.6,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute rounded-full animate-breathe"
        style={{
          width: 300,
          height: 300,
          background: "radial-gradient(circle, hsl(270 50% 60% / 0.1) 0%, transparent 70%)",
        }}
      />
      
      {/* Main orb container */}
      <motion.div
        className="relative cursor-pointer"
        style={{ x: orbX, y: orbY }}
      >
        {/* Orb glow */}
        <motion.div
          className="absolute rounded-full glow-presence"
          style={{
            width: 180,
            height: 180,
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
            background: "radial-gradient(circle, hsl(35 85% 55% / 0.4) 0%, hsl(35 80% 50% / 0.1) 50%, transparent 70%)",
          }}
          animate={{
            scale: isHovered ? 1.3 : 1,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Core orb */}
        <motion.div
          className="relative rounded-full overflow-hidden"
          style={{
            width: 140,
            height: 140,
            background: "radial-gradient(circle at 30% 30%, hsl(40 90% 70%) 0%, hsl(35 85% 55%) 40%, hsl(25 80% 40%) 100%)",
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            boxShadow: isHovered 
              ? "0 0 80px hsl(35 90% 60% / 0.6), 0 0 160px hsl(35 90% 60% / 0.3), inset 0 0 60px hsl(40 100% 80% / 0.3)"
              : "0 0 40px hsl(35 90% 60% / 0.4), 0 0 80px hsl(35 90% 60% / 0.2), inset 0 0 40px hsl(40 100% 80% / 0.2)",
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Inner light reflection */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 40,
              height: 40,
              top: 25,
              left: 25,
              background: "radial-gradient(circle, hsl(45 100% 95% / 0.8) 0%, transparent 70%)",
            }}
            animate={{
              x: mouseOffset.x * 10,
              y: mouseOffset.y * 10,
              scale: isHovered ? 1.2 : 1,
            }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
          />
          
          {/* Pupil - the eye within */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 50,
              height: 50,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, hsl(230 30% 8%) 0%, hsl(230 40% 3%) 100%)",
            }}
            animate={{
              x: `calc(-50% + ${mouseOffset.x * 15}px)`,
              y: `calc(-50% + ${mouseOffset.y * 15}px)`,
              scale: isHovered ? 0.85 : 1,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Pupil highlight */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                top: 10,
                left: 12,
                background: "hsl(45 100% 95%)",
              }}
              animate={{
                opacity: isHovered ? 1 : 0.7,
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
