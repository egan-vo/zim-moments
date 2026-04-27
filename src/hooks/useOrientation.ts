import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import { CARD_WIDTH_RATIO } from '../constants/layout';

type OrientationState = {
  isLandscape: boolean;
  cardWidth: number;
};

function getWindowMetrics() {
  const window = Dimensions.get('window');
  return {
    isLandscape: window.width > window.height,
    cardWidth: window.width * CARD_WIDTH_RATIO,
  };
}

export function useOrientation() {
  const [orientationState, setOrientationState] = useState<OrientationState>(() => getWindowMetrics());

  useEffect(() => {
    let isMounted = true;

    const updateWithWindow = () => {
      if (!isMounted) {
        return;
      }

      const next = getWindowMetrics();
      setOrientationState((prev) => {
        if (prev.isLandscape === next.isLandscape && prev.cardWidth === next.cardWidth) {
          return prev;
        }

        return next;
      });
    };

    const syncOrientation = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      if (!isMounted) {
        return;
      }

      const nextFromWindow = getWindowMetrics();
      const nextIsLandscape =
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT ||
        nextFromWindow.isLandscape;

      setOrientationState((prev) => {
        if (prev.isLandscape === nextIsLandscape && prev.cardWidth === nextFromWindow.cardWidth) {
          return prev;
        }

        return {
          isLandscape: nextIsLandscape,
          cardWidth: nextFromWindow.cardWidth,
        };
      });
    };

    syncOrientation().catch(() => {
      updateWithWindow();
    });

    const orientationSubscription = ScreenOrientation.addOrientationChangeListener(() => {
      updateWithWindow();
    });

    const dimensionsSubscription = Dimensions.addEventListener('change', () => {
      updateWithWindow();
    });

    return () => {
      isMounted = false;
      ScreenOrientation.removeOrientationChangeListener(orientationSubscription);
      dimensionsSubscription.remove();
    };
  }, []);

  return { isLandscape: orientationState.isLandscape };
}
