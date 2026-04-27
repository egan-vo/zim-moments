import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { type Story, type VideoPlayerRef, type VideoState } from '../../data/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useVideoLifecycle } from '../../hooks/useVideoLifecycle';

type VideoPlayerProps = {
  story: Story;
  isActive: boolean;
  distanceFromActive: number;
  onVideoEnd?: () => void;
  onStateChange?: (state: VideoState) => void;
  onProgress?: (value: number) => void;
  onMutedChange?: (muted: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
};

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(function VideoPlayer(
  {
    story,
    isActive,
    distanceFromActive,
    onVideoEnd,
    onStateChange,
    onProgress,
    onMutedChange,
    onLoadingChange,
  },
  ref,
) {
  const videoRef = useRef<Video | null>(null);
  const { reducedMotion } = useReducedMotion();

  const { state, transitionTo, getCurrentState, isMuted, getIsMuted, setMuted } = useVideoLifecycle(
    story.id,
    videoRef,
    {
      reducedMotion,
      onVideoEnd,
      onProgress,
      onLoadingChange,
    },
  );

  useImperativeHandle(
    ref,
    () => ({
      transitionTo,
      getCurrentState,
      setMuted,
      getIsMuted,
    }),
    [getCurrentState, getIsMuted, setMuted, transitionTo],
  );

  useEffect(() => {
    const distance = Math.abs(distanceFromActive);

    if (distance === 0) {
      void transitionTo('active_ready');
      return;
    }

    if (distance === 1) {
      void transitionTo('preview');
      return;
    }

    void transitionTo('offscreen_suspended');
  }, [distanceFromActive, transitionTo]);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  useEffect(() => {
    onMutedChange?.(isMuted);
  }, [isMuted, onMutedChange]);

  const shouldKeepVideoMounted =
    isActive ||
    Math.abs(distanceFromActive) <= 1 ||
    (state !== 'idle' && state !== 'offscreen_suspended');

  if (!shouldKeepVideoMounted || !story.videoUrl) {
    return null;
  }

  return (
    <Video
      ref={videoRef}
      source={{ uri: story.videoUrl }}
      style={styles.video}
      resizeMode={ResizeMode.COVER}
      isMuted={isMuted}
      shouldPlay={false}
      useNativeControls={false}
      isLooping={false}
      progressUpdateIntervalMillis={250}
      onError={() => {
        void transitionTo('idle');
      }}
    />
  );
});

const styles = StyleSheet.create({
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default memo(VideoPlayer);
