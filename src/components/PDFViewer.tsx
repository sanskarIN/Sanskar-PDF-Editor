import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  pdfData: string | null;
  currentPage: number;
  zoom: number;
  onPageRendered: (pageNum: number, totalPages: number) => void;
}

export default function PDFViewer({ pdfData, currentPage, zoom, onPageRendered }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanupRenderTask = useCallback(() => {
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (e) {}
      renderTaskRef.current = null;
    }
  }, []);

  // Load PDF document when pdfData changes
  useEffect(() => {
    if (!pdfData) {
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const loadDocument = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const binaryString = atob(pdfData);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        if (pdfDocRef.current) {
          pdfDocRef.current.cleanup();
          pdfDocRef.current = null;
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const doc = await loadingTask.promise;

        if (cancelled) {
          doc.cleanup();
          return;
        }

        pdfDocRef.current = doc;
        onPageRendered(1, doc.numPages);
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading PDF:', err);
          setError('Failed to load PDF document.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [pdfData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render page when currentPage, zoom, or document changes
  useEffect(() => {
    const doc = pdfDocRef.current;
    if (!doc || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      cleanupRenderTask();
      setIsLoading(true);

      try {
        const page = await doc.getPage(currentPage);

        if (cancelled) return;

        const viewport = page.getViewport({ scale: zoom * 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!cancelled) {
          onPageRendered(currentPage, doc.numPages);
        }
      } catch (err: unknown) {
        if (!cancelled && err instanceof Error && err.name !== 'RenderingCancelledException' && err.message !== 'Rendering cancelled') {
          console.error('Error rendering page:', err);
          setError('Failed to render page.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      cleanupRenderTask();
    };
  }, [currentPage, zoom, pdfData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRenderTask();
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
    };
  }, [cleanupRenderTask]);

  if (!pdfData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            <svg className="w-12 h-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-800 mb-2">No Document Loaded</h2>
          <p className="text-zinc-500 text-sm max-w-md">
            Open a PDF file to start editing. Use File → Open or the toolbar button.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 pdf-canvas-container bg-transparent relative overflow-auto p-8 flex justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 animate-fadeIn">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
            <span className="text-sm font-medium text-zinc-800 tracking-wide">Rendering page...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
          <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl shadow-lg backdrop-blur-md">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="page-transition"
        style={{ display: pdfData ? 'block' : 'none' }}
      />
    </div>
  );
}
