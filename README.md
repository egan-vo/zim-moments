# ZIM Moments

A short-form story carousel built with Expo, React Native, and the native `Animated` API. The experience focuses on smooth swipe navigation, lightweight transform-based motion, clear video playback, responsive portrait/landscape layouts, and readable Vietnamese story captions.

## Solution Overview

### Animation Approach

- Uses React Native's native `Animated` API via `import { Animated } from 'react-native'`.
- The coverflow carousel is driven by `scrollX` interpolation:
  - Active cards stay larger and clearer.
  - Side cards scale down and fade slightly.
- Progress uses `scaleX` and `translateX` inside an `overflow: hidden` wrapper instead of animating `width`.
- Card press lift, caption reveal, mute feedback, and caption parallax use transform/opacity-based animation.
- Media is intentionally not shifted for parallax, so videos remain sharp and display in their original card frame.
- 3D tilt was intentionally removed to keep the mobile experience calmer and reduce motion discomfort.

### Why This Solution

- Native `Animated` keeps the implementation aligned with the assignment constraints without adding a heavier motion dependency.
- `useNativeDriver: true` moves supported animations off the JS thread for smoother carousel, press, progress, and overlay motion.
- Transform/opacity animation is predictable across Expo Go, simulator, and native builds.
- The component and hook split keeps video lifecycle, carousel metrics, and presentation logic easy to review and maintain.

### Caption And Overlay

- Captions have a subtle scroll-driven parallax effect separate from the media layer.
- A dark rounded caption backdrop improves readability without dimming the full video.
- Location text is truncated to one line while collapsed.
- When the caption is expanded, the full location and full caption are shown.
- Story captions and locations are localized in Vietnamese.

### Video Lifecycle

- The video lifecycle uses `idle`, `preview`, `active_ready`, `playing`, `paused`, and `offscreen_suspended` during the carousel flow.
- `backgrounded` is supported by the state machine for future AppState handling, but this build does not currently trigger it from an AppState listener.
- The active card auto-plays, while non-active cards pause automatically.
- Adjacent cards stay in preview, and far offscreen cards transition to `offscreen_suspended` to unload video resources.
- `AudioOwnerManager` ensures only one card owns audio at a time.
- When a video finishes, the carousel advances to the next story when available; the final story replays from the beginning.

### UX And Interaction

- Horizontal swipe navigation between stories.
- `Prev` and `Next` controls are available; in landscape they sit beside the carousel.
- Mute/unmute is available per card with tap feedback.
- Tapping the video toggles play/pause.
- Tapping the caption toggles the expanded story context.
- Portrait and landscape layouts are supported. In landscape, the header is reduced and navigation controls move beside the carousel.

### Accessibility

- Story cards use `accessible`, `accessibilityRole="button"`, and descriptive labels/hints.
- Focus rings are shown for keyboard or focus-based navigation, and focus triggers the same lift motion as press/hover.
- Reduced Motion is respected by shortening supported animation durations to `0` for core UI flows.
- Video playback still works when Reduced Motion is enabled; reduced motion only shortens UI animation timing.

### Performance And Assets

- Core animations use `transform` and `opacity`, avoiding layout-heavy animated properties such as `top`, `left`, `width`, and `height`.
- `Animated.event` connects carousel scroll position to native-driven animation values.
- `FlatList` uses `windowSize`, `maxToRenderPerBatch`, and `removeClippedSubviews` to limit offscreen work.
- Thumbnail loading uses `expo-image` with BlurHash placeholders.
- Far offscreen video cards move to `offscreen_suspended` to release decoder/buffer resources.

## Requirement Coverage

Current status summary:

- Implemented: Expo/React Native source code, swipe carousel, press/focus lift motion, transform/opacity animation, native `Animated` API, reduced motion support, video auto-play/advance/replay-on-final-story, mute without pausing, single-audio ownership, portrait/landscape responsiveness, caption expand/collapse, and lazy image placeholders.
- Reviewed: carousel performance paths use native-driven animation and bounded `FlatList` rendering; caption text is placed on a dedicated dark backdrop to target WCAG AA readability; keyboard/focus states are visible and motion-enabled.
- Intentionally scoped out: 3D tilt, dynamic WebP/AVIF selection, and device-specific image resolution selection. These are useful production enhancements but add complexity beyond the core assignment.

## Implementation Map

- Main section: `src/components/MomentSection/MomentSection.tsx`
- Carousel metrics and scrolling: `src/hooks/useCarousel.ts`
- Story card interactions: `src/components/MomentSection/StoryCard.tsx`
- Video state machine: `src/hooks/useVideoLifecycle.ts`
- Audio ownership: `src/managers/AudioOwnerManager.ts`
- Caption overlay: `src/components/MomentSection/CaptionOverlay.tsx`
- Mute micro-interaction: `src/components/MomentSection/MuteButton.tsx`
- Progress bar: `src/components/MomentSection/ProgressBar.tsx`
- Lazy image placeholder: `src/components/common/LazyImage.tsx`
- Story data: `src/data/stories.ts`
- Orientation config: `app.json`

## Video Lifecycle State Machine

```text
idle -> preview -> active_ready -> playing -> paused
  |         ^              |            |
  |         |              v            v
  +----> playing      offscreen_suspended

Supported but not currently AppState-wired:
playing / paused -> backgrounded -> offscreen_suspended

Main transitions:
- Center card: -> playing
- Leave center: -> paused / preview / offscreen_suspended, depending on distance
- Unmount: -> idle and clean up resources
- didJustFinish: advance to the next story, or replay from the beginning on the final story
```

## Installation

### Requirements

- Node.js LTS, recommended 18 or newer
- npm
- Expo Go for quick device testing, or a simulator/emulator for platform-specific testing

### Install Dependencies

```bash
npm install
```

### Run With Expo Go And Scan QR

```bash
npm run start
```

After Metro starts, a QR code appears in the terminal.

- Install **Expo Go** on your phone.
- Keep the phone and computer on the same Wi-Fi network.
- On iPhone, open the Camera app and scan the QR code.
- On Android, open Expo Go and tap **Scan QR code**.
- If the app does not connect on the same network, press `t` in the terminal to switch Expo connection mode, or restart with:

```bash
npx expo start --tunnel
```

### Run On Simulator, Emulator, Or Web

```bash
npm run ios
npm run android
npm run web
```

Notes:

- `npm run start` is the recommended path for Expo Go.
- `npm run ios` and `npm run android` use `expo run:*` and are best for local native builds or simulator/emulator testing.
- `npm run web` starts the Expo web target.

## Build Android APK With EAS

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Log In

```bash
eas login
```

### Configure The Project

```bash
eas build:configure
```

### Build Android

```bash
eas build -p android --profile preview
```

## Submission Links

- Expo project: [zim-moments on Expo](https://expo.dev/accounts/thienvonam.dev/projects/zim-moments)
- Android APK profile: `eas build -p android --profile preview`

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- Native `Animated` API
- react-native-safe-area-context
- expo-av
- expo-image
