import { useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isActive = useMemo(() => appState === 'active', [appState]);

  return { appState, isActive };
}
