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

# 05 - Desktop Integration (Tauri)

While the app functions flawlessly in a browser, it is fundamentally designed to be a native Windows desktop application. We achieve this using Tauri.

## Tauri vs. Electron
Electron bundles a massive, complete version of the Google Chrome browser inside every application, resulting in 200MB+ file sizes and heavy RAM usage.
**Tauri** uses the host operating system's native webview (WebView2 on Windows). This results in an application binary that is often under 10MB and consumes a fraction of the RAM.

## IPC (Inter-Process Communication)
The React frontend communicates securely with the Rust backend via Tauri's IPC system.
- Instead of using HTML5 `<input type="file">` which is visually restrictive, the frontend imports `@tauri-apps/plugin-dialog`.
- When the user clicks "Open File", the frontend invokes `open()` from the Tauri API.
- The Rust backend hooks into the native Windows Win32 API to render a native Windows File Explorer dialog.
- The selected file path is passed back to the frontend, which then delegates it to the Node.js processing engine.

## Capabilities Configuration
Tauri uses a strict security model. The `src-tauri/capabilities/default.json` file explicitly grants the frontend permission to use the file dialogs (`dialog:allow-open`, `dialog:allow-save`). Any native API not explicitly whitelisted here is blocked by Tauri's security sandbox, preventing malicious code injection.

