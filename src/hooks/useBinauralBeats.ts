import { useCallback, useRef, useState, useEffect } from "react";

export type BrainwaveState = "alpha" | "theta" | "delta" | "gamma" | "focus" | "off";

interface BinauralConfig {
  name: string;
  baseFrequency: number;
  beatFrequency: number;
  description: string;
}

export const BRAINWAVE_CONFIGS: Record<Exclude<BrainwaveState, "off">, BinauralConfig> = {
  alpha: {
    name: "Alpha Waves",
    baseFrequency: 200,
    beatFrequency: 10,
    description: "Relaxation & calm awareness",
  },
  theta: {
    name: "Theta Waves",
    baseFrequency: 180,
    beatFrequency: 6,
    description: "Deep meditation & creativity",
  },
  delta: {
    name: "Delta Waves",
    baseFrequency: 150,
    beatFrequency: 2,
    description: "Deep sleep & healing",
  },
  gamma: {
    name: "Gamma Waves",
    baseFrequency: 220,
    beatFrequency: 40,
    description: "Peak focus & insight",
  },
  focus: {
    name: "Focus Mode",
    baseFrequency: 200,
    beatFrequency: 14,
    description: "Concentration & learning",
  },
};

export const useBinauralBeats = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const [currentState, setCurrentState] = useState<BrainwaveState>("off");
  const [volume, setVolumeState] = useState(0.3);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Create stereo panning for binaural effect
    const merger = ctx.createChannelMerger(2);
    mergerRef.current = merger;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGainRef.current = masterGain;

    merger.connect(masterGain);
    masterGain.connect(ctx.destination);

    return ctx;
  }, []);

  const startBinauralBeat = useCallback((state: Exclude<BrainwaveState, "off">) => {
    const ctx = initAudio();
    const config = BRAINWAVE_CONFIGS[state];

    // Stop existing oscillators
    if (leftOscRef.current) {
      try { leftOscRef.current.stop(); } catch {}
    }
    if (rightOscRef.current) {
      try { rightOscRef.current.stop(); } catch {}
    }

    // Left ear oscillator
    const leftOsc = ctx.createOscillator();
    const leftGain = ctx.createGain();
    leftOsc.type = "sine";
    leftOsc.frequency.value = config.baseFrequency;
    leftGain.gain.value = volume;
    leftOsc.connect(leftGain);
    leftGain.connect(mergerRef.current!, 0, 0);
    leftOscRef.current = leftOsc;
    leftGainRef.current = leftGain;

    // Right ear oscillator (slightly different frequency for binaural beat)
    const rightOsc = ctx.createOscillator();
    const rightGain = ctx.createGain();
    rightOsc.type = "sine";
    rightOsc.frequency.value = config.baseFrequency + config.beatFrequency;
    rightGain.gain.value = volume;
    rightOsc.connect(rightGain);
    rightGain.connect(mergerRef.current!, 0, 1);
    rightOscRef.current = rightOsc;
    rightGainRef.current = rightGain;

    leftOsc.start();
    rightOsc.start();

    // Fade in
    if (ctx.state === "suspended") ctx.resume();
    masterGainRef.current!.gain.linearRampToValueAtTime(1, ctx.currentTime + 1);

    setCurrentState(state);
  }, [initAudio, volume]);

  const stopBinauralBeat = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    setTimeout(() => {
      if (leftOscRef.current) {
        try { leftOscRef.current.stop(); } catch {}
        leftOscRef.current = null;
      }
      if (rightOscRef.current) {
        try { rightOscRef.current.stop(); } catch {}
        rightOscRef.current = null;
      }
    }, 600);

    setCurrentState("off");
  }, []);

  const setBrainwaveState = useCallback((state: BrainwaveState) => {
    if (state === "off") {
      stopBinauralBeat();
    } else {
      startBinauralBeat(state);
    }
  }, [startBinauralBeat, stopBinauralBeat]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (leftGainRef.current) leftGainRef.current.gain.value = newVolume;
    if (rightGainRef.current) rightGainRef.current.gain.value = newVolume;
  }, []);

  useEffect(() => {
    return () => {
      if (leftOscRef.current) try { leftOscRef.current.stop(); } catch {}
      if (rightOscRef.current) try { rightOscRef.current.stop(); } catch {}
      audioContextRef.current?.close();
    };
  }, []);

  return {
    currentState,
    setBrainwaveState,
    volume,
    setVolume,
    configs: BRAINWAVE_CONFIGS,
  };
};
