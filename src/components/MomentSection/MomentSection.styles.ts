import { StyleSheet } from 'react-native';

import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 20,
    overflow: 'visible',
    justifyContent: 'center',
  },
  headerWrap: {
    paddingHorizontal: 16,
    gap: 6,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
});
