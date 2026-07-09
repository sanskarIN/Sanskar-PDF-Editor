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

# 14 - Build and Deployment Pipeline

How to take the application from source code to production-ready binaries.

## 1. Web Deployment (Vite)
To deploy the application as a standard web application:
1. Run `npm run build`.
2. Vite executes `tsc` (TypeScript compiler) to guarantee 100% type safety across the entire codebase.
3. Vite then runs Rollup under the hood to tree-shake unused code, minify the CSS/JS, and output a highly optimized `dist/` folder.
4. Note: If deployed to the web, the Node.js backend must also be deployed to a cloud provider (like Heroku or AWS), and the frontend `fetch` URLs in `App.tsx` must be updated to point to the production backend rather than `localhost:3000`.

## 2. Desktop Deployment (Tauri)
To deploy the application as a standalone `.exe` or `.msi` Windows application:
1. Ensure the Rust toolchain is installed.
2. Run `npm run tauri build`.
3. Tauri will first execute the Vite web build.
4. It will then compile the Rust backend (`src-tauri/src/main.rs`).
5. Finally, it links the optimized web assets into the Rust binary and packages the entire suite into a native Windows installer located in `src-tauri/target/release/bundle/`.

