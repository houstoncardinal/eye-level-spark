import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const AudioToggle = ({ isMuted, onToggle }: AudioToggleProps) => {
  return (
    <motion.button
      className="fixed top-6 right-6 z-50 p-3 rounded-full border border-primary/20 bg-background/30 backdrop-blur-sm"
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary" />
      )}
    </motion.button>
  );
};
