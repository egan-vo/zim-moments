import { Text, View, useWindowDimensions } from 'react-native';

import { stories } from '../../data/stories';

import AmbientGlow from '../common/AmbientGlow';

import StoryCarousel from './StoryCarousel';
import { styles } from './MomentSection.styles';

export default function MomentSection() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View style={[styles.section, isLandscape && styles.sectionLandscape]}>
      <AmbientGlow />

      <View style={[styles.headerWrap, isLandscape && styles.headerWrapLandscape]}>
        <Text style={[styles.title, isLandscape && styles.titleLandscape]}>6587 khoảnh khắc đáng nhớ</Text>
        <Text style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}>
          Hàng ngàn khoảnh khắc học tập, trưởng thành và bứt phá tại ZIM.
        </Text>
      </View>

      <StoryCarousel stories={stories} />
    </View>
  );
}
