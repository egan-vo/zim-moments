import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { MAX_TILT_Y, SPRING_TILT_BACK } from '../constants/animation';
import { CARD_WIDTH_RATIO } from '../constants/layout';

type UseTiltInput = {
  isActiveCard: boolean;
};

export function useTilt({ isActiveCard }: UseTiltInput) {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  const cardWidth = Dimensions.get('window').width * CARD_WIDTH_RATIO;

  const panGesture = Gesture.Pan()
    .enabled(isActiveCard)
    .activateAfterLongPress(80)
    .minDistance(2)
    .onUpdate((event) => {
      const nextTiltY = clamp((event.translationX / cardWidth) * 16, -MAX_TILT_Y, MAX_TILT_Y);
      tiltY.value = nextTiltY;
      tiltX.value = clamp((-event.translationY / cardWidth) * 16, -MAX_TILT_Y, MAX_TILT_Y);
    })
    .onEnd(() => {
      tiltX.value = withSpring(0, SPRING_TILT_BACK);
      tiltY.value = withSpring(0, SPRING_TILT_BACK);
    })
    .onFinalize(() => {
      tiltX.value = withSpring(0, SPRING_TILT_BACK);
      tiltY.value = withSpring(0, SPRING_TILT_BACK);
    });

  const tiltStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${tiltX.value}deg` },
        { rotateY: `${tiltY.value}deg` },
      ],
    };
  });

  return {
    tiltStyle,
    panGesture,
  };
}
