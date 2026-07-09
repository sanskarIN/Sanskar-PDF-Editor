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

# 10 - File Handling (Multer)

When dealing with user uploads on the Node.js Express server, we must parse the incoming `multipart/form-data` HTTP requests. We use `multer`.

## Memory Storage Architecture
Normally, backend servers save uploaded files directly to the hard drive (`/tmp/` directories) to save RAM.
However, writing a 50MB PDF to a spinning hard drive, modifying it, and reading it back is extremely slow.

Because this application runs locally on the user's powerful desktop machine, we configure Multer to use **Memory Storage**:
```javascript
const upload = multer({ storage: multer.memoryStorage() });
```
This forces Express to hold the entire incoming PDF in a Node.js `Buffer` in RAM.

## The Processing Pipeline
1. The file arrives at `/api/pdf/execute`.
2. Multer parses it and attaches it to `req.file.buffer`.
3. We pass `req.file.buffer` directly into `PDFDocument.load()`.
4. We return the modified bytes directly into `res.send()`.

The file never touches the physical hard drive on the backend, resulting in instantaneous, lightning-fast execution times.

