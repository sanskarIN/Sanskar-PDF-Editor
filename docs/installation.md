# Installation & Setup Guide

This guide explains how to compile and run the Sanskar PDF Editor across different platforms.

## Prerequisites
- **Node.js** (v18+)
- **Rust** (1.70+)
- **Android Studio & NDK** (if compiling for Android)
- **Visual Studio C++ Build Tools** (if compiling on Windows)

## Local Development (Desktop App)

To run the Tauri Desktop app in development mode with Hot-Module Replacement (HMR):

```bash
npm install
npm run dev
```

## Compiling for Production

### Windows (.exe / .msi)
To build the native Windows installer binaries:

```bash
npm run tauri build
```
The output files will be located in `src-tauri/target/release/bundle/msi/`.

### Android (.apk)
To build the Android application:

```bash
npm run tauri android build
```
The output APK will be located in `src-tauri/gen/android/app/build/outputs/apk/universal/release/`.

### Standalone Web Version
If you want to bypass the native Tauri backend and build a standalone HTML file that runs 100% in the browser using the javascript fallback engine:

```bash
npm run build
```
This generates the `Web-Version.html` file in the root directory. You can open this file directly in any modern browser without a server.
