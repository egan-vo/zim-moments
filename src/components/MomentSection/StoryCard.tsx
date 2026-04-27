import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, Linking, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { type Story, type VideoPlayerRef, type VideoState } from '../../data/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useRevealOverlay } from '../../hooks/useRevealOverlay';
import { useTilt } from '../../hooks/useTilt';
import { CAROUSEL_DRAG_START_EVENT } from '../../hooks/useCarousel';

import LazyImage from '../common/LazyImage';

import CaptionOverlay from './CaptionOverlay';
import MuteButton from './MuteButton';
import ProgressBar from './ProgressBar';
import { STORY_CARD_SPRINGS, styles } from './StoryCard.styles';
import VideoPlayer from './VideoPlayer';

type StoryCardProps = {
  story: Story;
  isActive: boolean;
  distanceFromActive: number;
};

function StoryCard({ story, isActive, distanceFromActive }: StoryCardProps) {
  const videoRef = useRef<VideoPlayerRef>(null);
  const { reducedMotion } = useReducedMotion();

  const [videoState, setVideoState] = useState<VideoState>('idle');
  const [isMuted, setIsMuted] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const progress = useSharedValue(0);
  const muteVisibility = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const { tiltStyle, panGesture } = useTilt({ isActiveCard: isActive });
  const composedGesture = Gesture.Simultaneous(Gesture.Native(), panGesture);

  const { overlayStyle, captionStyle, ctaStyle, handleTap, isRevealed } = useRevealOverlay({
    ctaUrl: story.ctaUrl,
    onNavigate: (url) => {
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      void Linking.openURL(href);
    },
    reducedMotion,
  });

  const transitionTo = useCallback(async (nextState: VideoState) => {
    await videoRef.current?.transitionTo(nextState);
  }, []);

  const handleVideoTap = useCallback(async () => {
    if (!isActive) {
      return;
    }

    const current = videoRef.current?.getCurrentState() ?? videoState;
    if (current === 'playing') {
      await transitionTo('paused');
      return;
    }

    await transitionTo('playing');
  }, [isActive, transitionTo, videoState]);

  const handlePressIn = useCallback(() => {
    isPressed.value = true;
  }, [isPressed]);

  const handlePressOut = useCallback(() => {
    isPressed.value = false;
  }, [isPressed]);

  const handleMuteToggle = useCallback(() => {
    const nextMuted = !(videoRef.current?.getIsMuted() ?? isMuted);
    videoRef.current?.setMuted(nextMuted);
    setIsMuted(nextMuted);
  }, [isMuted]);

  useEffect(() => {
    muteVisibility.value = withTiming(videoState === 'playing' ? 1 : 0, {
      duration: reducedMotion ? 0 : 180,
    });
  }, [muteVisibility, reducedMotion, videoState]);

  useEffect(() => {
    if (isActive) {
      void transitionTo('playing');
      return;
    }

    void transitionTo('paused');
  }, [isActive, transitionTo]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(CAROUSEL_DRAG_START_EVENT, () => {
      if (videoRef.current?.getCurrentState() === 'playing') {
        void transitionTo('paused');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [transitionTo]);

  const liftStyle = useAnimatedStyle(() => {
    const liftY = isPressed.value ? -6 : 0;
    const liftScale = isPressed.value ? 1.02 : 1;

    return {
      transform: [
        {
          translateY: reducedMotion ? liftY : withSpring(liftY, STORY_CARD_SPRINGS.LIFT),
        },
        {
          scale: reducedMotion ? liftScale : withSpring(liftScale, STORY_CARD_SPRINGS.LIFT),
        },
      ],
    };
  }, [reducedMotion]);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.tiltContainer, tiltStyle]}>
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
          <Animated.View style={[styles.card, liftStyle]}>
            <LazyImage uri={story.thumbnailUrl} blurhash={story.blurhash} />

            <VideoPlayer
              ref={videoRef}
              story={story}
              isActive={isActive}
              distanceFromActive={distanceFromActive}
              onStateChange={setVideoState}
              onMutedChange={setIsMuted}
              onProgress={(value) => {
                progress.value = value;
              }}
              onVideoEnd={() => {
                void transitionTo('playing');
              }}
            />

            <ProgressBar progress={progress} />

            <MuteButton isMuted={isMuted} onToggle={handleMuteToggle} visible={muteVisibility} />

            {videoState !== 'playing' ? (
              <View style={styles.playButtonWrap} pointerEvents="none">
                <View style={styles.playButton}>
                  <Text style={styles.playGlyph}>▶</Text>
                </View>
              </View>
            ) : null}

            <CaptionOverlay
              story={story}
              overlayStyle={overlayStyle}
              captionStyle={captionStyle}
              ctaStyle={ctaStyle}
              isRevealed={isRevealed}
            />

            <View style={styles.interactionLayer}>
              <Pressable onPress={handleVideoTap} style={styles.videoTapZone} />
              <Pressable onPress={handleTap} style={styles.captionTapZone} />
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default memo(StoryCard);
