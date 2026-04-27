import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { OVERLAY_HIDE_DURATION, OVERLAY_SHOW_DURATION, STAGGER_CTA } from '../constants/animation';

type UseRevealOverlayInput = {
  ctaUrl?: string;
  onNavigate: (url: string) => void;
  reducedMotion?: boolean;
};

const AUTO_HIDE_MS = 4000;

export function useRevealOverlay({ ctaUrl, onNavigate, reducedMotion = false }: UseRevealOverlayInput) {
  const [isRevealed, setIsRevealed] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const captionY = useRef(new Animated.Value(14)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

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

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: timingDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(captionY, {
        toValue: 0,
        duration: timingDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(ctaDelay),
        Animated.timing(ctaOpacity, {
          toValue: 1,
          duration: timingDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    hideTimerRef.current = setTimeout(() => {
      setIsRevealed(false);
      const hideDuration = reducedMotion ? 0 : OVERLAY_HIDE_DURATION;
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: hideDuration,
          useNativeDriver: true,
        }),
        Animated.timing(captionY, {
          toValue: 14,
          duration: hideDuration,
          useNativeDriver: true,
        }),
        Animated.timing(ctaOpacity, {
          toValue: 0,
          duration: hideDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }, AUTO_HIDE_MS);
  }, [captionY, clearHideTimer, ctaOpacity, overlayOpacity, reducedMotion]);

  const hideOverlay = useCallback(() => {
    clearHideTimer();
    setIsRevealed(false);
    const hideDuration = reducedMotion ? 0 : OVERLAY_HIDE_DURATION;
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: true,
      }),
      Animated.timing(captionY, {
        toValue: 14,
        duration: hideDuration,
        useNativeDriver: true,
      }),
      Animated.timing(ctaOpacity, {
        toValue: 0,
        duration: hideDuration,
        useNativeDriver: true,
      }),
    ]).start();
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

  const overlayStyle = {
    opacity: overlayOpacity,
  };

  const captionStyle = {
    opacity: overlayOpacity,
    transform: [{ translateY: captionY }],
  };

  const ctaStyle = {
    opacity: ctaOpacity,
    transform: [
      {
        translateY: captionY.interpolate({
          inputRange: [0, 14],
          outputRange: [0, 7],
        }),
      },
    ],
  };

  return {
    overlayStyle,
    captionStyle,
    ctaStyle,
    handleTap,
    isRevealed,
  };
}
