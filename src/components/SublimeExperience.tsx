import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ParticleField } from "./ParticleField";
import { PresenceOrb } from "./PresenceOrb";
import { AmbientText } from "./AmbientText";

export const SublimeExperience = () => {
  const [isEngaged, setIsEngaged] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    setIsEngaged(true);
  }, [hasInteracted]);

  return (
    <div 
      className="relative h-full w-full cosmic-bg overflow-hidden cursor-default"
      onMouseEnter={handleInteraction}
      onTouchStart={handleInteraction}
      onMouseLeave={() => setIsEngaged(false)}
    >
      {/* Ambient background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 40% 15% / 0.5) 0%, transparent 60%)",
        }}
        animate={{
          opacity: isEngaged ? 0.8 : 0.4,
        }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, hsl(230 30% 3%) 100%)",
        }}
      />
      
      {/* Particle field layer */}
      <ParticleField />
      
      {/* Central presence container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <PresenceOrb />
        </motion.div>
      </div>
      
      {/* Ambient text */}
      <AmbientText isActive={isEngaged} />
      
      {/* Initial instruction */}
      {!hasInteracted && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <p className="font-display text-lg tracking-wider text-muted-foreground">
            move to awaken
          </p>
        </motion.div>
      )}
      
      {/* Ambient floating elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 200 + i * 100,
            height: 200 + i * 100,
            border: "1px solid hsl(var(--primary) / 0.05)",
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};
