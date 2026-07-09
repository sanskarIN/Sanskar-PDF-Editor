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
Purpose: Explains the single-command rapid development workflow for the full-stack environment.
============================================================================= -->

# Rapid Full-Stack Development (Dev Mode)

When developing or modifying Sanskar's PDF Editor, you need both the frontend React UI and the backend Node.js API running simultaneously. We have optimized this workflow into a single command.

## The Command
```bash
npm run dev
```

## What Happens Under the Hood?
This command triggers the `concurrently` package mapped in our `package.json`. 

It spawns two independent terminal processes in the background:
1. **`vite`**: The frontend bundler starts watching all `.tsx` and `.css` files. It spins up a local server on `http://localhost:5173`. Any changes to the UI are reflected in the browser in under 50 milliseconds via Hot Module Replacement (HMR).
2. **`ts-node server/index.ts`**: The backend processor starts listening on `http://localhost:3000`. This provides the `/api/pdf/execute` endpoint necessary for the 50+ tools to function.

## Why this is Fast
By orchestrating both environments together, you do not need to manually open multiple command prompts, navigate to different folders, and start services individually. This guarantees an incredibly fast, seamless development experience.
