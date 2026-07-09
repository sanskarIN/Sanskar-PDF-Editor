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

# 13 - Error Handling & Edge Cases

Dealing with corrupt or encrypted PDF documents is a major challenge in PDF processing.

## Encrypted Documents
By default, `pdf-lib` will throw a fatal error if it attempts to parse a PDF that is protected by a User Password or Owner Password.
In our backend `/execute` route, we explicitly pass the `{ ignoreEncryption: true }` flag to `PDFDocument.load()`. If the document has a weak owner password, the engine bypasses it. If it is fully encrypted with a User Password, the backend catches the error.

## Express Try/Catch Block
Every single Express route is wrapped in a massive `try { ... } catch (error) { ... }` block. 
If an operation fails (e.g., trying to remove page 50 from a 5-page document), the backend does not crash. It intercepts the exception and returns a cleanly formatted `HTTP 500 Internal Server Error` with a JSON payload containing the error message.

## UI Error Surfacing
The frontend `executeTool` function awaits the `fetch` response. 
If `!response.ok`, the frontend catches the thrown Error and triggers a graceful UI alert, preventing the application state from corrupting or freezing the interface.

