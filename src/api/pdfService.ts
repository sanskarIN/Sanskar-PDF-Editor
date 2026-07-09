// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// Purpose: Service wrapper for interacting with Tauri desktop APIs and Node.js backend APIs.
// =============================================================================
// @ts-nocheck
import { invoke } from '@tauri-apps/api/core';
import * as pdfjsLib from 'pdfjs-dist';

// Check if we are running inside Tauri
export const isTauriEnvironment = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Convert base64 to Uint8Array
const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Convert Uint8Array to base64
const uint8ArrayToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const API_BASE = 'http://localhost:3000/api/pdf';

export const pdfService = {
  // Get PDF Bytes
  async getPdfBytes(filePath: string, fileObject?: File): Promise<string> {
    if (isTauriEnvironment() && filePath) {
      return await invoke<string>('get_pdf_bytes', { filePath });
    } else if (fileObject) {
      const buffer = await fileObject.arrayBuffer();
      return uint8ArrayToBase64(new Uint8Array(buffer));
    }
    throw new Error("No file provided");
  },

  // Open PDF to get metadata and page count
  async openPdf(filePath: string, fileObject?: File, base64Data?: string): Promise<any> {
    if (isTauriEnvironment() && filePath) {
      return await invoke('open_pdf', { filePath });
    } else if (fileObject) {
      // Use Node.js Backend API
      const formData = new FormData();
      formData.append('file', fileObject);
      
      const response = await fetch(`${API_BASE}/open`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to open PDF on server");
      return await response.json();
    }
    throw new Error("Cannot open PDF without valid data");
  },

  // Get document info
  async getDocumentInfo(filePath: string, fileObject?: File, base64Data?: string): Promise<any> {
    return this.openPdf(filePath, fileObject, base64Data);
  },

  // Rotate a page
  async rotatePage(filePath: string, pageNumber: number, rotationDegrees: number, base64Data?: string, fileObject?: File): Promise<string | void> {
    if (isTauriEnvironment() && filePath) {
      await invoke('rotate_pdf_page', { 
        filePath, 
        pageNumber, 
        degrees: rotationDegrees, 
        outputPath: filePath 
      });
      return;
    } else if (fileObject) {
      // Use Node.js Backend API
      const formData = new FormData();
      formData.append('file', fileObject);
      formData.append('page', (pageNumber - 1).toString());
      formData.append('angle', rotationDegrees.toString());

      const response = await fetch(`${API_BASE}/rotate`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to rotate page on server");
      
      const arrayBuffer = await response.arrayBuffer();
      return uint8ArrayToBase64(new Uint8Array(arrayBuffer));
    }
  },

  // Delete a page
  async deletePage(filePath: string, pageNumber: number, base64Data?: string, fileObject?: File): Promise<string | void> {
    if (isTauriEnvironment() && filePath) {
      await invoke('delete_pdf_pages', { 
        filePath, 
        pagesToDelete: [pageNumber], 
        outputPath: filePath 
      });
      return;
    } else if (fileObject) {
      // Use Node.js Backend API
      const formData = new FormData();
      formData.append('file', fileObject);
      formData.append('pages', (pageNumber - 1).toString());

      const response = await fetch(`${API_BASE}/delete-pages`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to delete page on server");
      
      const arrayBuffer = await response.arrayBuffer();
      return uint8ArrayToBase64(new Uint8Array(arrayBuffer));
    }
  },

  // Merge PDFs
  async mergePdfs(filePaths: string[], fileObjects?: File[]): Promise<string | void> {
    if (isTauriEnvironment() && filePaths.length > 0) {
      throw new Error("Merge via Tauri should be handled directly in App.tsx");
    } else if (fileObjects && fileObjects.length > 1) {
      // Use Node.js Backend API
      const formData = new FormData();
      for (const file of fileObjects) {
        formData.append('files', file);
      }

      const response = await fetch(`${API_BASE}/merge`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to merge PDFs on server");
      
      const arrayBuffer = await response.arrayBuffer();
      return uint8ArrayToBase64(new Uint8Array(arrayBuffer));
    }
  },

  // Extract Text
  async extractText(filePath: string, pageNumber: number, base64Data?: string, fileObject?: File): Promise<string> {
    if (isTauriEnvironment() && filePath) {
      return await invoke<string>('get_pdf_text', { filePath, pageNumber });
    } else if (fileObject) {
      // We can use the server for extraction, but PDF.js in the browser is actually
      // much better for per-page extraction. We will keep PDF.js for extraction
      // so it doesn't upload a massive file just to get page 1 text.
      const bytes = await fileObject.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const doc = await loadingTask.promise;
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      let text = '';
      let lastY = -1;
      
      for (const item of textContent.items) {
        if ('str' in item) {
          if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
            text += '\n';
          }
          text += item.str;
          lastY = item.transform[5];
        }
      }
      
      return text || "[No text found on this page]";
    }
    return "Failed to extract text.";
  }
};

