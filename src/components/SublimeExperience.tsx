import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ParticleField } from "./ParticleField";
import { PresenceOrb } from "./PresenceOrb";
import { AmbientText } from "./AmbientText";
import { BreathingGuide } from "./BreathingGuide";
import { ConsciousnessField } from "./ConsciousnessField";
import { CosmicUniverse } from "./CosmicUniverse";
import { AudioToggle } from "./AudioToggle";
import { ModeToggle } from "./ModeToggle";
import { SettingsPanel } from "./SettingsPanel";
import { StatisticsDashboard } from "./StatisticsDashboard";
import { SoundscapeMixer } from "./SoundscapeMixer";
import { GuidedSessions } from "./GuidedSessions";
import { WellnessDashboard } from "./WellnessDashboard";
import { BinauralBeatsPanel } from "./BinauralBeatsPanel";
import { MeditationGame } from "./MeditationGame";
import { AICoach } from "./AICoach";
import { SpaceShip } from "./SpaceShip";
import { PsychicLab } from "./PsychicLab";
import { QuantumPortal } from "./QuantumPortal";
import { Settings, BarChart3, Volume2, Star, Play, Pause, Heart, Brain, Gamepad2, Sparkles, Rocket, Eye, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/useHaptic";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useMeditationGame } from "@/hooks/useMeditationGame";
import { useEffect } from "react";

type Mode = "presence" | "breathing" | "constellation";

export const SublimeExperience = () => {
  const [isEngaged, setIsEngaged] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>("presence");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [showSettings, setShowSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSoundscape, setShowSoundscape] = useState(false);
  const [showGuidedSessions, setShowGuidedSessions] = useState(false);
  const [showWellness, setShowWellness] = useState(false);
  const [showBinaural, setShowBinaural] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showSpaceShip, setShowSpaceShip] = useState(false);
  const [showPsychicLab, setShowPsychicLab] = useState(false);
  const [showQuantumPortal, setShowQuantumPortal] = useState(false);
  const [cosmicDepth, setCosmicDepth] = useState(0);
  const [showCosmicNavigation, setShowCosmicNavigation] = useState(false);
  const [settings, setSettings] = useState({
    theme: "cosmic",
    volume: 0.7,
    hapticEnabled: true,
    particleDensity: 100,
    breathingGuideEnabled: true,
    ambientTextEnabled: true,
    sessionDuration: 15,
    autoStartBreathing: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const { lightTap, mediumTap, heavyTap } = useHaptic();
  const { isMuted, toggleMute, setProximity, playBreathTone, playConnectionTone } = useAmbientAudio();
  const { stats, startSession } = useSessionTimer();
  const { completeSession: gameCompleteSession, updateStreak, exploreCosmic } = useMeditationGame();

  // Global audio mute function
  const muteAllAudio = () => {
    // Mute ambient audio
    if (!isMuted) {
      toggleMute();
    }

    // Close any open audio panels to trigger cleanup
    if (showSoundscape) {
      setShowSoundscape(false);
    }
    if (showBinaural) {
      setShowBinaural(false);
    }
  };

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      mediumTap();
    }
    setIsEngaged(true);
  }, [hasInteracted, mediumTap]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setMousePos({ x, y });

    const centerDist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    const proximity = Math.max(0, 1 - centerDist * 2);
    setProximity(proximity);
  }, [setProximity]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
      lightTap();
    }
  }, [handleMove, lightTap]);

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

  const getModeHint = () => {
    switch (currentMode) {
      case "breathing": return "follow the rhythm";
      case "constellation": return "watch them align";
      default: return "tap icons to explore modes";
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full cosmic-bg overflow-hidden cursor-default touch-none"
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

      {/* New Feature Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStatistics(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSoundscape(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGuidedSessions(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Star className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWellness(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Heart className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBinaural(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Brain className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGame(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Gamepad2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAICoach(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPsychicLab(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowQuantumPortal(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
        >
          <Atom className="w-4 h-4" />
        </Button>
      </div>

      {/* Ambient background gradients */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: currentMode === "constellation"
            ? "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 50% 20% / 0.6) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 60% at 50% 50%, hsl(270 40% 15% / 0.5) 0%, transparent 60%)",
        }}
        animate={{
          opacity: isEngaged ? 0.8 : 0.4,
        }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, hsl(230 30% 3%) 100%)",
        }}
      />
      
      {/* Particle field layer */}
      <ParticleField />

      {/* Cosmic Universe - stars, planets, nebulae, portals */}
      <CosmicUniverse
        mousePos={mousePos}
        isConstellationMode={currentMode === "constellation"}
        engagement={isEngaged ? 1 : 0}
        enableNavigation={true}
      />

      {/* Consciousness field - multiple orbs */}
      <ConsciousnessField
        mousePos={mousePos}
        onConnection={handleConnection}
        isConstellationMode={currentMode === "constellation"}
      />
      
      {/* Breathing guide overlay */}
      <BreathingGuide 
        isActive={currentMode === "breathing"} 
        onPhaseChange={handleBreathPhase} 
      />
      
      {/* Central presence container */}
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
      
      {/* Ambient text */}
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
      
      {/* Ambient floating elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 200 + i * 100,
            height: 200 + i * 100,
            border: `1px solid hsl(var(--${currentMode === "constellation" ? "glow-violet" : "primary"}) / 0.05)`,
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + i * 5,
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
          key={currentMode}
        >
          <span className="font-sans tracking-wide">{getModeHint()}</span>
        </motion.div>
      )}

      {/* Cosmic Navigation - appears when deeply engaged */}
      {isEngaged && hasInteracted && (
        <motion.div
          className="absolute bottom-20 left-6 z-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5 }}
        >
          <div className="flex flex-col gap-2">
            <motion.p
              className="text-xs text-primary/70 font-mono tracking-wider"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              COSMIC DEPTH: {cosmicDepth.toFixed(1)}
            </motion.p>

            <div className="flex gap-1">
              {['Nebula', 'Void', 'Core', 'Event Horizon'].map((region, i) => (
                <motion.button
                  key={region}
                  className="px-2 py-1 text-xs bg-background/20 backdrop-blur-sm border border-primary/20 rounded hover:border-primary/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCosmicDepth(i * 0.25);
                    mediumTap();
                  }}
                  animate={{
                    borderColor: cosmicDepth >= i * 0.25 && cosmicDepth < (i + 1) * 0.25
                      ? 'hsl(var(--primary) / 0.6)'
                      : 'hsl(var(--primary) / 0.2)',
                  }}
                >
                  {region}
                </motion.button>
              ))}
            </div>

            {/* Spaceship Launch Button */}
            <motion.button
              className="px-3 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowSpaceShip(true);
                heavyTap();
              }}
            >
              <Rocket className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium">Launch Ship</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Modal Components */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <StatisticsDashboard
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
        stats={stats}
      />

      <SoundscapeMixer
        isOpen={showSoundscape}
        onClose={() => setShowSoundscape(false)}
        masterVolume={settings.volume}
        onVolumeChange={(volume) => setSettings(prev => ({ ...prev, volume }))}
      />

      <GuidedSessions
        isOpen={showGuidedSessions}
        onClose={() => setShowGuidedSessions(false)}
        onStartSession={startSession}
      />

      <WellnessDashboard
        isOpen={showWellness}
        onClose={() => setShowWellness(false)}
      />

      <BinauralBeatsPanel
        isOpen={showBinaural}
        onClose={() => setShowBinaural(false)}
      />

      <MeditationGame
        isOpen={showGame}
        onClose={() => setShowGame(false)}
      />

      <AICoach
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
      />

      <SpaceShip
        isActive={showSpaceShip}
        onClose={() => setShowSpaceShip(false)}
        cosmicDepth={cosmicDepth}
        onDepthChange={setCosmicDepth}
      />

      <PsychicLab
        isOpen={showPsychicLab}
        onClose={() => setShowPsychicLab(false)}
      />

      <QuantumPortal
        isOpen={showQuantumPortal}
        onClose={() => setShowQuantumPortal(false)}
      />
    </div>
  );
};
