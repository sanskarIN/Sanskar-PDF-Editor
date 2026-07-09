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
Purpose: Documentation file explaining aspects of Sanskar's PDF Editor.
============================================================================= -->

# 50+ Ultimate PDF Tools Guide

Sanskar's PDF Editor is equipped with over 50 unique tools designed to handle every possible PDF requirement. This guide deeply explains every feature category and what the tools do under the hood.

## 1. Organize
These tools are designed to manipulate the pages within a document.
- **Duplicate All Pages (`dup-all`)**: Clones every single page and inserts the clone immediately after the original. Useful for creating two-per-page handouts.
- **Remove First Page (`rem-first`)**: Deletes page index 0. Perfect for stripping cover letters.
- **Remove Last Page (`rem-last`)**: Deletes the final page of the document.
- **Keep First Only (`keep-first`)**: Iteratively removes all pages except the cover.
- **Keep Last Only (`keep-last`)**: Iteratively removes all pages except the last one.
- **Extract Middle Page (`ext-mid`)**: Calculates the exact middle index of the document and deletes all other pages.
- **Shuffle Pages (`shuffle`)**: Randomizes the order of pages in the document.

## 2. Convert
These tools handle transforming the PDF into other formats or vice versa.
- **PDF to JSON (`to-json`)**: Extracts the metadata (Title, Author, Creator) and page count into a structured JSON file.
- **PDF to Base64 (`to-base64`)**: Converts the binary PDF stream into a Base64 encoded text string. Useful for embedding PDFs directly into HTML or JSON payloads.
- **JPG to PDF (`jpg-to`)**: Wraps a JPEG image into a standard PDF page.
- **PNG to PDF (`png-to`)**: Wraps a transparent PNG image into a PDF page.

## 3. Edit
These tools allow you to modify the visual properties and geometry of the PDF.
- **Advanced Viewer (`viewer`)**: A beautiful, custom-built canvas viewer using `pdfjs-dist` to pan, zoom, and inspect PDFs.
- **Rotate 45° (`rot-45`)**: Iterates through all pages and adds 45 degrees to their existing rotation matrix.
- **Shift Right 50px (`shift-x`)**: Applies a geometric translation to push all content 50 pixels to the right. Ideal for fixing printer margins.
- **Shift Up 50px (`shift-y`)**: Translates all content vertically.
- **Yellow Background (`bg-yellow`)**: Draws a translucent yellow rectangle over every page to simulate a "reading mode" tint.
- **Resize to A4 (`resize-a4`)**: Forces the media box of every page to exact A4 dimensions (595.28 x 841.89 points).
- **Resize to Letter (`resize-letter`)**: Forces every page to US Letter dimensions (612 x 792 points).
- **Crop PDF (`crop`)**: Shrinks the bounding box of every page by 20 points on all sides, effectively zooming in and cutting off edges.
- **Draw Rectangle (`draw-rect`)**: Draws a red 100x100 border box in the exact center of every page.
- **Draw Circle (`draw-circle`)**: Draws a translucent blue circle in the center of every page.
- **Add Header (`add-header`)**: Stamps "HEADER TEXT" dynamically at the top center of every page.
- **Add Borders (`borders`)**: Draws a thick 5-point black border around the perimeter of every page.

## 4. Security
These tools manage the sensitive nature of PDF documents.
- **Edit Metadata (`meta-edit`)**: Allows the user to inject a custom Title into the internal PDF dictionary.
- **Strip Metadata (`meta-remove`)**: Completely erases the Title, Author, Subject, Keywords, Producer, and Creator fields to ensure absolute privacy before sharing.
- **Text Watermark (`watermark`)**: Draws massive "CONFIDENTIAL" text diagonally across the page at 30% opacity to prevent unauthorized distribution.
- **Stamp "APPROVED" (`stamp-appr`)**: Stamps a green APPROVED badge.
- **Stamp "DRAFT" (`stamp-draft`)**: Stamps a blue DRAFT badge.
- **Redact PDF (`redact`)**: Draws solid black boxes over the center of the page to obscure sensitive information.

## Backend Implementation Note
All of the tools listed above (except for the frontend conversion tools like `to-base64`) are executed in `server/index.ts`. The Express server receives the tool `action` ID and uses a high-performance `switch` statement to directly manipulate the binary PDF using the `pdf-lib` library. This guarantees that files are processed instantly and completely locally.

