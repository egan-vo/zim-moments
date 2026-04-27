import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncReducedMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();

      if (!isMounted) {
        return;
      }

      setReducedMotion(enabled);
    };

    syncReducedMotion().catch(() => {
      if (isMounted) {
        setReducedMotion(false);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReducedMotion(enabled);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const animationDuration = reducedMotion ? 0 : undefined;

  return { reducedMotion, animationDuration };
}
