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
Purpose: Explains how to build and run the production web version of the PDF Editor.
============================================================================= -->

# Running the Web Version (Production)

To deploy Sanskar's PDF Editor as a standard web application accessible via a browser, you must build the frontend assets and serve them alongside the backend API.

## Step 1: Build the Frontend
Open your terminal in the root directory and run:
```bash
npm run build
```
This command triggers Vite to compile the React TypeScript codebase into highly optimized, minified HTML, CSS, and JS files located in the `dist/` directory.

## Step 2: Serve the Frontend & Backend
Because the architecture relies on a Node.js backend for PDF manipulation, you cannot just serve the `dist/` folder statically (like on GitHub Pages). You must run the Express server.

In a production environment, you would modify `server/index.ts` to statically serve the `dist/` directory:
```javascript
import express from 'express';
import path from 'path';

// Serve API routes...
app.post('/api/pdf/execute', ...);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

Then, you can start the production server:
```bash
node server/index.js
```
Navigate to `http://localhost:3000` to use the fully functional web application!
