import { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type ListRenderItemInfo, type ViewToken } from 'react-native';

import { COLORS } from '../../constants/colors';
import { SIDE_CARD_OPACITY, SIDE_CARD_ROTATE_Y, SIDE_CARD_SCALE, VISIBILITY_THRESHOLD } from '../../constants/layout';
import { type Story } from '../../data/types';
import { useCarousel } from '../../hooks/useCarousel';

import StoryCard from './StoryCard';

type StoryCarouselProps = {
  stories: Story[];
};

type CarouselItemProps = {
  index: number;
  itemSize: number;
  cardWidth: number;
  scrollX: Animated.Value;
  activeIndex: number;
  story: Story;
  isLandscape: boolean;
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
  isLandscape,
}: CarouselItemProps) {
  const inputRange = [(index - 2) * itemSize, index * itemSize, (index + 2) * itemSize];
  const scaleOutput = isLandscape ? [0.58, 1, 0.58] : [SIDE_CARD_SCALE[2], SIDE_CARD_SCALE[0], SIDE_CARD_SCALE[2]];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: scaleOutput,
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

export default function StoryCarousel({ stories }: StoryCarouselProps) {
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
    isLandscape,
  } = useCarousel({
    totalItems: stories.length,
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
        isLandscape={isLandscape}
      />
    ),
    [activeIndex, cardWidth, isLandscape, itemSize, scrollX],
  );

  const keyExtractor = useCallback((item: Story) => item.id, []);

  const sidePadding = Math.max(0, (screenWidth - itemSize) / 2);
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < stories.length - 1;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef as never}
        style={styles.list}
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
        contentContainerStyle={[
          styles.contentContainer,
          isLandscape && styles.contentContainerLandscape,
          { paddingHorizontal: sidePadding },
        ]}
      />

      <View pointerEvents="box-none" style={[styles.navRow, isLandscape && styles.navRowLandscape]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous card"
          disabled={!canGoPrev}
          onPress={() => scrollToIndex(activeIndex - 1)}
          style={[
            styles.navButton,
            isLandscape && styles.navButtonLandscape,
            !canGoPrev && styles.navButtonDisabled,
          ]}
        >
          <Text style={styles.navText}>Prev</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next card"
          disabled={!canGoNext}
          onPress={() => scrollToIndex(activeIndex + 1)}
          style={[
            styles.navButton,
            isLandscape && styles.navButtonLandscape,
            !canGoNext && styles.navButtonDisabled,
          ]}
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
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    width: '100%',
    alignSelf: 'stretch',
  },
  contentContainer: {
    paddingVertical: 36,
  },
  contentContainerLandscape: {
    paddingVertical: 8,
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
  navRowLandscape: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 34,
    right: 34,
    width: 'auto',
    marginTop: 0,
    marginHorizontal: 0,
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  navButtonLandscape: {
    minWidth: 54,
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
