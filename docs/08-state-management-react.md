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

# 08 - State Management (React)

Managing the state of a complex 50+ tool PDF editor requires careful orchestration to prevent unnecessary re-renders.

## The Global State (`App.tsx`)
Because the application is highly centralized, we rely on top-level React hooks rather than heavy state libraries like Redux.
- `file`: The `File` object selected by the user.
- `pdfBytes`: The `Uint8Array` representing the currently loaded PDF in memory.
- `activeTool`: The exact tool object currently selected by the user.
- `isProcessing`: A boolean lock that disables all UI buttons while the Node.js backend is crunching a heavy file.

## The Update Loop
1. When a user clicks "Execute Tool", `isProcessing` is set to `true`. The UI shows a spinning loader.
2. The `pdfBytes` are sent to the backend.
3. The backend returns a *new* `Uint8Array`.
4. We call `setPdfBytes(newBuffer)` and set `isProcessing` back to `false`.
5. React detects the state change on `pdfBytes` and triggers a re-render of the `PDFViewer` component, instantly showing the user the cropped, rotated, or stamped PDF.

