import { Dimensions, StyleSheet } from 'react-native';

import { SPRING_LIFT } from '../../constants/animation';
import { COLORS } from '../../constants/colors';
import { CARD_ASPECT, CARD_WIDTH_RATIO } from '../../constants/layout';

const CARD_WIDTH = Dimensions.get('window').width * CARD_WIDTH_RATIO;

export const STORY_CARD_DIMENSIONS = {
  CARD_WIDTH,
};

export const STORY_CARD_SPRINGS = {
  LIFT: SPRING_LIFT,
};

export const styles = StyleSheet.create({
  tiltContainer: {
    width: '100%',
  },
  pressable: {
    width: '100%',
    borderRadius: 22,
  },
  focusRing: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 22,
  },
  card: {
    width: '100%',
    aspectRatio: CARD_ASPECT,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLORS.BACKGROUND,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  interactionLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    paddingTop: 52,
  },
  videoTapZone: {
    flex: 7,
  },
  captionTapZone: {
    flex: 3,
  },
  playButtonWrap: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    marginLeft: 3,
  },
});
