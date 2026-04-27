import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

type LazyImageProps = {
  uri: string;
  blurhash?: string;
};

function LazyImage({ uri, blurhash }: LazyImageProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri }}
        placeholder={blurhash}
        contentFit="cover"
        transition={180}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default memo(LazyImage);
