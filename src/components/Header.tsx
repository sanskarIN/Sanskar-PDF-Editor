import { useState, useRef, useEffect } from 'react';
import FollowSanskar from './FollowSanskar';

interface HeaderProps {
  onShowSettings: () => void;
  onShowAbout: () => void;
  onOpenFile: () => void;
  onSaveCopy: () => void;
  onMerge: () => void;
  onShowProperties: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDeletePage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onExtractText: () => void;
  fileName: string;
  hasDocument: boolean;
}

export default function Header({ 
  onShowSettings, onShowAbout, onOpenFile, onSaveCopy, onMerge, onShowProperties,
  onRotateLeft, onRotateRight, onDeletePage, onZoomIn, onZoomOut, 
  onFitWidth, onExtractText, fileName, hasDocument
}: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const executeAndClose = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col no-select w-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" className="w-6 h-6 object-contain" alt="Sanskar Logo" />
          <span className="font-bold text-md text-zinc-900 tracking-wide">Sanskar PDF Editor</span>
          <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm font-bold tracking-widest">ENTERPRISE</span>
        </div>
        
        {hasDocument && (
          <div className="flex-1 px-8 text-center truncate">
            <span className="text-sm font-medium text-zinc-600 px-3 py-1 bg-zinc-100 rounded border border-zinc-200">
              {fileName}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onShowSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors border border-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Settings
          </button>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] hidden md:inline-block">
            Made by Sanskar Yadav
          </span>
          <FollowSanskar />
        </div>
      </div>
      
      <div className="flex items-center px-2 py-1 space-x-1 text-sm text-zinc-600" ref={menuRef}>
        <div className="relative">
          <button onClick={() => toggleMenu('file')} className={`px-3 py-1 hover:bg-zinc-100 rounded transition ${activeMenu==='file' ? 'bg-zinc-100 text-zinc-900' : ''}`}>File</button>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1">
              <button onClick={() => executeAndClose(onOpenFile)} className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900">Open...</button>
              <button onClick={() => executeAndClose(onSaveCopy)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Save Copy...</button>
              <button onClick={() => executeAndClose(onMerge)} className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900">Merge PDFs...</button>
              <div className="h-px bg-zinc-200 my-1"></div>
              <button onClick={() => executeAndClose(onShowProperties)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Properties</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => toggleMenu('edit')} className={`px-3 py-1 hover:bg-zinc-100 rounded transition ${activeMenu==='edit' ? 'bg-zinc-100 text-zinc-900' : ''}`}>Edit</button>
          {activeMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1">
              <button onClick={() => executeAndClose(onRotateLeft)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Rotate Left</button>
              <button onClick={() => executeAndClose(onRotateRight)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Rotate Right</button>
              <div className="h-px bg-zinc-200 my-1"></div>
              <button onClick={() => executeAndClose(onDeletePage)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50">Delete Page</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => toggleMenu('view')} className={`px-3 py-1 hover:bg-zinc-100 rounded transition ${activeMenu==='view' ? 'bg-zinc-100 text-zinc-900' : ''}`}>View</button>
          {activeMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1">
              <button onClick={() => executeAndClose(onZoomIn)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Zoom In</button>
              <button onClick={() => executeAndClose(onZoomOut)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Zoom Out</button>
              <button onClick={() => executeAndClose(onFitWidth)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Fit Width</button>
              <div className="h-px bg-zinc-200 my-1"></div>
              <button onClick={() => executeAndClose(onExtractText)} disabled={!hasDocument} className="w-full text-left px-4 py-2 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 hover:text-zinc-900">Extract Text</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => toggleMenu('help')} className={`px-3 py-1 hover:bg-zinc-100 rounded transition ${activeMenu==='help' ? 'bg-zinc-100 text-zinc-900' : ''}`}>Help</button>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-1">
              <button onClick={() => executeAndClose(onShowAbout)} className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900">About PDF Editor</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
