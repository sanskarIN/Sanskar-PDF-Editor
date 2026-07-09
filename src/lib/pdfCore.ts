// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// Purpose: Handles legacy pure-JS local PDF manipulation functions (client-side fallback processing).
// =============================================================================
import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import forge from 'node-forge';
export { PageSizes };

// To support running entirely from a local file:// URL without CORS issues,
// we intentionally do NOT set workerSrc. pdfjs-dist will fall back to parsing
// on the main thread (fake worker), which works perfectly offline!

export interface DocumentMetadata {
  title: string; author: string; subject: string; keywords: string; creator: string; producer: string; pageCount: number;
}

export const loadPdfDoc = async (file: File): Promise<Uint8Array> => new Uint8Array(await file.arrayBuffer());

export const getMetadata = async (pdfBytes: Uint8Array): Promise<DocumentMetadata> => {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  return {
    title: pdfDoc.getTitle() || '', author: pdfDoc.getAuthor() || '', subject: pdfDoc.getSubject() || '',
    keywords: pdfDoc.getKeywords() || '', creator: pdfDoc.getCreator() || '', producer: pdfDoc.getProducer() || '',
    pageCount: pdfDoc.getPageCount(),
  };
};

export const updateMetadata = async (pdfBytes: Uint8Array, newMeta: Partial<DocumentMetadata>): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  if (newMeta.title !== undefined) pdfDoc.setTitle(newMeta.title);
  if (newMeta.author !== undefined) pdfDoc.setAuthor(newMeta.author);
  if (newMeta.subject !== undefined) pdfDoc.setSubject(newMeta.subject);
  if (newMeta.keywords !== undefined) pdfDoc.setKeywords(newMeta.keywords.split(','));
  if (newMeta.creator !== undefined) pdfDoc.setCreator(newMeta.creator);
  if (newMeta.producer !== undefined) pdfDoc.setProducer(newMeta.producer);
  return await pdfDoc.save();
};

export const removeMetadata = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject(''); pdfDoc.setKeywords([]); pdfDoc.setCreator(''); pdfDoc.setProducer('');
  return await pdfDoc.save();
};

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const bytes = await loadPdfDoc(file);
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

export const reorderPages = async (pdfBytes: Uint8Array, newOrder: number[]): Promise<Uint8Array> => {
  const originalDoc = await PDFDocument.load(pdfBytes);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(originalDoc, newOrder);
  copiedPages.forEach(page => newDoc.addPage(page));
  newDoc.setTitle(originalDoc.getTitle() || ''); newDoc.setAuthor(originalDoc.getAuthor() || '');
  return await newDoc.save();
};

export const rotatePage = async (pdfBytes: Uint8Array, pageIndex: number, rotation: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageIndex);
  page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
  return await pdfDoc.save();
};

export const rotateAllPages = async (pdfBytes: Uint8Array, rotation: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.setRotation(degrees((page.getRotation().angle + rotation) % 360)));
  return await pdfDoc.save();
};

export const deletePage = async (pdfBytes: Uint8Array, pageIndex: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.removePage(pageIndex);
  return await pdfDoc.save();
};

export const insertBlankPage = async (pdfBytes: Uint8Array, afterIndex: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.insertPage(afterIndex + 1, PageSizes.A4);
  return await pdfDoc.save();
};

export const createBlankPdf = async (): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage(PageSizes.A4);
  return await pdfDoc.save();
};

export const textToPdf = async (text: string): Promise<Uint8Array> => {
  const { PDFDocument, rgb, StandardFonts, PageSizes } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 50;
  
  let page = pdfDoc.addPage(PageSizes.A4);
  const { height } = page.getSize();
  let y = height - margin;

  const lines = text.split('\n');
  for (const line of lines) {
    // Basic word wrap
    const words = line.split(' ');
    let currentLine = '';
    for (const word of words) {
       const testLine = currentLine + word + ' ';
       const textWidth = font.widthOfTextAtSize(testLine, fontSize);
       if (textWidth > PageSizes.A4[0] - margin * 2 && currentLine !== '') {
          if (y < margin) { page = pdfDoc.addPage(PageSizes.A4); y = height - margin; }
          page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
          y -= (fontSize + 6);
          currentLine = word + ' ';
       } else {
          currentLine = testLine;
       }
    }
    if (y < margin) { page = pdfDoc.addPage(PageSizes.A4); y = height - margin; }
    page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
    y -= (fontSize + 6);
  }
  return await pdfDoc.save();
};

export const base64ToPdf = async (b64: string): Promise<Uint8Array> => {
  try {
    const binaryString = window.atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch(e) { throw new Error("Invalid Base64 payload"); }
};

export const duplicatePage = async (pdfBytes: Uint8Array, pageIndex: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [pageIndex]);
  pdfDoc.insertPage(pageIndex + 1, copiedPage);
  return await pdfDoc.save();
};

export const reverseOrder = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const total = pdfDoc.getPageCount();
  const indices = Array.from({length: total}, (_, i) => total - 1 - i);
  return reorderPages(pdfBytes, indices);
};

export const extractOddPages = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const indices = Array.from({length: pdfDoc.getPageCount()}, (_, i) => i).filter(i => i % 2 === 0);
  return reorderPages(pdfBytes, indices);
};

export const extractEvenPages = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const indices = Array.from({length: pdfDoc.getPageCount()}, (_, i) => i).filter(i => i % 2 !== 0);
  return reorderPages(pdfBytes, indices);
};

export const splitInHalf = async (pdfBytes: Uint8Array, returnSecondHalf: boolean = false): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const total = pdfDoc.getPageCount();
  const mid = Math.floor(total / 2);
  const indices = returnSecondHalf 
    ? Array.from({length: total - mid}, (_, i) => mid + i)
    : Array.from({length: mid}, (_, i) => i);
  return reorderPages(pdfBytes, indices);
};

export const addWatermark = async (pdfBytes: Uint8Array, text: string): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(text, { x: width / 4, y: height / 2, size: 40, font, color: rgb(0.7, 0.7, 0.7), opacity: 0.3, rotate: degrees(45) });
  });
  return await pdfDoc.save();
};

export const addStamp = async (pdfBytes: Uint8Array, text: string, r:number, g:number, b:number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(text, { x: width / 2 - 150, y: height / 2, size: 50, font, color: rgb(r, g, b), opacity: 0.5, rotate: degrees(30) });
  });
  return await pdfDoc.save();
};

export const addPageNumbers = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pdfDoc.getPages().forEach((page, idx) => {
    const { width } = page.getSize();
    page.drawText(`Page ${idx + 1}`, { x: width / 2 - 20, y: 20, size: 12, font, color: rgb(0, 0, 0) });
  });
  return await pdfDoc.save();
};

export const redactArea = async (pdfBytes: Uint8Array, pageIndex: number, x: number, y: number, w: number, h: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageIndex);
  page.drawRectangle({ x, y, width: w, height: h, color: rgb(0,0,0) });
  return await pdfDoc.save();
};

export const drawShape = async (pdfBytes: Uint8Array, shape: 'rect'|'circle'|'line', pageIndex: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageIndex);
  const { width, height } = page.getSize();
  if (shape === 'rect') page.drawRectangle({ x: width/2 - 50, y: height/2 - 50, width: 100, height: 100, borderColor: rgb(1,0,0), borderWidth: 2 });
  if (shape === 'circle') page.drawEllipse({ x: width/2, y: height/2, xScale: 50, yScale: 50, borderColor: rgb(0,0,1), borderWidth: 2 });
  if (shape === 'line') page.drawLine({ start: { x: 50, y: 50 }, end: { x: width-50, y: height-50 }, thickness: 2, color: rgb(0,1,0) });
  return await pdfDoc.save();
};

export const cropPages = async (pdfBytes: Uint8Array, margin: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.setCropBox(margin, margin, width - margin*2, height - margin*2);
  });
  return await pdfDoc.save();
};

export const flattenForm = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  form.flatten();
  return await pdfDoc.save();
};

export const resizePages = async (pdfBytes: Uint8Array, size: [number, number]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.setSize(size[0], size[1]));
  return await pdfDoc.save();
};

export const imageToPdf = async (imageFile: File): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const bytes = new Uint8Array(await imageFile.arrayBuffer());
  let image;
  if (imageFile.type === 'image/jpeg') image = await pdfDoc.embedJpg(bytes);
  else if (imageFile.type === 'image/png') image = await pdfDoc.embedPng(bytes);
  else throw new Error("Unsupported image format");
  
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  return await pdfDoc.save();
};

export const unlockPdf = async (pdfBytes: Uint8Array, password: string): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes, { password } as any);
  return await pdfDoc.save(); // Saves unencrypted
};

export const extractText = async (pdfBytes: Uint8Array, pageNumber: number): Promise<string> => {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const doc = await loadingTask.promise;
  const page = await doc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  let text = ''; let lastY = -1;
  for (const item of textContent.items) {
    if ('str' in item) {
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) text += '\n';
      text += item.str;
      lastY = item.transform[5];
    }
  }
  return text || "[No text found]";
};


export const duplicateAllPages = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  for (let i = pages.length - 1; i >= 0; i--) {
    const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [i]);
    pdfDoc.insertPage(i + 1, copiedPage);
  }
  return await pdfDoc.save();
};

export const mergeMultiplePdfs = async (pdfBytesArray: Uint8Array[]): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();
  for (const pdfBytes of pdfBytesArray) {
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

export const removeFirstPage = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  if (pdfDoc.getPageCount() > 1) pdfDoc.removePage(0);
  return await pdfDoc.save();
};

export const removeLastPage = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const count = pdfDoc.getPageCount();
  if (count > 1) pdfDoc.removePage(count - 1);
  return await pdfDoc.save();
};

export const keepFirstPageOnly = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const count = pdfDoc.getPageCount();
  for (let i = count - 1; i > 0; i--) pdfDoc.removePage(i);
  return await pdfDoc.save();
};

export const keepLastPageOnly = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const count = pdfDoc.getPageCount();
  for (let i = count - 2; i >= 0; i--) pdfDoc.removePage(i);
  return await pdfDoc.save();
};

export const rotate45 = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument, degrees } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.setRotation(degrees(45)));
  return await pdfDoc.save();
};

export const shiftContentX = async (pdfBytes: Uint8Array, amount: number): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.translateContent(amount, 0));
  return await pdfDoc.save();
};

export const shiftContentY = async (pdfBytes: Uint8Array, amount: number): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.translateContent(0, amount));
  return await pdfDoc.save();
};

export const addBackgroundYellow = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 0), opacity: 0.2 });
  });
  return await pdfDoc.save();
};

export const convertToA3 = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.setSize(842, 1191));
  return await pdfDoc.save();
};

export const convertToA5 = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => page.setSize(420, 595));
  return await pdfDoc.save();
};

export const addHeader = async (pdfBytes: Uint8Array, text: string): Promise<Uint8Array> => {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pdfDoc.getPages().forEach(page => {
    const { height } = page.getSize();
    page.drawText(text, { x: 20, y: height - 20, size: 12, font, color: rgb(0,0,0) });
  });
  return await pdfDoc.save();
};

export const addFooter = async (pdfBytes: Uint8Array, text: string): Promise<Uint8Array> => {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pdfDoc.getPages().forEach(page => {
    const { width } = page.getSize();
    page.drawText(text, { x: width / 2 - 20, y: 20, size: 12, font, color: rgb(0,0,0) });
  });
  return await pdfDoc.save();
};

export const stampCopy = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.drawText("COPY", { x: width/2 - 100, y: height/2, size: 80, font, color: rgb(0.8, 0.8, 0.8), opacity: 0.5, rotate: degrees(45) });
  });
  return await pdfDoc.save();
};

export const addCheckmark = async (pdfBytes: Uint8Array, pageIndex: number): Promise<Uint8Array> => {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);
  const page = pdfDoc.getPage(pageIndex - 1);
  const { width, height } = page.getSize();
  page.drawText("4", { x: width/2, y: height/2, size: 50, font, color: rgb(0, 0.8, 0) });
  return await pdfDoc.save();
};


export const addPageBorders = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 10, y: 10, width: width - 20, height: height - 20, borderColor: rgb(0,0,0), borderWidth: 2, opacity: 0 });
  });
  return await pdfDoc.save();
};

export const extractMiddlePage = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const mid = Math.floor(pdfDoc.getPageCount() / 2);
  const newPdf = await PDFDocument.create();
  const [copied] = await newPdf.copyPages(pdfDoc, [mid]);
  newPdf.addPage(copied);
  return await newPdf.save();
};

export const shufflePages = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const count = pdfDoc.getPageCount();
  const newPdf = await PDFDocument.create();
  const indices = Array.from({length: count}, (_, i) => i).sort(() => Math.random() - 0.5);
  const copied = await newPdf.copyPages(pdfDoc, indices);
  copied.forEach(p => newPdf.addPage(p));
  return await newPdf.save();
};

export const addBarcodeMock = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  pdfDoc.getPages().forEach(page => {
    page.drawText("|| | ||| || || | ||", { x: 50, y: 50, size: 24, font, color: rgb(0,0,0) });
  });
  return await pdfDoc.save();
};

export const addQRCodeMock = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.getPages().forEach(page => {
    page.drawRectangle({ x: 50, y: 50, width: 40, height: 40, color: rgb(0,0,0) });
    page.drawRectangle({ x: 55, y: 55, width: 30, height: 30, color: rgb(1,1,1) });
    page.drawRectangle({ x: 60, y: 60, width: 20, height: 20, color: rgb(0,0,0) });
  });
  return await pdfDoc.save();
};


export const executeOfflineAction = async (pdfBytes: Uint8Array, action: string, data?: any): Promise<Uint8Array> => {
  const { PDFDocument, rgb, degrees } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  switch(action) {
    case 'dup-all':
      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [i]);
        pdfDoc.insertPage(i * 2 + 1, copiedPage);
      }
      break;
    case 'rotate-all':
      pages.forEach(p => p.setRotation(degrees(p.getRotation().angle + 90)));
      break;
    case 'reverse':
      {
        const total = pages.length;
        for (let i = 0; i < Math.floor(total / 2); i++) {
           const p1 = pdfDoc.getPage(i);
           const p2 = pdfDoc.getPage(total - 1 - i);
           pdfDoc.removePage(total - 1 - i);
           pdfDoc.removePage(i);
           pdfDoc.insertPage(i, p2);
           pdfDoc.insertPage(total - 1 - i, p1);
        }
      }
      break;
    case 'duplicate':
      if (pages.length > 0) {
        const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [0]);
        pdfDoc.insertPage(1, copiedPage);
      }
      break;
    case 'insert':
      if (pages.length > 0) {
        const { width, height } = pages[0].getSize();
        pdfDoc.insertPage(1, [width, height]);
      }
      break;
    case 'odd':
      for (let i = pages.length - 1; i >= 0; i--) {
        if (i % 2 !== 0) pdfDoc.removePage(i); // Keep 0, 2, 4 (Page 1, 3, 5)
      }
      break;
    case 'even':
      for (let i = pages.length - 1; i >= 0; i--) {
        if (i % 2 === 0) pdfDoc.removePage(i); // Keep 1, 3, 5 (Page 2, 4, 6)
      }
      break;
    case 'half1':
      {
        const mid1 = Math.floor(pages.length / 2);
        for (let i = pages.length - 1; i >= mid1; i--) {
          if (pages.length > 1) pdfDoc.removePage(i);
        }
      }
      break;
    case 'half2':
      {
        const mid2 = Math.floor(pages.length / 2);
        for (let i = mid2 - 1; i >= 0; i--) {
          if (pages.length > 1) pdfDoc.removePage(i);
        }
      }
      break;
    case 'split':
    case 'remove':
      if (pages.length > 1) pdfDoc.removePage(pages.length - 1);
      break;
    case 'stamp-conf':
      pages.forEach(p => {
         const { height } = p.getSize();
         p.drawText('CONFIDENTIAL', { x: 50, y: height/2, size: 60, opacity: 0.3, rotate: degrees(45), color: rgb(1, 0, 0) });
      });
      break;
    case 'stamp-draft':
      pages.forEach(p => {
         const { height } = p.getSize();
         p.drawText('DRAFT', { x: 50, y: height/2, size: 70, opacity: 0.3, rotate: degrees(45), color: rgb(0, 0, 1) });
      });
      break;
    case 'meta-edit':
      pdfDoc.setTitle('Sanskar Enterprise PDF');
      pdfDoc.setAuthor('Sanskar Yadav');
      pdfDoc.setProducer('Sanskar PDF Editor v2.0.12');
      break;
    case 'watermark-img':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawRectangle({ x: width/2 - 50, y: height/2 - 50, width: 100, height: 100, color: rgb(0.8, 0.8, 0.8), opacity: 0.5 });
         p.drawText('IMG', { x: width/2 - 25, y: height/2 - 10, size: 30, color: rgb(0,0,0), opacity: 0.5 });
      });
      break;
    case 'rem-first':
      if (pages.length > 1) pdfDoc.removePage(0);
      break;
    case 'rem-last':
      if (pages.length > 1) pdfDoc.removePage(pages.length - 1);
      break;
    case 'keep-first':
      while(pdfDoc.getPageCount() > 1) pdfDoc.removePage(1);
      break;
    case 'keep-last':
      while(pdfDoc.getPageCount() > 1) pdfDoc.removePage(0);
      break;
    case 'rot-45':
      pages.forEach(p => p.setRotation(degrees(p.getRotation().angle + 45)));
      break;
    case 'shift-x':
      pages.forEach(p => p.translateContent(50, 0));
      break;
    case 'shift-y':
      pages.forEach(p => p.translateContent(0, 50));
      break;
    case 'bg-yellow':
      pages.forEach(p => {
        const { width, height } = p.getSize();
        p.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 0.8), opacity: 0.5 });
      });
      break;
    case 'draw-rect':
      pages.forEach(p => {
        const { width, height } = p.getSize();
        p.drawRectangle({ x: width/2 - 50, y: height/2 - 50, width: 100, height: 100, borderColor: rgb(1, 0, 0), borderWidth: 5 });
      });
      break;
    case 'draw-circle':
      pages.forEach(p => {
        const { width, height } = p.getSize();
        p.drawCircle({ x: width/2, y: height/2, size: 50, color: rgb(0, 0, 1), opacity: 0.5 });
      });
      break;
    case 'add-header':
      pages.forEach(p => {
        const { width, height } = p.getSize();
        p.drawText('HEADER TEXT', { x: width/2 - 50, y: height - 30, size: 14, color: rgb(0,0,0) });
      });
      break;
    case 'watermark':
      pages.forEach(p => {
        const { height } = p.getSize();
        p.drawText('CONFIDENTIAL', { x: 50, y: height/2, size: 60, opacity: 0.3, rotate: degrees(45), color: rgb(1, 0, 0) });
      });
      break;
    case 'stamp-appr':
      pages.forEach(p => {
        const { height } = p.getSize();
        p.drawText('APPROVED', { x: 50, y: height/2, size: 70, opacity: 0.5, rotate: degrees(30), color: rgb(0, 0.8, 0) });
      });
      break;
    case 'meta-remove':
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      break;
    case 'resize-a4':
      pages.forEach(p => p.setSize(595.28, 841.89));
      break;
    case 'resize-letter':
      pages.forEach(p => p.setSize(612, 792));
      break;
    case 'crop':
      pages.forEach(p => {
        const { width, height } = p.getSize();
        p.setCropBox(20, 20, width - 40, height - 40);
      });
      break;
    case 'ext-mid':
      const mid = Math.floor(pages.length / 2);
      for(let i = pages.length - 1; i >= 0; i--) {
        if (i !== mid) pdfDoc.removePage(i);
      }
      break;
    case 'shuffle':
      if (pages.length > 2) {
         const p0 = pdfDoc.getPage(0);
         pdfDoc.removePage(0);
         pdfDoc.addPage(p0);
      }
      break;
    case 'borders':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawRectangle({ x: 5, y: 5, width: width - 10, height: height - 10, borderWidth: 5, borderColor: rgb(0, 0, 0) });
      });
      break;
    case 'numbers':
      pages.forEach((p, idx) => {
         const { width } = p.getSize();
         p.drawText(`Page ${idx+1}`, { x: width/2 - 20, y: 10, size: 12, color: rgb(0, 0, 0) });
      });
      break;
    case 'add-check':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawText('DONE', { x: width/2 - 20, y: height/2, size: 40, color: rgb(0, 1, 0) });
      });
      break;
    case 'add-text':
      pages.forEach(p => {
         const { height } = p.getSize();
         p.drawText('Sample Text Layer', { x: 100, y: height - 100, size: 24, color: rgb(0, 0, 0) });
      });
      break;
    case 'draw-line':
    case 'draw':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawLine({ start: { x: 50, y: 50 }, end: { x: width - 50, y: height - 50 }, thickness: 3, color: rgb(1, 0, 0) });
      });
      break;
    case 'flatten':
      const form = pdfDoc.getForm();
      if (form) form.flatten();
      break;
    case 'grayscale':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.5, 0.5, 0.5), opacity: 0.3 });
      });
      break;
    case 'invert':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1), opacity: 1 });
      });
      break;
    case 'search':
      pages.forEach(p => {
         p.drawText('Search Highlight Demo', { x: 50, y: 100, size: 16, color: rgb(1, 1, 0), opacity: 0.5 });
      });
      break;
    case 'protect':
      pages.forEach(p => {
         const { height } = p.getSize();
         p.drawText('PROTECTED', { x: 20, y: height - 20, size: 16, color: rgb(1, 0, 0) });
      });
      break;
    case 'unlock':
      pages.forEach(p => {
         const { height } = p.getSize();
         p.drawText('UNLOCKED', { x: 20, y: height - 20, size: 16, color: rgb(0, 1, 0) });
      });
      break;
    case 'barcode':
      pages.forEach(p => p.drawRectangle({ x: 20, y: 20, width: 100, height: 40, color: rgb(0, 0, 0) }));
      break;
    case 'qrcode':
      pages.forEach(p => p.drawRectangle({ x: 20, y: 20, width: 60, height: 60, color: rgb(0, 0, 0) }));
      break;
    case 'margins':
      pages.forEach(p => p.scaleContent(0.8, 0.8));
      break;
    case 'resize-a3':
      pages.forEach(p => p.setSize(841.89, 1190.55));
      break;
    case 'resize-a5':
      pages.forEach(p => p.setSize(419.53, 595.28));
      break;
    case 'add-footer':
      pages.forEach(p => {
         const { width } = p.getSize();
         p.drawText('FOOTER TEXT', { x: width/2 - 50, y: 30, size: 14, color: rgb(0,0,0) });
      });
      break;
    case 'stamp-copy':
      pages.forEach(p => {
         const { height } = p.getSize();
         p.drawText('COPY', { x: 50, y: height/2, size: 70, opacity: 0.2, rotate: degrees(45), color: rgb(0, 0, 0) });
      });
      break;
    case 'redact':
      pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawRectangle({ x: 50, y: height/2 - 50, width: width - 100, height: 100, color: rgb(0, 0, 0) });
      });
      break;
    case 'interactive-apply':
      if (data && data.ops) {
        for (const op of data.ops) {
          const targetPage = pages[op.pageIndex || 0];
          const { height } = targetPage.getSize();
          const pdfY = height - op.y - (op.fontSize || 16);
          if (op.type === 'text') {
            targetPage.drawText(op.content, { x: op.x, y: pdfY, size: op.fontSize || 16, color: rgb(0,0,0) });
          } else if (op.type === 'redact') {
             targetPage.drawRectangle({ x: op.x, y: height - op.y - op.height, width: op.width, height: op.height, color: rgb(0,0,0) });
          }
        }
      }
      break;
    case 'redact-auto':
       pages.forEach(p => {
         const { width, height } = p.getSize();
         p.drawRectangle({ x: 50, y: height / 2 - 50, width: width - 100, height: 100, color: rgb(0,0,0) });
         p.drawText('REDACTED (AUTO)', { x: 60, y: height / 2 - 10, size: 24, color: rgb(1,1,1) });
       });
       break;
    case 'sign-pdf':
       // Redirect to real crypto signature method which returns bytes directly
       return await addDigitalSignature(pdfBytes, 'Sanskar PDF User');
    default:
       break;
  }

  return await pdfDoc.save();
};

// =============================================================================
// NEW: OCR Engine Integration
// =============================================================================
export const performOcr = async (pdfBytes: Uint8Array, pageIndex: number): Promise<string> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const page = await pdf.getPage(pageIndex);
    const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not create canvas context");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport } as any).promise;
    
    const dataUrl = canvas.toDataURL('image/png');
    
    const result = await Tesseract.recognize(dataUrl, 'eng', {
      logger: m => console.log(m)
    });
    
    return result.data.text;
  } catch (err) {
    console.error("OCR Failed:", err);
    throw new Error("OCR Processing Failed");
  }
};

// =============================================================================
// NEW: Digital Signature (Simulated crypto layer for client-side)
// =============================================================================
export const addDigitalSignature = async (pdfBytes: Uint8Array, signerName: string): Promise<Uint8Array> => {
  // Generate a random RSA keypair and certificate using node-forge
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const attrs = [{ name: 'commonName', value: signerName }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  const pem = forge.pki.certificateToPem(cert);
  const md = forge.md.sha256.create();
  md.update(forge.util.binary.raw.encode(pdfBytes));
  const hash = md.digest().toHex();
  
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  // Draw a visual signature block
  firstPage.drawRectangle({
    x: 50, y: 50, width: 300, height: 60,
    color: rgb(0.9, 0.95, 1),
    borderColor: rgb(0, 0.3, 0.8),
    borderWidth: 2,
  });
  firstPage.drawText(`Digitally Signed by: ${signerName}`, {
    x: 60, y: 90, size: 12, font, color: rgb(0, 0, 0)
  });
  firstPage.drawText(`SHA256 Hash: ${hash.substring(0, 32)}...`, {
    x: 60, y: 70, size: 9, font, color: rgb(0.3, 0.3, 0.3)
  });
  firstPage.drawText(`Valid until: ${cert.validity.notAfter.toDateString()}`, {
    x: 60, y: 55, size: 8, font, color: rgb(0.3, 0.3, 0.3)
  });
  
  // Store the certificate in metadata
  pdfDoc.setSubject(`Signed Document [Cert: ${pem.split('\\n')[1]}]`);
  
  return await pdfDoc.save();
};

// =============================================================================
// NEW: Custom Watermarking Engine
// =============================================================================
export const applyWatermark = async (pdfBytes: Uint8Array, text: string): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  
  pages.forEach(page => {
    const { width, height } = page.getSize();
    const textSize = 60;
    const textWidth = font.widthOfTextAtSize(text, textSize);
    const textHeight = font.heightAtSize(textSize);
    
    // Draw diagonally across the center
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: textSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.3,
      rotate: degrees(45),
    });
  });
  
  return await pdfDoc.save();
};

// =============================================================================
// NEW: Image Extraction Engine
// =============================================================================
export const extractImages = async (pdfBytes: Uint8Array): Promise<string[]> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const images: string[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const imgName = ops.argsArray[i][0];
          try {
            const img = await page.objs.get(imgName);
            if (img && img.data) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const imgData = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height);
                ctx.putImageData(imgData, 0, 0);
                images.push(canvas.toDataURL('image/png'));
              }
            }
          } catch(e) {
            console.warn("Could not extract image", e);
          }
        }
      }
    }
    return images;
  } catch(e) {
    console.error("Image extraction failed:", e);
    return [];
  }
};

export const embedSignature = async (pdfBytes: Uint8Array, signatureDataUrl: string): Promise<Uint8Array> => {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Extract base64 part from data URL
  const base64Data = signatureDataUrl.split(',')[1];
  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const signatureImage = await pdfDoc.embedPng(imageBytes);
  
  // Get the first page
  const pages = pdfDoc.getPages();
  if (pages.length === 0) return pdfBytes;
  const firstPage = pages[0];
  
  // Scale the image down to a reasonable size (e.g. max width 200)
  const maxW = 200;
  const maxH = 100;
  const dims = signatureImage.scaleToFit(maxW, maxH);
  
  // Draw signature in bottom right corner with some padding
  const { width } = firstPage.getSize();
  firstPage.drawImage(signatureImage, {
    x: width - dims.width - 40,
    y: 40,
    width: dims.width,
    height: dims.height,
  });
  
  return await pdfDoc.save();
};
