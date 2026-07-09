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
Purpose: Details how to isolate and run the React frontend independently.
============================================================================= -->

# Running the Frontend Independently

If you are strictly working on UI/UX changes (e.g., modifying the Glassmorphism CSS, adding new tool cards to the grid, or tweaking the Framer Motion animations) and do not need to execute PDF manipulation, you can run the frontend in isolation.

## Command
To launch only the React UI:
```bash
npm run dev:frontend
```

## Technical Details
This command executes:
```bash
vite
```
- The Vite server binds to `localhost:5173`.
- Memory consumption is drastically reduced because the Express server and `pdf-lib` are not loaded into the Node.js runtime.
- Note: If you click "Execute Tool" while running in isolation, the UI will throw a fetch error because `http://localhost:3000/api/pdf/execute` is offline. 

This isolated mode is purely for high-speed CSS and React component structural development!
