# ZIM Moments - Khoanh Khac Dang Nho

## 1) Giai phap da chon

### Animation approach
- Toan bo animation dung `react-native-reanimated` (shared values + worklet styles), tranh Animated API cu.
- Coverflow transform cho carousel card:
  - `scale` theo khoang cach den card active.
  - `rotateY` tao hieu ung chieu sau.
  - `opacity` giam dan cho card xa.
- Progress bar dung `scaleX` + wrapper `overflow: hidden`, khong animate `width` de tranh reflow.
- Tilt card dung `PanGesture` + spring reset, ket hop lift on press (`translateY`, `scale`).
- Overlay reveal dung timing/spring va stagger.

### Video lifecycle approach
- Moi card co mot state machine rieng voi 7 trang thai:
  - `idle`, `preview`, `active_ready`, `playing`, `paused`, `backgrounded`, `offscreen_suspended`.
- Card active la card duy nhat duoc phep autoplay/play.
- Transition duoc serialize de tranh race condition giua drag, autoplay, app state va tap gestures.
- Resource cleanup chu dong o `offscreen_suspended`/`idle` de tranh decoder leak.

### Accessibility approach
- Story card duoc khai bao `accessible` + role `button` + label/hint ro nghia.
- Co focus ring khi focus keyboard/assistive navigation.
- Reduced Motion:
  - Skip autoplay trong lifecycle.
  - Dua cac animation timing ve `duration: 0` o cac flow chinh.

### Video lifecycle chi tiet (theo yeu cau)
- State machine 7 states per card.
- Autoplay: center card only, trigger sau khi carousel settle (`SETTLE_DELAY_MS = 400ms`) va viewability threshold 70%.
- Pause: khi drag-start event, khi card roi active, khi app background (state machine transition), hoac khi bi revoke audio owner.
- Preload window:
  - Card hien tai: `active_ready`/`playing`.
  - Card lan can ±1: `preview` (giu buffer metadata/video loaded theo policy hook).
  - Xa hon: `offscreen_suspended` -> `unloadAsync()`.
- Single audio owner: `AudioOwnerManager` singleton dam bao chi 1 card co quyen audio tai 1 thoi diem.
- Auto-advance: su kien `didJustFinish` da expose callback `onVideoEnd` de noi voi logic chuyen story.
- Resource cleanup: `offscreen_suspended` -> pause -> setPosition(0) -> unload -> release owner.

## 2) Video Lifecycle State Machine (ASCII)

```text
                          (mount / init)
                               |
                               v
                            [idle]
                               |
                               | loadAsync(shouldPlay=false, muted=true)
                               v
                           [preview]
                               |
                               | card = center
                               v
                        [active_ready]
                               |
                      playAsync |  (neu reduced motion = false)
                               v
                           [playing]
                               |
                               | pauseAsync
                               v
                            [paused]

playing/paused --app background--> [backgrounded]
backgrounded --offscreen cleanup--> [offscreen_suspended]
offscreen_suspended --card gan lai--> [preview]

bat ky state --unmount--> [idle]

Note:
- reducedMotion=true: active_ready -> playing bi chan (giu thumbnail/ready state)
- didJustFinish: goi onVideoEnd callback
```

## 3) Cai dat va chay

### Yeu cau
- Node.js LTS (khuyen nghi >= 18)
- npm
- Expo CLI qua `npx expo`

### Cai dat
```bash
npm install
```

### Chay local
```bash
npm run start
```

### Chay tren tung nen tang
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

### Build Android APK
```bash
eas build -p android --profile preview
```

Neu can profile rieng cho APK/no-store, them vao `eas.json` profile phu hop truoc khi build.

## 5) Demo links

- Demo video: `TODO_Add_Demo_Video_Link`
- APK download: `TODO_Add_APK_Link`
- TestFlight/Store (neu co): `TODO_Add_Store_Link`

---

## Stack
- Expo
- React Native
- TypeScript
- react-native-reanimated
- react-native-gesture-handler
- expo-av
- expo-image
