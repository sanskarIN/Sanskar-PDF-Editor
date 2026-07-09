# Rust IPC API Reference

This document outlines the commands exposed by the Rust backend to the frontend via Tauri's Inter-Process Communication (IPC). 
To call these from the React frontend, use `@tauri-apps/api/core` `invoke`.

## Core Commands

### `open_pdf`
Opens and analyzes a PDF file.
* **Arguments:** `{ file_path: String }`
* **Returns:** JSON object containing `page_count`, `metadata`, `file_name`, and `file_size`.

### `get_pdf_bytes`
Retrieves the raw binary data of the PDF for the browser to render via pdf.js.
* **Arguments:** `{ file_path: String }`
* **Returns:** Base64 encoded string of the PDF bytes.

### `get_pdf_text`
Extracts text from a specific page.
* **Arguments:** `{ file_path: String, page_number: u32 }`
* **Returns:** Extracted text as a String.

### `merge_pdfs`
Merges multiple PDFs into a single file.
* **Arguments:** `{ file_paths: Vec<String>, output_path: String }`
* **Returns:** `()` on success, Error on failure.

### `delete_pdf_pages`
Deletes an array of specific pages from the PDF.
* **Arguments:** `{ file_path: String, pages_to_delete: Vec<u32>, output_path: String }`
* **Returns:** `()` on success, Error on failure.

### `rotate_pdf_page`
Rotates a specific page by a given degree angle (90, 180, 270).
* **Arguments:** `{ file_path: String, page_number: u32, degrees: i32, output_path: String }`
* **Returns:** `()` on success, Error on failure.

### `save_pdf_copy`
Quickly duplicates a PDF file on the filesystem without loading the entire structure into memory.
* **Arguments:** `{ source_path: String, dest_path: String }`
* **Returns:** `()` on success, Error on failure.

### `get_document_info`
Retrieves highly detailed document properties (encryption status, PDF version, specific embedded metadata).
* **Arguments:** `{ file_path: String }`
* **Returns:** JSON object containing document properties.
