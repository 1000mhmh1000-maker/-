# ARMY RUSH

A portrait-first 3D crowd-battle runner built with Three.js and Capacitor.

## Build the web game

```sh
npm ci
npm run build
```

The Vite build bundles Three.js into `www/build/`; the app itself is served from `www/`.

## Build the Android APK

```sh
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.
The GitHub Actions workflow runs the same web build, Capacitor sync, and Gradle
build on pushes to the repository.

## Controls and progress

Drag left or right to steer the army across the bridge. Choose gates, avoid
traps, and clash with enemy squads and bosses. Spend earned coins in the
command-center lobby to strengthen your starting army, soldiers, coin bonus,
and arsenal. Progress is saved locally on the device.
