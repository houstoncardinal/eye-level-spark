import { useCallback } from "react";

export const useHaptic = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => vibrate(10), [vibrate]);
  const mediumTap = useCallback(() => vibrate(25), [vibrate]);
  const heavyTap = useCallback(() => vibrate(50), [vibrate]);
  const pulse = useCallback(() => vibrate([20, 50, 20]), [vibrate]);
  const breatheIn = useCallback(() => vibrate([10, 30, 10, 30, 10, 30, 10]), [vibrate]);
  const breatheOut = useCallback(() => vibrate([30, 50, 30, 50, 30]), [vibrate]);

  return { lightTap, mediumTap, heavyTap, pulse, breatheIn, breatheOut, vibrate };
};
