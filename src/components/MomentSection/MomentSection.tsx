import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { stories } from '../../data/stories';

import AmbientGlow from '../common/AmbientGlow';

import StoryCarousel from './StoryCarousel';
import { styles } from './MomentSection.styles';

export default function MomentSection() {
  const handleActiveChange = useCallback((_index: number) => {
    // Step 9 wrapper: auto advance behavior handled in later steps.
  }, []);

  return (
    <View style={styles.section}>
      <AmbientGlow />

      <View style={styles.headerWrap}>
        <Text style={styles.title}>6587 khoảnh khắc đáng nhớ</Text>
        <Text style={styles.subtitle}>Hàng ngàn khoảnh khắc học tập, trưởng thành và bứt phá tại ZIM.</Text>
      </View>

      <StoryCarousel stories={stories} onActiveChange={handleActiveChange} />
    </View>
  );
}
