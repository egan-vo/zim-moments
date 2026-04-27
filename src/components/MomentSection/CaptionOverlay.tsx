import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { COLORS } from '../../constants/colors';
import { type Story } from '../../data/types';

type CaptionOverlayProps = {
  story: Story;
  overlayStyle: AnimatedStyle<object>;
  captionStyle: AnimatedStyle<object>;
  ctaStyle: AnimatedStyle<object>;
  isRevealed: boolean;
};

function CaptionOverlay({ story, overlayStyle, captionStyle, ctaStyle, isRevealed }: CaptionOverlayProps) {
  return (
    <Animated.View pointerEvents="none" style={[styles.container, overlayStyle]}>
      <View style={styles.gradientStub} />
      <Animated.View style={captionStyle}>
        <Text style={styles.location}>{story.location}</Text>
        <Text numberOfLines={2} style={styles.caption}>
          {story.caption}
        </Text>
      </Animated.View>
      {isRevealed && story.ctaUrl ? (
        <Animated.View style={ctaStyle}>
          <Text style={styles.cta}>Tap again to open</Text>
        </Animated.View>
      ) : null}
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
    paddingTop: 36,
    gap: 8,
  },
  gradientStub: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.OVERLAY_GRADIENT_END,
    opacity: 0.8,
  },
  location: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  caption: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    color: COLORS.ACCENT,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export default memo(CaptionOverlay);
