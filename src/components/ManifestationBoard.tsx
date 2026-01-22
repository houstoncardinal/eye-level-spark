import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X, Plus, Trash2, Star, Heart, Sparkles, Target, Flame,
  Sun, Moon, Zap, Crown, Eye, Compass, Mountain, Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHaptic } from "@/hooks/useHaptic";

interface ManifestationBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Manifestation {
  id: string;
  title: string;
  description: string;
  affirmation: string;
  category: "abundance" | "love" | "health" | "career" | "spiritual" | "creativity";
  icon: string;
  color: string;
  energy: number; // 0-100
  createdAt: string;
  lastEmpowered: string;
  empowerCount: number;
}

const CATEGORIES = {
  abundance: { icon: Crown, color: "#F59E0B", label: "Abundance" },
  love: { icon: Heart, color: "#EC4899", label: "Love" },
  health: { icon: Sun, color: "#22C55E", label: "Health" },
  career: { icon: Mountain, color: "#3B82F6", label: "Career" },
  spiritual: { icon: Eye, color: "#8B5CF6", label: "Spiritual" },
  creativity: { icon: Sparkles, color: "#06B6D4", label: "Creativity" },
};

const ICONS = [
  { name: "star", component: Star },
  { name: "heart", component: Heart },
  { name: "sparkles", component: Sparkles },
  { name: "target", component: Target },
  { name: "flame", component: Flame },
  { name: "sun", component: Sun },
  { name: "moon", component: Moon },
  { name: "zap", component: Zap },
  { name: "crown", component: Crown },
  { name: "eye", component: Eye },
  { name: "compass", component: Compass },
  { name: "mountain", component: Mountain },
  { name: "waves", component: Waves },
];

const AFFIRMATION_TEMPLATES = {
  abundance: [
    "Money flows to me easily and abundantly",
    "I am worthy of financial freedom",
    "Prosperity surrounds me in all areas of life",
  ],
  love: [
    "I am worthy of deep, meaningful love",
    "Love flows into my life effortlessly",
    "I radiate love and attract loving relationships",
  ],
  health: [
    "My body is healthy, strong, and vibrant",
    "Every cell in my body radiates with wellness",
    "I nurture my body with love and care",
  ],
  career: [
    "Success comes naturally to me",
    "I am creating my dream career",
    "Opportunities flow to me easily",
  ],
  spiritual: [
    "I am connected to infinite wisdom",
    "My intuition guides me perfectly",
    "I am one with the universe",
  ],
  creativity: [
    "Creative ideas flow through me constantly",
    "I express my unique gifts with joy",
    "My creativity knows no bounds",
  ],
};

const STORAGE_KEY = "sublime-manifestation-board";

export const ManifestationBoard = ({ isOpen, onClose }: ManifestationBoardProps) => {
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedManifestation, setSelectedManifestation] = useState<Manifestation | null>(null);
  const [isEmpowering, setIsEmpowering] = useState(false);
  const [newManifestation, setNewManifestation] = useState({
    title: "",
    description: "",
    affirmation: "",
    category: "abundance" as Manifestation["category"],
    icon: "star",
  });
  const { mediumTap, heavyTap, pulse } = useHaptic();

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setManifestations(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save to localStorage
  const save = (items: Manifestation[]) => {
    setManifestations(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  // Add new manifestation
  const addManifestation = () => {
    if (!newManifestation.title) return;

    const category = CATEGORIES[newManifestation.category];
    const manifestation: Manifestation = {
      id: Date.now().toString(),
      title: newManifestation.title,
      description: newManifestation.description,
      affirmation: newManifestation.affirmation || AFFIRMATION_TEMPLATES[newManifestation.category][0],
      category: newManifestation.category,
      icon: newManifestation.icon,
      color: category.color,
      energy: 10,
      createdAt: new Date().toISOString(),
      lastEmpowered: new Date().toISOString(),
      empowerCount: 0,
    };

    save([...manifestations, manifestation]);
    setIsAdding(false);
    setNewManifestation({
      title: "",
      description: "",
      affirmation: "",
      category: "abundance",
      icon: "star",
    });
    heavyTap();
  };

  // Empower manifestation (charge it with energy)
  const empowerManifestation = async (id: string) => {
    setIsEmpowering(true);

    // Pulse haptic during empowerment
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 300));
      pulse();
    }

    setManifestations(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              energy: Math.min(100, m.energy + 15),
              lastEmpowered: new Date().toISOString(),
              empowerCount: m.empowerCount + 1,
            }
          : m
      )
    );

    save(
      manifestations.map(m =>
        m.id === id
          ? {
              ...m,
              energy: Math.min(100, m.energy + 15),
              lastEmpowered: new Date().toISOString(),
              empowerCount: m.empowerCount + 1,
            }
          : m
      )
    );

    setIsEmpowering(false);
    heavyTap();
  };

  // Delete manifestation
  const deleteManifestation = (id: string) => {
    save(manifestations.filter(m => m.id !== id));
    if (selectedManifestation?.id === id) setSelectedManifestation(null);
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    return ICONS.find(i => i.name === iconName)?.component || Star;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-6xl h-[85vh] bg-gradient-to-br from-violet-950/90 via-purple-950/90 to-indigo-950/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">Manifestation Board</h2>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Intention
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Board Content */}
            <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  const count = manifestations.filter(m => m.category === key).length;
                  return (
                    <Badge
                      key={key}
                      variant="outline"
                      className="cursor-pointer px-3 py-1"
                      style={{ borderColor: category.color + "50" }}
                    >
                      <Icon className="w-3 h-3 mr-1" style={{ color: category.color }} />
                      {category.label} ({count})
                    </Badge>
                  );
                })}
              </div>

              {/* Manifestation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {manifestations.map((manifestation) => {
                  const IconComponent = getIconComponent(manifestation.icon);
                  const category = CATEGORIES[manifestation.category];
                  const CategoryIcon = category.icon;

                  return (
                    <motion.div
                      key={manifestation.id}
                      className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 cursor-pointer overflow-hidden group"
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => setSelectedManifestation(manifestation)}
                      layout
                    >
                      {/* Energy glow effect */}
                      <motion.div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${manifestation.color}40 0%, transparent 70%)`,
                        }}
                        animate={{
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      />

                      {/* Icon */}
                      <div className="flex items-start justify-between mb-3">
                        <motion.div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: manifestation.color + "30" }}
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <IconComponent className="w-6 h-6" style={{ color: manifestation.color }} />
                        </motion.div>
                        <Badge
                          className="text-xs"
                          style={{ backgroundColor: category.color + "30", color: category.color }}
                        >
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {category.label}
                        </Badge>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-white font-semibold text-lg mb-1">{manifestation.title}</h3>
                      <p className="text-white/60 text-sm line-clamp-2 mb-3">{manifestation.description}</p>

                      {/* Energy bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/50">Manifestation Energy</span>
                          <span style={{ color: manifestation.color }}>{manifestation.energy}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: manifestation.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${manifestation.energy}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Affirmation preview */}
                      <p className="text-white/40 text-xs italic line-clamp-1">
                        "{manifestation.affirmation}"
                      </p>

                      {/* Hover overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            empowerManifestation(manifestation.id);
                          }}
                          disabled={isEmpowering}
                          style={{ backgroundColor: manifestation.color }}
                        >
                          <Flame className="w-4 h-4 mr-1" />
                          Empower
                        </Button>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Empty state */}
                {manifestations.length === 0 && (
                  <motion.div
                    className="col-span-full flex flex-col items-center justify-center py-16 text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Sparkles className="w-16 h-16 mb-4" />
                    <p className="text-lg">Your manifestation board is empty</p>
                    <p className="text-sm mt-2">Create your first intention to begin manifesting</p>
                    <Button className="mt-6" onClick={() => setIsAdding(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Intention
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Add Manifestation Modal */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-full max-w-lg bg-gradient-to-br from-violet-900/90 to-purple-900/90 rounded-2xl p-6 border border-white/20"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Create New Intention</h3>

                    <div className="space-y-4">
                      <Input
                        placeholder="What do you want to manifest?"
                        value={newManifestation.title}
                        onChange={(e) => setNewManifestation(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/10 border-white/20"
                      />

                      <Textarea
                        placeholder="Describe your intention in detail..."
                        value={newManifestation.description}
                        onChange={(e) => setNewManifestation(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/10 border-white/20"
                      />

                      {/* Category selection */}
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(CATEGORIES).map(([key, category]) => {
                            const Icon = category.icon;
                            return (
                              <Button
                                key={key}
                                variant={newManifestation.category === key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNewManifestation(prev => ({ ...prev, category: key as Manifestation["category"] }))}
                                style={{
                                  borderColor: newManifestation.category === key ? category.color : undefined,
                                  backgroundColor: newManifestation.category === key ? category.color + "40" : undefined,
                                }}
                              >
                                <Icon className="w-4 h-4 mr-1" style={{ color: category.color }} />
                                {category.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Icon selection */}
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Choose an Icon</label>
                        <div className="flex flex-wrap gap-2">
                          {ICONS.map(({ name, component: Icon }) => (
                            <Button
                              key={name}
                              variant={newManifestation.icon === name ? "default" : "outline"}
                              size="icon"
                              onClick={() => setNewManifestation(prev => ({ ...prev, icon: name }))}
                            >
                              <Icon className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Affirmation */}
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Affirmation</label>
                        <Textarea
                          placeholder="Write your personal affirmation..."
                          value={newManifestation.affirmation}
                          onChange={(e) => setNewManifestation(prev => ({ ...prev, affirmation: e.target.value }))}
                          className="bg-white/10 border-white/20"
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {AFFIRMATION_TEMPLATES[newManifestation.category].map((template, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="cursor-pointer text-xs"
                              onClick={() => setNewManifestation(prev => ({ ...prev, affirmation: template }))}
                            >
                              {template.substring(0, 30)}...
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button onClick={addManifestation} className="flex-1">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Intention
                        </Button>
                        <Button variant="outline" onClick={() => setIsAdding(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manifestation Detail Modal */}
            <AnimatePresence>
              {selectedManifestation && (
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedManifestation(null)}
                >
                  <motion.div
                    className="w-full max-w-lg bg-gradient-to-br from-violet-900/90 to-purple-900/90 rounded-2xl p-6 border border-white/20"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const IconComponent = getIconComponent(selectedManifestation.icon);
                      const category = CATEGORIES[selectedManifestation.category];

                      return (
                        <>
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: selectedManifestation.color + "30" }}
                                animate={{
                                  scale: [1, 1.1, 1],
                                  boxShadow: [
                                    `0 0 20px ${selectedManifestation.color}40`,
                                    `0 0 40px ${selectedManifestation.color}60`,
                                    `0 0 20px ${selectedManifestation.color}40`,
                                  ],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                              >
                                <IconComponent className="w-8 h-8" style={{ color: selectedManifestation.color }} />
                              </motion.div>
                              <div>
                                <h3 className="text-xl font-bold text-white">{selectedManifestation.title}</h3>
                                <Badge style={{ backgroundColor: category.color + "30", color: category.color }}>
                                  {category.label}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => {
                                deleteManifestation(selectedManifestation.id);
                                setSelectedManifestation(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <p className="text-white/80 mb-4">{selectedManifestation.description}</p>

                          {/* Affirmation card */}
                          <motion.div
                            className="bg-white/10 rounded-xl p-4 mb-4"
                            animate={{
                              borderColor: [`${selectedManifestation.color}30`, `${selectedManifestation.color}60`, `${selectedManifestation.color}30`],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{ border: "2px solid" }}
                          >
                            <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Daily Affirmation</p>
                            <motion.p
                              className="text-white text-lg italic"
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              "{selectedManifestation.affirmation}"
                            </motion.p>
                          </motion.div>

                          {/* Energy bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-white/70">Manifestation Energy</span>
                              <span style={{ color: selectedManifestation.color }}>
                                {selectedManifestation.energy}%
                              </span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: selectedManifestation.color }}
                                animate={{ width: `${selectedManifestation.energy}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-2xl font-bold text-white">{selectedManifestation.empowerCount}</p>
                              <p className="text-white/50 text-xs">Times Empowered</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-2xl font-bold text-white">
                                {Math.floor((Date.now() - new Date(selectedManifestation.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                              </p>
                              <p className="text-white/50 text-xs">Days Active</p>
                            </div>
                          </div>

                          {/* Empower button */}
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => empowerManifestation(selectedManifestation.id)}
                            disabled={isEmpowering}
                            style={{ backgroundColor: selectedManifestation.color }}
                          >
                            {isEmpowering ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <>
                                <Flame className="w-5 h-5 mr-2" />
                                Empower This Intention
                              </>
                            )}
                          </Button>
                        </>
                      );
                    })()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
