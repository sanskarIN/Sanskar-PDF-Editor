// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// 
// Follow Sanskar or Creater on:-
// GitHub:- https://www.github.com/Sanskar-in
// LinkedIn:- https://www.linkedin.com/in/sanskar-in/
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

# 09 - PDF Rendering (PDF.js)

To preview the PDFs before and after manipulation, the user needs to actually see the document. We use Mozilla's `pdfjs-dist` for this.

## How PDF.js Works
A PDF is not an image; it is a text-based list of vector drawing instructions.
When we pass the `pdfBytes` to `pdfjsLib.getDocument()`, PDF.js spins up a Web Worker thread.
This worker reads the PDF instructions, calculates the fonts and curves, and returns a `PDFPageProxy` object.

## The Canvas Render Loop
In `PDFViewer.tsx`:
1. We capture a reference to an HTML5 `<canvas>` node using `useRef`.
2. We call `page.render({ canvasContext, viewport })`.
3. PDF.js takes control of the canvas context and executes standard Canvas 2D API calls (`fillRect`, `bezierCurveTo`, `fillText`) to visually draw the PDF perfectly onto the screen.

## Zoom and Scale
The user can click the Zoom In / Zoom Out buttons on the toolbar. This updates the `zoom` state (e.g., `1.5` for 150%). The viewer component multiplies the base viewport scale by the zoom state and triggers a re-render of the canvas at a higher DPI resolution, preventing the PDF from looking pixelated when zoomed in.

