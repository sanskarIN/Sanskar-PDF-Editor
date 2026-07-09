import { X, FileText, User, Calendar, Info, Tag, Hash } from 'lucide-react';

interface DocumentInfoProps {
  info: {
    file_name?: string;
    file_path?: string;
    file_size?: number;
    page_count?: number;
    metadata?: {
      title?: string;
      author?: string;
      creator?: string;
      producer?: string;
      subject?: string;
      keywords?: string;
    };
  };
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-zinc-200 last:border-0">
      <div className="text-zinc-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</div>
        <div className="text-sm text-zinc-900 mt-0.5 break-all">{value || 'N/A'}</div>
      </div>
    </div>
  );
}

export default function DocumentInfo({ info, onClose }: DocumentInfoProps) {
  const meta = info.metadata || {};

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-slideUp border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Info size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Document Properties</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* File Info Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">File Information</h3>
            <div className="bg-zinc-50 rounded-lg px-4 border border-zinc-200">
              <InfoRow icon={<FileText size={16} />} label="File Name" value={info.file_name || 'Unknown'} />
              <InfoRow icon={<FileText size={16} />} label="File Path" value={info.file_path || 'Unknown'} />
              <InfoRow icon={<Hash size={16} />} label="File Size" value={info.file_size ? formatFileSize(info.file_size) : 'Unknown'} />
              <InfoRow icon={<FileText size={16} />} label="Page Count" value={info.page_count?.toString() || 'Unknown'} />
            </div>
          </div>

          {/* Metadata Section */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Document Metadata</h3>
            <div className="bg-zinc-50 rounded-lg px-4 border border-zinc-200">
              <InfoRow icon={<FileText size={16} />} label="Title" value={meta.title || 'N/A'} />
              <InfoRow icon={<User size={16} />} label="Author" value={meta.author || 'N/A'} />
              <InfoRow icon={<Calendar size={16} />} label="Creator" value={meta.creator || 'N/A'} />
              <InfoRow icon={<Info size={16} />} label="Producer" value={meta.producer || 'N/A'} />
              <InfoRow icon={<Tag size={16} />} label="Subject" value={meta.subject || 'N/A'} />
              <InfoRow icon={<Tag size={16} />} label="Keywords" value={meta.keywords || 'N/A'} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
