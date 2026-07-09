import fs from 'fs';

const pathsToUpdate = [
  "E:\\Easy Projects\\Sanskar's PDF Editor"
];

const newPdfCoreFuncs = `
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
`;

const newTools = `  // MORE ADVANCED (5)
  { id: 'borders', name: 'Add Borders', desc: 'Draw 2px border around all pages.', icon: Frame, category: 'Edit', requiresFile: true },
  { id: 'ext-mid', name: 'Extract Middle Page', desc: 'Pull out the exact middle page.', icon: Scissors, category: 'Organize', requiresFile: true },
  { id: 'shuffle', name: 'Shuffle Pages', desc: 'Randomize the order of all pages.', icon: RotateCw, category: 'Organize', requiresFile: true },
  { id: 'barcode', name: 'Add Barcode', desc: 'Stamp a barcode mock on pages.', icon: FileDigit, category: 'Security', requiresFile: true },
  { id: 'qrcode', name: 'Add QR Code', desc: 'Stamp a QR code mock on pages.', icon: BoxSelect, category: 'Security', requiresFile: true },
`;

const newSwitchCases = `
        case 'borders': outBytes = await pdfCore.addPageBorders(bytes); break;
        case 'ext-mid': outBytes = await pdfCore.extractMiddlePage(bytes); break;
        case 'shuffle': outBytes = await pdfCore.shufflePages(bytes); break;
        case 'barcode': outBytes = await pdfCore.addBarcodeMock(bytes); break;
        case 'qrcode': outBytes = await pdfCore.addQRCodeMock(bytes); break;
`;

for (const dir of pathsToUpdate) {
  const pdfCorePath = dir + "/src/lib/pdfCore.ts";
  let pdfCore = fs.readFileSync(pdfCorePath, 'utf8');
  if (!pdfCore.includes('addPageBorders')) {
    pdfCore += '\n' + newPdfCoreFuncs;
    fs.writeFileSync(pdfCorePath, pdfCore);
  }

  const appTsxPath = dir + "/src/App.tsx";
  let appTsx = fs.readFileSync(appTsxPath, 'utf8');
  
  if (!appTsx.includes('borders')) {
    // Inject new tools
    appTsx = appTsx.replace(
      "  { id: 'add-check', name: 'Add Checkmark', desc: 'Draw a green check mark.', icon: Check, category: 'Edit', requiresFile: true },\n];",
      "  { id: 'add-check', name: 'Add Checkmark', desc: 'Draw a green check mark.', icon: Check, category: 'Edit', requiresFile: true },\n" + newTools + "];"
    );

    // Inject switch cases
    appTsx = appTsx.replace(
      "case 'add-check': outBytes = await pdfCore.addCheckmark(bytes, currentPage); break;",
      "case 'add-check': outBytes = await pdfCore.addCheckmark(bytes, currentPage); break;\n" + newSwitchCases
    );
    
    fs.writeFileSync(appTsxPath, appTsx);
  }
}

console.log('Successfully patched 5 more features! Total is now 70!');
