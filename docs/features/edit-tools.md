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

# Edit Tools Documentation

The **Edit** toolset manipulates the geometrical and visual attributes of the PDF pages. These operations require deep modification of the PDF's internal MediaBox and Content Streams.

## 1. Page Resizing (`resize-a4`, `resize-letter`)
- **Purpose**: Standardizes the dimensions of the document to ensure flawless physical printing.
- **Deep Technical Workflow**:
  - The PDF specification defines page size via the `/MediaBox` array.
  - Our backend iterates through all pages and calls `page.setSize()`.
  - A4 is exactly `595.28` points wide and `841.89` points tall.
  - US Letter is exactly `612` points wide and `792` points tall.
  - Any vector graphics or text on the page are *not* distorted; the "paper" behind them simply shrinks or grows.

## 2. Geometric Translation (`shift-x`, `shift-y`)
- **Purpose**: Fixes margin errors (e.g., text is too close to the left binding edge) by physically moving all content across the page axis.
- **Deep Technical Workflow**:
  - We inject a PDF Transformation Matrix (CTM).
  - Calling `page.translateContent(x, y)` wraps the entire existing content stream in a `q ... Q` (save/restore graphics state) block, and pre-pends a `1 0 0 1 x y cm` instruction.
  - This mathematically shifts every subsequent line, image, and text block by the specified `x` and `y` points without altering the underlying data.

## 3. Shape Drawing (`draw-rect`, `draw-circle`, `bg-yellow`)
- **Purpose**: Injects new graphical elements over the existing PDF content.
- **Deep Technical Workflow**:
  - We use `page.getSize()` to calculate the exact center and dimensions of the current MediaBox.
  - For `draw-rect`, we inject `re` (rectangle) and `S` (stroke) operators into the content stream.
  - For `bg-yellow`, we draw a massive rectangle starting at coordinate `(0,0)` matching the width and height of the page. We set the fill color to RGB `(1, 1, 0.8)` and the opacity modifier (ExtGState `/ca` value) to `0.5`, ensuring the original text remains readable through the tint.

## 4. Cropping (`crop`)
- **Purpose**: Cuts off the edges of the document.
- **Deep Technical Workflow**:
  - We modify the `/CropBox` array in the PDF dictionary.
  - The `CropBox` defines the visible region of the document when opened in a viewer like Adobe Acrobat or our `pdfjs-dist` viewer. 
  - By setting it to `20, 20, width - 40, height - 40`, we slice 20 points off all four sides.

