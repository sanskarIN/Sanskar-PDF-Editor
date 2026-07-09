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

# Security & Privacy Tools Documentation

The **Security** toolset is built for enterprise users, lawyers, and privacy advocates who need absolute control over what data is exposed in their PDF documents.

## 1. Metadata Stripper (`meta-remove`)
- **Purpose**: Completely sanitizes the document by deleting all hidden tracking fields.
- **Deep Technical Workflow**:
  - When a PDF is created by MS Word, Adobe Acrobat, or MacOS, it invisibly injects the computer name, the original file path, the software version, and the author's name into the `/Info` dictionary.
  - The `meta-remove` tool systematically calls `pdfDoc.setTitle('')`, `pdfDoc.setAuthor('')`, `pdfDoc.setCreator('')`, and `pdfDoc.setProducer('')`.
  - When the document is saved and recompiled by the backend, these dictionary keys are completely omitted from the binary stream, making it impossible to forensically reconstruct the origin of the document.

## 2. Watermarking (`watermark`)
- **Purpose**: Protects intellectual property by slapping an un-removable diagonal text overlay across the document.
- **Deep Technical Workflow**:
  - The backend calculates the hypotenuse of the page to find the perfect center.
  - It uses a custom Transformation Matrix to rotate the text exactly 45 degrees (`rotate: degrees(45)`).
  - The text is drawn with a custom font size (60pt), a pure Red RGB color `(1,0,0)`, and an ExtGState opacity of `0.3` (30%).
  - Because it is flattened directly into the PDF content stream, it cannot be easily highlighted or deleted by standard PDF viewers.

## 3. Bates Stamping (`stamp-appr`, `stamp-draft`)
- **Purpose**: Applies official corporate workflow stamps to the document.
- **Deep Technical Workflow**:
  - Similar to watermarking, but utilizes specific colors and smaller rotation angles (30 degrees).
  - `stamp-appr` uses a dark green RGB profile `(0, 0.8, 0)` to indicate approval.
  - `stamp-draft` uses a dark blue profile `(0, 0, 1)` to indicate pending status.
  - These are stamped in large 70pt fonts directly over the center of the page.

## 4. Redaction Simulation (`redact`)
- **Purpose**: Obscures sensitive text (like Social Security Numbers or financial data).
- **Deep Technical Workflow**:
  - The backend draws absolute solid black `(0,0,0)` vector rectangles with 100% opacity (`1.0`) over specified coordinates.
  - *Note for future versions*: True redaction requires not just painting a black box, but deeply parsing the text stream and deleting the underlying text operators (e.g., the `Tj` strings) that sit "behind" the black box to prevent them from being copied to the clipboard. Currently, this tool provides visual obscuration.

