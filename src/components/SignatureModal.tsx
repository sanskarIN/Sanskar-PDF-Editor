import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Eraser, PenTool, Check } from 'lucide-react';

interface SignatureModalProps {
  onClose: () => void;
  onSign: (dataUrl: string) => void;
}

export default function SignatureModal({ onClose, onSign }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Setup high DPI canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear background (transparent by default, but let's be explicit)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000'; // Signatures are usually black
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasContent) setHasContent(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSign(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-lg flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <PenTool className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white tracking-wide">Sign Document</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-400 text-sm mb-4">Draw your signature below. It will be embedded into the bottom-right corner of the first page.</p>
          
          <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-600 bg-white shadow-inner flex justify-center">
            {/* The canvas has an internal size of 600x300 for crisp high-dpi drawing, but displays at 100% width via css */}
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full h-auto cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasContent && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <span className="text-slate-400 text-2xl font-medium select-none">Sign Here</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-white/10 bg-white/5">
          <button
            onClick={clearSignature}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          >
            <Eraser size={16} /> Clear
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasContent}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              <Check size={16} /> Embed Signature
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
