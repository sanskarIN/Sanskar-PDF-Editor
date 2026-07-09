import fs from 'fs';

const pathsToUpdate = [
  "E:\\Easy Projects\\Sanskar's PDF Editor"
];

const newPdfCoreFuncs = `
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
`;

const newTools = `  // ADVANCED & MORE (15)
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
`;

const newSwitchCases = `
        case 'dup-all': outBytes = await pdfCore.duplicateAllPages(bytes); break;
        case 'rem-first': outBytes = await pdfCore.removeFirstPage(bytes); break;
        case 'rem-last': outBytes = await pdfCore.removeLastPage(bytes); break;
        case 'keep-first': outBytes = await pdfCore.keepFirstPageOnly(bytes); break;
        case 'keep-last': outBytes = await pdfCore.keepLastPageOnly(bytes); break;
        case 'rot-45': outBytes = await pdfCore.rotate45(bytes); break;
        case 'shift-x': outBytes = await pdfCore.shiftContentX(bytes, 50); break;
        case 'shift-y': outBytes = await pdfCore.shiftContentY(bytes, 50); break;
        case 'bg-yellow': outBytes = await pdfCore.addBackgroundYellow(bytes); break;
        case 'resize-a3': outBytes = await pdfCore.convertToA3(bytes); break;
        case 'resize-a5': outBytes = await pdfCore.convertToA5(bytes); break;
        case 'add-header': outBytes = await pdfCore.addHeader(bytes, 'Header Text'); break;
        case 'add-footer': outBytes = await pdfCore.addFooter(bytes, 'Footer Text'); break;
        case 'stamp-copy': outBytes = await pdfCore.stampCopy(bytes); break;
        case 'add-check': outBytes = await pdfCore.addCheckmark(bytes, currentPage); break;
`;

for (const dir of pathsToUpdate) {
  const pdfCorePath = dir + "/src/lib/pdfCore.ts";
  let pdfCore = fs.readFileSync(pdfCorePath, 'utf8');
  if (!pdfCore.includes('duplicateAllPages')) {
    pdfCore += '\n' + newPdfCoreFuncs;
    fs.writeFileSync(pdfCorePath, pdfCore);
  }

  const appTsxPath = dir + "/src/App.tsx";
  let appTsx = fs.readFileSync(appTsxPath, 'utf8');

  if (!appTsx.includes('dup-all')) {
    // Inject new tools
    appTsx = appTsx.replace(
      "  { id: 'stamp-draft', name: 'Stamp \"DRAFT\"', desc: 'Draw massive blue stamp.', icon: CheckSquare, category: 'Security', requiresFile: true },\n];",
      "  { id: 'stamp-draft', name: 'Stamp \"DRAFT\"', desc: 'Draw massive blue stamp.', icon: CheckSquare, category: 'Security', requiresFile: true },\n" + newTools + "];"
    );

    // Inject switch cases
    appTsx = appTsx.replace(
      "case 'stamp-draft': outBytes = await pdfCore.addStamp(bytes, 'DRAFT', 0, 0, 1); break;",
      "case 'stamp-draft': outBytes = await pdfCore.addStamp(bytes, 'DRAFT', 0, 0, 1); break;\n" + newSwitchCases
    );

    // Inject imports
    appTsx = appTsx.replace(
      "} from 'lucide-react';",
      ", ArrowRight, ArrowUp, PaintBucket, Maximize, Minimize, Check, File as FileIcon } from 'lucide-react';"
    );

    fs.writeFileSync(appTsxPath, appTsx);
  }
}

console.log('Successfully patched 15 new features!');
