import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MomentSection from './src/components/MomentSection';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <MomentSection />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
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
