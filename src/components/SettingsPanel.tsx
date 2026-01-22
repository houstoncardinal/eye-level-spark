import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Palette, Volume2, Zap, Eye, Timer, Sparkles, Star, Moon, Sun, Infinity, Crown, Wand2, Gem, Orbit, Atom, Flower2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    theme: string;
    volume: number;
    hapticEnabled: boolean;
    particleDensity: number;
    breathingGuideEnabled: boolean;
    ambientTextEnabled: boolean;
    sessionDuration: number;
    autoStartBreathing: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

const REALITIES = [
  {
    id: "cosmic",
    name: "Cosmic Reality",
    description: "Infinite star systems and galactic wonders",
    colors: ["hsl(270 50% 20%)", "hsl(35 80% 60%)"],
    icon: Orbit,
    energy: "Stellar",
    vibration: 432
  },
  {
    id: "ocean",
    name: "Oceanic Realm",
    description: "Deep aquatic consciousness and fluid wisdom",
    colors: ["hsl(200 60% 25%)", "hsl(180 70% 50%)"],
    icon: Flower2,
    energy: "Tidal",
    vibration: 528
  },
  {
    id: "forest",
    name: "Ancient Grove",
    description: "Timeless wisdom of nature's eternal cycle",
    colors: ["hsl(120 40% 20%)", "hsl(90 60% 45%)"],
    icon: Flower2,
    energy: "Terrestrial",
    vibration: 396
  },
  {
    id: "sunset",
    name: "Golden Horizon",
    description: "Transcendent beauty of eternal transformation",
    colors: ["hsl(25 70% 30%)", "hsl(45 80% 60%)"],
    icon: Sun,
    energy: "Solar",
    vibration: 741
  },
  {
    id: "aurora",
    name: "Aurora Veil",
    description: "Dancing lights of cosmic intelligence",
    colors: ["hsl(160 50% 25%)", "hsl(280 60% 55%)"],
    icon: Sparkles,
    energy: "Magnetic",
    vibration: 852
  },
  {
    id: "minimal",
    name: "Void Essence",
    description: "Pure potential of infinite nothingness",
    colors: ["hsl(0 0% 15%)", "hsl(0 0% 70%)"],
    icon: Infinity,
    energy: "Quantum",
    vibration: 963
  }
];

const MANIFESTATION_PORTALS = [
  {
    id: "abundance",
    name: "Abundance Vortex",
    description: "Manifest prosperity and infinite wealth",
    icon: Crown,
    color: "from-yellow-400 to-orange-500",
    affirmation: "I am a magnet for abundance and prosperity"
  },
  {
    id: "love",
    name: "Love Sanctuary",
    description: "Attract divine love and harmonious relationships",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    affirmation: "I radiate love and attract loving souls"
  },
  {
    id: "wisdom",
    name: "Wisdom Temple",
    description: "Unlock infinite knowledge and enlightenment",
    icon: Gem,
    color: "from-purple-400 to-indigo-500",
    affirmation: "Wisdom flows through me effortlessly"
  },
  {
    id: "power",
    name: "Power Nexus",
    description: "Harness unlimited personal power and strength",
    icon: Zap,
    color: "from-red-400 to-pink-500",
    affirmation: "I am powerful beyond measure"
  },
  {
    id: "healing",
    name: "Healing Chamber",
    description: "Restore perfect health and vitality",
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    affirmation: "My body heals and rejuvenates perfectly"
  },
  {
    id: "creativity",
    name: "Creation Forge",
    description: "Unleash boundless creativity and innovation",
    icon: Wand2,
    color: "from-blue-400 to-cyan-500",
    affirmation: "Creativity flows through me like a mighty river"
  }
];

export const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activePortal, setActivePortal] = useState<string | null>(null);
  const [portalEnergy, setPortalEnergy] = useState(100);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const activatePortal = (portalId: string) => {
    setActivePortal(portalId);
    setPortalEnergy(prev => Math.max(prev - 25, 0));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at center, hsl(270 80% 5%) 0%, hsl(240 100% 2%) 50%, black 100%)`,
          }}
          onClick={onClose}
        >
          {/* Portal Entrance Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Outer Portal Rings */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full border-2"
                style={{
                  width: 400 + ring * 200,
                  height: 400 + ring * 200,
                  borderColor: `hsl(${270 + ring * 30} 70% 50% / 0.3)`,
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20 + ring * 5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity },
                }}
              />
            ))}

            {/* Central Portal Vortex */}
            <motion.div
              className="relative w-96 h-96 rounded-full overflow-hidden"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, hsl(280 100% 70%) 90deg, transparent 180deg, hsl(240 100% 70%) 270deg, transparent 360deg)`,
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Portal Core */}
              <motion.div
                className="absolute inset-8 rounded-full"
                style={{
                  background: `radial-gradient(circle, hsl(270 100% 90%) 0%, hsl(240 100% 60%) 50%, transparent 100%)`,
                  boxShadow: `0 0 100px hsl(270 100% 70%), inset 0 0 50px hsl(240 100% 80%)`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />

              {/* Floating Energy Particles */}
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: `hsl(${270 + i * 30} 100% 70%)`,
                    boxShadow: `0 0 10px hsl(${270 + i * 30} 100% 70%)`,
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: Math.cos((i / 12) * Math.PI * 2) * 120,
                    y: Math.sin((i / 12) * Math.PI * 2) * 120,
                    scale: [0.5, 1.5, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Portal Interface */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="relative z-10 w-full max-w-7xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="text-center border-b border-white/10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Infinity className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Quantum Manifestation Nexus
                    </h1>
                    <Infinity className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <p className="text-white/70 text-lg">
                    Welcome to the infinite realms of creation and manifestation
                  </p>
                </motion.div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                      Portal Energy: {portalEnergy}%
                    </Badge>
                    <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${portalEnergy}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="max-h-[65vh] overflow-y-auto p-8">
                <Tabs defaultValue="realities" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/30">
                    <TabsTrigger value="realities" className="text-white/80 data-[state=active]:text-cyan-400">
                      <Orbit className="w-4 h-4 mr-2" />
                      Quantum Realities
                    </TabsTrigger>
                    <TabsTrigger value="portals" className="text-white/80 data-[state=active]:text-purple-400">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Manifestation Portals
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-white/80 data-[state=active]:text-pink-400">
                      <Settings className="w-4 h-4 mr-2" />
                      Experience Matrix
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="realities" className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Choose Your Quantum Reality</h2>
                      <p className="text-white/60">Each reality holds infinite possibilities and unique vibrational frequencies</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {REALITIES.map((reality, index) => {
                        const Icon = reality.icon;
                        return (
                          <motion.div
                            key={reality.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 2 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all duration-500 hover:scale-105 border-2 ${
                                localSettings.theme === reality.id
                                  ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/25'
                                  : 'border-white/10 hover:border-white/30 bg-white/5'
                              }`}
                              onClick={() => updateSetting("theme", reality.id)}
                            >
                              <CardContent className="p-6 text-center">
                                <motion.div
                                  className="mb-4"
                                  animate={{
                                    rotate: [0, 5, -5, 0],
                                  }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    delay: index * 0.5,
                                  }}
                                >
                                  <reality.icon className="w-12 h-12 mx-auto mb-3 text-white/80" />
                                </motion.div>

                                <h3 className="text-xl font-bold text-white mb-2">{reality.name}</h3>
                                <p className="text-white/60 text-sm mb-4">{reality.description}</p>

                                <div className="flex justify-center gap-2 mb-4">
                                  {reality.colors.map((color, i) => (
                                    <motion.div
                                      key={i}
                                      className="w-4 h-4 rounded-full border border-white/20"
                                      style={{ backgroundColor: color }}
                                      animate={{
                                        scale: [1, 1.2, 1],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                      }}
                                    />
                                  ))}
                                </div>

                                <div className="space-y-2 text-xs text-white/50">
                                  <div>Energy: {reality.energy}</div>
                                  <div>Vibration: {reality.vibration}Hz</div>
                                </div>

                                {localSettings.theme === reality.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mt-4"
                                  >
                                    <Badge className="bg-cyan-400/20 text-cyan-400 border-cyan-400/50">
                                      Active Reality
                                    </Badge>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="portals" className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Manifestation Portals</h2>
                      <p className="text-white/60">Step through these portals to manifest your desires into reality</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {MANIFESTATION_PORTALS.map((portal, index) => {
                        const Icon = portal.icon;
                        return (
                          <motion.div
                            key={portal.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + 2 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all duration-500 hover:scale-105 border-2 ${
                                activePortal === portal.id
                                  ? `border-white bg-gradient-to-br ${portal.color} shadow-lg`
                                  : 'border-white/10 hover:border-white/30 bg-white/5'
                              }`}
                              onClick={() => portalEnergy >= 25 && activatePortal(portal.id)}
                            >
                              <CardContent className="p-6 text-center">
                                <motion.div
                                  className="mb-4"
                                  animate={activePortal === portal.id ? {
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1],
                                  } : {}}
                                  transition={{
                                    duration: 3,
                                    repeat: activePortal === portal.id ? Infinity : 0,
                                  }}
                                >
                                  <Icon className={`w-12 h-12 mx-auto mb-3 ${activePortal === portal.id ? 'text-white' : 'text-white/80'}`} />
                                </motion.div>

                                <h3 className="text-xl font-bold text-white mb-2">{portal.name}</h3>
                                <p className="text-white/60 text-sm mb-4">{portal.description}</p>

                                <div className={`text-xs mb-4 p-3 rounded-lg ${
                                  activePortal === portal.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/10 text-white/70'
                                }`}>
                                  "{portal.affirmation}"
                                </div>

                                <div className="space-y-2">
                                  <div className="text-xs text-white/50">Energy Cost: 25</div>
                                  {portalEnergy < 25 && (
                                    <div className="text-xs text-red-400">Insufficient Energy</div>
                                  )}
                                </div>

                                {activePortal === portal.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-4"
                                  >
                                    <Badge className="bg-white/20 text-white border-white/50 animate-pulse">
                                      Portal Active
                                    </Badge>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-4">Experience Matrix</h2>
                      <p className="text-white/60">Fine-tune your journey through the quantum realms</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Visual Settings */}
                      <Card className="border-cyan-400/30 bg-cyan-400/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-cyan-400">
                            <Eye className="w-5 h-5" />
                            Visual Matrix
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">
                              Particle Density: {localSettings.particleDensity}
                            </label>
                            <Slider
                              value={[localSettings.particleDensity]}
                              onValueChange={([value]) => updateSetting("particleDensity", value)}
                              min={10}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-white">Ambient Text</label>
                              <p className="text-xs text-white/60">Floating inspirational text</p>
                            </div>
                            <Switch
                              checked={localSettings.ambientTextEnabled}
                              onCheckedChange={(checked) => updateSetting("ambientTextEnabled", checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Audio Settings */}
                      <Card className="border-purple-400/30 bg-purple-400/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-purple-400">
                            <Volume2 className="w-5 h-5" />
                            Audio Matrix
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">
                              Master Volume: {Math.round(localSettings.volume * 100)}%
                            </label>
                            <Slider
                              value={[localSettings.volume]}
                              onValueChange={([value]) => updateSetting("volume", value)}
                              min={0}
                              max={1}
                              step={0.1}
                              className="w-full"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-white">Ambient Sounds</label>
                                <p className="text-xs text-white/60">Background audio</p>
                              </div>
                              <Switch checked={true} onCheckedChange={() => {}} />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-white">Binaural Beats</label>
                                <p className="text-xs text-white/60">Brainwave entrainment</p>
                              </div>
                              <Switch checked={true} onCheckedChange={() => {}} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Interaction Settings */}
                      <Card className="border-pink-400/30 bg-pink-400/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-pink-400">
                            <Zap className="w-5 h-5" />
                            Interaction Matrix
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-white">Haptic Feedback</label>
                              <p className="text-xs text-white/60">Vibration on interactions</p>
                            </div>
                            <Switch
                              checked={localSettings.hapticEnabled}
                              onCheckedChange={(checked) => updateSetting("hapticEnabled", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-white">Breathing Guide</label>
                              <p className="text-xs text-white/60">Visual breathing cues</p>
                            </div>
                            <Switch
                              checked={localSettings.breathingGuideEnabled}
                              onCheckedChange={(checked) => updateSetting("breathingGuideEnabled", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-white">Auto-start Breathing</label>
                              <p className="text-xs text-white/60">Begin breathing guide automatically</p>
                            </div>
                            <Switch
                              checked={localSettings.autoStartBreathing}
                              onCheckedChange={(checked) => updateSetting("autoStartBreathing", checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Session Settings */}
                      <Card className="border-yellow-400/30 bg-yellow-400/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-yellow-400">
                            <Timer className="w-5 h-5" />
                            Session Matrix
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-white mb-2 block">
                              Default Session Duration: {localSettings.sessionDuration} minutes
                            </label>
                            <Slider
                              value={[localSettings.sessionDuration]}
                              onValueChange={([value]) => updateSetting("sessionDuration", value)}
                              min={1}
                              max={60}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Quick Start Options</label>
                            <div className="flex gap-2 flex-wrap">
                              {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                                <Button
                                  key={mins}
                                  variant={localSettings.sessionDuration === mins ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateSetting("sessionDuration", mins)}
                                  className="text-xs"
                                >
                                  {mins}m
                                </Button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
