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

# 15 - Troubleshooting Guide

Common issues during development or usage and how to resolve them.

## Issue 1: "Port 3000 is already in use"
When running `npm run dev`, you might see an Express error indicating port 3000 is blocked.
**Solution**: This usually means a previous `node` process did not shut down properly. Open Windows Task Manager and terminate any zombie `node.exe` processes, or run `taskkill /F /IM node.exe` in PowerShell.

## Issue 2: PDF Viewer shows a blank white canvas
**Solution**: Ensure that `pdfjs-dist` is correctly resolving its worker file. In `App.tsx`, we explicitly map the `GlobalWorkerOptions.workerSrc` to the locally installed `pdf.worker.mjs`. If you update `pdfjs-dist` to a new major version, verify the path to this worker script is still valid.

## Issue 3: TypeScript "No overload matches this call" on FormData
**Solution**: When appending a `File` object to a `FormData` payload in `App.tsx`, TypeScript will throw an error if it believes the `file` variable might be `null`. Always wrap the execution logic in a `if (!file) throw new Error(...)` block to satisfy the TypeScript compiler's strict null checks.

## Issue 4: Tools not updating the UI immediately
**Solution**: React relies on immutable state updates. If you accidentally mutate the `pdfBytes` array directly instead of receiving a brand new array from the backend, React will not detect the change. Always ensure the backend returns a new byte stream and you call `setPdfBytes(newBuffer)` with the new reference.

