import { useCallback, useRef, useState, useEffect } from "react";

export type NatureSound = "rain" | "ocean" | "wind" | "forest" | "fire" | "off";

interface SoundConfig {
  name: string;
  emoji: string;
  description: string;
}

export const NATURE_CONFIGS: Record<Exclude<NatureSound, "off">, SoundConfig> = {
  rain: {
    name: "Gentle Rain",
    emoji: "🌧️",
    description: "Calming rainfall",
  },
  ocean: {
    name: "Ocean Waves",
    emoji: "🌊",
    description: "Rhythmic waves",
  },
  wind: {
    name: "Soft Wind",
    emoji: "💨",
    description: "Peaceful breeze",
  },
  forest: {
    name: "Forest Ambience",
    emoji: "🌲",
    description: "Nature sounds",
  },
  fire: {
    name: "Crackling Fire",
    emoji: "🔥",
    description: "Cozy fireplace",
  },
};

export const useNatureSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const modulatorRef = useRef<OscillatorNode | null>(null);
  const modulatorGainRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [currentSound, setCurrentSound] = useState<NatureSound>("off");
  const [volume, setVolumeState] = useState(0.4);

  const createNoiseBuffer = useCallback((ctx: AudioContext, type: NatureSound): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      switch (type) {
        case "rain":
          // Pink-ish noise for rain
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = white * 0.5 + (i > 0 ? data[i - 1] * 0.5 : 0);
          }
          break;

        case "ocean":
          // Modulated noise for waves
          for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            const wave = Math.sin(t * 0.3) * 0.5 + 0.5;
            const white = Math.random() * 2 - 1;
            data[i] = white * wave * 0.7;
          }
          break;

        case "wind":
          // Brown noise for wind
          let lastValue = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastValue = (lastValue + 0.02 * white) / 1.02;
            data[i] = lastValue * 3.5;
          }
          break;

        case "forest":
          // Layered noise with occasional chirps
          for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            const base = (Math.random() * 2 - 1) * 0.15;
            const chirp = Math.sin(t * 1500) * Math.exp(-((t % 0.5) * 10)) * 0.1;
            data[i] = base + (Math.random() > 0.995 ? chirp : 0);
          }
          break;

        case "fire":
          // Crackling fire
          for (let i = 0; i < bufferSize; i++) {
            const crackle = Math.random() > 0.97 ? (Math.random() * 2 - 1) * 0.8 : 0;
            const base = (Math.random() * 2 - 1) * 0.2;
            data[i] = base * 0.5 + crackle;
          }
          break;

        default:
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
      }
    }

    return buffer;
  }, []);

  const getFilterSettings = (type: NatureSound) => {
    switch (type) {
      case "rain":
        return { type: "lowpass" as BiquadFilterType, frequency: 3000, Q: 0.5 };
      case "ocean":
        return { type: "lowpass" as BiquadFilterType, frequency: 800, Q: 1 };
      case "wind":
        return { type: "lowpass" as BiquadFilterType, frequency: 500, Q: 0.7 };
      case "forest":
        return { type: "bandpass" as BiquadFilterType, frequency: 2000, Q: 0.3 };
      case "fire":
        return { type: "bandpass" as BiquadFilterType, frequency: 1500, Q: 0.5 };
      default:
        return { type: "lowpass" as BiquadFilterType, frequency: 2000, Q: 1 };
    }
  };

  const startSound = useCallback((sound: Exclude<NatureSound, "off">) => {
    // Stop existing
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch {}
    }
    if (modulatorRef.current) {
      try { modulatorRef.current.stop(); } catch {}
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const ctx = audioContextRef.current || new AudioContext();
    audioContextRef.current = ctx;

    if (ctx.state === "suspended") ctx.resume();

    // Create noise buffer
    const buffer = createNoiseBuffer(ctx, sound);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    noiseSourceRef.current = source;

    // Create filter
    const filter = ctx.createBiquadFilter();
    const filterSettings = getFilterSettings(sound);
    filter.type = filterSettings.type;
    filter.frequency.value = filterSettings.frequency;
    filter.Q.value = filterSettings.Q;
    filterRef.current = filter;

    // Create gain
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNodeRef.current = gainNode;

    // Connect nodes
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Add modulation for ocean waves
    if (sound === "ocean") {
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      modulator.frequency.value = 0.1;
      modGain.gain.value = 300;
      modulator.connect(modGain);
      modGain.connect(filter.frequency);
      modulator.start();
      modulatorRef.current = modulator;
      modulatorGainRef.current = modGain;
    }

    // Start and fade in
    source.start();
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);

    setCurrentSound(sound);
  }, [createNoiseBuffer, volume]);

  const stopSound = useCallback(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    setTimeout(() => {
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch {}
        noiseSourceRef.current = null;
      }
      if (modulatorRef.current) {
        try { modulatorRef.current.stop(); } catch {}
        modulatorRef.current = null;
      }
    }, 600);

    setCurrentSound("off");
  }, []);

  const setNatureSound = useCallback((sound: NatureSound) => {
    if (sound === "off") {
      stopSound();
    } else {
      startSound(sound);
    }
  }, [startSound, stopSound]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(
        newVolume,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (noiseSourceRef.current) try { noiseSourceRef.current.stop(); } catch {}
      if (modulatorRef.current) try { modulatorRef.current.stop(); } catch {}
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  return {
    currentSound,
    setNatureSound,
    volume,
    setVolume,
    configs: NATURE_CONFIGS,
  };
};
