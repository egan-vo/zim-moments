import { useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

import { MAX_TILT_Y } from '../constants/animation';
import { CARD_WIDTH_RATIO } from '../constants/layout';

type UseTiltInput = {
  isActiveCard: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useTilt({ isActiveCard }: UseTiltInput) {
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  const cardWidth = Dimensions.get('window').width * CARD_WIDTH_RATIO;

  const resetTilt = () => {
    Animated.parallel([
      Animated.spring(tiltX, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
      Animated.spring(tiltY, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
    ]).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_evt, gestureState) =>
      isActiveCard && (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3),
    onPanResponderMove: (_evt, gestureState) => {
      const nextTiltY = clamp((gestureState.dx / cardWidth) * 16, -MAX_TILT_Y, MAX_TILT_Y);
      const nextTiltX = clamp((-gestureState.dy / cardWidth) * 16, -MAX_TILT_Y, MAX_TILT_Y);
      tiltY.setValue(nextTiltY);
      tiltX.setValue(nextTiltX);
    },
    onPanResponderRelease: resetTilt,
    onPanResponderTerminate: resetTilt,
  });

  const tiltStyle = {
    transform: [
      { perspective: 1000 },
      {
        rotateX: tiltX.interpolate({
          inputRange: [-MAX_TILT_Y, MAX_TILT_Y],
          outputRange: [`-${MAX_TILT_Y}deg`, `${MAX_TILT_Y}deg`],
        }),
      },
      {
        rotateY: tiltY.interpolate({
          inputRange: [-MAX_TILT_Y, MAX_TILT_Y],
          outputRange: [`-${MAX_TILT_Y}deg`, `${MAX_TILT_Y}deg`],
        }),
      },
    ],
  } as const;

  return {
    tiltStyle,
    panHandlers: isActiveCard ? panResponder.panHandlers : {},
  };
}
