import { StyleSheet } from 'react-native';

import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 16,
    overflow: 'hidden',
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
