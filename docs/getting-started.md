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

# Getting Started Guide

This document explains how to get the project running as fast as possible.

## Prerequisites
- **Node.js**: Ensure Node.js (v18+) is installed.
- **NPM**: Node Package Manager comes with Node.js.
- **Rust (Optional)**: Required only if you want to build the final Tauri desktop `.exe` or `.app`.

## Running the Project "Fastly"

We have configured the project so that you do not need to run the frontend and backend separately in different terminal windows. They are orchestrated together for maximum speed.

### Step 1: Install Dependencies
Open your terminal in the root directory (`E:\Easy Projects\Sanskar's PDF Editor`) and run:
```bash
npm install
```
This installs all dependencies for both the React frontend and the Express backend.

### Step 2: Start the Dev Server
To start the project rapidly, run:
```bash
npm run dev
```

### What happens when you run `npm run dev`?
Under the hood, we use the `concurrently` package to launch two processes simultaneously:
1. `"dev:frontend": "vite"` - Starts the blazing-fast React Vite server on `http://localhost:5173`.
2. `"dev:backend": "ts-node server/index.ts"` - Starts the local Node.js PDF processing API on `http://localhost:3000`.

This means with one command, the entire full-stack application boots up in seconds!

## Building for Production

If you want to package the application into a single, optimized bundle:

1. Run `npm run build` to compile the TypeScript and build the Vite frontend into the `dist/` directory.
2. The final bundle sizes are heavily optimized (e.g., `dist/index.html` compresses to ~426 kB).

## Project Structure
- `/src`: Contains the React frontend (App.tsx, index.css, components).
- `/server`: Contains the Node.js Express backend (index.ts).
- `/src-tauri`: Contains the Rust backend for desktop deployment.
- `/docs`: Detailed project documentation.

