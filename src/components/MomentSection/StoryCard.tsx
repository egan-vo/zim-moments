import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  DeviceEventEmitter,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';

import { type Story, type VideoPlayerRef, type VideoState } from '../../data/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { CAROUSEL_DRAG_START_EVENT } from '../../hooks/useCarousel';

import LazyImage from '../common/LazyImage';

import CaptionOverlay from './CaptionOverlay';
import MuteButton from './MuteButton';
import ProgressBar from './ProgressBar';
import { styles } from './StoryCard.styles';
import VideoPlayer from './VideoPlayer';

type StoryCardProps = {
  story: Story;
  isActive: boolean;
  distanceFromActive: number;
};

function StoryCard({ story, isActive, distanceFromActive }: StoryCardProps) {
  const videoRef = useRef<VideoPlayerRef>(null);
  const ignoreVideoTapUntilRef = useRef(0);
  const ignorePauseUntilRef = useRef(0);
  const { reducedMotion } = useReducedMotion();

  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const muteVisibility = useRef(new Animated.Value(0)).current;
  const isPressed = useRef(new Animated.Value(0)).current;
  const captionExpandProgress = useRef(new Animated.Value(0)).current;

  const transitionTo = useCallback(async (nextState: VideoState) => {
    await videoRef.current?.transitionTo(nextState);
  }, []);

  const handleVideoTap = useCallback(async () => {
    if (Date.now() < ignoreVideoTapUntilRef.current) {
      return;
    }

    if (!isActive) {
      return;
    }

    if (isCaptionExpanded) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsCaptionExpanded(false);
      return;
    }

    const current = videoRef.current?.getCurrentState() ?? videoState;
    if (current === 'playing') {
      await transitionTo('paused');
      return;
    }

    await transitionTo('playing');
  }, [isActive, isCaptionExpanded, transitionTo, videoState]);

  const handleCaptionTap = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCaptionExpanded((prev) => !prev);
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.timing(isPressed, {
      toValue: 1,
      duration: reducedMotion ? 0 : 120,
      useNativeDriver: true,
    }).start();
  }, [isPressed, reducedMotion]);

  const handlePressOut = useCallback(() => {
    Animated.timing(isPressed, {
      toValue: 0,
      duration: reducedMotion ? 0 : 120,
      useNativeDriver: true,
    }).start();
  }, [isPressed, reducedMotion]);

  const handleMuteToggle = useCallback(async () => {
    const nextMuted = !(videoRef.current?.getIsMuted() ?? isMuted);
    setIsMuted(nextMuted);
    await videoRef.current?.setMuted(nextMuted);
  }, [isMuted]);

  const markMuteInteraction = useCallback(() => {
    const until = Date.now() + 500;
    ignoreVideoTapUntilRef.current = until;
    ignorePauseUntilRef.current = until;
  }, []);

  useEffect(() => {
    Animated.timing(muteVisibility, {
      toValue: videoState === 'playing' ? 1 : 0,
      duration: reducedMotion ? 0 : 180,
      useNativeDriver: true,
    }).start();
  }, [muteVisibility, reducedMotion, videoState]);

  useEffect(() => {
    if (isActive) {
      void transitionTo('playing');
      return;
    }

    if (videoRef.current?.getCurrentState() === 'playing') {
      void transitionTo('paused');
    }
  }, [isActive, transitionTo]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(CAROUSEL_DRAG_START_EVENT, () => {
      if (Date.now() < ignorePauseUntilRef.current) {
        return;
      }

      if (videoRef.current?.getCurrentState() === 'playing') {
        void transitionTo('paused');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [transitionTo]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    Animated.timing(captionExpandProgress, {
      toValue: isCaptionExpanded ? 1 : 0,
      duration: reducedMotion ? 0 : 220,
      useNativeDriver: true,
    }).start();
  }, [captionExpandProgress, isCaptionExpanded, reducedMotion]);

  const translateY = isPressed.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const scale = isPressed.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

  return (
    <Animated.View style={styles.cardContainer}>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Story từ ${story.location}`}
        accessibilityHint="Nhấn một lần để xem chi tiết, nhấn hai lần để mở link"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.pressable, isFocused && styles.focusRing]}
      >
        <Animated.View style={[styles.card, { transform: [{ translateY }, { scale }] }]}> 
          <LazyImage uri={story.thumbnailUrl} blurhash={story.blurhash} />

          <VideoPlayer
            ref={videoRef}
            story={story}
            isActive={isActive}
            distanceFromActive={distanceFromActive}
            onStateChange={setVideoState}
            onMutedChange={setIsMuted}
            onProgress={(value) => {
              progress.setValue(value);
            }}
            onVideoEnd={() => {
              void transitionTo('playing');
            }}
          />

          <ProgressBar progress={progress} />

          <View pointerEvents="box-none" style={styles.interactionLayer}>
            <Pressable onPress={handleVideoTap} style={styles.videoTapZone} />
            <Pressable onPress={handleCaptionTap} style={styles.captionTapZone} />
          </View>

          <MuteButton
            isMuted={isMuted}
            onToggle={handleMuteToggle}
            onInteract={markMuteInteraction}
            visible={muteVisibility}
          />

          {videoState !== 'playing' ? (
            <View style={styles.playButtonWrap} pointerEvents="none">
              <View style={styles.playButton}>
                <Text style={styles.playGlyph}>▶</Text>
              </View>
            </View>
          ) : null}

          <CaptionOverlay
            story={story}
            isExpanded={isCaptionExpanded}
            expandProgress={captionExpandProgress}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default memo(StoryCard);
