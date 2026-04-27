import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import MomentSection from './src/components/MomentSection';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
          <StatusBar style="light" />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <MomentSection />
          </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
});
