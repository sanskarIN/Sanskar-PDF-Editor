import React, { useState } from 'react';
import { Bot, X, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIPanelProps {
  onClose: () => void;
  onSummarize: () => Promise<void>;
  isProcessing: boolean;
  summaryResult?: string | null;
}

export default function AIPanel({ onClose, onSummarize, isProcessing, summaryResult }: AIPanelProps) {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-screen w-[450px] bg-slate-900/95 backdrop-blur-3xl border-l border-white/10 z-50 flex flex-col font-sans shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">AI Studio</h2>
              <p className="text-purple-400/80 text-xs font-semibold tracking-wider uppercase">Powered by Local AI Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!summaryResult ? (
            <div className="space-y-6">
              <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/30">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Generate Smart Summary</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      Extract key insights, word counts, and executive summaries instantly using the built-in local engine. No data leaves your machine.
                    </p>
                    <button 
                      onClick={onSummarize}
                      disabled={isProcessing}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      {isProcessing ? 'Analyzing Document...' : 'Run Analysis'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-200/70 text-xs leading-relaxed">
                  The local AI engine reads the first 5 pages of your document to construct its context window. Ensure your document has extractable text layers.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-lg">Analysis Complete</h3>
                <button onClick={() => onClose()} className="text-xs text-purple-400 hover:text-purple-300 font-semibold tracking-wider uppercase">Reset</button>
              </div>
              <div className="glass-panel rounded-2xl p-6 border border-white/10 prose prose-invert prose-p:text-slate-300 prose-p:text-sm prose-p:leading-relaxed prose-headings:text-white">
                {summaryResult.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) return <h3 key={i} className="text-purple-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block text-white mt-4 mb-1">{line.replace(/\*\*/g, '')}</strong>;
                  if (line.startsWith('- ')) return <li key={i} className="text-slate-300 text-sm ml-4 list-disc">{line.replace('- ', '')}</li>;
                  if (line === '---') return <hr key={i} className="border-white/10 my-4" />;
                  if (line.trim() === '') return <div key={i} className="h-2"></div>;
                  if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="text-slate-500 italic text-xs mt-4">{line.replace(/\*/g, '')}</p>;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
