import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useHaptic } from "@/hooks/useHaptic";

interface BreathingGuideProps {
  isActive: boolean;
  onPhaseChange?: (phase: "inhale" | "hold" | "exhale") => void;
}

type BreathPhase = "inhale" | "hold" | "exhale";

const BREATH_CYCLE = {
  inhale: 4000,
  hold: 4000,
  exhale: 6000,
};

export const BreathingGuide = ({ isActive, onPhaseChange }: BreathingGuideProps) => {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [progress, setProgress] = useState(0);
  const { breatheIn, breatheOut, pulse } = useHaptic();

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "breathe in";
      case "hold": return "hold";
      case "exhale": return "release";
    }
  };

  useEffect(() => {
    if (!isActive) return;

    let animationFrame: number;
    let startTime = Date.now();
    let currentPhase: BreathPhase = "inhale";

    const runCycle = () => {
      const elapsed = Date.now() - startTime;
      const phaseDuration = BREATH_CYCLE[currentPhase];
      const phaseProgress = Math.min(elapsed / phaseDuration, 1);
      
      setProgress(phaseProgress);

      if (elapsed >= phaseDuration) {
        // Transition to next phase
        if (currentPhase === "inhale") {
          currentPhase = "hold";
          pulse();
        } else if (currentPhase === "hold") {
          currentPhase = "exhale";
          breatheOut();
        } else {
          currentPhase = "inhale";
          breatheIn();
        }
        setPhase(currentPhase);
        onPhaseChange?.(currentPhase);
        startTime = Date.now();
      }

      animationFrame = requestAnimationFrame(runCycle);
    };

    breatheIn();
    animationFrame = requestAnimationFrame(runCycle);

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, breatheIn, breatheOut, pulse, onPhaseChange]);

  const getScale = () => {
    switch (phase) {
      case "inhale": return 1 + progress * 0.3;
      case "hold": return 1.3;
      case "exhale": return 1.3 - progress * 0.3;
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breathing ring */}
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              width: 300,
              height: 300,
              borderColor: `hsl(var(--primary) / ${0.3 + progress * 0.3})`,
            }}
            animate={{ scale: getScale() }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
          
          {/* Inner pulse ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 250,
              height: 250,
              background: `radial-gradient(circle, hsl(var(--primary) / ${0.05 + progress * 0.1}) 0%, transparent 70%)`,
            }}
            animate={{ scale: getScale() * 0.9 }}
            transition={{ duration: 0.1, ease: "linear" }}
          />

          {/* Phase text */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2"
            style={{ marginTop: 120 }}
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="font-display text-xl tracking-widest text-primary text-glow">
              {getPhaseText()}
            </p>
          </motion.div>

          {/* Progress indicator */}
          <svg
            className="absolute"
            width="320"
            height="320"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="160"
              cy="160"
              r="155"
              fill="none"
              stroke="hsl(var(--primary) / 0.1)"
              strokeWidth="2"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="155"
              fill="none"
              stroke="hsl(var(--primary) / 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 155}
              strokeDashoffset={2 * Math.PI * 155 * (1 - progress)}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
