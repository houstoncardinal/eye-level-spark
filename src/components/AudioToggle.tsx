import { motion } from "framer-motion";
import { Volume2, VolumeX, Square } from "lucide-react";

interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  onStopAll?: () => void;
}

export const AudioToggle = ({ isMuted, onToggle, onStopAll }: AudioToggleProps) => {
  return (
    <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex gap-1.5 md:gap-2">
      <motion.button
        className="p-3 rounded-full border border-primary/20 bg-background/30 backdrop-blur-sm"
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary" />
        )}
      </motion.button>

      {onStopAll && (
        <motion.button
          className="p-3 rounded-full border border-red-500/20 bg-background/30 backdrop-blur-sm hover:border-red-500/50"
          onClick={onStopAll}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          title="Stop All Audio"
        >
          <Square className="w-5 h-5 text-red-400" />
        </motion.button>
      )}
    </div>
  );
};
