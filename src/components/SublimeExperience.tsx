import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ParticleField } from "./ParticleField";
import { PresenceOrb } from "./PresenceOrb";
import { AmbientText } from "./AmbientText";
import { BreathingGuide } from "./BreathingGuide";
import { ConsciousnessField } from "./ConsciousnessField";
import { AudioToggle } from "./AudioToggle";
import { ModeToggle } from "./ModeToggle";
import { useHaptic } from "@/hooks/useHaptic";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

type Mode = "presence" | "breathing" | "constellation";

export const SublimeExperience = () => {
  const [isEngaged, setIsEngaged] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>("presence");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { lightTap, mediumTap, heavyTap } = useHaptic();
  const { isMuted, toggleMute, setProximity, playBreathTone, playConnectionTone } = useAmbientAudio();

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      mediumTap();
    }
    setIsEngaged(true);
  }, [hasInteracted, mediumTap]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setMousePos({ x, y });

    const centerDist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    const proximity = Math.max(0, 1 - centerDist * 2);
    setProximity(proximity);
  }, [setProximity]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
      lightTap();
    }
  }, [handleMove, lightTap]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleInteraction();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
      heavyTap();
    }
  }, [handleInteraction, handleMove, heavyTap]);

  const handleBreathPhase = useCallback((phase: "inhale" | "hold" | "exhale") => {
    playBreathTone(phase);
  }, [playBreathTone]);

  const handleConnection = useCallback(() => {
    playConnectionTone();
    heavyTap();
  }, [playConnectionTone, heavyTap]);

  const handleModeChange = useCallback((mode: Mode) => {
    setCurrentMode(mode);
    mediumTap();
  }, [mediumTap]);

  const getModeHint = () => {
    switch (currentMode) {
      case "breathing": return "follow the rhythm";
      case "constellation": return "watch them align";
      default: return "tap icons to explore modes";
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full cosmic-bg overflow-hidden cursor-default touch-none"
      onMouseEnter={handleInteraction}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsEngaged(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsEngaged(false)}
    >
      {/* Controls */}
      <AudioToggle isMuted={isMuted} onToggle={toggleMute} />
      <ModeToggle currentMode={currentMode} onModeChange={handleModeChange} />

      {/* Ambient background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: currentMode === "constellation"
            ? "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 50% 20% / 0.6) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 40% 15% / 0.5) 0%, transparent 60%)",
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
      
      {/* Consciousness field - multiple orbs */}
      <ConsciousnessField 
        mousePos={mousePos} 
        onConnection={handleConnection}
        isConstellationMode={currentMode === "constellation"}
      />
      
      {/* Breathing guide overlay */}
      <BreathingGuide 
        isActive={currentMode === "breathing"} 
        onPhaseChange={handleBreathPhase} 
      />
      
      {/* Central presence container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: currentMode === "presence" ? 1 : 0.2, 
            scale: currentMode === "constellation" ? 0.6 : 1 
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <PresenceOrb />
        </motion.div>
      </div>
      
      {/* Ambient text */}
      {currentMode === "presence" && <AmbientText isActive={isEngaged} />}
      
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
            border: `1px solid hsl(var(--${currentMode === "constellation" ? "glow-violet" : "primary"}) / 0.05)`,
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

      {/* Mode hint */}
      {hasInteracted && (
        <motion.div
          className="absolute bottom-6 left-6 text-muted-foreground/50 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          key={currentMode}
        >
          <span className="font-sans tracking-wide">{getModeHint()}</span>
        </motion.div>
      )}
    </div>
  );
};
