import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface PaywallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const PaywallDialog = ({ isOpen, onClose, featureName }: PaywallDialogProps) => {
  const { user, startCheckout } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    if (user) {
      startCheckout();
    } else {
      window.location.href = "/auth?mode=signup";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl glass p-8 text-center overflow-hidden"
      >
        {/* Subtle gradient shimmer at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative"
        >
          <Lock className="w-7 h-7 text-primary" />
          <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse-slow" />
        </motion.div>

        <h3 className="font-display text-2xl mb-2 text-foreground">{featureName}</h3>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Unlock this premium feature with Transcendent at <span className="text-primary font-medium">$9.99/mo</span>
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full rounded-2xl h-12 text-sm font-medium tracking-wide glow-soft relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Upgrade Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full rounded-2xl h-10 text-xs text-muted-foreground hover:text-foreground"
          >
            Maybe Later
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
