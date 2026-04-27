import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { CARD_ASPECT, CARD_WIDTH_RATIO, GAP } from '../constants/layout';

export const CAROUSEL_DRAG_START_EVENT = 'carousel-drag-start';

export type UseCarouselInput = {
  totalItems: number;
};

export type UseCarouselOutput = {
  activeIndex: number;
  scrollX: Animated.Value;
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag: () => void;
  flatListRef: RefObject<FlatList<unknown> | null>;
  scrollToIndex: (index: number) => void;
  cardWidth: number;
  itemSize: number;
  screenWidth: number;
  isLandscape: boolean;
};

function getMetrics() {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  const widthBasedCardWidth = width * CARD_WIDTH_RATIO;
  const heightBasedCardWidth = height * (isLandscape ? 0.78 : 0.82) * CARD_ASPECT;
  const cardWidth = Math.min(widthBasedCardWidth, heightBasedCardWidth);

  return {
    screenWidth: width,
    cardWidth,
    itemSize: cardWidth + GAP,
    isLandscape,
  };
}

export function useCarousel({ totalItems }: UseCarouselInput): UseCarouselOutput {
  const flatListRef = useRef<FlatList<unknown> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [metrics, setMetrics] = useState(getMetrics);
  const scrollX = useRef(new Animated.Value(0)).current;
  const activeIndexRef = useRef(0);
  const { itemSize, cardWidth, screenWidth, isLandscape } = metrics;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      const nextMetrics = getMetrics();
      const nextOffset = activeIndexRef.current * nextMetrics.itemSize;

      setMetrics(nextMetrics);
      scrollX.setValue(nextOffset);

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({ offset: nextOffset, animated: false });
      });
    });

    return () => {
      subscription.remove();
    };
  }, [scrollX]);

  const clearSettleTimer = useCallback(() => {
    if (!settleTimerRef.current) {
      return;
    }

    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearSettleTimer();
    };
  }, [clearSettleTimer]);

  const scrollHandler = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
      }),
    [scrollX],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      clearSettleTimer();

      if (totalItems <= 0) {
        return;
      }

      const rawIndex = event.nativeEvent.contentOffset.x / itemSize;
      const clampedIndex = Math.max(0, Math.min(totalItems - 1, Math.round(rawIndex)));

      activeIndexRef.current = clampedIndex;
      setActiveIndex(clampedIndex);

    },
    [clearSettleTimer, itemSize, totalItems],
  );

  const onScrollBeginDrag = useCallback(() => {
    clearSettleTimer();
    DeviceEventEmitter.emit(CAROUSEL_DRAG_START_EVENT);
  }, [clearSettleTimer]);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!flatListRef.current || totalItems <= 0) {
        return;
      }

      const clampedIndex = Math.max(0, Math.min(totalItems - 1, index));
      activeIndexRef.current = clampedIndex;
      flatListRef.current.scrollToOffset({ offset: clampedIndex * itemSize, animated: true });
      setActiveIndex(clampedIndex);
      clearSettleTimer();

    },
    [clearSettleTimer, itemSize, totalItems],
  );

  useEffect(() => {
    if (activeIndex >= totalItems && totalItems > 0) {
      const nextIndex = totalItems - 1;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  }, [activeIndex, totalItems]);

  return {
    activeIndex,
    scrollX,
    scrollHandler,
    onMomentumScrollEnd,
    onScrollBeginDrag,
    flatListRef,
    scrollToIndex,
    cardWidth,
    itemSize,
    screenWidth,
    isLandscape,
  };
}
