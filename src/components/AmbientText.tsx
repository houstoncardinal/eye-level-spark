import { motion } from "framer-motion";

interface AmbientTextProps {
  isActive: boolean;
}

export const AmbientText = ({ isActive }: AmbientTextProps) => {
  const words = ["presence", "connection", "awareness", "being"];
  
  return (
    <motion.div
      className="absolute bottom-20 left-0 right-0 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 2 }}
    >
      <motion.p
        className="font-display text-2xl md:text-3xl tracking-widest text-glow"
        style={{ color: "hsl(var(--primary) / 0.8)" }}
        animate={{
          opacity: isActive ? 1 : 0.5,
        }}
        transition={{ duration: 0.8 }}
      >
        {isActive ? "I see you" : "Come closer"}
      </motion.p>
      
      <motion.div 
        className="mt-6 flex justify-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        {words.map((word, i) => (
          <motion.span
            key={word}
            className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
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
      </motion.div>
    </motion.div>
  );
};
