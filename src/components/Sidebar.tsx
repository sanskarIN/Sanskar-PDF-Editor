import { useEffect, useRef, useState, useCallback } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

interface SidebarProps {
  pdfData: string | null;
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface ThumbnailData {
  page: number;
  dataUrl: string;
}

export default function Sidebar({
  pdfData,
  currentPage,
  totalPages,
  onPageSelect,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const thumbnailRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const generateThumbnails = useCallback(async (data: string) => {
    setIsGenerating(true);
    setThumbnails([]);

    try {
      const binaryString = atob(data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
      }

      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const doc = await loadingTask.promise;
      pdfDocRef.current = doc;

      const newThumbnails: ThumbnailData[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        try {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext: any = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          };

          await page.render(renderContext).promise;

          newThumbnails.push({
            page: i,
            dataUrl: canvas.toDataURL(),
          });
        } catch (err) {
          console.error(`Error generating thumbnail for page ${i}:`, err);
        }
      }

      setThumbnails(newThumbnails);
    } catch (err) {
      console.error('Error generating thumbnails:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (pdfData) {
      generateThumbnails(pdfData);
    } else {
      setThumbnails([]);
    }
  }, [pdfData, generateThumbnails]);

  // Scroll current page thumbnail into view
  useEffect(() => {
    const ref = thumbnailRefs.current.get(currentPage);
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`flex flex-col bg-white transition-all duration-300 no-select h-full ${
        isCollapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-center p-2 border-b border-zinc-200">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Thumbnails */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {!pdfData && (
            <p className="text-xs text-zinc-400 text-center mt-4">No document</p>
          )}

          {isGenerating && (
            <div className="space-y-3">
              {Array.from({ length: Math.min(totalPages || 3, 10) }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-[1/1.4] bg-zinc-200 rounded border border-zinc-300"></div>
                  <div className="h-3 w-8 bg-zinc-200 rounded mx-auto mt-1.5"></div>
                </div>
              ))}
            </div>
          )}

          {!isGenerating &&
            thumbnails.map((thumb) => (
              <div
                key={thumb.page}
                ref={(el) => {
                  if (el) thumbnailRefs.current.set(thumb.page, el);
                }}
                onClick={() => onPageSelect(thumb.page)}
                className={`cursor-pointer rounded-lg p-1.5 transition-all duration-150 ${
                  currentPage === thumb.page
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-zinc-100 border border-transparent hover:border-zinc-300'
                }`}
              >
                <div className="w-full overflow-hidden rounded border border-zinc-200 bg-white">
                  <img
                    src={thumb.dataUrl}
                    alt={`Page ${thumb.page}`}
                    className="w-full h-auto"
                    draggable={false}
                  />
                </div>
                <div
                  className={`text-xs text-center mt-1.5 font-medium ${
                    currentPage === thumb.page ? 'text-blue-600' : 'text-zinc-500'
                  }`}
                >
                  {thumb.page}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
