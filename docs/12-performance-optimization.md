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

# 12 - Performance Optimization Strategies

Rendering and manipulating heavy binary files inside a browser environment requires extreme optimization.

## The Concurrency Model
During development, we use the `concurrently` package in our `package.json`.
Instead of forcing the developer to manage two separate terminal windows for the frontend and backend, `npm run dev` spawns both processes simultaneously, parsing logs intelligently and binding them to their respective ports.

## Memoization in React
The `PDFViewer` component takes the `pdfBytes` array as a prop.
If the user clicks "Next Page", the component must re-render the canvas. However, we do not want to re-parse the entire `pdfBytes` buffer on every page turn.
We heavily utilize `useEffect` with dependency arrays to ensure that `pdfjsLib.getDocument()` is only called when the actual `pdfBytes` buffer changes, caching the `PDFDocumentProxy` instance in memory for instantaneous page transitions.

## In-Memory Express Buffers
By utilizing `multer.memoryStorage()`, the Express server skips the operating system's disk I/O scheduler entirely. Operations that take 5-10 seconds on web-based PDF editors complete in less than 200 milliseconds on our architecture because the CPU is mutating raw RAM arrays.

