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

# Convert Tools Documentation

The **Convert** toolset acts as a bridge between the binary PDF format and standard web-friendly text or image formats. 

## 1. PDF to JSON (`to-json`)
- **Purpose**: Extracts critical metadata and page telemetry from the PDF, formatting it into a standardized JSON payload that other REST APIs or microservices can consume.
- **Deep Technical Workflow**:
  1. The file is uploaded to the backend `open` route.
  2. `pdf-lib` reads the PDF internal dictionary (the `/Info` dictionary in the PDF spec).
  3. It extracts the raw text buffers for fields like `/Title`, `/Author`, and `/Creator`.
  4. The data is wrapped in a structured JSON object along with `getPageCount()`.
  5. The frontend intercepts this JSON and triggers a `Blob` download of a `metadata.json` file to the user's local disk.

## 2. PDF to Base64 String (`to-base64`)
- **Purpose**: Serializes the raw binary data of the PDF into a secure, URL-safe Base64 text string.
- **Deep Technical Workflow**:
  - This is highly useful for transmitting PDFs over older SOAP APIs, or embedding them directly into an HTML `<embed src="data:application/pdf;base64,...">` tag without needing a server to host the file.
  - Executed purely in the frontend: The `Uint8Array` binary stream is converted character-by-character using `String.fromCharCode()` and then encoded into Base64 using the native browser `window.btoa()` API.

## 3. Image to PDF (`to-png`, `to-jpg`)
- **Purpose**: rasterizes the PDF pages into standard web images.
- **Deep Technical Workflow**:
  - The application leverages the `pdfjs-dist` worker threads.
  - A PDF page is parsed into a sequence of drawing instructions (lines, bezier curves, text operators).
  - The instructions are drawn onto an invisible, high-DPI HTML `<canvas>`.
  - We call `canvas.toDataURL('image/png')` to generate an exact pixel-perfect rasterized version of the vector PDF, which is then downloaded by the user.

