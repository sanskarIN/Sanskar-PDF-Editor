// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// 
// Follow Sanskar or Creater on:-
// GitHub:- https://www.github.com/Sanskar-in
// LinkedIn:- https://www.linkedin.com/in/sanskar-in
// X (Formally known as Twitter):- https://www.x.com/Sanskar_in
// Source will available at the GitHub:- https://www.github.com/Sanskar-in/Sanskar-PDF-Editor
// Need support:- supportramsandesh@gmail.com
// Want to make your own apps, websites, games, or anything else via Sanskar:- sanskaryadavfrom2012to2026@gmail.com
// =============================================================================

<!-- =============================================================================
(c) Copyright Sanskar Yadav. All rights reserved.
Made by the Sanskar Yadav.
Purpose: Explains how to compile and run the native desktop executable using Tauri.
============================================================================= -->

# Running the Native Desktop Executable (Tauri)

Sanskar's PDF Editor is designed to be a deeply native Windows application that bypasses the limitations of web browsers.

## Step 1: Prerequisites
You must have the Rust toolchain installed.
1. Download and install [Rustup](https://rustup.rs/).
2. Ensure you have the Visual Studio C++ Build Tools installed.

## Step 2: Development Mode
If you want to run the desktop application in a live-reloading development environment:
```bash
npm run tauri dev
```
This command will:
1. Start the Vite React server on port 5173.
2. Compile the Rust `src-tauri` binary.
3. Launch a native Windows window running WebView2 that instantly reflects your React code changes.

## Step 3: Building the Executable
To package the application for distribution to end-users:
```bash
npm run tauri build
```
This command will:
1. Run `npm run build` to compile the optimized React `dist/` folder.
2. Bake the `dist/` assets directly into the Rust binary.
3. Output a highly compressed `.msi` installer and an `.exe` file inside `src-tauri/target/release/bundle/`.

## Running the Executable
Simply double-click the `.exe` file! The application will launch instantly in a standalone native window, utilizing a fraction of the RAM required by Electron.
