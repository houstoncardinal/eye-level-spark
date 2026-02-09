import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, RotateCcw, X, Waves, Wind, CloudRain, Flame, Bird, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface SoundscapeMixerProps {
  isOpen: boolean;
  onClose: () => void;
  masterVolume: number;
  onVolumeChange: (volume: number) => void;
}

interface SoundLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  volume: number;
  enabled: boolean;
  audioBuffer?: AudioBuffer;
  source?: AudioBufferSourceNode;
  gainNode?: GainNode;
}

const SOUND_LAYERS: Omit<SoundLayer, 'volume' | 'enabled' | 'audioBuffer' | 'source' | 'gainNode'>[] = [
  { id: "ocean", name: "Ocean Waves", icon: <Waves className="w-4 h-4" /> },
  { id: "rain", name: "Gentle Rain", icon: <CloudRain className="w-4 h-4" /> },
  { id: "wind", name: "Soft Wind", icon: <Wind className="w-4 h-4" /> },
  { id: "fire", name: "Crackling Fire", icon: <Flame className="w-4 h-4" /> },
  { id: "birds", name: "Forest Birds", icon: <Bird className="w-4 h-4" /> },
  { id: "bells", name: "Tibetan Bells", icon: <Bell className="w-4 h-4" /> },
];

const PRESETS = [
  {
    id: "beach",
    name: "Beach Paradise",
    description: "Ocean waves with distant seagulls",
    layers: { ocean: 0.8, wind: 0.3, birds: 0.4 }
  },
  {
    id: "forest",
    name: "Enchanted Forest",
    description: "Birds singing in a gentle breeze",
    layers: { birds: 0.7, wind: 0.5, rain: 0.2 }
  },
  {
    id: "storm",
    name: "Summer Storm",
    description: "Thunder and rain with wind",
    layers: { rain: 0.9, wind: 0.6 }
  },
  {
    id: "fireplace",
    name: "Cozy Fireplace",
    description: "Crackling fire with ambient warmth",
    layers: { fire: 0.8, wind: 0.2 }
  },
  {
    id: "temple",
    name: "Sacred Temple",
    description: "Tibetan bells with gentle wind",
    layers: { bells: 0.6, wind: 0.4, rain: 0.1 }
  },
  {
    id: "meditation",
    name: "Deep Meditation",
    description: "Minimal ambient sounds for focus",
    layers: { bells: 0.3, wind: 0.2 }
  }
];

export const SoundscapeMixer = ({ isOpen, onClose, masterVolume, onVolumeChange }: SoundscapeMixerProps) => {
  const [soundLayers, setSoundLayers] = useState<SoundLayer[]>(() =>
    SOUND_LAYERS.map(layer => ({
      ...layer,
      volume: 0.5,
      enabled: false
    }))
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);

  const loadAudioBuffer = async (soundId: string): Promise<AudioBuffer | null> => {
    try {
      // In a real app, these would be actual audio files
      // For demo purposes, we'll create synthetic sounds
      const ctx = audioContextRef.current;
      if (!ctx) return null;

      const sampleRate = ctx.sampleRate;
      const duration = 10; // 10 seconds of loop
      const frameCount = sampleRate * duration;
      const buffer = ctx.createBuffer(1, frameCount, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Generate different sounds based on type
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;

        switch (soundId) {
          case "ocean":
            // Ocean waves - combination of sine waves
            channelData[i] = (
              Math.sin(t * 0.5) * 0.3 +
              Math.sin(t * 1.2) * 0.2 +
              Math.sin(t * 2.1) * 0.1
            ) * Math.sin(t * 0.1) * 0.5;
            break;

          case "rain":
            // Rain - white noise filtered
            channelData[i] = (Math.random() - 0.5) * Math.exp(-t % 0.1) * 0.3;
            break;

          case "wind":
            // Wind - filtered noise with modulation
            channelData[i] = (Math.random() - 0.5) * Math.sin(t * 0.3) * 0.4;
            break;

          case "fire":
            // Fire - crackling sound
            channelData[i] = Math.random() > 0.95 ? (Math.random() - 0.5) * 2 : 0;
            break;

          case "birds":
            // Birds - occasional chirps
            const chirp = Math.sin(t * 1000) * Math.exp(-t % 0.5) * 0.2;
            channelData[i] = Math.random() > 0.98 ? chirp : 0;
            break;

          case "bells":
            // Bells - harmonic tones
            channelData[i] = (
              Math.sin(t * 440) * 0.4 +
              Math.sin(t * 554) * 0.3 +
              Math.sin(t * 659) * 0.2
            ) * Math.exp(-t % 2) * 0.3;
            break;

          default:
            channelData[i] = 0;
        }
      }

      return buffer;
    } catch (error) {
      console.error("Error loading audio:", error);
      return null;
    }
  };

  const playSound = async (layer: SoundLayer) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const buffer = await loadAudioBuffer(layer.id);
      if (!buffer) return;

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      source.loop = true;
      gainNode.gain.value = layer.volume;

      source.connect(gainNode);
      gainNode.connect(masterGain);

      source.start();

      setSoundLayers(prev => prev.map(l =>
        l.id === layer.id
          ? { ...l, source, gainNode, audioBuffer: buffer }
          : l
      ));
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const stopSound = (layerId: string) => {
    setSoundLayers(prev => prev.map(layer => {
      if (layer.id === layerId && layer.source) {
        try {
          layer.source.stop();
        } catch (e) {
          // Source might already be stopped
        }
        return { ...layer, source: undefined, gainNode: undefined };
      }
      return layer;
    }));
  };

  const updateLayerVolume = (layerId: string, volume: number) => {
    setSoundLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        if (layer.gainNode) {
          layer.gainNode.gain.value = volume;
        }
        return { ...layer, volume };
      }
      return layer;
    }));
  };

  const toggleLayer = async (layerId: string) => {
    const layer = soundLayers.find(l => l.id === layerId);
    if (!layer) return;

    if (layer.enabled) {
      stopSound(layerId);
      setSoundLayers(prev => prev.map(l =>
        l.id === layerId ? { ...l, enabled: false } : l
      ));
    } else {
      await playSound(layer);
      setSoundLayers(prev => prev.map(l =>
        l.id === layerId ? { ...l, enabled: true } : l
      ));
    }
  };

  const applyPreset = async (preset: typeof PRESETS[0]) => {
    // Stop all currently playing sounds
    soundLayers.forEach(layer => {
      if (layer.enabled) {
        stopSound(layer.id);
      }
    });

    // Reset all layers
    setSoundLayers(prev => prev.map(layer => ({
      ...layer,
      enabled: false,
      volume: 0.5
    })));

    // Apply preset after a short delay
    setTimeout(async () => {
      for (const [layerId, volume] of Object.entries(preset.layers)) {
        const layer = soundLayers.find(l => l.id === layerId);
        if (layer) {
          const updatedLayer = { ...layer, volume, enabled: true };
          await playSound(updatedLayer);
          setSoundLayers(prev => prev.map(l =>
            l.id === layerId ? updatedLayer : l
          ));
        }
      }
    }, 100);
  };

  const stopAll = () => {
    soundLayers.forEach(layer => {
      if (layer.enabled) {
        stopSound(layer.id);
      }
    });
    setSoundLayers(prev => prev.map(layer => ({ ...layer, enabled: false })));
    setIsPlaying(false);
  };

  // Stop all sounds when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopAll();
    }
  }, [isOpen]);

  const resetMixer = () => {
    stopAll();
    setSoundLayers(prev => prev.map(layer => ({ ...layer, volume: 0.5 })));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Soundscape Mixer
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[75vh] overflow-y-auto">
                {/* Master Controls */}
                <div className="flex items-center gap-4 mb-6 p-4 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetMixer}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopAll}
                      className="flex items-center gap-1"
                    >
                      <VolumeX className="w-3 h-3" />
                      Stop All
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center gap-4">
                    <span className="text-sm font-medium">Master Volume</span>
                    <Slider
                      value={[masterVolume]}
                      onValueChange={([value]) => onVolumeChange(value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12">
                      {Math.round(masterVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PRESETS.map((preset) => (
                      <Card
                        key={preset.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => applyPreset(preset)}
                      >
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm">{preset.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                          <div className="flex gap-1 mt-2">
                            {Object.keys(preset.layers).map(layerId => {
                              const layer = SOUND_LAYERS.find(l => l.id === layerId);
                              return layer ? (
                                <Badge key={layerId} variant="secondary" className="text-xs px-1 py-0">
                                  {layer.icon}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Individual Sound Layers */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Sound Layers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {soundLayers.map((layer) => (
                      <Card key={layer.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {layer.icon}
                            <span className="font-medium">{layer.name}</span>
                          </div>
                          <Switch
                            checked={layer.enabled}
                            onCheckedChange={() => toggleLayer(layer.id)}
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <VolumeX className="w-4 h-4 text-muted-foreground" />
                          <Slider
                            value={[layer.volume]}
                            onValueChange={([value]) => updateLayerVolume(layer.id, value)}
                            min={0}
                            max={1}
                            step={0.1}
                            className="flex-1"
                            disabled={!layer.enabled}
                          />
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground w-10">
                            {Math.round(layer.volume * 100)}%
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Active Sounds Indicator */}
                <div className="mt-6 p-4 border border-border/50 rounded-lg">
                  <h4 className="font-medium mb-2">Active Sounds</h4>
                  <div className="flex flex-wrap gap-2">
                    {soundLayers.filter(l => l.enabled).map(layer => (
                      <Badge key={layer.id} variant="default" className="flex items-center gap-1">
                        {layer.icon}
                        {layer.name}
                      </Badge>
                    ))}
                    {soundLayers.filter(l => l.enabled).length === 0 && (
                      <span className="text-sm text-muted-foreground">No sounds active</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
