import { memo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { COLORS } from '../../constants/colors';
import { PROGRESS_BAR_HEIGHT } from '../../constants/layout';

type ProgressBarProps = {
  progress: SharedValue<number>;
};

function ProgressBar({ progress }: ProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const fillStyle = useAnimatedStyle(() => {
    const p = Math.max(0, Math.min(1, progress.value));
    return {
      transform: [
        { translateX: ((p - 1) * trackWidth) / 2 },
        { scaleX: p },
      ],
    };
  }, [trackWidth]);

  return (
    <View style={styles.track} onLayout={handleTrackLayout}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: COLORS.PROGRESS_TRACK,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.PROGRESS_FILL,
  },
});

export default memo(ProgressBar);
