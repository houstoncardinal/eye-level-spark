import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Rocket,
  Zap,
  Star,
  Target,
  Navigation,
  Fuel,
  Shield,
  Crosshair,
  RotateCcw,
  Play,
  Pause,
  Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMeditationGame } from "@/hooks/useMeditationGame";

interface SpaceShipProps {
  isActive: boolean;
  onClose: () => void;
  cosmicDepth: number;
  onDepthChange: (depth: number) => void;
}

interface SpaceLocation {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'nebula' | 'blackhole';
  x: number;
  y: number;
  reward: number;
  description: string;
  emoji: string;
  meditationBonus: number;
}

const SPACE_LOCATIONS: SpaceLocation[] = [
  { id: 'earth', name: 'Earth', type: 'planet', x: 10, y: 50, reward: 50, description: 'Home sweet home', emoji: '🌍', meditationBonus: 1.2 },
  { id: 'mars', name: 'Mars', type: 'planet', x: 25, y: 30, reward: 75, description: 'The red planet', emoji: '🔴', meditationBonus: 1.3 },
  { id: 'venus', name: 'Venus', type: 'planet', x: 40, y: 70, reward: 60, description: 'Morning star', emoji: '⭐', meditationBonus: 1.25 },
  { id: 'jupiter', name: 'Jupiter', type: 'planet', x: 60, y: 20, reward: 100, description: 'Gas giant', emoji: '🪐', meditationBonus: 1.4 },
  { id: 'saturn', name: 'Saturn', type: 'planet', x: 75, y: 60, reward: 90, description: 'Ringed wonder', emoji: '🪐', meditationBonus: 1.35 },
  { id: 'sun', name: 'Sun', type: 'star', x: 50, y: 50, reward: 150, description: 'Source of life', emoji: '☀️', meditationBonus: 1.5 },
  { id: 'orion', name: 'Orion Nebula', type: 'nebula', x: 80, y: 30, reward: 120, description: 'Stellar nursery', emoji: '🌌', meditationBonus: 1.45 },
  { id: 'andromeda', name: 'Andromeda', type: 'nebula', x: 90, y: 80, reward: 200, description: 'Nearest galaxy', emoji: '🌌', meditationBonus: 1.6 },
];

export const SpaceShip = ({ isActive, onClose, cosmicDepth, onDepthChange }: SpaceShipProps) => {
  const [shipPosition, setShipPosition] = useState({ x: 10, y: 50 });
  const [fuel, setFuel] = useState(100);
  const [shields, setShields] = useState(100);
  const [isPiloting, setIsPiloting] = useState(false);
  const [targetLocation, setTargetLocation] = useState<SpaceLocation | null>(null);
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set());
  const [cosmicEnergy, setCosmicEnergy] = useState(0);

  const { gameStats, addPoints, exploreCosmic } = useMeditationGame();
  const shipControls = useAnimation();

  // Ship upgrades based on meditation level
  const shipLevel = Math.min(gameStats.level, 5);
  const maxFuel = 80 + (shipLevel * 20); // 100-180
  const maxShields = 80 + (shipLevel * 20); // 100-180
  const fuelEfficiency = 1 - (shipLevel * 0.1); // Better fuel efficiency at higher levels

  useEffect(() => {
    if (isActive && fuel < maxFuel) {
      const interval = setInterval(() => {
        setFuel(prev => Math.min(prev + 2, maxFuel));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive, fuel, maxFuel]);

  const moveShip = useCallback((targetX: number, targetY: number) => {
    if (fuel < 10) return; // Need minimum fuel

    const distance = Math.sqrt(Math.pow(targetX - shipPosition.x, 2) + Math.pow(targetY - shipPosition.y, 2));
    const fuelCost = Math.ceil(distance * fuelEfficiency);

    if (fuelCost > fuel) return; // Not enough fuel

    setFuel(prev => prev - fuelCost);
    setShipPosition({ x: targetX, y: targetY });

    // Animate ship movement
    shipControls.start({
      x: `${targetX}%`,
      y: `${targetY}%`,
      transition: { duration: 2, ease: "easeInOut" }
    });

    // Update cosmic depth based on position
    const newDepth = Math.min(targetX / 100, 1);
    onDepthChange(newDepth);

    // Explore cosmic areas
    exploreCosmic(newDepth * 10);

    // Check for location visits
    const location = SPACE_LOCATIONS.find(loc =>
      Math.abs(loc.x - targetX) < 5 && Math.abs(loc.y - targetY) < 5
    );

    if (location && !visitedLocations.has(location.id)) {
      setVisitedLocations(prev => new Set([...prev, location.id]));
      addPoints(location.reward);
      setCosmicEnergy(prev => prev + location.reward);

      // Show reward animation
      setTargetLocation(location);
      setTimeout(() => setTargetLocation(null), 3000);
    }
  }, [fuel, fuelEfficiency, shipPosition, shipControls, onDepthChange, exploreCosmic, visitedLocations, addPoints]);

  const autoPilotToLocation = useCallback((location: SpaceLocation) => {
    if (!isPiloting) {
      setIsPiloting(true);
      moveShip(location.x, location.y);
      setTimeout(() => setIsPiloting(false), 2000);
    }
  }, [isPiloting, moveShip]);

  const rechargeAtStar = useCallback(() => {
    const nearestStar = SPACE_LOCATIONS.find(loc => loc.type === 'star');
    if (nearestStar) {
      moveShip(nearestStar.x, nearestStar.y);
      setTimeout(() => {
        setFuel(maxFuel);
        setShields(maxShields);
        addPoints(25); // Bonus for recharging
      }, 2000);
    }
  }, [moveShip, maxFuel, maxShields, addPoints]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-card/95 backdrop-blur-md border-border/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                Meditation Spacecraft - Level {shipLevel}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={rechargeAtStar}>
                  <Zap className="w-4 h-4 mr-1" />
                  Recharge
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <Home className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Space Map */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
                        {/* Starfield background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20">
                          {[...Array(50)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`
                              }}
                            />
                          ))}
                        </div>

                        {/* Space locations */}
                        {SPACE_LOCATIONS.map((location) => (
                          <motion.button
                            key={location.id}
                            className="absolute w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                            style={{
                              left: `${location.x}%`,
                              top: `${location.y}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            onClick={() => autoPilotToLocation(location)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {location.emoji}
                          </motion.button>
                        ))}

                        {/* Spaceship */}
                        <motion.div
                          className="absolute text-2xl"
                          animate={shipControls}
                          initial={{ x: '10%', y: '50%' }}
                          style={{
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          🚀
                        </motion.div>

                        {/* Cosmic depth indicator */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex justify-between text-xs text-white/70 mb-1">
                            <span>Nebula</span>
                            <span>Void</span>
                            <span>Core</span>
                            <span>Event Horizon</span>
                          </div>
                          <Progress value={cosmicDepth * 100} className="h-2" />
                        </div>
                      </div>

                      {/* Ship Stats */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Fuel className="w-3 h-3" />
                              Fuel
                            </span>
                            <span>{fuel}/{maxFuel}</span>
                          </div>
                          <Progress value={(fuel / maxFuel) * 100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Shields
                            </span>
                            <span>{shields}/{maxShields}</span>
                          </div>
                          <Progress value={(shields / maxShields) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Control Panel */}
                <div className="space-y-4">
                  {/* Cosmic Energy */}
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">⚡</div>
                      <div className="text-2xl font-bold text-yellow-400">{cosmicEnergy}</div>
                      <div className="text-sm text-muted-foreground">Cosmic Energy</div>
                    </CardContent>
                  </Card>

                  {/* Ship Upgrades */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ship Upgrades</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Fuel Capacity</span>
                        <Badge variant="secondary">{maxFuel}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shield Strength</span>
                        <Badge variant="secondary">{maxShields}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fuel Efficiency</span>
                        <Badge variant="secondary">{(fuelEfficiency * 100).toFixed(0)}%</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Meditation Bonus</span>
                        <Badge variant="secondary">+{((shipLevel - 1) * 10)}%</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Info */}
                  {targetLocation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{targetLocation.emoji}</span>
                            <div>
                              <h4 className="font-semibold">{targetLocation.name}</h4>
                              <p className="text-sm text-muted-foreground">{targetLocation.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Reward: +{targetLocation.reward} points</span>
                            <span>Bonus: {targetLocation.meditationBonus}x</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Visited Locations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Explored Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {SPACE_LOCATIONS.map((location) => (
                          <div
                            key={location.id}
                            className={`text-center p-2 rounded text-sm ${
                              visitedLocations.has(location.id)
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {location.emoji}
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-2 text-sm text-muted-foreground">
                        {visitedLocations.size}/{SPACE_LOCATIONS.length} explored
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Travel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        size="sm"
                        onClick={() => moveShip(10, 50)}
                        disabled={fuel < 10}
                        className="w-full"
                      >
                        <Home className="w-3 h-3 mr-1" />
                        Return to Earth
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => moveShip(50, 50)}
                        disabled={fuel < 20}
                        className="w-full"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Visit Sun
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => moveShip(90, 80)}
                        disabled={fuel < 30}
                        className="w-full"
                      >
                        <Target className="w-3 h-3 mr-1" />
                        Explore Andromeda
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
