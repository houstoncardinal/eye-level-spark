import { motion } from "framer-motion";
import { Wind, Eye, Sparkles } from "lucide-react";

type Mode = "presence" | "breathing" | "constellation";

interface ModeToggleProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeToggle = ({ currentMode, onModeChange }: ModeToggleProps) => {
  const modes: { mode: Mode; icon: typeof Eye; label: string }[] = [
    { mode: "presence", icon: Eye, label: "Presence" },
    { mode: "breathing", icon: Wind, label: "Breathe" },
    { mode: "constellation", icon: Sparkles, label: "Sacred" },
  ];

  return (
    <motion.div
      className="fixed top-[4.5rem] left-4 md:top-6 md:left-24 z-50 flex gap-1.5 md:gap-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
    >
      {modes.map(({ mode, icon: Icon, label }) => (
        <motion.button
          key={mode}
          className={`p-3 rounded-full border backdrop-blur-sm transition-colors ${
            currentMode === mode
              ? "border-primary/50 bg-primary/20"
              : "border-primary/20 bg-background/30"
          }`}
          onClick={() => onModeChange(mode)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon 
            className={`w-5 h-5 ${
              currentMode === mode ? "text-primary" : "text-muted-foreground"
            }`} 
          />
          <span className="sr-only">{label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};
