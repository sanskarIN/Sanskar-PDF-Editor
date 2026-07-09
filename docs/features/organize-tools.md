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

# Organize Tools Documentation

The **Organize** toolset is designed to restructure the physical pages within a PDF document. These tools utilize `pdf-lib` on the Node.js backend to perform non-destructive extraction and reassembly of PDF byte streams.

## 1. Merge PDFs (`merge`)
- **Purpose**: Combines multiple independent PDF files into a single continuous document.
- **Deep Technical Workflow**:
  1. The user selects multiple `File` objects in the browser.
  2. The files are sent as a `multipart/form-data` array to the backend.
  3. The backend iterates through the array, using `PDFDocument.load()` on each buffer.
  4. A new blank `PDFDocument` is created.
  5. `mergedPdf.copyPages(source, source.getPageIndices())` is called to securely extract the cross-reference tables and binary streams of the pages without losing quality.
  6. The copied pages are appended to the new document.

## 2. Duplicate All Pages (`dup-all`)
- **Purpose**: Creates an exact clone of every page right next to the original (e.g., [Page 1, Page 1 Copy, Page 2, Page 2 Copy]).
- **Deep Technical Workflow**:
  - The algorithm loops from `i = 0` to `pages.length`.
  - It copies page `i` into a temporary variable.
  - It inserts the cloned page at index `i * 2 + 1`. This mathematical offset ensures the cloned page immediately follows the original, even as the document size grows dynamically during the loop.

## 3. Extract Middle Page (`ext-mid`)
- **Purpose**: Strips all pages except the exact center of the document.
- **Deep Technical Workflow**:
  - The middle index is calculated using `Math.floor(pages.length / 2)`.
  - The algorithm iterates through the pages *backwards* (from `pages.length - 1` to `0`).
  - Iterating backwards is a crucial technical requirement; if we iterated forwards and deleted index `0`, all subsequent indices would shift, corrupting the loop.
  - Any index that does not match the `mid` index is deleted using `pdfDoc.removePage(i)`.

## 4. Shuffle Pages (`shuffle`)
- **Purpose**: Randomizes or modifies the order of the pages.
- **Deep Technical Workflow**:
  - Because `pdf-lib` manages pages via an internal reference array, doing a true random shuffle requires creating a completely new `PDFDocument` and copying pages over in a randomized order based on a Fisher-Yates array shuffle algorithm.

## 5. Keep First / Keep Last (`keep-first`, `keep-last`)
- **Purpose**: Isolates the absolute extremities of the document (cover page or back page).
- **Deep Technical Workflow**:
  - Uses a `while(pdfDoc.getPageCount() > 1)` loop. 
  - For `keep-first`, it constantly removes index `1` until only index `0` remains.
  - For `keep-last`, it constantly removes index `0` until only the final page remains.

