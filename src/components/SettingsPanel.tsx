import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Palette, Volume2, Zap, Eye, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const THEMES = [
  { id: "cosmic", name: "Cosmic", colors: ["hsl(270 50% 20%)", "hsl(35 80% 60%)"] },
  { id: "ocean", name: "Ocean", colors: ["hsl(200 60% 25%)", "hsl(180 70% 50%)"] },
  { id: "forest", name: "Forest", colors: ["hsl(120 40% 20%)", "hsl(90 60% 45%)"] },
  { id: "sunset", name: "Sunset", colors: ["hsl(25 70% 30%)", "hsl(45 80% 60%)"] },
  { id: "aurora", name: "Aurora", colors: ["hsl(160 50% 25%)", "hsl(280 60% 55%)"] },
  { id: "minimal", name: "Minimal", colors: ["hsl(0 0% 15%)", "hsl(0 0% 70%)"] },
];

export const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
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
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card/95 backdrop-blur-md border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Experience Settings
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[70vh] overflow-y-auto">
                <Tabs defaultValue="visual" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="visual" className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Visual
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      Audio
                    </TabsTrigger>
                    <TabsTrigger value="interaction" className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Interaction
                    </TabsTrigger>
                    <TabsTrigger value="session" className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      Session
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="visual" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Theme</label>
                        <Select value={localSettings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {THEMES.map((theme) => (
                              <SelectItem key={theme.id} value={theme.id}>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {theme.colors.map((color, i) => (
                                      <div
                                        key={i}
                                        className="w-3 h-3 rounded-full border border-border/50"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  {theme.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
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
                          <label className="text-sm font-medium">Ambient Text</label>
                          <p className="text-xs text-muted-foreground">Floating inspirational text</p>
                        </div>
                        <Switch
                          checked={localSettings.ambientTextEnabled}
                          onCheckedChange={(checked) => updateSetting("ambientTextEnabled", checked)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="audio" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Ambient Sounds</label>
                            <p className="text-xs text-muted-foreground">Background audio</p>
                          </div>
                          <Switch checked={true} onCheckedChange={() => {}} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Binaural Beats</label>
                            <p className="text-xs text-muted-foreground">Brainwave entrainment</p>
                          </div>
                          <Switch checked={true} onCheckedChange={() => {}} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="interaction" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Haptic Feedback</label>
                          <p className="text-xs text-muted-foreground">Vibration on interactions</p>
                        </div>
                        <Switch
                          checked={localSettings.hapticEnabled}
                          onCheckedChange={(checked) => updateSetting("hapticEnabled", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Breathing Guide</label>
                          <p className="text-xs text-muted-foreground">Visual breathing cues</p>
                        </div>
                        <Switch
                          checked={localSettings.breathingGuideEnabled}
                          onCheckedChange={(checked) => updateSetting("breathingGuideEnabled", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Auto-start Breathing</label>
                          <p className="text-xs text-muted-foreground">Begin breathing guide automatically</p>
                        </div>
                        <Switch
                          checked={localSettings.autoStartBreathing}
                          onCheckedChange={(checked) => updateSetting("autoStartBreathing", checked)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="session" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
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

                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 border border-border/50 rounded-lg">
                          <h4 className="font-medium mb-2">Quick Start Options</h4>
                          <div className="flex gap-2 flex-wrap">
                            {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                              <Button
                                key={mins}
                                variant={localSettings.sessionDuration === mins ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSetting("sessionDuration", mins)}
                              >
                                {mins}m
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
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
