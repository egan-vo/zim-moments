import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { type AVPlaybackStatus, type Video } from 'expo-av';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import audioOwnerManager from '../managers/AudioOwnerManager';
import { stories } from '../data/stories';
import { type VideoState } from '../data/types';

type UseVideoLifecycleOptions = {
  reducedMotion: boolean;
  onVideoEnd?: () => void;
  onProgress?: (value: number) => void;
};

type UseVideoLifecycleResult = {
  state: VideoState;
  transitionTo: (nextState: VideoState) => Promise<void>;
  isMuted: boolean;
  setMuted: (v: boolean) => void;
  progress: ReturnType<typeof useSharedValue<number>>;
};

export function useVideoLifecycle(
  storyId: string,
  videoRef: RefObject<Video | null>,
  options: UseVideoLifecycleOptions,
): UseVideoLifecycleResult {
  const [state, setState] = useState<VideoState>('idle');
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef<VideoState>('idle');
  const isMountedRef = useRef(true);
  const transitionQueueRef = useRef<Promise<void>>(Promise.resolve());
  const transitionToRef = useRef<(nextState: VideoState) => Promise<void>>(async () => undefined);

  const progress = useSharedValue(0);

  const story = useMemo(() => stories.find((item) => item.id === storyId), [storyId]);
  const videoUri = story?.videoUrl;

  const setStateSafe = useCallback((nextState: VideoState) => {
    stateRef.current = nextState;
    if (isMountedRef.current) {
      setState(nextState);
    }
  }, []);

  const resetProgress = useCallback(() => {
    progress.value = 0;
  }, [progress]);

  const unloadAndRelease = useCallback(async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.unloadAsync();
      }
    } catch {
      // Best-effort cleanup.
    } finally {
      audioOwnerManager.release(storyId);
      resetProgress();
    }
  }, [resetProgress, storyId, videoRef]);

  const loadPreview = useCallback(async () => {
    if (!videoRef.current || !videoUri) {
      return;
    }

    await videoRef.current.loadAsync(
      { uri: videoUri },
      { shouldPlay: false, isMuted: true, progressUpdateIntervalMillis: 250 },
      false,
    );
  }, [videoRef, videoUri]);

  const runTransition = useCallback(
    async (nextState: VideoState) => {
      const currentState = stateRef.current;

      if (nextState === currentState) {
        return;
      }

      if (nextState === 'idle') {
        await unloadAndRelease();
        setStateSafe('idle');
        return;
      }

      if (currentState === 'idle' && nextState === 'preview') {
        await loadPreview();
        setStateSafe('preview');
        return;
      }

      if (currentState === 'idle' && nextState === 'active_ready') {
        await loadPreview();
        setStateSafe('active_ready');
        return;
      }

      if (currentState === 'preview' && nextState === 'active_ready') {
        setStateSafe('active_ready');
        return;
      }

      if ((currentState === 'idle' || currentState === 'preview') && nextState === 'playing') {
        if (currentState === 'idle') {
          await loadPreview();
        }

        if (options.reducedMotion) {
          setStateSafe('active_ready');
          return;
        }

        audioOwnerManager.claim(storyId, () => {
          void transitionToRef.current('paused');
        });

        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(isMuted);
          await videoRef.current.playAsync();
        }

        setStateSafe('playing');
        return;
      }

      if (
        (currentState === 'active_ready' ||
          currentState === 'playing' ||
          currentState === 'paused' ||
          currentState === 'backgrounded') &&
        nextState === 'preview'
      ) {
        if (videoRef.current) {
          try {
            await videoRef.current.pauseAsync();
          } catch {
            // Keep transition resilient.
          }
        }
        setStateSafe('preview');
        return;
      }

      if (currentState === 'active_ready' && nextState === 'playing') {
        if (options.reducedMotion) {
          setStateSafe('active_ready');
          return;
        }

        audioOwnerManager.claim(storyId, () => {
          void transitionToRef.current('paused');
        });

        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(isMuted);
          await videoRef.current.playAsync();
        }

        setStateSafe('playing');
        return;
      }

      if (currentState === 'paused' && nextState === 'playing') {
        if (options.reducedMotion) {
          setStateSafe('active_ready');
          return;
        }

        audioOwnerManager.claim(storyId, () => {
          void transitionToRef.current('paused');
        });

        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(isMuted);
          await videoRef.current.playAsync();
        }

        setStateSafe('playing');
        return;
      }

      if (currentState === 'playing' && nextState === 'paused') {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
        setStateSafe('paused');
        return;
      }

      if (
        (currentState === 'playing' || currentState === 'paused') &&
        nextState === 'backgrounded'
      ) {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
        setStateSafe('backgrounded');
        return;
      }

      if (currentState === 'backgrounded' && nextState === 'offscreen_suspended') {
        if (videoRef.current) {
          try {
            await videoRef.current.pauseAsync();
          } catch {
            // Continue cleanup sequence.
          }

          try {
            await videoRef.current.setPositionAsync(0);
          } catch {
            // Continue cleanup sequence.
          }
        }

        await unloadAndRelease();
        setStateSafe('offscreen_suspended');
        return;
      }

      if (currentState === 'offscreen_suspended' && nextState === 'preview') {
        await loadPreview();
        setStateSafe('preview');
        return;
      }

      if (currentState === 'preview' && nextState === 'offscreen_suspended') {
        await unloadAndRelease();
        setStateSafe('offscreen_suspended');
        return;
      }

      if (nextState === 'paused') {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
        setStateSafe('paused');
      }
    },
    [isMuted, loadPreview, options.reducedMotion, setStateSafe, storyId, unloadAndRelease, videoRef],
  );

  const transitionTo = useCallback(
    async (nextState: VideoState) => {
      const queued = transitionQueueRef.current.then(() => runTransition(nextState));
      transitionQueueRef.current = queued.catch(() => undefined);
      await queued;
    },
    [runTransition],
  );

  transitionToRef.current = transitionTo;

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }

      const durationMillis = status.durationMillis ?? 0;
      const nextProgress =
        durationMillis > 0 ? Math.min(1, status.positionMillis / durationMillis) : 0;

      progress.value = withTiming(nextProgress, { duration: options.reducedMotion ? 0 : 250 });
      options.onProgress?.(nextProgress);

      if (status.didJustFinish) {
        if (!options.reducedMotion && videoRef.current) {
          void (async () => {
            try {
              await videoRef.current?.setPositionAsync(0);
              await videoRef.current?.playAsync();
              setStateSafe('playing');
            } catch {
              // Keep end-of-video callback resilient.
            }
          })();
        }
        options.onVideoEnd?.();
      }
    },
    [options, progress, setStateSafe, videoRef],
  );

  const setMuted = useCallback(
    (value: boolean) => {
      setIsMuted(value);
      if (videoRef.current) {
        void videoRef.current.setIsMutedAsync(value);
      }
    },
    [videoRef],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      void unloadAndRelease();
      stateRef.current = 'idle';
    };
  }, [unloadAndRelease]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);

    return () => {
      if (videoRef.current) {
        videoRef.current.setOnPlaybackStatusUpdate(null);
      }
    };
  }, [handlePlaybackStatusUpdate, videoRef]);

  return {
    state,
    transitionTo,
    isMuted,
    setMuted,
    progress,
  };
}
