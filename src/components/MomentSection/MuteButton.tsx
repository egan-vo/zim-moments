import { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { COLORS } from '../../constants/colors';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type MuteButtonProps = {
  isMuted: boolean;
  onToggle: () => void;
  visible: Animated.Value;
  onInteract?: () => void;
};

function MuteButton({ isMuted, onToggle, visible, onInteract }: MuteButtonProps) {
  const { reducedMotion } = useReducedMotion();
  const tapScale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    if (reducedMotion) {
      tapScale.setValue(1);
    } else {
      Animated.sequence([
        Animated.timing(tapScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
        Animated.spring(tapScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
    onToggle();
  }, [onToggle, reducedMotion, tapScale]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, { opacity: visible, transform: [{ scale: tapScale }] }]}
    >
      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onInteract?.();
          handlePress();
        }}
        onPressIn={(event) => {
          event.stopPropagation();
          onInteract?.();
        }}
        style={styles.button}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={18}
          color={COLORS.TEXT_PRIMARY}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 30,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
});

export default memo(MuteButton);
