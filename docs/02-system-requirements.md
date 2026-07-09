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
Purpose: Documentation file explaining aspects of Sanskar's PDF Editor.
============================================================================= -->

# 02 - System Requirements

Because Sanskar's PDF Editor runs a hybrid frontend/backend environment, specific underlying systems are required for development and deployment.

## Development Requirements
To contribute to or modify the source code, the following is required:

- **Node.js**: Version 18.0.0 or higher. The backend Express server and the frontend Vite bundler rely heavily on modern Node APIs.
- **NPM / Yarn / pnpm**: A package manager to resolve the `package.json` dependencies.
- **Rust Toolchain**: (Required *only* for Tauri builds). You must install `rustup` and the MSVC C++ build tools for Windows.
- **WebView2**: Windows 10/11 machines natively include the Microsoft Edge WebView2 runtime, which Tauri uses to render the React application without shipping a heavy Chromium binary (unlike Electron).

## End-User Requirements
When packaged into a final executable (`.exe` or `.msi`):
- **Operating System**: Windows 10 (Build 1809 or higher) or Windows 11. 
- **Memory**: Minimum 4GB RAM (8GB recommended for processing massive >100MB PDF files).
- **Disk Space**: ~20MB for the application binary (incredibly lightweight due to Tauri).

## Network Requirements
- **Strictly Offline**: The application requires **zero** internet connectivity after installation. This guarantees absolute compliance with strict data privacy laws (GDPR, HIPAA) for enterprise clients handling sensitive PDFs.

