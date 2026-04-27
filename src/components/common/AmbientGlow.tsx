import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS } from '../../constants/colors';

function AmbientGlow() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.leftGlow} />
      <View style={styles.rightGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  leftGlow: {
    position: 'absolute',
    right: -80,
    bottom: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.AMBIENT_LEFT,
    opacity: 0.3,
  },
  rightGlow: {
    position: 'absolute',
    left: -95,
    top: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.AMBIENT_RIGHT,
    opacity: 0.6,
  },
});

export default memo(AmbientGlow);
