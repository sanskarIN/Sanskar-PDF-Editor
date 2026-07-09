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
Purpose: Documentation file explaining aspects of Sanskar's PDF Editor.
============================================================================= -->

# 06 - The PDF-Lib Engine

The absolute core of our document processing capability is `pdf-lib`.

## What is pdf-lib?
`pdf-lib` is an open-source, pure TypeScript library that allows the creation and modification of PDF documents without relying on external native binaries like Ghostscript or poppler.

## How we use it
When a user uploads a PDF, the Express backend executes:
```javascript
const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
```
This parses the binary buffer into a heavily structured AST (Abstract Syntax Tree) representing the PDF Cross-Reference (XRef) table and object dictionaries.

- **Modifying the AST**: Tools like "Remove Metadata" directly delete keys from the `/Info` object in the AST. Tools like "Rotate" modify the `/Rotate` integer on specific Page object dictionaries.
- **Content Stream Injection**: Tools like "Draw Rectangle" compile new PDF graphics operators (`re` and `S`) and inject them into the page's `/Contents` stream array.

Once the AST is modified, `pdfDoc.save()` re-serializes the entire tree back into a flat `Uint8Array` binary stream, ensuring mathematical compliance with the ISO 32000-1 PDF standard.

