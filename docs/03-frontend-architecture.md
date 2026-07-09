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

# 03 - Frontend Architecture (React & Vite)

The visual layer of the application is an engineering marvel designed for maximum responsiveness.

## React 18
We utilize React 18's concurrent rendering features to ensure the UI never freezes, even when a massive PDF is being rendered to the canvas.
- **Component Architecture**: The UI is broken down into strictly modular components: `Header.tsx`, `Sidebar.tsx`, `Toolbar.tsx`, `PDFViewer.tsx`, and the main orchestrator `App.tsx`.
- **State Orchestration**: The `App.tsx` file maintains the global source of truth:
  - `activeTool`: Tracks which of the 50 tools is currently selected.
  - `pdfBytes`: The raw `Uint8Array` of the loaded document.
  - `currentPage` & `zoom`: Viewport controls passed down to the `PDFViewer`.

## Vite Bundler
Vite replaces older bundlers like Webpack.
- **Esbuild Power**: Vite pre-bundles dependencies using `esbuild` (written in Go), which is 10-100x faster than JavaScript-based bundlers.
- **Instant HMR**: When you save a React component, Hot Module Replacement updates the UI in the browser in less than 50 milliseconds without losing application state.

## Dynamic Tool Grid
Instead of hardcoding 50 separate buttons, the UI dynamically maps over an `ALL_TOOLS` array. Each tool is an object containing an `id`, `name`, `desc`, `icon`, and `category`. This data-driven UI approach allows new tools to be added to the grid simply by pushing a new object into the array.

