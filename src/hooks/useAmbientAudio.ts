import { useCallback, useRef, useEffect, useState } from "react";

interface AudioState {
  isPlaying: boolean;
  baseFrequency: number;
  volume: number;
}

export const useAmbientAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Create layered ambient tones
    const frequencies = [110, 165, 220, 330]; // A2, E3, A3, E4 - harmonious
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = i === 0 ? "sine" : i === 1 ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.value = i === 0 ? 0.3 : 0.15;
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      
      oscillatorsRef.current.push(osc);
      gainNodesRef.current.push(gain);
    });

    setIsInitialized(true);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) {
      initAudio();
      setIsMuted(false);
      setTimeout(() => {
        if (masterGainRef.current) {
          masterGainRef.current.gain.linearRampToValueAtTime(0.15, audioContextRef.current!.currentTime + 1);
        }
      }, 100);
      return;
    }

    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;

    if (isMuted) {
      if (ctx.state === "suspended") ctx.resume();
      masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
    } else {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }
    setIsMuted(!isMuted);
  }, [isMuted, initAudio]);

  const setProximity = useCallback((proximity: number) => {
    if (!audioContextRef.current || !masterGainRef.current || isMuted) return;
    
    const ctx = audioContextRef.current;
    const baseVolume = 0.15;
    const proximityBoost = proximity * 0.1;
    
    masterGainRef.current.gain.linearRampToValueAtTime(
      baseVolume + proximityBoost,
      ctx.currentTime + 0.1
    );

    // Shift frequencies based on proximity
    oscillatorsRef.current.forEach((osc, i) => {
      const baseFreqs = [110, 165, 220, 330];
      const shift = proximity * 20 * (i + 1);
      osc.frequency.linearRampToValueAtTime(baseFreqs[i] + shift, ctx.currentTime + 0.2);
    });
  }, [isMuted]);

  const playBreathTone = useCallback((phase: "inhale" | "hold" | "exhale") => {
    if (!audioContextRef.current || isMuted) return;
    
    const ctx = audioContextRef.current;
    const freqShift = phase === "inhale" ? 30 : phase === "exhale" ? -20 : 0;
    
    oscillatorsRef.current.forEach((osc, i) => {
      const baseFreqs = [110, 165, 220, 330];
      osc.frequency.linearRampToValueAtTime(
        baseFreqs[i] + freqShift * (i + 1) * 0.5,
        ctx.currentTime + 0.5
      );
    });
  }, [isMuted]);

  const playConnectionTone = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.value = 528; // "Love frequency"
    gain.gain.value = 0;
    
    osc.connect(gain);
    gain.connect(masterGainRef.current!);
    
    osc.start();
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    
    setTimeout(() => osc.stop(), 1100);
  }, [isMuted]);

  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      audioContextRef.current?.close();
    };
  }, []);

  return { 
    isInitialized, 
    isMuted, 
    toggleMute, 
    setProximity, 
    playBreathTone,
    playConnectionTone 
  };
};
