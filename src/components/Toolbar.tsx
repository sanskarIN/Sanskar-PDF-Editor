import {
  FolderOpen,
  Save,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  Trash2,
  FileText,
} from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  hasDocument: boolean;
  onOpenFile: () => void;
  onSaveCopy: () => void;
  onMerge: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDeletePage: () => void;
  onExtractText: () => void;
}

function ToolbarButton({
  onClick,
  disabled,
  title,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  const baseClasses =
    'p-2 rounded-lg transition-all duration-150 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed';
  const variantClasses =
    variant === 'danger'
      ? 'hover:bg-red-50 hover:text-red-600 text-zinc-500'
      : 'hover:bg-zinc-100 hover:text-zinc-900 text-zinc-500';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-7 bg-zinc-200 mx-1"></div>;
}

export default function Toolbar({
  currentPage,
  totalPages,
  zoom,
  hasDocument,
  onOpenFile,
  onSaveCopy,
  onMerge,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onRotateLeft,
  onRotateRight,
  onDeletePage,
  onExtractText,
}: ToolbarProps) {
  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(value) && value >= 1 && value <= totalPages) {
        onGoToPage(value);
      }
    }
  };

  return (
    <div className="flex items-center px-3 py-2 bg-white border-b border-zinc-200 no-select flex-wrap gap-y-2">
      {/* File Operations */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onOpenFile} title="Open PDF (Ctrl+O)">
          <FolderOpen size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onSaveCopy} disabled={!hasDocument} title="Save Copy (Ctrl+S)">
          <Save size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onMerge} title="Merge PDFs">
          <FilePlus2 size={18} />
        </ToolbarButton>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onPrevPage} disabled={!hasDocument || currentPage <= 1} title="Previous Page">
          <ChevronLeft size={18} />
        </ToolbarButton>
        <div className="flex items-center gap-1.5 px-2">
          <input
            type="text"
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={handlePageInput}
            disabled={!hasDocument}
            className="w-12 text-center text-sm bg-white border border-zinc-200 rounded px-1 py-0.5 text-zinc-900 focus:outline-none focus:border-blue-500 disabled:opacity-40 shadow-sm"
          />
          <span className="text-sm text-zinc-500">of</span>
          <span className="text-sm text-zinc-700 font-medium">{totalPages}</span>
        </div>
        <ToolbarButton onClick={onNextPage} disabled={!hasDocument || currentPage >= totalPages} title="Next Page">
          <ChevronRight size={18} />
        </ToolbarButton>
      </div>

      <Separator />

      {/* Zoom Controls */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onZoomOut} disabled={!hasDocument} title="Zoom Out">
          <ZoomOut size={18} />
        </ToolbarButton>
        <span className="text-sm text-zinc-700 font-medium w-14 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <ToolbarButton onClick={onZoomIn} disabled={!hasDocument} title="Zoom In">
          <ZoomIn size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onFitWidth} disabled={!hasDocument} title="Fit to Width">
          <Maximize2 size={18} />
        </ToolbarButton>
      </div>

      <Separator />

      {/* Page Operations */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onRotateLeft} disabled={!hasDocument} title="Rotate Left (90° CCW)">
          <RotateCcw size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onRotateRight} disabled={!hasDocument} title="Rotate Right (90° CW)">
          <RotateCw size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={onDeletePage} disabled={!hasDocument || totalPages <= 1} title="Delete Page" variant="danger">
          <Trash2 size={18} />
        </ToolbarButton>
      </div>

      <Separator />

      {/* View */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={onExtractText} disabled={!hasDocument} title="Extract Text">
          <FileText size={18} />
        </ToolbarButton>
      </div>
    </div>
  );
}
