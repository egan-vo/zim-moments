import { memo, useState } from 'react';
import { Animated, type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { PROGRESS_BAR_HEIGHT } from '../../constants/layout';

const PROGRESS_HORIZONTAL_INSET = 8;
const PROGRESS_TOP_INSET = 1;

type ProgressBarProps = {
  progress: Animated.Value;
};

function ProgressBar({ progress }: ProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-trackWidth / 2, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.track} onLayout={handleTrackLayout}>
      <Animated.View
        style={[
          styles.fill,
          {
            transform: [{ translateX }, { scaleX: progress }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: PROGRESS_TOP_INSET,
    left: PROGRESS_HORIZONTAL_INSET,
    right: PROGRESS_HORIZONTAL_INSET,
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: COLORS.PROGRESS_TRACK,
    overflow: 'hidden',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
  },
  fill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.PROGRESS_FILL,
  },
});

export default memo(ProgressBar);
