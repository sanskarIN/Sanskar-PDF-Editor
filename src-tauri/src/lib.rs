use base64::{engine::general_purpose::STANDARD, Engine as _};
use lopdf::{Document, Object, ObjectId, StringFormat};
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

// ---------------------------------------------------------------------------
// Response structs
// ---------------------------------------------------------------------------

#[derive(Serialize)]
pub struct PdfInfo {
    pub page_count: u32,
    pub metadata: HashMap<String, String>,
    pub file_path: String,
    pub file_name: String,
    pub file_size: u64,
}

#[derive(Serialize)]
pub struct DocumentInfo {
    pub file_path: String,
    pub file_name: String,
    pub file_size: u64,
    pub page_count: u32,
    pub pdf_version: String,
    pub metadata: HashMap<String, String>,
}

// ---------------------------------------------------------------------------
// Helper: extract Info dictionary values
// ---------------------------------------------------------------------------

fn extract_metadata(doc: &Document) -> HashMap<String, String> {
    let mut meta = HashMap::new();
    let keys = [
        "Title",
        "Author",
        "Creator",
        "Producer",
        "Subject",
        "Keywords",
        "CreationDate",
        "ModDate",
    ];

    if let Ok(info_ref) = doc.trailer.get(b"Info") {
        if let Ok(info_id) = info_ref.as_reference() {
            if let Ok(info_obj) = doc.get_object(info_id) {
                if let Object::Dictionary(dict) = info_obj {
                    for key in &keys {
                        if let Ok(val) = dict.get(key.as_bytes()) {
                            let text = match val {
                                Object::String(bytes, _) => {
                                    String::from_utf8_lossy(bytes).to_string()
                                }
                                _ => format!("{:?}", val),
                            };
                            if !text.is_empty() {
                                meta.insert(key.to_string(), text);
                            }
                        }
                    }
                }
            }
        }
    }

    meta
}

/// Count pages via the document's page tree.
fn count_pages(doc: &Document) -> u32 {
    doc.get_pages().len() as u32
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

/// Opens a PDF and returns high-level info (page count, metadata, file stats).
#[tauri::command]
fn open_pdf(file_path: String) -> Result<PdfInfo, String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let file_meta = fs::metadata(path).map_err(|e| e.to_string())?;
    let file_size = file_meta.len();

    let file_name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown.pdf".to_string());

    let doc = Document::load(&file_path).map_err(|e| format!("Failed to load PDF: {}", e))?;

    let page_count = count_pages(&doc);
    let metadata = extract_metadata(&doc);

    Ok(PdfInfo {
        page_count,
        metadata,
        file_path: file_path.clone(),
        file_name,
        file_size,
    })
}

/// Extracts text content from a specific 1-indexed page.
#[tauri::command]
fn get_pdf_text(file_path: String, page_number: u32) -> Result<String, String> {
    let doc = Document::load(&file_path).map_err(|e| format!("Failed to load PDF: {}", e))?;

    let pages = doc.get_pages();
    let page_id = pages
        .get(&page_number)
        .ok_or_else(|| format!("Page {} not found (document has {} pages)", page_number, pages.len()))?;

    // Try to extract text from the page's content streams.
    let text = extract_page_text(&doc, *page_id);

    if text.trim().is_empty() {
        Ok("[Text extraction not available for this page]".to_string())
    } else {
        Ok(text)
    }
}

/// Walk content stream operators and pull out text from Tj / TJ operators.
fn extract_page_text(doc: &Document, page_id: ObjectId) -> String {
    let mut text = String::new();

    // Collect content stream data for the page.
    let content_data = match doc.get_page_content(page_id) {
        Ok(data) => data,
        Err(_) => return text,
    };

    let content = match lopdf::content::Content::decode(&content_data) {
        Ok(c) => c,
        Err(_) => return text,
    };

    for op in &content.operations {
        match op.operator.as_ref() {
            "Tj" => {
                // Single string show
                for operand in &op.operands {
                    if let Object::String(ref bytes, _) = operand {
                        text.push_str(&String::from_utf8_lossy(bytes));
                    }
                }
            }
            "TJ" => {
                // Array of strings / spacing
                for operand in &op.operands {
                    if let Object::Array(ref arr) = operand {
                        for item in arr {
                            if let Object::String(ref bytes, _) = item {
                                text.push_str(&String::from_utf8_lossy(bytes));
                            }
                        }
                    }
                }
            }
            "'" | "\"" => {
                // Next-line show operators
                for operand in &op.operands {
                    if let Object::String(ref bytes, _) = operand {
                        text.push_str(&String::from_utf8_lossy(bytes));
                    }
                }
                text.push('\n');
            }
            "Td" | "TD" | "T*" => {
                // Text positioning – approximate line breaks
                text.push('\n');
            }
            _ => {}
        }
    }

    text
}

/// Returns the page count of a PDF.
#[tauri::command]
fn get_pdf_page_count(file_path: String) -> Result<u32, String> {
    let doc = Document::load(&file_path).map_err(|e| format!("Failed to load PDF: {}", e))?;
    Ok(count_pages(&doc))
}

/// Merges multiple PDFs into a single output file.
#[tauri::command]
fn merge_pdfs(file_paths: Vec<String>, output_path: String) -> Result<String, String> {
    if file_paths.is_empty() {
        return Err("No files provided for merging".to_string());
    }

    // Start with the first document.
    let mut base_doc =
        Document::load(&file_paths[0]).map_err(|e| format!("Failed to load {}: {}", file_paths[0], e))?;

    // Merge subsequent documents.
    for path in file_paths.iter().skip(1) {
        let other_doc =
            Document::load(path).map_err(|e| format!("Failed to load {}: {}", path, e))?;

        // Collect pages from the other document and append them.
        let other_pages: Vec<ObjectId> = other_doc
            .get_pages()
            .into_values()
            .collect();

        for &page_id in &other_pages {
            // Deep-clone objects from the other doc into the base doc.
            let mut max_id = base_doc.max_id;

            // Build a mapping from old IDs to new IDs.
            let mut id_map: HashMap<ObjectId, ObjectId> = HashMap::new();
            for (&old_id, object) in &other_doc.objects {
                max_id += 1;
                let new_id = (max_id, 0);
                id_map.insert(old_id, new_id);
                base_doc.objects.insert(new_id, object.clone());
            }
            base_doc.max_id = max_id;

            // Remap all references inside the newly inserted objects.
            let new_ids: Vec<ObjectId> = id_map.values().copied().collect();
            for &new_id in &new_ids {
                if let Some(obj) = base_doc.objects.get_mut(&new_id) {
                    remap_references(obj, &id_map);
                }
            }

            // Insert the remapped page into the base document's page tree.
            if let Some(&new_page_id) = id_map.get(&page_id) {
                let pages_id = base_doc
                    .catalog()
                    .map_err(|e| e.to_string())?
                    .get(b"Pages")
                    .map_err(|e| e.to_string())?
                    .as_reference()
                    .map_err(|e| e.to_string())?;

                // Add page ref to Kids array & bump Count.
                if let Ok(Object::Dictionary(ref mut pages_dict)) =
                    base_doc.get_object_mut(pages_id)
                {
                    if let Ok(Object::Array(ref mut kids)) = pages_dict.get_mut(b"Kids") {
                        kids.push(Object::Reference(new_page_id));
                    }
                    if let Ok(Object::Integer(ref mut count)) = pages_dict.get_mut(b"Count") {
                        *count += 1;
                    }
                }

                // Update the page's Parent reference.
                if let Ok(Object::Dictionary(ref mut page_dict)) =
                    base_doc.get_object_mut(new_page_id)
                {
                    page_dict.set("Parent", Object::Reference(pages_id));
                }
            }

            // Only process the first page_id iteration for this document —
            // break out and re-approach by doing one pass per document instead.
            break;
        }
    }

    // An easier, more reliable merge: restart using lopdf's built-in approach.
    // We'll re-implement with a straightforward collect-and-insert strategy.
    let mut merged_doc = merge_documents_simple(&file_paths)?;

    merged_doc
        .save(&output_path)
        .map_err(|e| format!("Failed to save merged PDF: {}", e))?;

    let total = count_pages(&merged_doc);
    Ok(format!(
        "Successfully merged {} files into {} ({} pages)",
        file_paths.len(),
        output_path,
        total
    ))
}

/// Simple merge: load first doc, then for each subsequent doc copy all page
/// objects with remapped IDs and append page references to the page tree.
fn merge_documents_simple(file_paths: &[String]) -> Result<Document, String> {
    let mut base =
        Document::load(&file_paths[0]).map_err(|e| format!("Failed to load {}: {}", file_paths[0], e))?;

    for path in file_paths.iter().skip(1) {
        let other =
            Document::load(path).map_err(|e| format!("Failed to load {}: {}", path, e))?;

        // Build id remapping so there are no collisions with base.
        let mut id_map: HashMap<ObjectId, ObjectId> = HashMap::new();
        let mut next_id = base.max_id;
        for &old_id in other.objects.keys() {
            next_id += 1;
            id_map.insert(old_id, (next_id, 0));
        }
        base.max_id = next_id;

        // Copy objects into base with new IDs.
        for (old_id, obj) in &other.objects {
            let new_id = id_map[old_id];
            let mut cloned = obj.clone();
            remap_references(&mut cloned, &id_map);
            base.objects.insert(new_id, cloned);
        }

        // Find the base's Pages dictionary.
        let pages_ref = base
            .catalog()
            .map_err(|e| e.to_string())?
            .get(b"Pages")
            .map_err(|e| e.to_string())?
            .as_reference()
            .map_err(|e| e.to_string())?;

        // Collect page IDs from the other document, remapped.
        let other_page_ids: Vec<ObjectId> = {
            let mut sorted: Vec<(u32, ObjectId)> = other.get_pages().into_iter().collect();
            sorted.sort_by_key(|&(num, _)| num);
            sorted
                .into_iter()
                .map(|(_, oid)| *id_map.get(&oid).unwrap_or(&oid))
                .collect()
        };

        // Insert pages into Kids and bump Count.
        if let Ok(Object::Dictionary(ref mut pages_dict)) = base.get_object_mut(pages_ref) {
            for &new_page_id in &other_page_ids {
                if let Ok(Object::Array(ref mut kids)) = pages_dict.get_mut(b"Kids") {
                    kids.push(Object::Reference(new_page_id));
                }
                if let Ok(Object::Integer(ref mut count)) = pages_dict.get_mut(b"Count") {
                    *count += 1;
                }
            }
        }

        // Repoint each inserted page's Parent to the base's Pages node.
        for &new_page_id in &other_page_ids {
            if let Ok(Object::Dictionary(ref mut page_dict)) = base.get_object_mut(new_page_id) {
                page_dict.set("Parent", Object::Reference(pages_ref));
            }
        }
    }

    Ok(base)
}

/// Recursively remap all Object::Reference values according to `id_map`.
fn remap_references(obj: &mut Object, id_map: &HashMap<ObjectId, ObjectId>) {
    match obj {
        Object::Reference(ref mut id) => {
            if let Some(&new_id) = id_map.get(id) {
                *id = new_id;
            }
        }
        Object::Dictionary(dict) => {
            for (_, val) in dict.iter_mut() {
                remap_references(val, id_map);
            }
        }
        Object::Array(arr) => {
            for item in arr.iter_mut() {
                remap_references(item, id_map);
            }
        }
        Object::Stream(stream) => {
            for (_, val) in stream.dict.iter_mut() {
                remap_references(val, id_map);
            }
        }
        _ => {}
    }
}

/// Deletes specified pages (1-indexed) from a PDF and saves the result.
#[tauri::command]
fn delete_pdf_pages(
    file_path: String,
    pages_to_delete: Vec<u32>,
    output_path: String,
) -> Result<String, String> {
    let mut doc =
        Document::load(&file_path).map_err(|e| format!("Failed to load PDF: {}", e))?;

    let pages = doc.get_pages();
    let total = pages.len() as u32;

    // Validate page numbers.
    for &p in &pages_to_delete {
        if p < 1 || p > total {
            return Err(format!(
                "Invalid page number {}. Document has {} pages.",
                p, total
            ));
        }
    }

    if pages_to_delete.len() as u32 >= total {
        return Err("Cannot delete all pages from the document".to_string());
    }

    // Collect page ObjectIds to delete (sorted descending so removal is stable).
    let mut to_delete: Vec<u32> = pages_to_delete.clone();
    to_delete.sort_unstable();
    to_delete.dedup();

    for &page_num in to_delete.iter().rev() {
        doc.delete_pages(&[page_num]);
    }

    doc.save(&output_path)
        .map_err(|e| format!("Failed to save PDF: {}", e))?;

    let remaining = count_pages(
        &Document::load(&output_path).map_err(|e| e.to_string())?,
    );
    Ok(format!(
        "Deleted {} page(s). {} pages remaining.",
        to_delete.len(),
        remaining
    ))
}

/// Rotates a single page (1-indexed) by the given degrees (must be multiple of 90).
#[tauri::command]
fn rotate_pdf_page(
    file_path: String,
    page_number: u32,
    degrees: i32,
    output_path: String,
) -> Result<String, String> {
    if degrees % 90 != 0 {
        return Err("Rotation degrees must be a multiple of 90".to_string());
    }

    let mut doc =
        Document::load(&file_path).map_err(|e| format!("Failed to load PDF: {}", e))?;

    let pages = doc.get_pages();
    let page_id = pages
        .get(&page_number)
        .ok_or_else(|| {
            format!(
                "Page {} not found (document has {} pages)",
                page_number,
                pages.len()
            )
        })?;
    let page_id = *page_id;

    // Read current rotation, add the requested amount, normalise to 0..360.
    let current_rotation = {
        if let Ok(Object::Dictionary(ref dict)) = doc.get_object(page_id) {
            match dict.get(b"Rotate") {
                Ok(Object::Integer(n)) => *n as i32,
                _ => 0,
            }
        } else {
            0
        }
    };

    let new_rotation = ((current_rotation + degrees) % 360 + 360) % 360;

    if let Ok(Object::Dictionary(ref mut dict)) = doc.get_object_mut(page_id) {
        dict.set("Rotate", Object::Integer(new_rotation as i64));
    }

    doc.save(&output_path)
        .map_err(|e| format!("Failed to save PDF: {}", e))?;

    Ok(format!(
        "Rotated page {} by {} degrees (new rotation: {})",
        page_number, degrees, new_rotation
    ))
}

/// Returns the entire PDF file as a base64-encoded string for pdf.js rendering.
#[tauri::command]
fn get_pdf_bytes(file_path: String) -> Result<String, String> {
    let bytes = fs::read(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(STANDARD.encode(&bytes))
}

/// Copies a PDF file to a new location.
#[tauri::command]
fn save_pdf_copy(source_path: String, dest_path: String) -> Result<String, String> {
    let src = Path::new(&source_path);
    if !src.exists() {
        return Err(format!("Source file not found: {}", source_path));
    }

    // Make sure destination directory exists.
    if let Some(parent) = Path::new(&dest_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::copy(&source_path, &dest_path).map_err(|e| format!("Failed to copy file: {}", e))?;

    Ok(format!("Saved copy to {}", dest_path))
}

/// Returns detailed document information.
#[tauri::command]
fn get_document_info(file_path: String) -> Result<DocumentInfo, String> {
    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let file_meta = fs::metadata(path).map_err(|e| e.to_string())?;
    let file_size = file_meta.len();
    let file_name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown.pdf".to_string());

    let doc = Document::load(&file_path).map_err(|e| format!("Failed to load PDF: {}", e))?;

    let page_count = count_pages(&doc);
    let metadata = extract_metadata(&doc);

    let pdf_version = doc.version.clone();

    Ok(DocumentInfo {
        file_path: file_path.clone(),
        file_name,
        file_size,
        page_count,
        pdf_version,
        metadata,
    })
}

use tauri::Manager;

// ---------------------------------------------------------------------------
// Tauri bootstrap
// ---------------------------------------------------------------------------

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    // Close splashscreen
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
        let _ = splashscreen.close();
    }
    // Show main window
    if let Some(main_window) = window.get_webview_window("main") {
        let _ = main_window.show();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_pdf,
            get_pdf_text,
            get_pdf_page_count,
            merge_pdfs,
            delete_pdf_pages,
            rotate_pdf_page,
            get_pdf_bytes,
            save_pdf_copy,
            get_document_info,
            close_splashscreen,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub mod pdf_engine_core;

pub mod redaction_engine;
pub mod advanced_crypto;
