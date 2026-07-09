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

# Complete Features Guide

Sanskar's PDF Editor is the ultimate PDF manipulation engine. This document deeply explores every single feature and capability currently available in the application.

## Core Application Features

### 1. Hybrid Architecture Execution
- **Instant Processing Engine**: The application utilizes a powerful local Node.js Express server to perform binary manipulations. This means file processing happens almost instantaneously in your computer's RAM rather than relying on slow browser-based JavaScript execution.
- **Privacy & Security**: Every operation is strictly local. No PDF file is ever sent to a third-party server or cloud, making this tool perfect for highly confidential and enterprise documents.

### 2. Glassmorphism UI/UX
- **Dark Mode Aesthetic**: A highly premium slate and indigo color palette.
- **Frosted Glass Panels**: The entire interface is built with Tailwind CSS utilizing `backdrop-blur` techniques to create semi-transparent glass cards.
- **Micro-Interactions**: Hovering over tool cards triggers subtle scaling animations and pulsating glowing background elements using Framer Motion.
- **Dynamic Tool Grid**: Over 50 tools are neatly categorized into Organize, Convert, Edit, and Security grids.

## Detailed Tool Explanations

### Organize Tools
- **Merge PDFs**: Combines multiple PDF files sequentially into a single unified document.
- **Split in Half**: Slices a document directly down the middle, allowing you to extract the first 50% or the last 50% of pages.
- **Duplicate All Pages**: Iterates through the document and inserts a clone of every single page immediately after the original.
- **Extract Odd/Even Pages**: Slices the document based on page numbering. Perfect for formatting documents for double-sided printing.
- **Remove Specific Pages**: Deletes the first page, the last page, or a custom range (e.g., stripping the cover page or appendix).
- **Extract Middle Page**: Automatically calculates the median page index and strips all other pages, isolating the exact center of the document.
- **Reverse Order**: Flips the entire document backward. Page 1 becomes the last page, and the last page becomes page 1.
- **Shuffle Pages**: Randomly scrambles the page order. Useful for creating randomized tests or flashcards.

### Convert Tools
- **PDF to Base64 String**: Translates the raw binary stream of the PDF into a Base64 text string. This allows developers to embed the PDF directly into JSON payloads or HTML `data:` URIs.
- **PDF to JSON Metadata**: Parses the internal PDF dictionary and outputs a JSON file containing the Title, Author, Subject, Creator, and total Page Count.
- **Image to PDF (JPG/PNG)**: Takes a standard image file and wraps it into a fully compliant PDF page structure.

### Edit Tools
- **Interactive Canvas Viewer**: Utilizes `pdfjs-dist` to render any PDF page directly onto an HTML `<canvas>`. Includes zooming, panning, and seamless navigation.
- **Geometric Translation (Shift X/Y)**: Moves the entire contents of a page by a specific pixel offset (e.g., pushing content 50px right or 50px down). Useful for correcting scanner misalignments or making room for a binding margin.
- **Rotate Pages**: Applies a 45°, 90°, 180°, or 270° rotational matrix to the pages.
- **Resize to Standard Formats**: Forces the page media box to mathematically exact dimensions like A4 (595.28 x 841.89 points) or US Letter (612 x 792 points).
- **Crop**: Shrinks the visual bounding box of the page by cutting 20 points off all four sides, effectively zooming in on the content.
- **Shape Drawing**: Programmatically injects vector graphics (rectangles, circles, borders) directly into the PDF rendering stream.
- **Add Headers & Footers**: Dynamically calculates page coordinates and injects customized text strings at the very top or bottom of every page.
- **Background Tints**: Draws a translucent yellow rectangle across the entire page to simulate "Reading Mode" and reduce eye strain.

### Security Tools
- **Metadata Editor**: Allows you to overwrite the internal document properties (Title, Author, Subject) embedded within the PDF.
- **Metadata Stripper**: The ultimate privacy tool. This completely erases all metadata traces, preventing forensic analysis of the document's origins, creation software, and author.
- **Watermarking**: Injects large, semi-transparent text diagonally across the document (e.g., "CONFIDENTIAL") to deter unauthorized sharing.
- **Bates Stamping**: Adds professional colored stamps such as "APPROVED" (Green) or "DRAFT" (Blue) to indicate document status.
- **Redaction**: Draws absolute solid black vector rectangles over specified coordinates to permanently obscure sensitive text or imagery.

