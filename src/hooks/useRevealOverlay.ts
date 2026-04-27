import { useCallback, useEffect, useRef, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  OVERLAY_HIDE_DURATION,
  OVERLAY_SHOW_DURATION,
  SPRING_OVERLAY,
  STAGGER_CAPTION,
  STAGGER_CTA,
} from '../constants/animation';

type UseRevealOverlayInput = {
  ctaUrl?: string;
  onNavigate: (url: string) => void;
  reducedMotion?: boolean;
};

const AUTO_HIDE_MS = 4000;

export function useRevealOverlay({ ctaUrl, onNavigate, reducedMotion = false }: UseRevealOverlayInput) {
  const [isRevealed, setIsRevealed] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const overlayOpacity = useSharedValue(0);
  const captionY = useSharedValue(14);
  const ctaOpacity = useSharedValue(0);

  const clearHideTimer = useCallback(() => {
    if (!hideTimerRef.current) {
      return;
    }

    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const showOverlay = useCallback(() => {
    clearHideTimer();
    setIsRevealed(true);

    const timingDuration = reducedMotion ? 0 : OVERLAY_SHOW_DURATION;
    const ctaDelay = reducedMotion ? 0 : STAGGER_CTA;

    overlayOpacity.value = withTiming(1, { duration: timingDuration });
    captionY.value = reducedMotion ? withTiming(0, { duration: 0 }) : withSpring(0, SPRING_OVERLAY);
    ctaOpacity.value = withDelay(ctaDelay, withTiming(1, { duration: timingDuration }));

    hideTimerRef.current = setTimeout(() => {
      setIsRevealed(false);
      const hideDuration = reducedMotion ? 0 : OVERLAY_HIDE_DURATION;
      overlayOpacity.value = withTiming(0, { duration: hideDuration });
      captionY.value = withTiming(14, { duration: hideDuration });
      ctaOpacity.value = withTiming(0, { duration: hideDuration });
    }, AUTO_HIDE_MS);
  }, [captionY, clearHideTimer, ctaOpacity, overlayOpacity, reducedMotion]);

  const hideOverlay = useCallback(() => {
    clearHideTimer();
    setIsRevealed(false);
    const hideDuration = reducedMotion ? 0 : OVERLAY_HIDE_DURATION;
    overlayOpacity.value = withTiming(0, { duration: hideDuration });
    captionY.value = withTiming(14, { duration: hideDuration });
    ctaOpacity.value = withTiming(0, { duration: hideDuration });
  }, [captionY, clearHideTimer, ctaOpacity, overlayOpacity, reducedMotion]);

  const handleTap = useCallback(() => {
    if (!isRevealed) {
      showOverlay();
      return;
    }

    hideOverlay();
    if (ctaUrl) {
      onNavigate(ctaUrl);
    }
  }, [ctaUrl, hideOverlay, isRevealed, onNavigate, showOverlay]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ translateY: captionY.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: captionY.value / 2 }],
  }));

  return {
    overlayStyle,
    captionStyle,
    ctaStyle,
    handleTap,
    isRevealed,
  };
}
