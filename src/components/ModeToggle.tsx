import { motion } from "framer-motion";
import { Wind, Eye } from "lucide-react";

interface ModeToggleProps {
  isBreathingMode: boolean;
  onToggle: () => void;
}

export const ModeToggle = ({ isBreathingMode, onToggle }: ModeToggleProps) => {
  return (
    <motion.button
      className="fixed top-6 left-6 z-50 p-3 rounded-full border border-primary/20 bg-background/30 backdrop-blur-sm"
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
    >
      {isBreathingMode ? (
        <Eye className="w-5 h-5 text-primary" />
      ) : (
        <Wind className="w-5 h-5 text-muted-foreground" />
      )}
      <span className="sr-only">
        {isBreathingMode ? "Exit breathing mode" : "Enter breathing mode"}
      </span>
    </motion.button>
  );
};
