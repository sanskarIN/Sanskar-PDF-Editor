import { useEffect, useState } from 'react';

const LOADING_STAGES = [
  'Initializing Core Engine...',
  'Loading PDF Renderer...',
  'Preparing Workspace...',
  'Ready!',
];

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onComplete, 600);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 25) {
      setStageIndex(0);
    } else if (progress < 55) {
      setStageIndex(1);
    } else if (progress < 85) {
      setStageIndex(2);
    } else {
      setStageIndex(3);
    }
  }, [progress]);

  return (
    <div
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Graphic */}
      <img src="/splash.png" alt="Splash Background" className="absolute inset-0 w-full h-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>

      {/* Logo Area */}
      <div className="mb-10 text-center relative z-10">
        <div className="relative inline-block">
          {/* Glowing Logo image */}
          <div className="relative mb-8 mx-auto w-32 h-32 flex items-center justify-center animate-float">
            <img src="/logo.png" alt="Sanskar PDF Logo" className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(79,70,229,0.5)]" />
          </div>

          <h1 className="relative text-6xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Sanskar PDF Editor
          </h1>
          <p className="relative mt-4 text-xl text-blue-300 font-bold tracking-[0.2em] uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">
            Enterprise Edition
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-80 mb-4">
        <div className="w-full h-2 bg-zinc-200/80 rounded-full overflow-hidden backdrop-blur-sm border border-zinc-300">
          <div
            className="h-full rounded-full transition-all duration-100 ease-out relative"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-gradient"></div>
          </div>
        </div>
      </div>

      {/* Loading Stage Text */}
      <p className="text-sm text-indigo-700 font-semibold h-5 tracking-wide animate-pulse">
        {LOADING_STAGES[stageIndex]}
      </p>
      <p className="text-xs text-indigo-500 mt-2 font-mono">{progress}%</p>

      {/* Bottom Credit */}
      <div className="absolute bottom-10">
        <p className="text-sm font-bold text-zinc-400 tracking-widest uppercase drop-shadow-sm">
          Made by Sanskar Yadav
        </p>
      </div>
    </div>
  );
}
