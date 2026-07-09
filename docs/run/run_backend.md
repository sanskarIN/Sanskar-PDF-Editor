// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// 
// Follow Sanskar or Creater on:-
// GitHub:- https://www.github.com/Sanskar-in
// LinkedIn:- https://www.linkedin.com/in/sanskar-in/
// YouTube:- https://youtube.com/@Sanskar-in
// X (Formally known as Twitter):- https://www.x.com/Sanskar_in
// Source will available at the GitHub:- https://www.github.com/Sanskar-in/Sanskar-PDF-Editor
// Need support:- supportramsandesh@gmail.com
// Want to make your own apps, websites, games, or anything else via Sanskar:- sanskaryadavfrom2012to2026@gmail.com
// =============================================================================

<!-- =============================================================================
(c) Copyright Sanskar Yadav. All rights reserved.
Made by the Sanskar Yadav.
Purpose: Details how to isolate and run the Node.js backend server independently.
============================================================================= -->

# Running the Backend Server Independently

Sometimes, you may want to isolate the Node.js Express backend for debugging, or you may want to deploy the backend as a standalone microservice that multiple different frontends (e.g., a mobile app) can connect to.

## Command
To run the backend independently without starting the Vite frontend:
```bash
npm run dev:backend
```

## Technical Details
This command executes:
```bash
ts-node server/index.ts
```
- It uses `ts-node` to compile the TypeScript on the fly without needing a pre-build step.
- The server binds to `0.0.0.0:3000` by default.
- It is fully configured with `cors()` to accept cross-origin requests from any client.

## Testing the API
With the backend running independently, you can test the 50+ tools using Postman or cURL by sending a `multipart/form-data` request:
```bash
curl -X POST -F "file=@document.pdf" -F "action=watermark" http://localhost:3000/api/pdf/execute -o modified.pdf
```
This isolates the PDF-lib logic perfectly!
