// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// Purpose: A powerful drag-and-drop interactive PDF editor canvas using React-RND.
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Save, X, Type, Image as ImageIcon, ShieldAlert, ArrowLeft } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface InteractiveStudioProps {
  pdfBytes: Uint8Array;
  fileName: string;
  onClose: () => void;
  onSave: (operations: any[]) => void;
  isProcessing: boolean;
}

export default function InteractiveStudio({ pdfBytes, fileName, onClose, onSave, isProcessing }: InteractiveStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Render the first page of the PDF to act as the canvas background
  useEffect(() => {
    let active = true;
    const renderPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // For simplicity, studio mode edits page 1
        
        // Use a standard scale, e.g., 1.5 for crispness
        const viewport = page.getViewport({ scale: 1.2 });
        setPageSize({ width: viewport.width, height: viewport.height });

        if (canvasRef.current && active) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            const renderContext = { canvasContext: context, viewport } as any;
            await page.render(renderContext).promise;
          }
        }
      } catch (err) {
        console.error("Failed to render PDF in studio", err);
      }
    };
    renderPdf();
    return () => { active = false; };
  }, [pdfBytes]);

  const addElement = (type: 'text' | 'image' | 'redact') => {
    const id = Date.now().toString();
    const newEl = {
      id,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 150,
      content: type === 'text' ? 'Double click to edit...' : '',
      fontSize: 24,
      base64: ''
    };
    
    if (type === 'image') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg';
      input.onchange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (re) => {
            newEl.base64 = re.target?.result as string;
            setElements([...elements, newEl]);
            setSelectedId(id);
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      };
      input.click();
    } else {
      setElements([...elements, newEl]);
      setSelectedId(id);
    }
  };

  const updateElement = (id: string, updates: any) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const handleSave = () => {
    // We must map the visual coordinates back to the PDF's unscaled coordinates
    // If viewport scale is 1.2, we divide by 1.2
    const scale = 1.2;
    const ops = elements.map(el => ({
      type: el.type,
      x: el.x / scale,
      y: el.y / scale,
      width: el.width / scale,
      height: el.height / scale,
      content: el.content,
      fontSize: el.fontSize / scale,
      base64: el.base64,
      pageIndex: 0
    }));
    onSave(ops);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans">
      {/* Top Toolbar */}
      <div className="h-16 border-b border-white/10 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="text-white font-bold flex items-center gap-2">
            <span className="bg-blue-600 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Studio Mode</span>
            {fileName}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => addElement('text')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200">
            <Type size={16} /> Add Text
          </button>
          <button onClick={() => addElement('image')} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200">
            <ImageIcon size={16} /> Add Image
          </button>
          <button onClick={() => addElement('redact')} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-400">
            <ShieldAlert size={16} /> Redact Area
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          
          <button onClick={handleSave} disabled={isProcessing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold text-white shadow-lg transition-colors disabled:opacity-50">
            <Save size={16} /> {isProcessing ? 'Processing...' : 'Bake to PDF'}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-8 custom-scrollbar relative" onClick={() => setSelectedId(null)}>
        
        {pageSize.width === 0 && <div className="text-white animate-pulse">Initializing Studio Engine...</div>}
        
        {pageSize.width > 0 && (
          <div 
            className="relative shadow-2xl bg-white" 
            style={{ width: pageSize.width, height: pageSize.height }}
            onClick={(e) => e.stopPropagation()} // prevent deselect
          >
            {/* Background PDF */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

            {/* Draggable Overlays */}
            {elements.map(el => (
              <Rnd
                key={el.id}
                bounds="parent"
                position={{ x: el.x, y: el.y }}
                size={{ width: el.width, height: el.height }}
                onDragStop={(_e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                onResizeStop={(_e, _dir, ref, _delta, pos) => {
                  updateElement(el.id, { width: ref.style.width, height: ref.style.height, ...pos });
                }}
                className={`absolute ${selectedId === el.id ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-400/50'} cursor-move group`}
                onClick={() => setSelectedId(el.id)}
              >
                {/* Delete Button */}
                {selectedId === el.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg z-10"
                  >
                    <X size={12} />
                  </button>
                )}

                {el.type === 'text' && (
                  <textarea
                    className="w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden"
                    style={{ fontSize: `${el.fontSize}px`, color: 'black', fontFamily: 'sans-serif' }}
                    value={el.content}
                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                  />
                )}
                
                {el.type === 'image' && (
                  <img src={el.base64} alt="overlay" className="w-full h-full object-contain pointer-events-none" />
                )}

                {el.type === 'redact' && (
                  <div className="w-full h-full bg-black/80 flex items-center justify-center border-2 border-red-500">
                    <span className="text-red-500 font-bold tracking-widest text-sm opacity-50 rotate-45 pointer-events-none">REDACTED</span>
                  </div>
                )}
              </Rnd>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
