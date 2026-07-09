interface FooterProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  fileSize: number;
  hasDocument: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Footer({ currentPage, totalPages, zoom, fileSize, hasDocument }: FooterProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white text-xs text-zinc-500 no-select">
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${hasDocument ? 'bg-emerald-500' : 'bg-zinc-300'}`}></div>
          <span>{hasDocument ? 'Document Loaded' : 'Ready'}</span>
        </div>
        {hasDocument && (
          <>
            <span className="text-zinc-300">|</span>
            <span>Page {currentPage} of {totalPages}</span>
            <span className="text-zinc-300">|</span>
            <span>{Math.round(zoom * 100)}%</span>
            {fileSize > 0 && (
              <>
                <span className="text-zinc-300">|</span>
                <span>{formatFileSize(fileSize)}</span>
              </>
            )}
          </>
        )}
      </div>
      <div className="font-semibold tracking-widest text-zinc-400 uppercase text-[10px]">
        Made by Sanskar Yadav
      </div>
    </div>
  );
}
