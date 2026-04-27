import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { DeviceEventEmitter, Dimensions, type FlatList, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { CARD_WIDTH_RATIO, GAP, SETTLE_DELAY_MS } from '../constants/layout';

export const CAROUSEL_DRAG_START_EVENT = 'carousel-drag-start';

export type UseCarouselInput = {
  totalItems: number;
  onActiveChange: (index: number) => void;
};

export type UseCarouselOutput = {
  activeIndex: number;
  scrollX: SharedValue<number>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollBeginDrag: () => void;
  flatListRef: RefObject<FlatList<unknown> | null>;
  scrollToIndex: (index: number) => void;
  cardWidth: number;
  itemSize: number;
  screenWidth: number;
};

function getMetrics() {
  const width = Dimensions.get('window').width;
  const cardWidth = width * CARD_WIDTH_RATIO;
  return {
    screenWidth: width,
    cardWidth,
    itemSize: cardWidth + GAP,
  };
}

export function useCarousel({ totalItems, onActiveChange }: UseCarouselInput): UseCarouselOutput {
  const flatListRef = useRef<FlatList<unknown> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [metrics, setMetrics] = useState(getMetrics);
  const scrollX = useSharedValue(0);
  const { itemSize, cardWidth, screenWidth } = metrics;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setMetrics(getMetrics());
    });

    return () => {
      subscription.remove();
    };
  }, []);

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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      clearSettleTimer();

      if (totalItems <= 0) {
        return;
      }

      const rawIndex = event.nativeEvent.contentOffset.x / itemSize;
      const clampedIndex = Math.max(0, Math.min(totalItems - 1, Math.round(rawIndex)));

      setActiveIndex(clampedIndex);

      settleTimerRef.current = setTimeout(() => {
        onActiveChange(clampedIndex);
      }, SETTLE_DELAY_MS);
    },
    [clearSettleTimer, itemSize, onActiveChange, totalItems],
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
      flatListRef.current.scrollToOffset({ offset: clampedIndex * itemSize, animated: true });
    },
    [itemSize, totalItems],
  );

  useEffect(() => {
    if (activeIndex >= totalItems && totalItems > 0) {
      setActiveIndex(totalItems - 1);
    }
  }, [activeIndex, totalItems]);

  useEffect(() => {
    const maxOffset = Math.max(0, totalItems - 1) * itemSize;
    if (scrollX.value > maxOffset) {
      scrollX.value = maxOffset;
    }
  }, [itemSize, scrollX, totalItems]);

  return useMemo(
    () => ({
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
    }),
    [
      activeIndex,
      cardWidth,
      itemSize,
      onMomentumScrollEnd,
      onScrollBeginDrag,
      screenWidth,
      scrollHandler,
      scrollToIndex,
      scrollX,
    ],
  );
}
