import { useCallback, useRef, useEffect } from "react";

// Singleton audio context shared across the app
let sharedAudioContext: AudioContext | null = null;
let contextUsers = 0;

export const getSharedAudioContext = (): AudioContext => {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
};

export const useSharedAudioContext = () => {
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!hasRegistered.current) {
      contextUsers++;
      hasRegistered.current = true;
    }

    return () => {
      if (hasRegistered.current) {
        contextUsers--;
        hasRegistered.current = false;

        // Close context when no users remain
        if (contextUsers === 0 && sharedAudioContext) {
          // Delay closing in case another component needs it
          setTimeout(() => {
            if (contextUsers === 0 && sharedAudioContext) {
              sharedAudioContext.close();
              sharedAudioContext = null;
            }
          }, 1000);
        }
      }
    };
  }, []);

  const getContext = useCallback(() => {
    const ctx = getSharedAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }, []);

  const createOscillator = useCallback((frequency: number, type: OscillatorType = "sine") => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    return osc;
  }, [getContext]);

  const createGain = useCallback((initialValue = 0) => {
    const ctx = getContext();
    const gain = ctx.createGain();
    gain.gain.value = initialValue;
    return gain;
  }, [getContext]);

  const createAnalyser = useCallback((fftSize = 256) => {
    const ctx = getContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    return analyser;
  }, [getContext]);

  const fadeIn = useCallback((gainNode: GainNode, targetValue: number, duration = 0.5) => {
    const ctx = getContext();
    gainNode.gain.linearRampToValueAtTime(targetValue, ctx.currentTime + duration);
  }, [getContext]);

  const fadeOut = useCallback((gainNode: GainNode, duration = 0.5) => {
    const ctx = getContext();
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }, [getContext]);

  return {
    getContext,
    createOscillator,
    createGain,
    createAnalyser,
    fadeIn,
    fadeOut,
    get currentTime() {
      return sharedAudioContext?.currentTime ?? 0;
    },
    get destination() {
      return getContext().destination;
    },
  };
};
