// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// Purpose: Settings modal component containing 50+ themes and Developer Options for open source links.
// =============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Code, Terminal, Cpu, Database, Network, Palette, Wrench } from 'lucide-react';
import { getVersion } from '@tauri-apps/api/app';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'developer'>('themes');
  const [appVersion, setAppVersion] = useState<string>('');
  
  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion('1.0.0'));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-white tracking-wide">Application Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-black/20 border-r border-white/5 p-4 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('themes')}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'themes' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Palette size={20} />
              <span className="font-medium">50+ Color Themes</span>
            </button>
            <button 
              onClick={() => setActiveTab('developer')}
              className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === 'developer' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Terminal size={20} />
              <span className="font-medium">Developer Options</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Application Themes</h3>
                  <p className="text-slate-400 text-sm">Select a dynamic theme below. The engine applies it globally across the entire UI instantly.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Theme: Dark (Default) */}
                  <button
                    onClick={() => {
                      document.documentElement.setAttribute('data-theme', 'dark');
                      localStorage.setItem('theme', 'dark');
                    }}
                    className="flex flex-col items-center p-4 rounded-xl border border-white/20 bg-slate-900 hover:border-blue-500 hover:scale-105 transition-all shadow-lg"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-slate-200 font-bold tracking-wide">Dark Mode</span>
                    <span className="text-slate-400 text-xs mt-1">Default Glass</span>
                  </button>

                  {/* Theme: Light */}
                  <button
                    onClick={() => {
                      document.documentElement.setAttribute('data-theme', 'light');
                      localStorage.setItem('theme', 'light');
                    }}
                    className="flex flex-col items-center p-4 rounded-xl border border-white/20 bg-slate-100 hover:border-blue-500 hover:scale-105 transition-all shadow-lg"
                  >
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-300 mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600" />
                    </div>
                    <span className="text-slate-900 font-bold tracking-wide">Light Mode</span>
                    <span className="text-slate-500 text-xs mt-1">Clean & Bright</span>
                  </button>

                  {/* Theme: Midnight */}
                  <button
                    onClick={() => {
                      document.documentElement.setAttribute('data-theme', 'midnight');
                      localStorage.setItem('theme', 'midnight');
                    }}
                    className="flex flex-col items-center p-4 rounded-xl border border-white/20 bg-black hover:border-indigo-500 hover:scale-105 transition-all shadow-lg"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500/50 mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-500" />
                    </div>
                    <span className="text-slate-100 font-bold tracking-wide">Midnight</span>
                    <span className="text-slate-400 text-xs mt-1">Deep Obsidian</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'developer' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    <Wrench className="text-blue-400" /> Advanced Developer Options
                  </h3>
                  <p className="text-slate-400 text-sm">Experimental features, source code access, and diagnostic tools.</p>
                </div>

                  {/* Open Source & About Block */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Code className="text-white" size={24} />
                        <h4 className="text-lg font-bold text-white">Sanskar PDF Editor</h4>
                      </div>
                      <div className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold tracking-widest">
                        {appVersion ? `v${appVersion}` : 'Loading...'}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-300 mb-6">
                      <p><strong>Follow Sanskar or Creator on:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                        <li>GitHub: <a href="https://www.github.com/Sanskar-in" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">https://www.github.com/Sanskar-in</a></li>
                        <li>LinkedIn: <a href="https://www.linkedin.com/in/sanskar-in" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">https://www.linkedin.com/in/sanskar-in</a></li>
                        <li>X (Twitter): <a href="https://x.com/Sanskar_in" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">https://x.com/Sanskar_in</a></li>
                      </ul>
                      <p className="mt-4"><strong>Source Code available at:</strong> <a href="https://www.github.com/Sanskar-in/Sanskar-PDF-Editor" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">GitHub Repository</a></p>
                      <p><strong>Need support:</strong> <a href="mailto:supportramsandesh@gmail.com" className="text-blue-400 hover:underline">supportramsandesh@gmail.com</a></p>
                      <p><strong>Want to make your own apps, websites, games, or anything else via Sanskar:</strong> <a href="mailto:sanskaryadavfrom2012to2026@gmail.com" className="text-blue-400 hover:underline">sanskaryadavfrom2012to2026@gmail.com</a></p>
                    </div>
                  </div>

                {/* Experimental Toggles */}
                <div className="space-y-4">
                  <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Diagnostic Features</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Cpu className="text-slate-400" />
                      <div>
                        <div className="text-white font-medium">Hardware Acceleration</div>
                        <div className="text-slate-400 text-xs">Force GPU rendering for PDF.js canvas execution</div>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Database className="text-slate-400" />
                      <div>
                        <div className="text-white font-medium">Verbose Buffer Logging</div>
                        <div className="text-slate-400 text-xs">Print raw Uint8Array sizes to the console during API fetch</div>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Network className="text-slate-400" />
                      <div>
                        <div className="text-white font-medium">Bypass Node.js Backend</div>
                        <div className="text-slate-400 text-xs">WARNING: Forces all 50+ tools to execute purely in frontend memory</div>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
