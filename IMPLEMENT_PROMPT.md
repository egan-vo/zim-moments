# Implementation Prompt — ZIM "Khoảnh Khắc Đáng Nhớ"

---

## CONTEXT

Bạn là senior React Native developer. Tôi cần bạn implement **từng bước, từng file** một React Native Expo app theo đúng plan dưới đây.

**Yêu cầu cứng:**
- Expo SDK 51, React Native 0.74, TypeScript strict
- Chỉ dùng `StyleSheet` — không dùng NativeWind, Tamagui, bất kỳ UI lib nào
- Animation: `react-native-reanimated` v3 (worklet) — không dùng Animated API cũ
- Gesture: `react-native-gesture-handler` v2
- Video: `expo-av`
- Image: `expo-image`

**Cách làm việc:**
- Implement từng module một, đợi tôi confirm trước khi sang module tiếp theo
- Mỗi file phải compile được, không để TODO trống quan trọng
- Comment ngắn gọn tại logic phức tạp
- Sau mỗi module, liệt kê những gì vừa làm + những gì còn lại

---

## BƯỚC 0 — SCAFFOLD

Tạo project và install dependencies:

```bash
npx create-expo-app zim-moments --template blank-typescript
cd zim-moments
npx expo install expo-av expo-image expo-screen-orientation
npx expo install react-native-reanimated react-native-gesture-handler
```

Tạo cấu trúc thư mục sau (tạo file rỗng/barrel trước, sẽ fill sau):

```
src/
  components/MomentSection/
    index.tsx
    MomentSection.tsx
    MomentSection.styles.ts
    StoryCarousel.tsx
    StoryCard.tsx
    StoryCard.styles.ts
    CaptionOverlay.tsx
    VideoPlayer.tsx
    ProgressBar.tsx
    MuteButton.tsx
  components/common/
    LazyImage.tsx
    AmbientGlow.tsx
  hooks/
    useCarousel.ts
    useTilt.ts
    useRevealOverlay.ts
    useReducedMotion.ts
    useOrientation.ts
    useVideoLifecycle.ts
    useAppState.ts
  managers/
    AudioOwnerManager.ts
  data/
    stories.ts
  constants/
    layout.ts
    animation.ts
    colors.ts
  utils/
    imageUtils.ts
```

Sau đó config `babel.config.js` cho Reanimated plugin và `GestureHandlerRootView` trong `App.tsx`.

---

## BƯỚC 1 — CONSTANTS & DATA

### `src/constants/colors.ts`
```
BACKGROUND: '#1F1F1F'
CARD_SHADOW: 'rgba(0,0,0,0.5)'
OVERLAY_GRADIENT_START: 'rgba(0,0,0,0)'
OVERLAY_GRADIENT_MID: 'rgba(0,0,0,0.36)'
OVERLAY_GRADIENT_END: 'rgba(0,0,0,1)'
TEXT_PRIMARY: '#FFFFFF'
TEXT_SECONDARY: 'rgba(255,255,255,0.85)'
ACCENT: '#E53935'   (màu đỏ ZIM)
PROGRESS_TRACK: 'rgba(217,217,217,0.5)'
PROGRESS_FILL: '#D9D9D9'
AMBIENT_LEFT: '#E53935'
AMBIENT_RIGHT: '#7C3AED'
```

### `src/constants/layout.ts`
```
CARD_ASPECT = 9/16
CARD_WIDTH_RATIO = 0.72   (72vw)
SIDE_CARD_SCALE = [1, 0.85, 0.72] cho offset [0, 1, 2]
SIDE_CARD_ROTATE_Y = [-20, 0, 20] cho offset [-2, 0, 2]
SIDE_CARD_OPACITY = [1, 0.7, 0] cho offset [0, 1.5, 2.5]
GAP = 12
PROGRESS_BAR_HEIGHT = 4
SETTLE_DELAY_MS = 400
VISIBILITY_THRESHOLD = 0.7
SUSPEND_DEBOUNCE_MS = 200
```

### `src/constants/animation.ts`
```
SPRING_LIFT = { damping: 20, stiffness: 300, mass: 0.8 }
SPRING_TILT_BACK = { damping: 15, stiffness: 200 }
SPRING_OVERLAY = { damping: 18, stiffness: 200 }
OVERLAY_SHOW_DURATION = 250
OVERLAY_HIDE_DURATION = 200
STAGGER_LOCATION = 0
STAGGER_CAPTION = 80
STAGGER_CTA = 160
MAX_TILT_X = 6
MAX_TILT_Y = 8
```

### `src/data/stories.ts`

Interface:
```typescript
export type VideoState =
  | 'idle' | 'preview' | 'active_ready'
  | 'playing' | 'paused' | 'backgrounded' | 'offscreen_suspended';

export interface Story {
  id: string;
  location: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl?: string;
  ctaUrl?: string;
  blurhash?: string;
  duration?: number;
}

export interface VideoPlayerRef {
  transitionTo: (state: VideoState) => Promise<void>;
  getCurrentState: () => VideoState;
}
```

Data: extract 10 stories đầu từ list sau (thumbnailUrl lấy từ src trong HTML):
```
ZIM Academy - Q.10 | thumbnail: https://social-media.zim.vn/stories/24315262-.../uOEls0-... | video: ...1080p.m3u8 | cta: m.me/108664042169789?ref=ZIM550547
ZIM Academy - 143 Hồng Tiến - Q. Long Biên | thumbnail: https://social-media.zim.vn/stories/0bdd85d1-.../0gvOOp-thumbnail-0.png | cta: m.me/...
ZIM Academy - 133 Nguyễn Thị Thập - Q.7 | thumbnail: https://social-media.zim.vn/stories/6174e2f7-.../uhXUey-...jpg | cta: m.me/...
ZIM Academy - 139 Võ Oanh - Q. Bình Thạnh | thumbnail: https://social-media.zim.vn/stories/f7c1d487-.../MxliO1-thumbnail-1.png
ZIM Academy - 787 Luỹ Bán Bích - Tân Phú | thumbnail: https://social-media.zim.vn/stories/7e41eae4-.../S320yD-thumbnail-1.png
ZIM Academy - Tp. Thủ Đức | thumbnail: https://social-media.zim.vn/stories/05d1bfdb-.../q_2krQ-thumbnail-2.png
ZIM Academy - 148 Hoàng Diệu 2 | thumbnail: https://social-media.zim.vn/stories/c128fe23-.../odoq_v-IMG_1308.jpeg
ZIM Academy - 109 Nguyễn Thái Học, Vũng Tàu | thumbnail: https://social-media.zim.vn/stories/253b5dce-.../aXmdH3-IMG_9187.jpeg
ZIM Academy - Q.10 (v2) | thumbnail: https://social-media.zim.vn/stories/22ec9069-.../eq9qjt-IMG_6502.jpeg
ZIM Academy - 395 Quang Trung, Hà Đông | thumbnail: https://social-media.zim.vn/stories/17776b29-.../qP6nwQ-thumbnail-0.png
```
Caption điền ngắn gọn phù hợp. Đặt `blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'` tạm cho tất cả.

---

## BƯỚC 2 — MANAGERS & HOOKS CƠ BẢN

### `src/managers/AudioOwnerManager.ts`

Singleton class với:
- `claim(cardId: string, onRevoked: () => void): void` — revoke owner cũ trước, set owner mới
- `release(cardId: string): void` — xóa ownership
- `getCurrentOwner(): string | null`

### `src/hooks/useReducedMotion.ts`

```typescript
// Dùng AccessibilityInfo.isReduceMotionEnabled()
// Subscribe onChange
// Return: { reducedMotion: boolean }
```

### `src/hooks/useAppState.ts`

```typescript
// Dùng AppState.addEventListener('change')
// Return: { appState: AppStateStatus, isActive: boolean }
```

### `src/hooks/useOrientation.ts`

```typescript
// Dùng expo-screen-orientation
// Return: { isLandscape: boolean }
// Re-calculate CARD_WIDTH khi orientation change
```

---

## BƯỚC 3 — VIDEO LIFECYCLE

### `src/hooks/useVideoLifecycle.ts`

Đây là hook quan trọng nhất. Implement đầy đủ state machine:

```
States: idle → preview → active_ready → playing → paused → backgrounded → offscreen_suspended
```

Hook nhận vào: `(storyId: string, videoRef: RefObject<Video>, options: { reducedMotion: boolean })`

Expose ra:
```typescript
{
  state: VideoState,
  transitionTo: (nextState: VideoState) => Promise<void>,
  isMuted: boolean,
  setMuted: (v: boolean) => void,
  progress: SharedValue<number>,   // 0-1, dùng cho ProgressBar
}
```

Logic transitions:
```
idle → preview:
  loadAsync({ uri }, { shouldPlay: false, isMuted: true })

preview → active_ready:
  (đã load, chỉ đổi state)

active_ready → playing:
  if reducedMotion → stay at active_ready (show thumbnail)
  AudioOwnerManager.claim(storyId, () => transitionTo('paused'))
  playAsync()

playing → paused:
  pauseAsync()

paused → playing:
  playAsync()

playing/paused → backgrounded:
  pauseAsync() (giữ buffer)

backgrounded → offscreen_suspended:
  pauseAsync()
  setPositionAsync(0)
  unloadAsync()
  AudioOwnerManager.release(storyId)
  progress.value = 0

offscreen_suspended → preview:
  loadAsync lại

* → idle (unmount):
  unloadAsync()
  AudioOwnerManager.release(storyId)
```

onPlaybackStatusUpdate handler:
```
status.positionMillis / status.durationMillis → progress.value (withTiming 250ms)
status.didJustFinish → call onVideoEnd callback
```

---

## BƯỚC 4 — CAROUSEL CORE

### `src/hooks/useCarousel.ts`

```typescript
// Input: { totalItems: number, onActiveChange: (index: number) => void }
// Output: {
//   activeIndex: number,
//   scrollX: SharedValue<number>,
//   scrollHandler: AnimatedScrollHandler,
//   onMomentumScrollEnd: handler,   // → trigger onSnapComplete sau SETTLE_DELAY_MS
//   onScrollBeginDrag: handler,     // → emit 'drag-start' event
//   flatListRef: RefObject,
//   scrollToIndex: (i: number) => void,
// }

// onMomentumScrollEnd:
//   clearTimeout(settleTimer)
//   newIndex = Math.round(e.contentOffset.x / ITEM_SIZE)
//   setActiveIndex(newIndex)
//   settleTimer = setTimeout(() => onActiveChange(newIndex), SETTLE_DELAY_MS)

// onScrollBeginDrag:
//   clearTimeout(settleTimer)  // cancel pending play
//   emit drag start để VideoPlayer pause
```

### `src/components/MomentSection/StoryCarousel.tsx`

- `Animated.FlatList` horizontal
- `snapToInterval={ITEM_SIZE}`, `decelerationRate="fast"`
- `windowSize={5}`, `maxToRenderPerBatch={3}`, `removeClippedSubviews`
- `onViewableItemsChanged` với `viewabilityConfig = { itemVisiblePercentThreshold: 70 }`
- Render mỗi item là `StoryCard`
- Pass `isActive={index === activeIndex}` và `distanceFromActive={index - activeIndex}` vào card

Per-card animated style (worklet, không re-render):
```typescript
// Tính từ scrollX shared value
const offset = (index * ITEM_SIZE - scrollX.value) / ITEM_SIZE
scale = interpolate(|offset|, [0,1,2], SIDE_CARD_SCALE, 'clamp')
rotateY = interpolate(offset, [-2,0,2], SIDE_CARD_ROTATE_Y, 'clamp')
opacity = interpolate(|offset|, [0,1.5,2.5], SIDE_CARD_OPACITY, 'clamp')
```

---

## BƯỚC 5 — STORY CARD & ANIMATIONS

### `src/hooks/useTilt.ts`

```typescript
// PanGesture → tiltX, tiltY SharedValues
// onUpdate: clamp(translationX / CARD_WIDTH * 16, -MAX_TILT_Y, MAX_TILT_Y)
// onEnd: withSpring(0, SPRING_TILT_BACK) cho cả 2
// Return: { tiltStyle: AnimatedStyle, panGesture: PanGesture }
// Chỉ active khi isActiveCard = true
```

### `src/hooks/useRevealOverlay.ts`

```typescript
// overlayVisible: boolean state (tap count logic)
// overlayOpacity: SharedValue
// captionY: SharedValue
// Tap 1 → showOverlay(): withTiming(1, 250) + withSpring(0)
// Tap 2 → hideOverlay() + call onNavigate(ctaUrl)
// Auto-hide sau 4s nếu không tap lần 2
// Return: { overlayStyle, captionStyle, ctaStyle (với delay 160ms), handleTap, isRevealed }
```

### `src/components/MomentSection/StoryCard.tsx`

Compose tất cả lại:
```
GestureDetector (pan tilt)
  └── Animated.View (tiltStyle)
        └── Pressable (lift on press)
              └── Animated.View (liftStyle: translateY -6, scale 1.02 on press)
                    ├── LazyImage (thumbnail)
                    ├── VideoPlayer (ref forwarded, chỉ mount khi state !== idle)
                    ├── ProgressBar (top, 4px, scaleX)
                    ├── MuteButton (top-left, fade in khi playing)
                    ├── PlayButton (center, hiện khi paused)
                    └── CaptionOverlay (bottom gradient + reveal)
```

**Press lift:**
```typescript
const isPressed = useSharedValue(false);
// onPressIn: isPressed.value = true
// onPressOut: isPressed.value = false
// liftStyle: translateY withSpring(-6 or 0), scale withSpring(1.02 or 1)
```

**Tap 1/2 phân vùng:**
- Vùng video (top 70% card): tap toggle play/pause
- Vùng caption (bottom 30%): tap 1 = reveal, tap 2 = navigate

---

## BƯỚC 6 — VIDEO PLAYER COMPONENT

### `src/components/MomentSection/VideoPlayer.tsx`

```typescript
// forwardRef → VideoPlayerRef (transitionTo, getCurrentState)
// Props: { story, isActive, distanceFromActive, onVideoEnd }

// Internal:
// - useVideoLifecycle hook
// - Video component từ expo-av (useNativeControls={false})
// - HLS config: androidImplementation nếu cần
// - onError: transitionTo('idle') → show thumbnail fallback

// Effect: khi distanceFromActive đổi
//   distance === 0 → transitionTo('active_ready')
//   distance === 1 → transitionTo('preview')  
//   distance > 1  → transitionTo('offscreen_suspended')

// Render:
//   state === 'idle' → null (LazyImage handle thumbnail)
//   state !== 'idle' → <Video ... />
//   state === 'offscreen_suspended' → null
```

---

## BƯỚC 7 — SUBCOMPONENTS

### `src/components/MomentSection/ProgressBar.tsx`

```typescript
// Props: { progress: SharedValue<number> }
// KHÔNG dùng width animation (reflow)
// Dùng: scaleX + translateX để fake left-origin scale
// Track: 4px height, full width, PROGRESS_TRACK color
// Fill: scaleX = progress.value, origin left

// Trick: 
// style={{ width: '100%', transform: [{ scaleX: progress }] }}
// Wrap trong View overflow hidden → clip right side
```

### `src/components/MomentSection/MuteButton.tsx`

```typescript
// Props: { isMuted, onToggle, visible: SharedValue<number> }
// Animation khi tap: withSequence(withTiming(0.85, 80ms), withSpring(1))
// Fade in/out dựa vào visible SharedValue
// Icon: SVG path từ HTML gốc (speaker icon)
```

### `src/components/MomentSection/CaptionOverlay.tsx`

```typescript
// Props: { story, overlayStyle, captionStyle, ctaStyle, onCtaTap }
// LinearGradient bottom: transparent → rgba(0,0,0,0.36) → black
// Location name: stagger 0ms
// Caption text: stagger 80ms, numberOfLines={3}
// CTA button "Tìm hiểu thêm →": stagger 160ms, bounce on press
```

### `src/components/common/LazyImage.tsx`

```typescript
// Wrapper expo-image với:
// placeholder={{ blurhash: story.blurhash }}
// contentFit="cover"
// transition={300}
// recyclingKey={story.id}
```

### `src/components/common/AmbientGlow.tsx`

```typescript
// 2 View với blur effect giả lập ambient glow từ design gốc
// Left: bottom-right, màu AMBIENT_LEFT (đỏ ZIM), opacity 0.3
// Right: top-left, màu AMBIENT_RIGHT (tím), opacity 0.6
// Dùng position absolute, pointerEvents='none'
// Blur: blurRadius={80} hoặc MaskedView nếu cần
```

---

## BƯỚC 8 — ACCESSIBILITY

Trong `StoryCard.tsx`:

```typescript
<Pressable
  accessible
  accessibilityRole="button"
  accessibilityLabel={`Story từ ${story.location}`}
  accessibilityHint="Nhấn một lần để xem chi tiết, nhấn hai lần để mở link"
  style={({ focused }) => [styles.card, focused && styles.focusRing]}
>
```

```typescript
// styles.focusRing:
// borderWidth: 2, borderColor: '#FFFFFF', borderRadius: CARD_BORDER_RADIUS
```

Trong `useReducedMotion.ts`:
- Nếu `reducedMotion === true`: skip autoplay, dùng `duration: 0` cho tất cả animation

---

## BƯỚC 9 — SECTION WRAPPER & APP ENTRY

### `src/components/MomentSection/MomentSection.tsx`

```typescript
// Header: "6587 khoảnh khắc đáng nhớ" (bold, white)
// Subtext: "Hàng ngàn khoảnh khắc..." (small, white)
// AmbientGlow background
// StoryCarousel
```

### `App.tsx`

```typescript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#1F1F1F' }}>
      <StatusBar style="light" />
      <ScrollView>
        <MomentSection />
      </ScrollView>
    </GestureHandlerRootView>
  );
}
```

---

## BƯỚC 10 — README.md

Tạo `README.md` đầy đủ gồm:

1. **Giải pháp đã chọn** (animation approach, video lifecycle, accessibility)
2. **Video Lifecycle State Machine** diagram dạng ASCII
3. **Cài đặt & Chạy** (npm install, expo start)
4. **Build APK** (eas build)
5. **Demo links** placeholder

Trong phần giải pháp, mô tả rõ:
```
Video lifecycle:
- State machine 7 states per card
- Autoplay: center card only, 400ms after gesture settle, visibility > 70%
- Pause: drag start / visibility < 50% / app background / modal
- Preload window: current + ±1 (metadata only), xa hơn → unloadAsync()
- Single audio owner: AudioOwnerManager singleton
- Auto-advance: didJustFinish → next story
- Resource cleanup: offscreen_suspended → unloadAsync() → decoder released
```

---

## THỨ TỰ IMPLEMENT

Implement đúng thứ tự sau, mỗi bước đợi confirm:

```
Bước 0  → Scaffold + babel config
Bước 1  → Constants + Data
Bước 2  → AudioOwnerManager + basic hooks (reducedMotion, appState, orientation)
Bước 3  → useVideoLifecycle (quan trọng nhất, test kỹ)
Bước 4  → useCarousel + StoryCarousel (layout + coverflow transform)
Bước 5  → useTilt + useRevealOverlay + StoryCard (animations compose)
Bước 6  → VideoPlayer component (bridge carousel → lifecycle)
Bước 7  → ProgressBar, MuteButton, CaptionOverlay, LazyImage, AmbientGlow
Bước 8  → Accessibility pass (labels, focusRing, reduced motion)
Bước 9  → MomentSection wrapper + App.tsx
Bước 10 → README.md
```

---

## LƯU Ý QUAN TRỌNG

1. **Progress bar**: KHÔNG animate `width`. Dùng `scaleX` transform + `overflow: 'hidden'` wrapper
2. **Worklet annotation**: Mọi function chạy trong `useAnimatedStyle` / `useAnimatedScrollHandler` phải là worklet (`'worklet'` directive hoặc arrow function inline)
3. **runOnJS**: Khi cần call JS function từ gesture handler (pause video, set state), dùng `runOnJS()`
4. **Video mount**: Chỉ mount `<Video>` component khi state !== 'idle' và !== 'offscreen_suspended' để tránh decoder leak
5. **FlatList keyExtractor**: Dùng `story.id` để React không re-mount card khi scroll
6. **Gesture conflict**: Dùng `Gesture.Simultaneous(panGesture, nativeGesture)` nếu scroll + tilt conflict

Bắt đầu từ **Bước 0** và show tôi code + confirm trước khi sang bước tiếp theo.
