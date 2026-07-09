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

# 04 - Backend Architecture (Node.js & Express)

The secret weapon of Sanskar's PDF Editor is the local Node.js execution layer.

## Why a Node.js Backend?
Browsers impose strict memory limits on JavaScript tabs. Attempting to parse, merge, and re-serialize a 200MB PDF document purely in the browser can easily trigger an "Out of Memory" crash. 
By offloading this to a local Node.js instance, we bypass browser limits and gain access to the full power of the host machine's RAM and CPU.

## The Express Server (`server/index.ts`)
- **Port 3000**: The Express app binds to localhost port 3000.
- **CORS Configuration**: Cross-Origin Resource Sharing is enabled so the Vite frontend (running on port 5173) can seamlessly dispatch HTTP POST requests to the backend.

## The Universal `/execute` Endpoint
Instead of creating 50 different REST routes for 50 different tools, the architecture utilizes a single, highly optimized endpoint: `/api/pdf/execute`.
- **Action Routing**: The frontend submits a `FormData` payload containing the file and an `action` string (e.g., `"dup-all"`).
- **The Switch Engine**: The backend runs the action string through a massive `switch` statement.
- **Execution**: The PDF is modified in memory, saved to a new buffer, and immediately streamed back to the frontend with the `Content-Type: application/pdf` header.

