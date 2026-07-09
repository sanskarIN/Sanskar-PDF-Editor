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

# Technology Stack & Architecture

Sanskar's PDF Editor is built using a modern, extremely high-performance full-stack ecosystem. This document explains the exact languages, frameworks, and libraries used to power the application.

## 1. Programming Languages
- **TypeScript**: The entire application (both frontend and backend) is written in strictly typed TypeScript. This ensures absolute type safety across the massive 50+ tool API boundaries, preventing runtime crashes and ensuring deep structural integrity.
- **HTML5 & CSS3**: Used to structure the DOM and apply the native custom glassmorphism styles and layout grids.
- **Rust (Tauri)**: The core desktop wrapper is built using Rust, providing extremely safe memory management and deep native OS hooks.

## 2. Frontend Web Framework
- **React 18**: The UI engine. We use modern React Hooks (`useState`, `useEffect`, `useRef`) to manage the complex application state (active tools, file buffers, modal states) without performance bottlenecks.
- **Vite**: The build tool and development server. Vite compiles the TypeScript into optimized browser-native ES Modules instantaneously, which is why `npm run dev` boots so fast.

## 3. Styling & Aesthetics
- **Tailwind CSS**: A utility-first CSS framework. It is used to rapidly build the responsive grid layouts and construct the dark-theme UI.
- **Framer Motion**: The physics-based animation library for React. This powers the micro-interactions, spring-loaded hover states, pulsating UI elements, and smooth page transitions that give the app its "Ultimate Engine" feel.
- **Lucide React**: The beautifully consistent, open-source SVG icon library used across all 50+ tool cards.

## 4. PDF Manipulation Engines
- **pdf-lib (Backend)**: The core workhorse of the application. Written in TypeScript, this library is used on our Node.js backend to parse, modify, merge, draw on, and rewrite binary PDF byte streams directly in RAM.
- **pdfjs-dist (Frontend)**: Developed by Mozilla, this library takes a binary PDF buffer and rasterizes it onto an HTML `<canvas>` element for crisp, zoomed-in visual previewing.
- **pdf-parse (Backend)**: Specifically designed to aggressively extract raw textual data from PDF buffers for our text-extraction API.

## 5. Backend Server Architecture
- **Node.js**: The runtime environment that executes the V8 JavaScript engine outside the browser, giving us access to raw file system and buffer manipulation.
- **Express.js**: The web framework for Node.js. We run an Express server locally on port 3000 to catch massive REST API requests from the React frontend.
- **Multer**: A middleware for handling `multipart/form-data`. It intercepts the massive PDF files uploaded from the React frontend and holds them entirely in server RAM (Memory Storage) so they can be processed instantly without disk I/O bottlenecks.

## 6. Desktop Packaging
- **Tauri 2.0**: The ultimate Electron alternative. Tauri takes our compiled React Vite build and packages it into a lightweight, highly secure desktop executable using Rust and the native OS Webview (WebView2 on Windows).
- **Tauri Dialog Plugin**: Allows the app to bypass standard browser `<input type="file">` popups and use the deeply native Windows OS file explorer dialogues.

## Development Tooling
- **Concurrently**: A brilliant CLI tool that allows us to run both the Vite frontend server and the `ts-node` backend server side-by-side in a single terminal process. This guarantees maximum development speed.

