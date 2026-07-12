import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileUp, Settings, Scissors, Type, Trash2, RotateCcw, 
  RotateCw, Download, Layers, ZoomIn, ZoomOut, ImageDown, Copy,
  ArrowLeft, FileDigit, Image as ImageIcon, CheckSquare,
  BookOpen, LayoutGrid, Lock, Unlock, FileJson, Minus, Search, Frame, BoxSelect, Square, Circle, FilePenLine, 
  ArrowRight, ArrowUp, PaintBucket, Maximize, Minimize, Check, File as FileIcon, Loader2, Play, ShieldAlert } from 'lucide-react';
import * as pdfCore from './lib/pdfCore';
import * as cryptoEngine from './lib/crypto';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
import SettingsModal from './components/SettingsModal';
import InteractiveStudio from './components/InteractiveStudio';
import SignatureModal from './components/SignatureModal';
import SecurityPanel from './components/SecurityPanel';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { writeFile, readFile } from '@tauri-apps/plugin-fs';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const shouldUseWebFallback = isMobile || !isTauri;

type ToolCategory = 'Organize' | 'Convert' | 'Edit' | 'Security';
type ToolDef = { id: string; name: string; desc: string; icon: any; category: ToolCategory; requiresFile: boolean; action?: string; };

const ALL_TOOLS: ToolDef[] = [
  // ORGANIZE (12)
  { id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs into one unified document.', icon: Layers, category: 'Organize', requiresFile: false, action: 'merge' },
  { id: 'split', name: 'Split PDF', desc: 'Extract ranges or cut your PDF in half.', icon: Scissors, category: 'Organize', requiresFile: true },
  { id: 'remove', name: 'Remove Pages', desc: 'Delete specific pages from your document.', icon: Trash2, category: 'Organize', requiresFile: true },
  { id: 'extract', name: 'Extract Pages', desc: 'Pull out individual pages as a new PDF.', icon: Copy, category: 'Organize', requiresFile: true },
  { id: 'rotate-all', name: 'Rotate All Pages', desc: 'Rotate the entire document instantly.', icon: RotateCw, category: 'Organize', requiresFile: true },
  { id: 'reverse', name: 'Reverse Order', desc: 'Flip the document back-to-front.', icon: RotateCcw, category: 'Organize', requiresFile: true },
  { id: 'duplicate', name: 'Duplicate Page', desc: 'Create a copy of the current page.', icon: Copy, category: 'Organize', requiresFile: true },
  { id: 'insert', name: 'Insert Blank Page', desc: 'Add an empty page anywhere.', icon: FileUp, category: 'Organize', requiresFile: true },
  { id: 'odd', name: 'Extract Odd Pages', desc: 'Create a PDF of only odd pages.', icon: LayoutGrid, category: 'Organize', requiresFile: true },
  { id: 'even', name: 'Extract Even Pages', desc: 'Create a PDF of only even pages.', icon: LayoutGrid, category: 'Organize', requiresFile: true },
  { id: 'half1', name: 'First Half', desc: 'Extract the first half of the PDF.', icon: Scissors, category: 'Organize', requiresFile: true },
  { id: 'half2', name: 'Second Half', desc: 'Extract the second half of the PDF.', icon: Scissors, category: 'Organize', requiresFile: true },

  // CONVERT (12)
  { id: 'to-jpg', name: 'PDF to JPG', desc: 'Export current page as JPG image.', icon: ImageDown, category: 'Convert', requiresFile: true },
  { id: 'to-png', name: 'PDF to PNG', desc: 'Export current page as PNG snapshot.', icon: ImageDown, category: 'Convert', requiresFile: true },
  { id: 'to-text', name: 'PDF to Text', desc: 'Extract raw readable strings from PDF.', icon: Type, category: 'Convert', requiresFile: true },
  { id: 'to-json', name: 'PDF to JSON', desc: 'Export metadata and structure to JSON.', icon: FileJson, category: 'Convert', requiresFile: true },
  { id: 'to-base64', name: 'PDF to Base64', desc: 'Export PDF to text file as Base64.', icon: Type, category: 'Convert', requiresFile: true },
  { id: 'jpg-to', name: 'JPG to PDF', desc: 'Convert an image into a PDF document.', icon: ImageIcon, category: 'Convert', requiresFile: false, action: 'jpg-to' },
  { id: 'png-to', name: 'PNG to PDF', desc: 'Convert transparent images to PDF.', icon: ImageIcon, category: 'Convert', requiresFile: false, action: 'png-to' },
  { id: 'text-to', name: 'Text to PDF', desc: 'Convert Text string to PDF.', icon: Type, category: 'Convert', requiresFile: false, action: 'text-to' },
  { id: 'html-to', name: 'HTML to PDF', desc: 'Convert HTML to PDF.', icon: Frame, category: 'Convert', requiresFile: false, action: 'html-to' },
  { id: 'md-to', name: 'Markdown to PDF', desc: 'Parse Markdown into PDF.', icon: Type, category: 'Convert', requiresFile: false, action: 'md-to' },
  { id: 'base64-to', name: 'Base64 to PDF', desc: 'Create PDF from Base64.', icon: Type, category: 'Convert', requiresFile: false, action: 'base64-to' },
  { id: 'svg-to', name: 'SVG to PDF', desc: 'Convert vector graphics to PDF.', icon: ImageIcon, category: 'Convert', requiresFile: false, action: 'svg-to' },

  // VIEW & EDIT (16)
  { id: 'viewer', name: 'Advanced Viewer', desc: 'Pan, zoom, and scroll smoothly.', icon: BookOpen, category: 'Edit', requiresFile: true },
  { id: 'numbers', name: 'Add Page Numbers', desc: 'Stamp sequential page numbers.', icon: FileDigit, category: 'Edit', requiresFile: true },
  { id: 'crop', name: 'Crop PDF', desc: 'Shrink page bounding boxes by 20px.', icon: BoxSelect, category: 'Edit', requiresFile: true },
  { id: 'resize-a4', name: 'Resize to A4', desc: 'Force all pages to A4 dimensions.', icon: Frame, category: 'Edit', requiresFile: true },
  { id: 'resize-letter', name: 'Resize to Letter', desc: 'Force pages to US Letter dimensions.', icon: Frame, category: 'Edit', requiresFile: true },
  { id: 'margins', name: 'Add Margins', desc: 'Shrink content (Scale).', icon: Frame, category: 'Edit', requiresFile: true },
  { id: 'draw-rect', name: 'Add Rectangle', desc: 'Draw a red border box in center.', icon: Square, category: 'Edit', requiresFile: true },
  { id: 'draw-circle', name: 'Add Circle', desc: 'Draw a blue circle in center.', icon: Circle, category: 'Edit', requiresFile: true },
  { id: 'draw-line', name: 'Add Line', desc: 'Draw a green diagonal line.', icon: Minus, category: 'Edit', requiresFile: true },
  { id: 'add-text', name: 'Add Text Box', desc: 'Text box insertion in center.', icon: Type, category: 'Edit', requiresFile: true },
  { id: 'draw', name: 'Draw on PDF', desc: 'Freehand drawing stroke mock.', icon: FilePenLine, category: 'Edit', requiresFile: true },
  { id: 'flatten', name: 'Flatten PDF', desc: 'Burn all forms and layers.', icon: Layers, category: 'Edit', requiresFile: true },
  { id: 'grayscale', name: 'Grayscale PDF', desc: 'Grayscale export via overlay.', icon: ImageDown, category: 'Edit', requiresFile: true },
  { id: 'invert', name: 'Invert Colors', desc: 'Invert color export via overlay.', icon: ImageDown, category: 'Edit', requiresFile: true },
  { id: 'blank', name: 'Create Blank PDF', desc: 'Generate a new empty document.', icon: FileUp, category: 'Edit', requiresFile: false, action: 'blank' },
  { id: 'search', name: 'Search PDF', desc: 'Search for text keywords (Visualized highlight).', icon: Search, category: 'Edit', requiresFile: true },

  // SECURITY (10)
  { id: 'meta-edit', name: 'Edit Metadata', desc: 'Change internal document properties.', icon: Settings, category: 'Security', requiresFile: true },
  { id: 'meta-remove', name: 'Strip Metadata', desc: 'Remove all hidden tracking data.', icon: Trash2, category: 'Security', requiresFile: true },
  { id: 'watermark', name: 'Text Watermark', desc: 'Stamp custom text across all pages.', icon: Type, category: 'Security', requiresFile: true },
  { id: 'watermark-img', name: 'Image Watermark', desc: 'Stamp image mock watermark.', icon: ImageIcon, category: 'Security', requiresFile: true },
  { id: 'redact', name: 'Redact PDF', desc: 'Draw black boxes over the center.', icon: Square, category: 'Security', requiresFile: true },
  { id: 'unlock', name: 'Unlock PDF', desc: 'Remove password protection.', icon: Unlock, category: 'Security', requiresFile: true },
  { id: 'protect', name: 'Protect PDF', desc: 'Add visual lock encryption layer.', icon: Lock, category: 'Security', requiresFile: true },
  { id: 'stamp-conf', name: 'Stamp "CONFIDENTIAL"', desc: 'Draw massive red stamp.', icon: CheckSquare, category: 'Security', requiresFile: true },
  { id: 'stamp-appr', name: 'Stamp "APPROVED"', desc: 'Draw massive green stamp.', icon: CheckSquare, category: 'Security', requiresFile: true },
  { id: 'stamp-draft', name: 'Stamp "DRAFT"', desc: 'Draw massive blue stamp.', icon: CheckSquare, category: 'Security', requiresFile: true },
  // ADVANCED & MORE (15)
  { id: 'dup-all', name: 'Duplicate All Pages', desc: 'Copy every page sequentially.', icon: Copy, category: 'Organize', requiresFile: true },
  { id: 'rem-first', name: 'Remove First Page', desc: 'Delete the cover page.', icon: Trash2, category: 'Organize', requiresFile: true },
  { id: 'rem-last', name: 'Remove Last Page', desc: 'Delete the end page.', icon: Trash2, category: 'Organize', requiresFile: true },
  { id: 'keep-first', name: 'Keep First Only', desc: 'Delete all but the first page.', icon: FileIcon, category: 'Organize', requiresFile: true },
  { id: 'keep-last', name: 'Keep Last Only', desc: 'Delete all but the last page.', icon: FileIcon, category: 'Organize', requiresFile: true },
  
  { id: 'rot-45', name: 'Rotate 45°', desc: 'Rotate all pages by 45 degrees.', icon: RotateCw, category: 'Edit', requiresFile: true },
  { id: 'shift-x', name: 'Shift Right 50px', desc: 'Move all content horizontally.', icon: ArrowRight, category: 'Edit', requiresFile: true },
  { id: 'shift-y', name: 'Shift Up 50px', desc: 'Move all content vertically.', icon: ArrowUp, category: 'Edit', requiresFile: true },
  { id: 'bg-yellow', name: 'Yellow Background', desc: 'Add a warm tint behind pages.', icon: PaintBucket, category: 'Edit', requiresFile: true },
  { id: 'resize-a3', name: 'Resize to A3', desc: 'Scale up pages to A3.', icon: Maximize, category: 'Edit', requiresFile: true },
  { id: 'resize-a5', name: 'Resize to A5', desc: 'Scale down pages to A5.', icon: Minimize, category: 'Edit', requiresFile: true },
  
  { id: 'add-header', name: 'Add Header', desc: 'Insert text at the top.', icon: Type, category: 'Edit', requiresFile: true },
  { id: 'add-footer', name: 'Add Footer', desc: 'Insert text at the bottom.', icon: Type, category: 'Edit', requiresFile: true },
  { id: 'stamp-copy', name: 'Stamp "COPY"', desc: 'Draw a faint COPY watermark.', icon: CheckSquare, category: 'Security', requiresFile: true },
  { id: 'add-check', name: 'Add Checkmark', desc: 'Draw a green check mark.', icon: Check, category: 'Edit', requiresFile: true },
  // MORE ADVANCED (5)
  { id: 'borders', name: 'Add Borders', desc: 'Draw 2px border around all pages.', icon: Frame, category: 'Edit', requiresFile: true },
  { id: 'ext-mid', name: 'Extract Middle Page', desc: 'Pull out the exact middle page.', icon: Scissors, category: 'Organize', requiresFile: true },
  { id: 'shuffle', name: 'Shuffle Pages', desc: 'Randomize the order of all pages.', icon: RotateCw, category: 'Organize', requiresFile: true },
  { id: 'barcode', name: 'Add Barcode', desc: 'Stamp a barcode mock on pages.', icon: FileDigit, category: 'Security', requiresFile: true },
  { id: 'qrcode', name: 'Add QR Code', desc: 'Stamp a QR code mock on pages.', icon: BoxSelect, category: 'Security', requiresFile: true },
];

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null);
  const [desktopFilePath, setDesktopFilePath] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Attempt to close Tauri splashscreen
    try {
      invoke('close_splashscreen').catch(console.error);
    } catch(e) {}
  }, []);

  const generateThumbnails = async (bytes: Uint8Array) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const thumbs: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.height = viewport.height; canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport } as any).promise;
        thumbs.push(canvas.toDataURL('image/png'));
      }
      setThumbnails(thumbs);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const cmdOrCtrl = e.metaKey || e.ctrlKey;
      const shift = e.shiftKey;
      
      if (cmdOrCtrl && !shift && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleDesktopOpen();
      }
      if (cmdOrCtrl && !shift && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (pdfBytes) {
           triggerDownload(pdfBytes, `Export_${file?.name || 'document.pdf'}`);
        }
      }
      if (cmdOrCtrl && shift && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSettings(true);
      }
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(z => Math.min(z + 0.25, 3));
      }
      if (cmdOrCtrl && e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(z - 0.25, 0.5));
      }
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
      if (!cmdOrCtrl && e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(metadata?.pageCount || 1, p + 1));
      }
      if (!cmdOrCtrl && e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(1, p - 1));
      }
      if (cmdOrCtrl && e.key === 'ArrowRight') {
        setCurrentPage(metadata?.pageCount || 1);
      }
      if (cmdOrCtrl && e.key === 'ArrowLeft') {
        setCurrentPage(1);
      }
      
      if (pdfBytes) {
        if (cmdOrCtrl && !shift && e.key.toLowerCase() === 'e') {
          e.preventDefault();
          const tool = ALL_TOOLS.find(t => t.id === 'to-text');
          if (tool) setActiveTool(tool);
        }
        if (cmdOrCtrl && !shift && e.key.toLowerCase() === 'm') {
          e.preventDefault();
          const tool = ALL_TOOLS.find(t => t.id === 'merge');
          if (tool) setActiveTool(tool);
        }
        if (cmdOrCtrl && shift && e.key.toLowerCase() === 'f') {
          e.preventDefault();
          const tool = ALL_TOOLS.find(t => t.id === 'search');
          if (tool) setActiveTool(tool);
        }
        if (cmdOrCtrl && !shift && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          const tool = ALL_TOOLS.find(t => t.id === 'interactive-studio');
          if (tool) setActiveTool(tool);
        }
        if (e.key === 'Escape') {
          setShowStudio(false);
          setActiveTool(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfBytes, file, metadata?.pageCount, activeTool]);

  const handleDesktopOpen = async () => {
    if (shouldUseWebFallback) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.locked';
      input.onchange = async (e: any) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setIsProcessing(true);
        try {
          const buf = await selectedFile.arrayBuffer();
          let bytes = new Uint8Array(buf);
          setFile(selectedFile);
          setDesktopFilePath(null);

          if (selectedFile.name.endsWith('.locked')) {
            const pwd = prompt("This file is locked with Military-Grade AES-256.\n\nEnter password to decrypt:");
            if (!pwd) {
              setIsProcessing(false); setFile(null); return;
            }
            try { bytes = await cryptoEngine.decryptPDF(bytes, pwd); } 
            catch(err) { alert("Incorrect password."); setIsProcessing(false); setFile(null); return; }
          }
          setPdfBytes(bytes);
          const meta = await pdfCore.getMetadata(bytes);
          setMetadata(meta);
          setCurrentPage(1); setZoom(1);
          generateThumbnails(bytes);
        } catch(err) {
          console.error(err);
          alert("Error reading file.");
        }
        setIsProcessing(false);
      };
      input.click();
      return;
    }

    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF', extensions: ['pdf', 'locked'] }]
      });
      if (selected && typeof selected === 'string') {
        setIsProcessing(true);
        let rawBytes: Uint8Array;
        try {
          rawBytes = await readFile(selected);
        } catch (e) {
          alert("Error reading file natively.");
          setIsProcessing(false);
          return;
        }

        let bytes = rawBytes;
        setFile(new File([bytes as BlobPart], selected.split(/[\\/]/).pop() || 'document.pdf', { type: 'application/pdf' }));
        setDesktopFilePath(selected);

        if (selected.endsWith('.locked')) {
          const pwd = prompt("This file is locked with Military-Grade AES-256.\n\nEnter password to decrypt:");
          if (!pwd) {
            setIsProcessing(false);
            setFile(null);
            setDesktopFilePath(null);
            return;
          }
          try {
            bytes = await cryptoEngine.decryptPDF(rawBytes, pwd);
          } catch (e) {
            alert("Incorrect password or corrupted file.");
            setIsProcessing(false);
            setFile(null);
            setDesktopFilePath(null);
            return;
          }
        }

        setPdfBytes(bytes);
        
        try {
          const info: any = await invoke('open_pdf', { filePath: selected });
          setMetadata({
             title: info.metadata?.Title || '',
             author: info.metadata?.Author || '',
             pageCount: info.page_count || 1
          });
        } catch(e) {
          const meta = await pdfCore.getMetadata(bytes);
          setMetadata(meta);
        }
        
        setCurrentPage(1); setZoom(1);
        generateThumbnails(bytes);
        setIsProcessing(false);
      }
    } catch (err) {
      alert("Error opening file dialog: " + err);
      setIsProcessing(false);
    }
  };

  const triggerDownload = async (bytes: Uint8Array, filename: string) => {
    if (shouldUseWebFallback) {
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    try {
      const destPath = await save({
        defaultPath: filename,
        filters: [{ name: 'File', extensions: [filename.split('.').pop() || '*'] }]
      });
      if (destPath) {
        await writeFile(destPath, bytes);
      }
    } catch(e) { console.error("Save failed", e); }
  };

  const triggerBinaryDownload = triggerDownload;

  const triggerFileDownload = async (content: string, filename: string) => {
    const encoder = new TextEncoder();
    await triggerDownload(encoder.encode(content), filename);
  };

  const handleAction = async (action: () => Promise<Uint8Array | void>) => {
    if (!pdfBytes && activeTool?.requiresFile) return;
    setIsProcessing(true);
    try {
      const newBytes = await action();
      if (newBytes) {
        setPdfBytes(newBytes);
        const meta = await pdfCore.getMetadata(newBytes);
        setMetadata(meta);
        if (currentPage > meta.pageCount) setCurrentPage(meta.pageCount);
        generateThumbnails(newBytes);
      }
    } catch (err) { alert("Action failed."); console.error(err); }
    setIsProcessing(false);
  };

  const executeNoFileAction = async (tool: ToolDef) => {
    if (tool.action === 'blank' || tool.action === 'text-to' || tool.action === 'html-to' || tool.action === 'md-to' || tool.action === 'base64-to' || tool.action === 'svg-to') {
      setIsProcessing(true);
      try {
        let bytes: Uint8Array;
        if (tool.action === 'text-to' || tool.action === 'html-to' || tool.action === 'md-to' || tool.action === 'svg-to') {
           const input = prompt(`Enter the ${tool.action.split('-')[0].toUpperCase()} content to convert into PDF:`);
           if (!input) { setIsProcessing(false); return; }
           bytes = await pdfCore.textToPdf(input);
        } else if (tool.action === 'base64-to') {
           const input = prompt("Enter the Base64 String to decode into a PDF:");
           if (!input) { setIsProcessing(false); return; }
           bytes = await pdfCore.base64ToPdf(input);
        } else {
           bytes = await pdfCore.createBlankPdf();
        }
        setPdfBytes(bytes); setFile(new File([bytes as unknown as BlobPart], 'generated.pdf', {type: 'application/pdf'}));
        setMetadata(await pdfCore.getMetadata(bytes)); generateThumbnails(bytes);
      } catch(e) { alert("Generation failed: " + e); }
      setIsProcessing(false);
    }
    if (tool.action === 'merge' || tool.action === 'jpg-to' || tool.action === 'png-to') {
      if (shouldUseWebFallback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = tool.action === 'merge';
        input.accept = tool.action === 'merge' ? '.pdf' : '.jpg,.jpeg,.png';
        input.onchange = async (e: any) => {
          const selectedFiles = Array.from(e.target.files) as File[];
          if (!selectedFiles.length) return;
          setIsProcessing(true);
          try {
            if (tool.action === 'merge') {
               const bufs = await Promise.all(selectedFiles.map(f => f.arrayBuffer()));
               // Use offline pdfCore to merge on mobile
               const mergedBytes = await pdfCore.mergeMultiplePdfs(bufs.map(b => new Uint8Array(b)));
               setPdfBytes(mergedBytes);
               setFile(new File([mergedBytes as BlobPart], 'merged.pdf', {type: 'application/pdf'}));
               setMetadata(await pdfCore.getMetadata(mergedBytes)); generateThumbnails(mergedBytes);
            } else {
               const mockFile = selectedFiles[0];
               const outBytes = await pdfCore.imageToPdf(mockFile);
               setPdfBytes(outBytes); setFile(new File([outBytes as BlobPart], 'converted.pdf', {type: 'application/pdf'}));
               setMetadata(await pdfCore.getMetadata(outBytes)); generateThumbnails(outBytes);
            }
          } catch(err) { alert("Operation failed: " + err); }
          setIsProcessing(false);
        };
        input.click();
        return;
      }
      const selected = await open({
        multiple: tool.action === 'merge',
        filters: [{ name: 'Files', extensions: tool.action === 'merge' ? ['pdf'] : ['jpg', 'png', 'jpeg'] }]
      });
      if (selected) {
        setIsProcessing(true);
        if (tool.action === 'merge') {
          const filesArray = Array.isArray(selected) ? selected : [selected];
          const outPath = await save({ defaultPath: 'merged.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
          if (outPath) {
            try {
              await invoke('merge_pdfs', { filePaths: filesArray, outputPath: outPath });
              const rawBytes = await readFile(outPath);
              setPdfBytes(rawBytes); setFile(new File([rawBytes as BlobPart], 'merged.pdf', {type: 'application/pdf'}));
              setMetadata(await pdfCore.getMetadata(rawBytes)); generateThumbnails(rawBytes);
            } catch(e) { alert("Merge failed: " + e); }
          }
        } else {
          const path = Array.isArray(selected) ? selected[0] : selected;
          const bytes = await readFile(path);
          const mockFile = new File([bytes], path.split(/[\\/]/).pop() || 'image', { type: tool.action === 'jpg-to' ? 'image/jpeg' : 'image/png' });
          const outBytes = await pdfCore.imageToPdf(mockFile);
          setPdfBytes(outBytes); setFile(new File([outBytes as BlobPart], 'converted.pdf', {type: 'application/pdf'}));
          setMetadata(await pdfCore.getMetadata(outBytes)); generateThumbnails(outBytes);
        }
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    if (!pdfBytes || !canvasRef.current) return;
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom * 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.height = viewport.height; canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport } as any).promise;
      } catch(e) {
        console.error("Render failed", e);
      }
    })();
  }, [pdfBytes, currentPage, zoom]);

  const executeTool = async () => {
    if(!activeTool || !pdfBytes) return;
    if (activeTool.id === 'interactive-studio') {
      setShowStudio(true);
      return;
    }
    switch(activeTool.id) {
      case 'to-png': 
      case 'to-jpg': {
        if(canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL(`image/${activeTool.id==='to-png'?'png':'jpeg'}`);
          const res = await fetch(dataUrl);
          const blob = await res.arrayBuffer();
          await triggerDownload(new Uint8Array(blob), `page_${currentPage}.${activeTool.id==='to-png'?'png':'jpg'}`);
        }
        break;
      }
      case 'to-text': {
        let txt = "";
        if (desktopFilePath) {
           try {
             txt = await invoke('get_pdf_text', { filePath: desktopFilePath, pageNumber: currentPage });
           } catch(e) { txt = await pdfCore.extractText(pdfBytes, currentPage); }
        } else {
           txt = await pdfCore.extractText(pdfBytes, currentPage);
        }
        triggerFileDownload(txt, `page_${currentPage}.txt`);
        break;
      }
      case 'ocr-scan': {
        setIsProcessing(true);
        try {
          const ocrText = await pdfCore.performOcr(pdfBytes, currentPage);
          triggerFileDownload(ocrText, `page_${currentPage}_ocr.txt`);
        } catch (e) {
          alert('OCR failed. Please check the console.');
        }
        setIsProcessing(false);
        break;
      }
      case 'extract-images': {
        setIsProcessing(true);
        try {
          const images = await pdfCore.extractImages(pdfBytes);
          if (images.length === 0) {
            alert('No images found in this PDF.');
          } else {
            // Downloading multiple files natively requires multiple save dialogues.
            // For batch extraction, we'll ask user for a directory, but let's fallback to web behavior for simplicity
            images.forEach((imgUrl, i) => {
              const a = document.createElement('a');
              a.href = imgUrl;
              a.download = `extracted_image_${i + 1}.png`;
              a.click();
            });
          }
        } catch(e) {
          alert('Image extraction failed.');
        }
        setIsProcessing(false);
        break;
      }
      case 'redact': {
        setShowSecurityPanel(true);
        break;
      }
      case 'custom-watermark': {
        const text = prompt("Enter watermark text (e.g., CONFIDENTIAL):");
        if (text) {
          await handleAction(() => pdfCore.applyWatermark(pdfBytes, text));
        }
        break;
      }
      case 'visual-signature': {
        setShowSignatureModal(true);
        break;
      }
      case 'encrypt-file': {
        const pwd = prompt("Enter a strong password to lock this PDF:\n(Warning: If you lose this password, the PDF is gone forever!)");
        if (pwd) {
          setIsProcessing(true);
          try {
            const encryptedBytes = await cryptoEngine.encryptPDF(pdfBytes, pwd);
            await triggerBinaryDownload(encryptedBytes, `${file?.name || 'document'}.locked`);
          } catch(e) {
             alert('Encryption failed.');
          }
          setIsProcessing(false);
        }
        break;
      }
      case 'to-json': {
        const d = JSON.stringify({ metadata, pages: metadata?.pageCount }, null, 2);
        triggerFileDownload(d, `metadata.json`);
        break;
      }
      case 'to-base64': {
        const binary = Array.from(pdfBytes).map(b => String.fromCharCode(b)).join('');
        const b64 = window.btoa(binary);
        triggerFileDownload(b64, `pdf_base64.txt`);
        break;
      }
      case 'extract': {
        const range = prompt("Extract range (e.g. 1-3):");
        if(range) {
          const [s, e] = range.split('-');
          const indices = Array.from({length: parseInt(e) - parseInt(s) + 1}, (_, i) => parseInt(s) - 1 + i);
          await handleAction(() => pdfCore.reorderPages(pdfBytes, indices));
        }
        break;
      }
      default:
        await handleAction(async () => {
          if (!pdfBytes) throw new Error("No PDF loaded");
          return await pdfCore.executeOfflineAction(pdfBytes, activeTool.id, { ops: [] });
        });
        break;
    }
  };

    if (!activeTool) {
      return (
        <div className="min-h-screen bg-transparent pb-20 relative z-10">
          {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
          <header className="h-[400px] relative flex flex-col items-center justify-center overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 animate-gradient-x"></div>
            <div className="absolute top-6 right-6 z-30">
              <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold backdrop-blur-md transition-all shadow-lg hover:scale-105">
                <Settings size={18} /> Settings
              </button>
            </div>
            <motion.div initial={{y: 30, opacity:0}} animate={{y:0, opacity:1}} transition={{duration: 0.8, ease: "easeOut"}} className="z-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center text-blue-400 text-4xl font-black mb-8 shadow-2xl animate-float">S</div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-gradient-x tracking-tight mb-6 drop-shadow-lg">
                Ultimate PDF Engine
              </h1>
              <p className="text-slate-300 text-xl max-w-2xl font-medium tracking-wide">
                50+ powerful tools to merge, split, convert, and edit PDFs. 
                <br/><span className="text-blue-400 mt-2 block font-semibold text-sm tracking-widest uppercase opacity-80">Made by Sanskar Yadav</span>
              </p>
            </motion.div>
          </header>
  
          <main className="max-w-7xl mx-auto px-6 z-20 relative">
            {['Organize', 'Convert', 'Edit', 'Security'].map((category, catIdx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: catIdx * 0.1 }}
                key={category} 
                className="mb-16"
              >
                <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 text-glow">
                  <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div> 
                  {category} <span className="text-sm font-medium text-slate-500 px-3 py-1 rounded-full glass-panel ml-2">{ALL_TOOLS.filter(t => t.category === category).length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {ALL_TOOLS.filter(t => t.category === category).map((tool, idx) => (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                      key={tool.id}
                      onClick={() => { setActiveTool(tool); if(!tool.requiresFile) executeNoFileAction(tool); }}
                      className="tool-card glass-panel rounded-2xl p-6 text-left flex flex-col group cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                      <div className="w-14 h-14 rounded-xl bg-slate-800/50 text-blue-400 flex items-center justify-center mb-5 border border-white/5 shadow-inner relative z-10">
                        <tool.icon size={26} className="tool-icon" />
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2 relative z-10">{tool.name}</h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10">{tool.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </main>
        </div>
      );
    }
    return (
        <div className="flex h-screen w-screen bg-transparent overflow-hidden font-sans text-slate-100 relative z-10">
          {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
          {showStudio && (
            <InteractiveStudio 
              pdfBytes={pdfBytes!} 
              fileName={file?.name || 'document.pdf'}
              onClose={() => setShowStudio(false)}
              isProcessing={isProcessing}
              onSave={async (ops) => {
                setShowStudio(false);
                setIsProcessing(true);
                try {
                  const newBytes = await pdfCore.executeOfflineAction(pdfBytes!, 'interactive-studio', { ops });
                  setPdfBytes(newBytes);
                  const meta = await pdfCore.getMetadata(newBytes);
                  setMetadata(meta);
                  generateThumbnails(newBytes);
                } catch(e) {
                  console.error(e);
                  alert('Interactive processing failed.');
                }
                setIsProcessing(false);
              }}
            />
          )}
          {showSignatureModal && (
            <SignatureModal 
              onClose={() => setShowSignatureModal(false)}
              onSign={async (dataUrl) => {
                setShowSignatureModal(false);
                setIsProcessing(true);
                try {
                  const newBytes = await pdfCore.embedSignature(pdfBytes!, dataUrl);
                  setPdfBytes(newBytes);
                  const meta = await pdfCore.getMetadata(newBytes);
                  setMetadata(meta);
                  generateThumbnails(newBytes);
                } catch(e) {
                  console.error(e);
                  alert('Signature embedding failed.');
                }
                setIsProcessing(false);
              }}
            />
          )}
          {showSecurityPanel && (
            <SecurityPanel
              isProcessing={isProcessing}
              onClose={() => setShowSecurityPanel(false)}
              onRedact={async () => {
                setShowSecurityPanel(false);
                setIsProcessing(true);
                try {
                  if (desktopFilePath) {
                    const result = await invoke('redact_pdf_command', { 
                      filePath: desktopFilePath,
                      boxes: [{ x: 100.0, y: 100.0, width: 300.0, height: 200.0 }]
                    });
                    alert(result as string);
                  } else {
                    alert('True Redaction requires a saved desktop file.');
                  }
                } catch (e: any) {
                  alert(`Redaction failed: ${e}`);
                }
                setIsProcessing(false);
              }}
              onSign={async () => {
                setShowSecurityPanel(false);
                setIsProcessing(true);
                try {
                  if (desktopFilePath) {
                    const result = await invoke('sign_pdf_command', {
                      filePath: desktopFilePath,
                      certId: "user-certificate-123"
                    });
                    alert(result as string);
                  } else {
                    alert('Digital Signatures require a saved desktop file.');
                  }
                } catch (e: any) {
                  alert(`Signature failed: ${e}`);
                }
                setIsProcessing(false);
              }}
            />
          )}
          <nav className="w-80 glass-panel border-r border-white/5 flex flex-col justify-between shrink-0 z-20">
          <div>
            <button onClick={() => { setActiveTool(null); setPdfBytes(null); setFile(null); setDesktopFilePath(null); }} className="p-6 flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full border-b border-white/5 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-wider text-sm">
              <ArrowLeft size={18} /> Back to Hub
            </button>
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl glass-panel text-blue-400 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse-glow">
                <activeTool.icon size={32} />
              </div>
              <h2 className="text-3xl font-black mb-3 text-white tracking-tight text-glow">{activeTool.name}</h2>
              <p className="text-slate-400 mb-8 leading-relaxed font-medium">{activeTool.desc}</p>
              
              {activeTool.requiresFile && !file && (
                 <button onClick={handleDesktopOpen} className="w-full py-4 glass-button text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-3">
                   <FileUp size={20} className="text-blue-400" /> Select PDF File
                 </button>
               )}
              
              {file && (
                <div className="glass-panel rounded-xl p-4 mb-6 border border-blue-500/30 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <FileIcon size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-white truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-blue-300 font-medium">{metadata?.pageCount || '?'} pages</p>
                    </div>
                  </div>
                  <button onClick={handleDesktopOpen} className="text-xs text-slate-400 hover:text-white w-full text-left mt-2 flex items-center gap-2 transition-colors">
                     <FileUp size={12} /> Change file
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8 border-t border-white/5">
            <button 
              onClick={executeTool}
              disabled={(!file && activeTool.requiresFile) || isProcessing}
              className={`w-full py-4 rounded-xl font-black tracking-wide text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                ${(!file && activeTool.requiresFile) 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-[1.02]'}`}
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="fill-current" />}
              {isProcessing ? 'PROCESSING...' : `EXECUTE ${activeTool.name.toUpperCase()}`}
            </button>
            <p className="text-center text-slate-500 text-xs mt-4 font-medium flex items-center justify-center gap-1">
               <ShieldAlert size={12} /> SECURE OFFLINE DESKTOP ENGINE
            </p>
          </div>
        </nav>
  
          <main className="flex-1 flex flex-col h-full bg-slate-900/50 backdrop-blur-3xl relative z-10 overflow-hidden">
            {isProcessing ? (
               <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 animate-[spin_3s_linear_infinite]"></div>
                   <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0 animate-[spin_1s_linear_infinite]"></div>
                   <Loader2 size={32} className="text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
                 <h3 className="text-2xl font-black mt-8 text-white tracking-widest text-glow">PROCESSING NATIVELY</h3>
                 <p className="text-blue-400 mt-2 font-medium">Please wait...</p>
               </div>
            ) : file && pdfBytes ? (
              <div className="flex-1 flex flex-col h-full">
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/40 shrink-0">
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded-lg shadow-inner">Page {currentPage} of {metadata?.pageCount || '?'}</span>
                     <div className="h-4 w-px bg-white/10"></div>
                     <span className="text-sm text-slate-400 font-medium">Zoom: {Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => triggerDownload(pdfBytes, `Export_${file.name}`)} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-blue-500/30">
                       <Download size={16} /> SAVE PDF
                     </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-start custom-scrollbar">
                  <div className="flex items-center gap-4 mb-6 sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 text-slate-300 hover:text-white transition-colors"><ArrowLeft size={20}/></button>
                    <span className="font-bold text-white min-w-[80px] text-center">{currentPage} / {metadata?.pageCount || '?'}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(metadata?.pageCount || 1, p + 1))} disabled={currentPage >= (metadata?.pageCount || 1)} className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 text-slate-300 hover:text-white transition-colors"><ArrowRight size={20}/></button>
                    <div className="w-px h-6 bg-white/20 mx-2"></div>
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"><ZoomOut size={18}/></button>
                    <button onClick={() => setZoom(1)} className="p-2 hover:bg-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-colors">FIT</button>
                    <button onClick={() => setZoom(z => z + 0.2)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"><ZoomIn size={18}/></button>
                  </div>
                  <div className="relative pdf-canvas-container rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
                    <canvas ref={canvasRef} className="block bg-white mx-auto" />
                  </div>
                  
                  <div className="w-full mt-12 overflow-x-auto flex gap-4 pb-6 px-4">
                     {thumbnails.map((thumb, idx) => (
                        <div key={idx} onClick={() => setCurrentPage(idx + 1)} className={`shrink-0 cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 ${currentPage === idx + 1 ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'border-transparent opacity-50 hover:opacity-100 hover:border-slate-500'}`}>
                          <img src={thumb} alt={`Page ${idx+1}`} className="w-24 object-contain bg-white" />
                          <div className="bg-slate-800 text-center text-xs font-bold py-1 text-slate-300">{idx + 1}</div>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-30 pointer-events-none">
                 <activeTool.icon size={120} />
              </div>
            )}
          </main>
        </div>
      );
  }
