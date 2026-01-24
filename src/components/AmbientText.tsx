import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface AmbientTextProps {
  isActive: boolean;
}

const activeMessages = [
  "I see you",
  "You are present",
  "Breathe with me",
  "This moment is yours",
  "Feel the stillness",
  "You belong here",
  "Let go",
  "Trust the silence",
  "You are enough",
  "Be here now",
  "Peace surrounds you",
  "Your mind is clear",
  "Embrace the calm",
  "You are infinite",
];

const passiveMessages = [
  "Come closer",
  "Step into stillness",
  "Find your center",
  "Begin within",
  "Awaken",
  "The cosmos awaits",
  "Seek the quiet",
  "Return to yourself",
  "Open your awareness",
];

const anchorWords = [
  ["presence", "connection", "awareness", "being"],
  ["stillness", "breath", "peace", "now"],
  ["calm", "focus", "clarity", "flow"],
  ["light", "energy", "harmony", "unity"],
];

export const AmbientText = ({ isActive }: AmbientTextProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [wordSetIndex, setWordSetIndex] = useState(0);
  
  const messages = isActive ? activeMessages : passiveMessages;
  const words = anchorWords[wordSetIndex];
  
  // Rotate main message every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [messages.length]);
  
  // Rotate anchor words every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWordSetIndex((prev) => (prev + 1) % anchorWords.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);
  
  // Reset message index when switching between active/passive
  useEffect(() => {
    setMessageIndex(0);
  }, [isActive]);
  
  return (
    <motion.div
      className="absolute bottom-20 left-0 right-0 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 2 }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={`${isActive}-${messageIndex}`}
          className="font-display text-2xl md:text-3xl tracking-widest text-glow"
          style={{ color: "hsl(var(--primary) / 0.8)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isActive ? 1 : 0.6, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8 }}
        >
          {messages[messageIndex]}
        </motion.p>
      </AnimatePresence>
      
      <motion.div 
        className="mt-6 flex justify-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        <AnimatePresence mode="wait">
          {words.map((word, i) => (
            <motion.span
              key={`${wordSetIndex}-${word}`}
              className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {word}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
