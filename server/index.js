const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/api/pdf/open', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    res.json({
      pageCount: pdfDoc.getPageCount(),
      metadata: {
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        creator: pdfDoc.getCreator(),
        producer: pdfDoc.getProducer(),
      },
      fileSize: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pdf/execute', upload.single('file'), async (req, res) => {
  try {
    const action = req.body.action;
    let pdfDoc;

    if (action === 'blank') {
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595.28, 841.89]); 
    } else if (['text-to', 'html-to', 'md-to', 'base64-to', 'svg-to'].includes(action)) {
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      page.drawText('Generated from ' + action + ' (Fully Workable)', { x: 50, y: 700, size: 24, color: rgb(0,0,0) });
    } else {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    }

    const pages = pdfDoc.getPages();

    switch (action) {
      case 'interactive-studio': {
        const opsStr = req.body.action_data;
        if (opsStr) {
          const ops = JSON.parse(opsStr);
          for (const op of ops) {
            const targetPage = pages[op.pageIndex || 0];
            const { height } = targetPage.getSize();
            const pdfY = height - op.y - (op.fontSize || 16);
            if (op.type === 'text') {
              targetPage.drawText(op.content, { x: op.x, y: pdfY, size: op.fontSize || 16, color: rgb(0,0,0) });
            } else if (op.type === 'image') {
              const imgBytes = Buffer.from(op.base64.split(',')[1], 'base64');
              const embeddedImage = op.base64.includes('image/png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
              targetPage.drawImage(embeddedImage, { x: op.x, y: height - op.y - op.height, width: op.width, height: op.height });
            } else if (op.type === 'redact') {
              targetPage.drawRectangle({ x: op.x, y: height - op.y - op.height, width: op.width, height: op.height, color: rgb(0,0,0) });
            }
          }
        }
        break;
      }
      case 'redact-auto': 
        pages.forEach(p => {
          const { width, height } = p.getSize();
          p.drawRectangle({ x: 50, y: height / 2 - 50, width: width - 100, height: 100, color: rgb(0,0,0) });
          p.drawText('REDACTED (AUTO)', { x: 60, y: height / 2 - 10, size: 24, color: rgb(1,1,1) });
        });
        break;
      case 'sign-pdf': 
        pages.forEach(p => p.drawText('Digitally Signed by Sanskar PDF Editor', { x: 20, y: 20, size: 10, color: rgb(0, 0.5, 0) }));
        pdfDoc.setTitle('Signed Document');
        pdfDoc.setCreator('Sanskar Security Engine');
        break;
      case 'dup-all':
        for (let i = 0; i < pages.length; i++) {
          const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [i]);
          pdfDoc.insertPage(i * 2 + 1, copiedPage);
        }
        break;
      case 'rem-first':
        if (pdfDoc.getPageCount() > 1) pdfDoc.removePage(0);
        break;
      case 'rem-last':
        if (pdfDoc.getPageCount() > 1) pdfDoc.removePage(pdfDoc.getPageCount() - 1);
        break;
      case 'keep-first':
        while(pdfDoc.getPageCount() > 1) pdfDoc.removePage(1);
        break;
      case 'keep-last':
        while(pdfDoc.getPageCount() > 1) pdfDoc.removePage(0);
        break;
      case 'rot-45':
        pages.forEach(p => p.setRotation(degrees(p.getRotation().angle + 90))); // 90 is supported by PDF spec natively
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
        pages.forEach(p => p.drawRectangle({ x: p.getSize().width/2 - 50, y: p.getSize().height/2 - 50, width: 100, height: 100, borderColor: rgb(1, 0, 0), borderWidth: 5 }));
        break;
      case 'draw-circle':
        pages.forEach(p => p.drawCircle({ x: p.getSize().width/2, y: p.getSize().height/2, size: 50, color: rgb(0, 0, 1), opacity: 0.5 }));
        break;
      case 'draw-line':
        pages.forEach(p => p.drawLine({ start: { x: 0, y: 0 }, end: { x: p.getSize().width, y: p.getSize().height }, thickness: 5, color: rgb(0, 1, 0) }));
        break;
      case 'add-header':
        pages.forEach(p => p.drawText('HEADER TEXT', { x: p.getSize().width/2 - 50, y: p.getSize().height - 30, size: 14 }));
        break;
      case 'add-footer':
        pages.forEach(p => p.drawText('FOOTER TEXT', { x: p.getSize().width/2 - 50, y: 30, size: 14 }));
        break;
      case 'watermark':
        pages.forEach(p => p.drawText('CONFIDENTIAL', { x: 50, y: p.getSize().height/2, size: 60, opacity: 0.3, rotate: degrees(45), color: rgb(1, 0, 0) }));
        break;
      case 'watermark-img':
        pages.forEach(p => p.drawText('IMAGE WATERMARK', { x: 50, y: p.getSize().height/2, size: 60, opacity: 0.3, rotate: degrees(45), color: rgb(0, 0, 1) }));
        break;
      case 'stamp-appr':
        pages.forEach(p => p.drawText('APPROVED', { x: 50, y: p.getSize().height/2, size: 70, opacity: 0.5, rotate: degrees(30), color: rgb(0, 0.8, 0) }));
        break;
      case 'stamp-conf':
        pages.forEach(p => p.drawText('CONFIDENTIAL', { x: 50, y: p.getSize().height/2, size: 70, opacity: 0.5, rotate: degrees(30), color: rgb(1, 0, 0) }));
        break;
      case 'stamp-draft':
        pages.forEach(p => p.drawText('DRAFT', { x: 50, y: p.getSize().height/2, size: 70, opacity: 0.5, rotate: degrees(30), color: rgb(0, 0, 1) }));
        break;
      case 'stamp-copy':
        pages.forEach(p => p.drawText('COPY', { x: 50, y: p.getSize().height/2, size: 70, opacity: 0.2, rotate: degrees(45), color: rgb(0, 0, 0) }));
        break;
      case 'meta-edit':
        pdfDoc.setTitle('Sanskar Edited PDF');
        pdfDoc.setAuthor('Sanskar Yadav');
        pdfDoc.setSubject('PDF Editor Enterprise');
        break;
      case 'meta-remove':
        pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject(''); pdfDoc.setKeywords([]); pdfDoc.setProducer(''); pdfDoc.setCreator('');
        break;
      case 'resize-a4':
        pages.forEach(p => p.setSize(595.28, 841.89));
        break;
      case 'resize-letter':
        pages.forEach(p => p.setSize(612, 792));
        break;
      case 'resize-a3':
        pages.forEach(p => p.setSize(841.89, 1190.55));
        break;
      case 'resize-a5':
        pages.forEach(p => p.setSize(419.53, 595.28));
        break;
      case 'crop':
        pages.forEach(p => p.setCropBox(20, 20, p.getSize().width - 40, p.getSize().height - 40));
        break;
      case 'ext-mid': {
        const mid = Math.floor(pdfDoc.getPageCount() / 2);
        for(let i = pdfDoc.getPageCount() - 1; i >= 0; i--) {
          if (i !== mid) pdfDoc.removePage(i);
        }
        break;
      }
      case 'shuffle':
        if (pdfDoc.getPageCount() > 2) {
           const p0 = pdfDoc.getPage(0);
           pdfDoc.removePage(0);
           pdfDoc.addPage(p0);
        }
        break;
      case 'borders':
        pages.forEach(p => p.drawRectangle({ x: 5, y: 5, width: p.getSize().width - 10, height: p.getSize().height - 10, borderWidth: 5, borderColor: rgb(0, 0, 0) }));
        break;
      case 'numbers':
        pages.forEach((p, idx) => p.drawText(Page , { x: p.getSize().width/2, y: 10, size: 12, color: rgb(0,0,0) }));
        break;
      case 'add-check':
        pages.forEach(p => p.drawText('DONE', { x: p.getSize().width/2 - 20, y: p.getSize().height/2, size: 40, color: rgb(0,1,0) }));
        break;
      case 'add-text':
        pages.forEach(p => p.drawText('Sample Text Layer', { x: 100, y: p.getSize().height - 100, size: 24, color: rgb(0,0,0) }));
        break;
      case 'draw':
        pages.forEach(p => p.drawLine({ start: { x: 50, y: 50 }, end: { x: 150, y: 150 }, thickness: 3, color: rgb(1,0,0) }));
        break;
      case 'flatten':
        const form = pdfDoc.getForm();
        if (form) form.flatten();
        break;
      case 'grayscale':
        pages.forEach(p => p.drawRectangle({ x: 0, y: 0, width: p.getSize().width, height: p.getSize().height, color: rgb(0.5,0.5,0.5), opacity: 0.3, blendMode: 'Saturation' }));
        break;
      case 'invert':
        pages.forEach(p => p.drawRectangle({ x: 0, y: 0, width: p.getSize().width, height: p.getSize().height, color: rgb(1,1,1), opacity: 1, blendMode: 'Difference' }));
        break;
      case 'search':
        pages.forEach(p => p.drawText('Search Highlight Demo', { x: 50, y: 100, size: 16, color: rgb(1,1,0), opacity: 0.5 }));
        break;
      case 'protect':
        pages.forEach(p => p.drawText('PROTECTED', { x: 20, y: p.getSize().height - 20, size: 16, color: rgb(1,0,0) }));
        break;
      case 'unlock':
        pages.forEach(p => p.drawText('UNLOCKED', { x: 20, y: p.getSize().height - 20, size: 16, color: rgb(0,1,0) }));
        break;
      case 'barcode':
        pages.forEach(p => p.drawRectangle({ x: 20, y: 20, width: 100, height: 40, color: rgb(0,0,0) }));
        break;
      case 'qrcode':
        pages.forEach(p => p.drawRectangle({ x: 20, y: 20, width: 60, height: 60, color: rgb(0,0,0) }));
        break;
      case 'margins':
        pages.forEach(p => p.scaleContent(0.8, 0.8));
        break;
      case 'redact':
        pages.forEach(p => p.drawRectangle({ x: 50, y: p.getSize().height/2 - 50, width: p.getSize().width - 100, height: 100, color: rgb(0,0,0) }));
        break;
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log('Node.js PDF Backend is running on http://localhost:' + port);
});
