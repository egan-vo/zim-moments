import { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type ListRenderItemInfo, type ViewToken } from 'react-native';

import { COLORS } from '../../constants/colors';
import { SIDE_CARD_OPACITY, SIDE_CARD_ROTATE_Y, SIDE_CARD_SCALE, VISIBILITY_THRESHOLD } from '../../constants/layout';
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
  scrollX: Animated.Value;
  activeIndex: number;
  story: Story;
};

const viewabilityConfig = {
  itemVisiblePercentThreshold: Math.round(VISIBILITY_THRESHOLD * 100),
};

const CarouselItem = memo(function CarouselItem({
  index,
  itemSize,
  cardWidth,
  scrollX,
  activeIndex,
  story,
}: CarouselItemProps) {
  const inputRange = [(index - 2) * itemSize, index * itemSize, (index + 2) * itemSize];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [SIDE_CARD_SCALE[2], SIDE_CARD_SCALE[0], SIDE_CARD_SCALE[2]],
    extrapolate: 'clamp',
  });

  const rotateY = scrollX.interpolate({
    inputRange,
    outputRange: [`${SIDE_CARD_ROTATE_Y[2]}deg`, `${SIDE_CARD_ROTATE_Y[1]}deg`, `${SIDE_CARD_ROTATE_Y[0]}deg`],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [SIDE_CARD_OPACITY[2], SIDE_CARD_OPACITY[0], SIDE_CARD_OPACITY[2]],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.itemContainer, { width: itemSize }]}> 
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            width: cardWidth,
            opacity,
            transform: [{ perspective: 900 }, { scale }, { rotateY }],
          },
        ]}
      >
        <StoryCard story={story} isActive={index === activeIndex} distanceFromActive={index - activeIndex} />
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

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItemsRef.current = viewableItems;
  }, []);

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
      <Animated.FlatList
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingVertical: 36,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  navRow: {
    marginTop: 12,
    marginHorizontal: 16,
    width: '92%',
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
