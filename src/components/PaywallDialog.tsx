import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, X } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-8 text-center"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-primary" />
        </div>

        <h3 className="font-display text-2xl mb-2">{featureName}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This is a premium feature. Upgrade to Transcendent for $9.99/mo to unlock all advanced tools.
        </p>

        <div className="space-y-3">
          <Button onClick={handleUpgrade} className="w-full rounded-full glow-soft">
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
