import { useState, useCallback, useRef, lazy, Suspense, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { ParticleField } from "./ParticleField";
import { PresenceOrb } from "./PresenceOrb";
import { AmbientText } from "./AmbientText";
import { BreathingGuide } from "./BreathingGuide";
import { ConsciousnessField } from "./ConsciousnessField";
import { CosmicUniverse } from "./CosmicUniverse";
import { AuroraWaves } from "./AuroraWaves";
import { NebulaCloud } from "./NebulaCloud";
import { DynamicLighting } from "./DynamicLighting";
import { CosmicRipples } from "./CosmicRipples";
import { AudioToggle } from "./AudioToggle";
import { ModeToggle } from "./ModeToggle";
import { Settings, BarChart3, Volume2, Star, Heart, Brain, Gamepad2, Sparkles, Rocket, Eye, Atom, Palette, Zap, Moon, Target, Waves, Radio, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/useHaptic";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { useSessionTimer } from "@/hooks/useSessionTimer";

// Lazy load all modal components for faster initial load
const SettingsPanel = lazy(() => import("./SettingsPanel").then(m => ({ default: m.SettingsPanel })));
const StatisticsDashboard = lazy(() => import("./StatisticsDashboard").then(m => ({ default: m.StatisticsDashboard })));
const SoundscapeMixer = lazy(() => import("./SoundscapeMixer").then(m => ({ default: m.SoundscapeMixer })));
const GuidedSessions = lazy(() => import("./GuidedSessions").then(m => ({ default: m.GuidedSessions })));
const WellnessDashboard = lazy(() => import("./WellnessDashboard").then(m => ({ default: m.WellnessDashboard })));
const BinauralBeatsPanel = lazy(() => import("./BinauralBeatsPanel").then(m => ({ default: m.BinauralBeatsPanel })));
const MeditationGame = lazy(() => import("./MeditationGame").then(m => ({ default: m.MeditationGame })));
const AICoach = lazy(() => import("./AICoach").then(m => ({ default: m.AICoach })));
const SpaceShip = lazy(() => import("./SpaceShip").then(m => ({ default: m.SpaceShip })));
const PsychicLab = lazy(() => import("./PsychicLab").then(m => ({ default: m.PsychicLab })));
const QuantumPortal = lazy(() => import("./QuantumPortal").then(m => ({ default: m.QuantumPortal })));
const Kaleidoscope = lazy(() => import("./Kaleidoscope").then(m => ({ default: m.Kaleidoscope })));
const ChakraFlow = lazy(() => import("./ChakraFlow").then(m => ({ default: m.ChakraFlow })));
const DreamJournal = lazy(() => import("./DreamJournal").then(m => ({ default: m.DreamJournal })));
const ManifestationBoard = lazy(() => import("./ManifestationBoard").then(m => ({ default: m.ManifestationBoard })));
const SolfeggioHealing = lazy(() => import("./SolfeggioHealing").then(m => ({ default: m.SolfeggioHealing })));
const TimeWarp = lazy(() => import("./TimeWarp").then(m => ({ default: m.TimeWarp })));
const AchievementsPanel = lazy(() => import("./AchievementsPanel").then(m => ({ default: m.AchievementsPanel })));
const CosmicRadio = lazy(() => import("./CosmicRadio").then(m => ({ default: m.CosmicRadio })));

type Mode = "presence" | "breathing" | "constellation";

// Memoized control button component
const ControlButton = memo(({ icon: Icon, onClick }: { icon: React.ElementType; onClick: () => void }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 will-change-transform"
  >
    <Icon className="w-4 h-4" />
  </Button>
));
ControlButton.displayName = "ControlButton";

// Throttle helper for mouse movements
const throttle = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

// Loading fallback - minimal
const LoadingFallback = () => null;

export const SublimeExperience = () => {
  const [isEngaged, setIsEngaged] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>("presence");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Modal states - only loaded when opened
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [cosmicDepth, setCosmicDepth] = useState(0);

  const [settings, setSettings] = useState({
    theme: "cosmic",
    volume: 0.7,
    hapticEnabled: true,
    particleDensity: 60, // Reduced for performance
    breathingGuideEnabled: true,
    ambientTextEnabled: true,
    sessionDuration: 15,
    autoStartBreathing: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { lightTap, mediumTap, heavyTap } = useHaptic();
  const { isMuted, toggleMute, setProximity, playBreathTone, playConnectionTone } = useAmbientAudio();
  const { stats, startSession } = useSessionTimer();

  // Memoized mute all function
  const muteAllAudio = useCallback(() => {
    if (!isMuted) toggleMute();
    if (activeModal === "soundscape" || activeModal === "binaural") {
      setActiveModal(null);
    }
  }, [isMuted, toggleMute, activeModal]);

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      mediumTap();
    }
    setIsEngaged(true);
  }, [hasInteracted, mediumTap]);

  // Throttled mouse move handler for 60fps
  const handleMove = useMemo(() =>
    throttle((clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      setMousePos({ x, y });

      const centerDist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
      setProximity(Math.max(0, 1 - centerDist * 2));
    }, 16), // ~60fps
  [setProximity]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleInteraction();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
      heavyTap();
    }
  }, [handleInteraction, handleMove, heavyTap]);

  const handleBreathPhase = useCallback((phase: "inhale" | "hold" | "exhale") => {
    playBreathTone(phase);
  }, [playBreathTone]);

  const handleConnection = useCallback(() => {
    playConnectionTone();
    heavyTap();
  }, [playConnectionTone, heavyTap]);

  const handleModeChange = useCallback((mode: Mode) => {
    setCurrentMode(mode);
    mediumTap();
  }, [mediumTap]);

  const getModeHint = useMemo(() => {
    switch (currentMode) {
      case "breathing": return "follow the rhythm";
      case "constellation": return "watch them align";
      default: return "tap icons to explore modes";
    }
  }, [currentMode]);

  // Memoized background style
  const backgroundStyle = useMemo(() => ({
    background: currentMode === "constellation"
      ? "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 50% 20% / 0.6) 0%, transparent 60%)"
      : "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 40% 15% / 0.5) 0%, transparent 60%)",
  }), [currentMode]);

  // Control buttons config
  const controls = useMemo(() => [
    { id: "settings", icon: Settings },
    { id: "statistics", icon: BarChart3 },
    { id: "soundscape", icon: Volume2 },
    { id: "guided", icon: Star },
    { id: "wellness", icon: Heart },
    { id: "binaural", icon: Brain },
    { id: "game", icon: Gamepad2 },
    { id: "coach", icon: Sparkles },
    { id: "psychic", icon: Eye },
    { id: "quantum", icon: Atom },
    { id: "kaleidoscope", icon: Palette },
    { id: "chakra", icon: Zap },
    { id: "dream", icon: Moon },
    { id: "manifest", icon: Target },
    { id: "solfeggio", icon: Waves },
    { id: "timewarp", icon: Sparkles },
    { id: "radio", icon: Radio },
    { id: "achievements", icon: Trophy },
  ], []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cosmic-bg overflow-hidden cursor-default touch-none will-change-auto"
      onMouseEnter={handleInteraction}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsEngaged(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsEngaged(false)}
    >
      {/* Controls */}
      <AudioToggle isMuted={isMuted} onToggle={toggleMute} onStopAll={muteAllAudio} />
      <ModeToggle currentMode={currentMode} onModeChange={handleModeChange} />

      {/* Feature Controls - Scrollable */}
      <div className="absolute top-6 right-6 flex flex-col gap-1.5 z-10 max-h-[80vh] overflow-y-auto scrollbar-hide">
        {controls.map(({ id, icon }) => (
          <ControlButton key={id} icon={icon} onClick={() => setActiveModal(id)} />
        ))}
      </div>

      {/* Background - GPU accelerated */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-opacity"
        style={backgroundStyle}
        animate={{ opacity: isEngaged ? 0.8 : 0.4 }}
        transition={{ duration: 1.5 }}
      />

      {/* Vignette - static, no animation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, hsl(230 30% 3%) 100%)",
        }}
      />

      {/* Enhanced visual atmosphere layers */}
      <NebulaCloud 
        mousePos={mousePos} 
        engagement={isEngaged ? 1 : 0} 
      />
      <AuroraWaves 
        intensity={isEngaged ? 0.7 : 0.4} 
        colorScheme={currentMode === "constellation" ? "ethereal" : currentMode === "breathing" ? "northern" : "cosmic"} 
      />
      <DynamicLighting 
        mousePos={mousePos} 
        isEngaged={isEngaged} 
        mode={currentMode} 
      />

      {/* Core visual layers */}
      <ParticleField />
      <CosmicUniverse
        mousePos={mousePos}
        isConstellationMode={currentMode === "constellation"}
        engagement={isEngaged ? 1 : 0}
        enableNavigation={true}
      />
      <CosmicRipples 
        containerRef={containerRef} 
        color={currentMode === "constellation" ? "hsl(270 70% 60%)" : "hsl(35 80% 55%)"} 
      />
      <ConsciousnessField
        mousePos={mousePos}
        onConnection={handleConnection}
        isConstellationMode={currentMode === "constellation"}
      />

      {/* Breathing guide */}
      <BreathingGuide
        isActive={currentMode === "breathing"}
        onPhaseChange={handleBreathPhase}
      />

      {/* Central presence */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: currentMode === "presence" ? 1 : 0.2,
            scale: currentMode === "constellation" ? 0.6 : 1
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <PresenceOrb />
        </motion.div>
      </div>

      {/* Ambient text - conditional */}
      {currentMode === "presence" && <AmbientText isActive={isEngaged} />}

      {/* Initial instruction */}
      {!hasInteracted && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <p className="font-display text-lg tracking-wider text-muted-foreground">
            move to awaken
          </p>
        </motion.div>
      )}

      {/* Ambient rings - reduced count */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none will-change-transform"
          style={{
            width: 250 + i * 150,
            height: 250 + i * 150,
            border: `1px solid hsl(var(--${currentMode === "constellation" ? "glow-violet" : "primary"}) / 0.05)`,
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: 360,
          }}
          transition={{
            duration: 25 + i * 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Mode hint */}
      {hasInteracted && (
        <motion.div
          className="absolute bottom-6 left-6 text-muted-foreground/50 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <span className="font-sans tracking-wide">{getModeHint}</span>
        </motion.div>
      )}

      {/* Cosmic Navigation */}
      {isEngaged && hasInteracted && (
        <motion.div
          className="absolute bottom-20 left-6 z-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5 }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs text-primary/70 font-mono tracking-wider">
              COSMIC DEPTH: {cosmicDepth.toFixed(1)}
            </p>
            <div className="flex gap-1">
              {['Nebula', 'Void', 'Core', 'Horizon'].map((region, i) => (
                <button
                  key={region}
                  className={`px-2 py-1 text-xs bg-background/20 backdrop-blur-sm border rounded transition-colors ${
                    cosmicDepth >= i * 0.25 && cosmicDepth < (i + 1) * 0.25
                      ? 'border-primary/60'
                      : 'border-primary/20 hover:border-primary/40'
                  }`}
                  onClick={() => {
                    setCosmicDepth(i * 0.25);
                    mediumTap();
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
            <button
              className="px-3 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
              onClick={() => {
                setActiveModal("spaceship");
                heavyTap();
              }}
            >
              <Rocket className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium">Launch Ship</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Lazy-loaded Modals - only render when active */}
      <Suspense fallback={<LoadingFallback />}>
        {activeModal === "settings" && (
          <SettingsPanel
            isOpen={true}
            onClose={closeModal}
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
        {activeModal === "statistics" && (
          <StatisticsDashboard isOpen={true} onClose={closeModal} stats={stats} />
        )}
        {activeModal === "soundscape" && (
          <SoundscapeMixer
            isOpen={true}
            onClose={closeModal}
            masterVolume={settings.volume}
            onVolumeChange={(volume) => setSettings(prev => ({ ...prev, volume }))}
          />
        )}
        {activeModal === "guided" && (
          <GuidedSessions isOpen={true} onClose={closeModal} onStartSession={startSession} />
        )}
        {activeModal === "wellness" && (
          <WellnessDashboard isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "binaural" && (
          <BinauralBeatsPanel isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "game" && (
          <MeditationGame isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "coach" && (
          <AICoach isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "spaceship" && (
          <SpaceShip
            isActive={true}
            onClose={closeModal}
            cosmicDepth={cosmicDepth}
            onDepthChange={setCosmicDepth}
          />
        )}
        {activeModal === "psychic" && (
          <PsychicLab isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "quantum" && (
          <QuantumPortal isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "kaleidoscope" && (
          <Kaleidoscope isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "chakra" && (
          <ChakraFlow isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "dream" && (
          <DreamJournal isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "manifest" && (
          <ManifestationBoard isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "solfeggio" && (
          <SolfeggioHealing isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "timewarp" && (
          <TimeWarp isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "radio" && (
          <CosmicRadio isOpen={true} onClose={closeModal} />
        )}
        {activeModal === "achievements" && (
          <AchievementsPanel isOpen={true} onClose={closeModal} />
        )}
      </Suspense>
    </div>
  );
};
