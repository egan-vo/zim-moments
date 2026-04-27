# ZIM Moments

A short-form story carousel built with Expo, React Native, and the native `Animated` API. The experience focuses on smooth swipe navigation, lightweight motion, clear video playback, and readable story captions.

## Solution Overview

### Animation Approach

- Uses React Native's native `Animated` API via `import { Animated } from 'react-native'`.
- The coverflow carousel is driven by `scrollX` interpolation:
  - Active cards stay larger and clearer.
  - Side cards scale down and fade slightly.
- Progress uses `scaleX` and `translateX` inside an `overflow: hidden` wrapper instead of animating `width`.
- Card press lift, caption reveal, mute feedback, and caption parallax use transform/opacity-based animation.
- Media is intentionally not scaled or shifted for parallax, so videos remain sharp and display in their original card frame.

### Caption And Overlay

- Captions have a subtle scroll-driven parallax effect separate from the media layer.
- A dark rounded caption backdrop improves readability without dimming the full video.
- Location text is truncated to one line while collapsed.
- When the caption is expanded, the full location and full caption are shown.
- Story captions and locations are localized in Vietnamese.

### Video Lifecycle

- Each card moves through these states:
  - `idle`
  - `preview`
  - `active_ready`
  - `playing`
  - `paused`
  - `backgrounded`
  - `offscreen_suspended`
- The active card auto-plays.
- Non-active cards pause automatically.
- Far offscreen cards release decoder/buffer resources through `offscreen_suspended`.
- `AudioOwnerManager` ensures only one card owns audio at a time.
- Videos replay automatically when they finish.

### UX And Interaction

- Horizontal swipe navigation between stories.
- `Prev` and `Next` controls are available; in landscape they sit beside the carousel.
- Mute/unmute is available per card with tap feedback.
- Tapping the video toggles play/pause.
- Tapping the caption expands or collapses the text.
- Portrait and landscape layouts are supported.

### Accessibility

- Story cards use `accessible`, `accessibilityRole="button"`, and descriptive labels/hints.
- Focus rings are shown for keyboard or focus-based navigation.
- Reduced Motion is respected by shortening supported animation durations to `0` for core UI flows.

## Video Lifecycle State Machine

```text
idle -> preview -> active_ready -> playing -> paused
                      ^             |
                      |             v
offscreen_suspended <- backgrounded

Main transitions:
- Center card: -> playing
- Leave center: -> paused / preview / offscreen_suspended, depending on distance
- Unmount: -> idle and clean up resources
- didJustFinish: replay from the beginning
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

### Start Development Server

```bash
npm run start
```

### Run By Platform

```bash
npm run ios
npm run android
npm run web
```

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

## Demo Links

- Demo video: `TODO_Add_Demo_Video_Link`
- APK download: `TODO_Add_APK_Link`
- Store/TestFlight: `TODO_Add_Store_Link`

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- Native `Animated` API
- react-native-gesture-handler
- react-native-safe-area-context
- expo-av
- expo-image
