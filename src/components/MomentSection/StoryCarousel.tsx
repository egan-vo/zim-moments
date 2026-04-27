import { memo, useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, type ListRenderItemInfo, type ViewToken } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { SIDE_CARD_OPACITY, SIDE_CARD_ROTATE_Y, SIDE_CARD_SCALE, VISIBILITY_THRESHOLD } from '../../constants/layout';
import { COLORS } from '../../constants/colors';
import { type Story } from '../../data/types';
import { useCarousel } from '../../hooks/useCarousel';

import StoryCard from './StoryCard';

type StoryCarouselProps = {
  stories: Story[];
  onActiveChange: (index: number) => void;
};

type CarouselItemProps = {
  index: number;
  itemSize: number;
  cardWidth: number;
  scrollX: SharedValue<number>;
  activeIndex: number;
  story: Story;
};

const viewabilityConfig = {
  itemVisiblePercentThreshold: Math.round(VISIBILITY_THRESHOLD * 100),
};

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList<Story>);

const CarouselItem = memo(function CarouselItem({
  index,
  itemSize,
  cardWidth,
  scrollX,
  activeIndex,
  story,
}: CarouselItemProps) {
  const animatedCardStyle = useAnimatedStyle(() => {
    const offset = (index * itemSize - scrollX.value) / itemSize;
    const absOffset = Math.abs(offset);

    const scale = interpolate(
      absOffset,
      [0, 1, 2],
      [...SIDE_CARD_SCALE],
      Extrapolation.CLAMP,
    );

    const rotateY = interpolate(
      offset,
      [-2, 0, 2],
      [...SIDE_CARD_ROTATE_Y],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      absOffset,
      [0, 1.5, 2.5],
      [...SIDE_CARD_OPACITY],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ perspective: 900 }, { scale }, { rotateY: `${rotateY}deg` }],
    };
  }, [index, itemSize, scrollX]);

  return (
    <View style={[styles.itemContainer, { width: itemSize }]}>
      <Animated.View style={[styles.cardWrapper, { width: cardWidth }, animatedCardStyle]}>
        <StoryCard
          story={story}
          isActive={index === activeIndex}
          distanceFromActive={index - activeIndex}
        />
      </Animated.View>
    </View>
  );
});

export default function StoryCarousel({ stories, onActiveChange }: StoryCarouselProps) {
  const {
    activeIndex,
    scrollX,
    scrollHandler,
    onMomentumScrollEnd,
    onScrollBeginDrag,
    flatListRef,
    scrollToIndex,
    itemSize,
    cardWidth,
    screenWidth,
  } = useCarousel({
    totalItems: stories.length,
    onActiveChange,
  });

  const viewableItemsRef = useRef<ViewToken[]>([]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItemsRef.current = viewableItems;
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Story>) => (
      <CarouselItem
        index={index}
        itemSize={itemSize}
        cardWidth={cardWidth}
        scrollX={scrollX}
        activeIndex={activeIndex}
        story={item}
      />
    ),
    [activeIndex, cardWidth, itemSize, scrollX],
  );

  const keyExtractor = useCallback((item: Story) => item.id, []);

  const sidePadding = Math.max(0, (screenWidth - cardWidth) / 2);
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < stories.length - 1;

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef as never}
        data={stories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemSize}
        decelerationRate="fast"
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        windowSize={5}
        maxToRenderPerBatch={3}
        removeClippedSubviews
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: sidePadding }]}
      />

      <View pointerEvents="box-none" style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous card"
          disabled={!canGoPrev}
          onPress={() => scrollToIndex(activeIndex - 1)}
          style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
        >
          <Text style={styles.navText}>Prev</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next card"
          disabled={!canGoNext}
          onPress={() => scrollToIndex(activeIndex + 1)}
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
        >
          <Text style={styles.navText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    paddingVertical: 4,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    alignItems: 'center',
  },
  navRow: {
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
