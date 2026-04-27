import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { COLORS } from '../../constants/colors';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type MuteButtonProps = {
  isMuted: boolean;
  onToggle: () => void;
  visible: SharedValue<number>;
};

function MuteButton({ isMuted, onToggle, visible }: MuteButtonProps) {
  const { reducedMotion } = useReducedMotion();
  const tapScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ scale: tapScale.value }],
  }));

  const handlePress = useCallback(() => {
    tapScale.value = reducedMotion
      ? withTiming(1, { duration: 0 })
      : withSequence(withTiming(0.85, { duration: 80 }), withSpring(1));
    onToggle();
  }, [onToggle, reducedMotion, tapScale]);

  return (
    <Animated.View pointerEvents="box-none" style={[styles.container, animatedStyle]}>
      <Pressable onPress={handlePress} style={styles.button}>
        <View style={styles.iconWrap}>
          <View style={styles.speakerBody} />
          <View style={styles.speakerCone} />
          {isMuted ? (
            <>
              <View style={[styles.muteSlash, styles.muteSlashA]} />
              <View style={[styles.muteSlash, styles.muteSlashB]} />
            </>
          ) : (
            <>
              <View style={[styles.soundWave, styles.waveNear]} />
              <View style={[styles.soundWave, styles.waveFar]} />
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 20,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  iconWrap: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  speakerBody: {
    position: 'absolute',
    left: 1,
    top: 6,
    width: 5,
    height: 6,
    borderRadius: 1,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  speakerCone: {
    position: 'absolute',
    left: 5,
    top: 4,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.TEXT_PRIMARY,
  },
  muteSlash: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.TEXT_PRIMARY,
  },
  muteSlashA: {
    transform: [{ rotate: '45deg' }],
  },
  muteSlashB: {
    transform: [{ rotate: '-45deg' }],
  },
  soundWave: {
    position: 'absolute',
    borderColor: COLORS.TEXT_PRIMARY,
    borderLeftWidth: 0,
    borderTopWidth: 1.8,
    borderBottomWidth: 1.8,
    borderRightWidth: 1.8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  waveNear: {
    right: 1,
    top: 6,
    width: 4,
    height: 6,
  },
  waveFar: {
    right: -1,
    top: 4,
    width: 6,
    height: 10,
  },
});

export default memo(MuteButton);
