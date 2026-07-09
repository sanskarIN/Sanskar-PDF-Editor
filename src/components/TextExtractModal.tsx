import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface TextExtractModalProps {
  text: string;
  isLoading: boolean;
  onClose: () => void;
  pageNumber: number;
}

export default function TextExtractModal({ text, isLoading, onClose, pageNumber }: TextExtractModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slideUp border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Extracted Text</h2>
            <p className="text-sm text-zinc-500">Page {pageNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 text-sm">Extracting text from page {pageNumber}...</p>
            </div>
          ) : text.trim().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm">No text content found on this page.</p>
              <p className="text-zinc-400 text-xs mt-2">The page may contain only images or scanned content.</p>
            </div>
          ) : (
            <pre className="text-sm text-zinc-800 whitespace-pre-wrap font-mono leading-relaxed bg-zinc-50 rounded-lg p-4 border border-zinc-200">
              {text}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-200">
          <button
            onClick={handleCopy}
            disabled={isLoading || text.trim().length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
