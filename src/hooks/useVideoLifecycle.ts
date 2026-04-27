import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Animated } from 'react-native';
import { type AVPlaybackStatus, type Video } from 'expo-av';

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
  getCurrentState: () => VideoState;
  isMuted: boolean;
  getIsMuted: () => boolean;
  setMuted: (v: boolean) => Promise<void>;
  progress: Animated.Value;
};

export function useVideoLifecycle(
  storyId: string,
  videoRef: RefObject<Video | null>,
  options: UseVideoLifecycleOptions,
): UseVideoLifecycleResult {
  const [state, setState] = useState<VideoState>('idle');
  const [isMuted, setIsMuted] = useState(false);

  const stateRef = useRef<VideoState>('idle');
  const isMutedRef = useRef(false);
  const ignorePauseStatusUntilRef = useRef(0);
  const isMountedRef = useRef(true);
  const transitionQueueRef = useRef<Promise<void>>(Promise.resolve());
  const transitionToRef = useRef<(nextState: VideoState) => Promise<void>>(async () => undefined);

  const progress = useRef(new Animated.Value(0)).current;

  const story = useMemo(() => stories.find((item) => item.id === storyId), [storyId]);
  const videoUri = story?.videoUrl;

  const setStateSafe = useCallback((nextState: VideoState) => {
    stateRef.current = nextState;
    if (isMountedRef.current) {
      setState(nextState);
    }
  }, []);

  const resetProgress = useCallback(() => {
    progress.setValue(0);
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

    const status = await videoRef.current.getStatusAsync();
    if (status.isLoaded) {
      await videoRef.current.setStatusAsync({
        shouldPlay: false,
        isMuted: isMutedRef.current,
        progressUpdateIntervalMillis: 250,
      });
      return;
    }

    try {
      await videoRef.current.loadAsync(
        { uri: videoUri },
        { shouldPlay: false, isMuted: isMutedRef.current, progressUpdateIntervalMillis: 250 },
        false,
      );
    } catch (error) {
      const nextStatus = await videoRef.current.getStatusAsync();
      if (!nextStatus.isLoaded) {
        throw error;
      }

      await videoRef.current.setStatusAsync({
        shouldPlay: false,
        isMuted: isMutedRef.current,
        progressUpdateIntervalMillis: 250,
      });
    }
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

        audioOwnerManager.claim(storyId, () => {
          void transitionToRef.current('paused');
        });

        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(isMutedRef.current);
          await videoRef.current.playAsync();
        }

        setStateSafe('playing');
        return;
      }

      if (
        nextState === 'offscreen_suspended' &&
        (currentState === 'preview' ||
          currentState === 'active_ready' ||
          currentState === 'playing' ||
          currentState === 'paused' ||
          currentState === 'backgrounded')
      ) {
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
        audioOwnerManager.claim(storyId, () => {
          void transitionToRef.current('paused');
        });

        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(isMutedRef.current);
          await videoRef.current.playAsync();
        }

        setStateSafe('playing');
        return;
      }

      if (currentState === 'paused' && nextState === 'playing') {
        audioOwnerManager.claim(storyId, () => {
          void transitionToRef.current('paused');
        });

        if (videoRef.current) {
          await videoRef.current.setIsMutedAsync(isMutedRef.current);
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

      if (nextState === 'paused') {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
        setStateSafe('paused');
      }
    },
    [loadPreview, options.reducedMotion, setStateSafe, storyId, unloadAndRelease, videoRef],
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

      Animated.timing(progress, {
        toValue: nextProgress,
        duration: options.reducedMotion ? 0 : 250,
        useNativeDriver: true,
      }).start();
      options.onProgress?.(nextProgress);

      if (
        stateRef.current === 'playing' &&
        !status.isPlaying &&
        !status.isBuffering &&
        !status.didJustFinish &&
        Date.now() >= ignorePauseStatusUntilRef.current
      ) {
        setStateSafe('paused');
      }

      if (status.didJustFinish) {
        if (videoRef.current) {
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
    async (value: boolean) => {
      const shouldResume = stateRef.current === 'playing';
      ignorePauseStatusUntilRef.current = Date.now() + 700;
      isMutedRef.current = value;
      setIsMuted(value);

      if (videoRef.current) {
        try {
          await videoRef.current.setIsMutedAsync(value);

          if (shouldResume) {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded && !status.isPlaying) {
              await videoRef.current.playAsync();
            }
            setStateSafe('playing');
          }
        } finally {
          setTimeout(() => {
            ignorePauseStatusUntilRef.current = 0;
          }, 700);
        }
      }
    },
    [setStateSafe, videoRef],
  );

  const getCurrentState = useCallback(() => stateRef.current, []);
  const getIsMuted = useCallback(() => isMutedRef.current, []);

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
    getCurrentState,
    isMuted,
    getIsMuted,
    setMuted,
    progress,
  };
}
