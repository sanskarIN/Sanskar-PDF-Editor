// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.

import { Shield, ShieldAlert, Key, Fingerprint, Lock } from 'lucide-react';

interface SecurityPanelProps {
  onClose: () => void;
  onRedact: () => void;
  onSign: () => void;
  isProcessing: boolean;
}

export default function SecurityPanel({ onClose, onRedact, onSign, isProcessing }: SecurityPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-6 animate-slideUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-xl">
              <Shield className="text-red-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Security & Redaction</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-red-500/50 transition-colors">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-red-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-white font-medium">True Redaction Engine</h3>
                <p className="text-slate-400 text-sm mt-1 mb-3">
                  Physically wipe text and image data beneath selected areas to prevent data recovery.
                </p>
                <button
                  onClick={onRedact}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Lock size={16} />
                  {isProcessing ? 'Processing...' : 'Apply Redaction (Demo)'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-start gap-3">
              <Key className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-white font-medium">PKI Digital Signatures</h3>
                <p className="text-slate-400 text-sm mt-1 mb-3">
                  Apply a PADES cryptographic signature to authenticate this document.
                </p>
                <button
                  onClick={onSign}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Fingerprint size={16} />
                  {isProcessing ? 'Signing...' : 'Sign Document (Demo)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
