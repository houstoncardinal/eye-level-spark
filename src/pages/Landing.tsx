import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Brain, Waves, Eye, Sparkles, Heart, Zap, Shield, Star, 
  ArrowRight, Check, Play, ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Waves,
    title: "Guided Breathing",
    description: "Scientifically-calibrated 4-4-6 breathing cycles with reactive visual rings",
    free: true,
  },
  {
    icon: Eye,
    title: "Presence Orb",
    description: "Eye-tracking reactive orb that responds to your gaze and proximity",
    free: true,
  },
  {
    icon: Heart,
    title: "Wellness Dashboard",
    description: "Track your meditation streaks, session history, and personal growth",
    free: true,
  },
  {
    icon: Brain,
    title: "Binaural Beats",
    description: "Precision-tuned frequencies for deep focus, relaxation, and sleep",
    free: false,
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    description: "Personalized meditation guidance powered by advanced AI models",
    free: false,
  },
  {
    icon: Zap,
    title: "Solfeggio Healing",
    description: "Ancient healing frequencies from 396Hz to 963Hz for energy alignment",
    free: false,
  },
  {
    icon: Eye,
    title: "Psychic Lab",
    description: "Intuition exercises and precognition training in an immersive environment",
    free: false,
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Yoga Instructor",
    quote: "The most immersive meditation experience I've ever encountered. The cosmic visuals transport me to another dimension.",
    avatar: "S",
  },
  {
    name: "Marcus T.",
    role: "Software Engineer",
    quote: "I use it daily before deep work sessions. The binaural beats and AI coaching have transformed my focus.",
    avatar: "M",
  },
  {
    name: "Elena R.",
    role: "Therapist",
    quote: "I recommend Sublime Presence to my clients. The breathing guide alone has helped dozens manage anxiety.",
    avatar: "E",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "What's included in the free tier?", a: "Breathing guide, particle fields, cosmic visuals, aurora waves, wellness dashboard, and guided sessions are all free forever." },
    { q: "Can I cancel anytime?", a: "Absolutely. Cancel your subscription at any time with zero questions asked. You'll retain access until the end of your billing period." },
    { q: "Does it work on mobile?", a: "Yes — Sublime Presence is fully optimized for mobile devices with touch interactions and haptic feedback support." },
    { q: "What are binaural beats?", a: "Binaural beats are auditory illusions created when two slightly different frequencies are played in each ear. They can promote relaxation, focus, and sleep." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-glow-violet animate-breathe" />
            <span className="font-display text-xl tracking-wide text-foreground">Sublime Presence</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/auth?mode=signup")} className="rounded-full">
              Start Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(var(--glow-violet) / 0.2) 40%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="text-primary font-medium text-sm tracking-[0.3em] uppercase mb-6">
              Meditation Reimagined
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6">
              Find Your
              <br />
              <span className="text-glow text-primary">Sublime Presence</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              An immersive cosmic meditation experience with reactive visuals, binaural beats, AI coaching, and ancient healing frequencies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="rounded-full px-8 h-12 text-base glow-soft">
              Begin Your Journey <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/experience")} className="rounded-full px-8 h-12 text-base">
              <Play className="w-4 h-4 mr-2" /> Try Free Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground mx-auto animate-float" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">Features</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mb-4">Everything You Need to Transcend</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete toolkit for deep meditation, healing, and self-discovery.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-500"
              >
                {!feature.free && (
                  <span className="absolute top-4 right-4 text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Pro
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">Testimonials</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Loved by Seekers Worldwide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 italic mb-4 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6" id="pricing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-card border border-border/50">
              <h3 className="font-display text-2xl mb-1">Explorer</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfect for getting started</p>
              <p className="text-4xl font-display mb-8">$0<span className="text-base text-muted-foreground">/mo</span></p>
              <ul className="space-y-3 mb-8">
                {["Breathing guide", "Cosmic visuals", "Aurora waves", "Wellness dashboard", "Guided sessions"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full" onClick={() => navigate("/experience")}>
                Start Free
              </Button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl bg-card border-2 border-primary/40 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium tracking-wider uppercase">
                Most Popular
              </div>
              <h3 className="font-display text-2xl mb-1">Transcendent</h3>
              <p className="text-muted-foreground text-sm mb-6">Unlock the full experience</p>
              <p className="text-4xl font-display mb-8">$9.99<span className="text-base text-muted-foreground">/mo</span></p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Explorer",
                  "AI Coach",
                  "Binaural Beats",
                  "Solfeggio Healing",
                  "Psychic Lab",
                  "Priority support",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-full glow-soft" onClick={() => navigate("/auth?mode=signup")}>
                Subscribe Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 bg-card/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3">FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-card/50 transition-colors"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mb-6">Begin Your Cosmic Journey</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of seekers who have transformed their meditation practice.
          </p>
          <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="rounded-full px-10 h-12 text-base glow-soft">
            Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-glow-violet" />
            <span className="font-display text-sm">Sublime Presence</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Sublime Presence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
