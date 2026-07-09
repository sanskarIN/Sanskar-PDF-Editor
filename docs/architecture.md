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

# Architecture Overview

Sanskar's PDF Editor is built as a state-of-the-art hybrid application that leverages the best of modern web and native technologies to provide a lightning-fast, highly secure, and feature-rich PDF editing experience.

## The Hybrid Stack

### 1. Frontend: React + TypeScript + Vite
The user interface is powered by React and Vite. It is designed to be incredibly responsive and beautiful, featuring a custom glassmorphism aesthetic.
- **Why Vite?** Vite provides ultra-fast Hot Module Replacement (HMR) and optimized builds. When you run `npm run dev`, Vite spins up the frontend in milliseconds.
- **Styling**: We use Tailwind CSS for utility-first styling, combined with custom CSS for the frosted glass effects (`backdrop-blur`).
- **PDF Rendering**: We use `pdfjs-dist` (Mozilla's PDF.js) to render PDF pages onto HTML5 `<canvas>` elements for crisp, accurate previews.

### 2. Backend Engine: Node.js + Express + pdf-lib
Because pure frontend JavaScript can be slow and limited when manipulating large binary PDF files, we offload all the heavy lifting to a dedicated local Node.js server.
- **Express Server**: Runs on port 3000 and exposes REST API endpoints (e.g., `/api/pdf/execute`).
- **pdf-lib**: The core manipulation engine. It handles complex operations like merging, splitting, rotating, cropping, drawing shapes, and modifying metadata.
- **In-Memory Processing**: The backend uses `multer` with memory storage (`multer.memoryStorage()`) to process PDFs entirely in RAM without writing to the disk, ensuring maximum speed and security.

### 3. Desktop Deployment: Tauri (Rust)
While the core logic is Web and Node.js based, the application is packaged as a lightweight desktop application using Tauri.
- **Security**: Tauri apps are deeply secure and have a tiny footprint compared to Electron.
- **Native Dialogs**: We use `@tauri-apps/plugin-dialog` to trigger native OS file pickers (Open/Save dialogs) rather than standard browser inputs when running as a desktop app.

## Data Flow (How a Tool Works)

1. **Selection**: The user selects a tool from the gorgeous 50+ tool grid in the UI.
2. **File Selection**: The user drops a PDF into the dropzone. The file is read as a `File` object in the browser.
3. **Execution**: When the user clicks "Execute Tool", the frontend wraps the `File` and the tool's `action` string (e.g., `rot-45` or `draw-rect`) into a `FormData` object.
4. **Backend Processing**: The frontend makes a `POST` request to `http://localhost:3000/api/pdf/execute`.
5. **PDF-Lib Manipulation**: The Express backend receives the buffer, loads it into `PDFDocument`, applies the requested transformation via a massive `switch` statement, and serializes the document.
6. **Response**: The modified PDF buffer is sent back to the frontend as a binary stream.
7. **Download**: The frontend converts the received `Uint8Array` into a `Blob` and triggers a seamless file download for the user.

## Why this Architecture?

- **"Making Fastly"**: By combining Vite's blazing fast dev server with Node.js in-memory binary processing, the feedback loop for development and the processing speed for the end-user are unmatched.
- **Local & Secure**: 100% of the processing happens locally on the machine. No PDFs are ever uploaded to a remote cloud server. This is critical for enterprise security.

