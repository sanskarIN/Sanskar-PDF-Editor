import FollowSanskar from './FollowSanskar';

interface AboutProps {
  onClose: () => void;
}

export default function About({ onClose }: AboutProps) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-200">
        <div className="p-8 text-center border-b border-zinc-200">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              SPE
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Sanskar PDF Editor</h2>
          <p className="text-lg text-zinc-500 mt-2 font-medium">Enterprise Edition v1.0.0</p>
          <div className="mt-4 inline-block px-4 py-1 bg-zinc-100 text-zinc-800 font-semibold tracking-widest text-sm rounded-full">
            MADE BY SANSKAR YADAV
          </div>
        </div>
        
        <div className="p-6 text-center text-zinc-600">
          <p className="mb-6 leading-relaxed">
            A high-performance, multi-language architecture PDF Editor built with Tauri, Rust, and React. 
            Designed to support over 100+ advanced features including core viewing, annotation, form handling, 
            security compliance, and AI integration.
          </p>
          
          <div className="flex justify-center mb-6">
            <FollowSanskar />
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
