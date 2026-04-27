import { StyleSheet } from 'react-native';

import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 20,
    overflow: 'visible',
  },
  sectionLandscape: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  headerWrap: {
    paddingHorizontal: 16,
    gap: 6,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  headerWrapLandscape: {
    gap: 2,
    marginBottom: 0,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  titleLandscape: {
    fontSize: 18,
    lineHeight: 22,
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  subtitleLandscape: {
    fontSize: 11,
    lineHeight: 14,
  },
});
