# ZIM Moments - Khoanh Khac Dang Nho

## 1) Giai phap da chon

### Animation approach (Native Animated API)
- Toan bo animation dang dung `Animated` cua React Native (`import { Animated } from 'react-native'`).
- Coverflow carousel duoc noi suy tu `scrollX`:
  - `scale`: active card lon hon, inactive card nho hon.
  - `rotateY`: tao depth khi swipe.
  - `opacity`: card xa giam do ro.
- Progress bar dung `scaleX` + `translateX` trong wrapper `overflow: hidden` (khong animate `width`).
- Lift on press, overlay reveal, mute button tap feedback deu dung `Animated.timing/spring/sequence`.

### Video lifecycle approach
- Moi card co 7 state:
  - `idle`, `preview`, `active_ready`, `playing`, `paused`, `backgrounded`, `offscreen_suspended`.
- Card active se auto play.
- Card khong active se pause.
- Cleanup decoder/buffer khi offscreen xa (`offscreen_suspended`).
- Co `AudioOwnerManager` de dam bao chi 1 card giu audio owner tai 1 thoi diem.
- Video auto replay khi chay het.

### UX va interaction
- Swipe ngang de doi card.
- Co nut `Prev` / `Next` ben duoi carousel.
- Co nut mute/unmute tren card.
- Safe Area da duoc ap dung o app shell.

### Accessibility
- Story card co `accessible`, `accessibilityRole="button"`, label/hint ro nghia.
- Co focus ring khi focus.
- Reduced Motion: skip autoplay transition phuc tap va giam duration animation ve 0 cho cac flow chinh.

## 2) Video Lifecycle State Machine (ASCII)

```text
idle -> preview -> active_ready -> playing -> paused
                      ^             |
                      |             v
offscreen_suspended <- backgrounded

Transitions chinh:
- center card: -> playing
- leave center: -> paused / preview / offscreen_suspended (tuy khoang cach)
- unmount: -> idle (cleanup)
- didJustFinish: replay tu dau
```

## 3) Cai dat va chay

### Yeu cau
- Node.js LTS (khuyen nghi >= 18)
- npm

### Cai dat
```bash
npm install
```

### Chay local
```bash
npm run start
```

### Chay theo nen tang
```bash
npm run ios
npm run android
npm run web
```

## 4) Build APK (EAS)

### Cai EAS CLI
```bash
npm install -g eas-cli
```

### Dang nhap
```bash
eas login
```

### Cau hinh project (lan dau)
```bash
eas build:configure
```

### Build Android
```bash
eas build -p android --profile preview
```

## 5) Demo links

- Demo video: `TODO_Add_Demo_Video_Link`
- APK download: `TODO_Add_APK_Link`
- Store/TestFlight: `TODO_Add_Store_Link`

---

## Stack
- Expo SDK 54
- React Native 0.81
- TypeScript
- Native `Animated` API (React Native)
- react-native-gesture-handler
- react-native-safe-area-context
- expo-av
- expo-image
