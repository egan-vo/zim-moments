import { memo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { type Story } from '../../data/types';

type CaptionOverlayProps = {
  story: Story;
  isExpanded: boolean;
  expandProgress: Animated.Value;
};

function CaptionOverlay({ story, isExpanded, expandProgress }: CaptionOverlayProps) {
  const captionTranslateY = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });

  const captionOpacity = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
    extrapolate: 'clamp',
  });

  const helperOpacity = expandProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity: captionOpacity }]}>
      <Animated.Text
        numberOfLines={1}
        style={[styles.location, { transform: [{ translateY: captionTranslateY }] }]}
      >
        {story.location}
      </Animated.Text>
      <Animated.Text
        numberOfLines={isExpanded ? undefined : 2}
        style={[styles.caption, { transform: [{ translateY: captionTranslateY }] }]}
      >
        {story.caption}
      </Animated.Text>
      <Animated.Text style={[styles.helper, { opacity: helperOpacity }]}>
        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 12,
    gap: 4,
  },
  location: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  caption: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  helper: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.85,
  },
});

export default memo(CaptionOverlay);
